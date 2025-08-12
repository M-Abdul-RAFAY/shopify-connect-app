import React, { createContext, useContext, useState, useCallback } from "react";
import {
  ShopifyProduct,
  ShopifyOrder,
  ShopifyCustomer,
  ShopifyStore,
  shopifyAPI,
} from "../services/shopifyAPI";
import cachedDataService from "../services/cachedDataService";
import { useShopify } from "./ShopifyContext";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  recentOrders: ShopifyOrder[];
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  ordersByStatus: { [key: string]: number };
  revenueByMonth: { [key: string]: number };
}

interface ShopifyData {
  products: ShopifyProduct[];
  orders: ShopifyOrder[];
  customers: ShopifyCustomer[];
  shop: ShopifyStore | null;
  analytics: AnalyticsData | null;
}

interface LoadingProgress {
  isLoading: boolean;
  stage: string;
  progress: number;
  details: string;
}

interface DataContextType {
  data: ShopifyData;
  loading: LoadingProgress;
  error: string | null;
  hasData: boolean;
  fetchAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Calculate analytics from fetched data
const calculateAnalyticsFromData = (
  products: ShopifyProduct[],
  orders: ShopifyOrder[],
  customers: ShopifyCustomer[]
): AnalyticsData => {
  // Calculate total revenue from orders
  const totalRevenue = orders.reduce((sum, order) => {
    const amount = parseFloat(order.total_price || "0");
    return sum + amount;
  }, 0);

  // Calculate orders by status
  const ordersByStatus = orders.reduce((acc, order) => {
    const status = order.fulfillment_status || "unfulfilled";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Get recent orders (last 10)
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  // Calculate revenue by month
  const revenueByMonth = orders.reduce((acc, order) => {
    const date = new Date(order.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = parseFloat(order.total_price || "0");
    acc[monthKey] = (acc[monthKey] || 0) + amount;
    return acc;
  }, {} as { [key: string]: number });

  // Calculate top products (simplified - based on line items)
  const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};
  
  orders.forEach(order => {
    order.line_items?.forEach(item => {
      const productName = item.title || "Unknown Product";
      const quantity = item.quantity || 0;
      const price = parseFloat(item.price || "0");
      const revenue = quantity * price;
      
      if (!productSales[productName]) {
        productSales[productName] = { name: productName, sales: 0, revenue: 0 };
      }
      
      productSales[productName].sales += quantity;
      productSales[productName].revenue += revenue;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalRevenue,
    totalOrders: orders.length,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    totalProducts: products.length,
    recentOrders,
    topProducts,
    ordersByStatus,
    revenueByMonth,
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useShopify();
  
  const [data, setData] = useState<ShopifyData>({
    products: [],
    orders: [],
    customers: [],
    shop: null,
    analytics: null,
  });

  const [loading, setLoading] = useState<LoadingProgress>({
    isLoading: false,
    stage: "",
    progress: 0,
    details: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const updateProgress = (stage: string, progress: number, details: string) => {
    setLoading({ isLoading: true, stage, progress, details });
  };

  const fetchAllData = useCallback(async () => {
    if (!isConnected) return;

    setLoading({ isLoading: true, stage: "Initializing", progress: 0, details: "Preparing to fetch data..." });
    setError(null);

    try {
      // Step 1: Get shop info
      updateProgress("Shop Info", 10, "Fetching shop information...");
      const shopRes = await shopifyAPI.getShop();
      const shopDomain = shopRes.shop?.myshopify_domain || "";
      const accessToken = shopifyAPI.getAccessToken();

      if (!shopDomain) {
        throw new Error("Unable to get shop domain");
      }

      // Step 2: Fetch products
      updateProgress("Products", 25, "Loading all products...");
      const productsRes = await cachedDataService.getProducts(
        shopDomain, 
        accessToken || undefined, 
        { limit: 5000 }
      );

      // Step 3: Fetch orders
      updateProgress("Orders", 50, "Loading all orders...");
      const ordersRes = await cachedDataService.getOrders(
        shopDomain, 
        accessToken || undefined, 
        { limit: 5000 }
      );

      // Step 4: Fetch customers
      updateProgress("Customers", 75, "Loading all customers...");
      const customersRes = await cachedDataService.getCustomers(
        shopDomain, 
        accessToken || undefined, 
        { limit: 5000 }
      );

      // Step 5: Calculate analytics
      updateProgress("Analytics", 90, "Calculating analytics...");
      const calculatedAnalytics = calculateAnalyticsFromData(
        productsRes.products || [],
        ordersRes.orders || [],
        customersRes.customers || []
      );

      // Step 6: Complete
      updateProgress("Complete", 100, "Finalizing data...");

      const newData = {
        products: productsRes.products || [],
        orders: ordersRes.orders || [],
        customers: customersRes.customers || [],
        shop: shopRes.shop,
        analytics: calculatedAnalytics,
      };

      setData(newData);
      setHasData(true);

      console.log("✅ All data loaded successfully:", {
        products: newData.products.length,
        orders: newData.orders.length,
        customers: newData.customers.length,
        analytics: calculatedAnalytics ? "calculated" : "missing",
        totalProducts: productsRes.pagination?.total_count || 0,
        totalOrders: ordersRes.pagination?.total_count || 0,
        totalCustomers: customersRes.pagination?.total_count || 0,
      });

    } catch (err) {
      console.error("Data fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading({ isLoading: false, stage: "", progress: 0, details: "" });
    }
  }, [isConnected]);

  const refreshData = useCallback(async () => {
    setHasData(false); // Reset data state to show loading
    await fetchAllData();
  }, [fetchAllData]);

  const value: DataContextType = {
    data,
    loading,
    error,
    hasData,
    fetchAllData,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
