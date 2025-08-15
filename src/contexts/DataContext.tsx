import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  ShopifyProduct,
  ShopifyOrder,
  ShopifyCustomer,
  ShopifyStore,
  shopifyAPI,
} from "../services/shopifyAPI";
import cachedDataService from "../services/cachedDataService";
import { useShopify } from "./ShopifyContext";
import { syncProgressService, SyncProgress } from "../services/syncProgressService";

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
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  // Calculate revenue by month
  const revenueByMonth = orders.reduce((acc, order) => {
    const date = new Date(order.created_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const amount = parseFloat(order.total_price || "0");
    acc[monthKey] = (acc[monthKey] || 0) + amount;
    return acc;
  }, {} as { [key: string]: number });

  // Calculate top products (simplified - based on line items)
  const productSales: {
    [key: string]: { name: string; sales: number; revenue: number };
  } = {};

  orders.forEach((order) => {
    order.line_items?.forEach((item) => {
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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isConnected, shopData } = useShopify();

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

  // Start monitoring sync progress when shop connects
  useEffect(() => {
    if (isConnected && shopData) {
      const shopDomain = shopData.myshopify_domain || shopData.domain || "";
      if (shopDomain) {
        console.log("🎯 Starting sync progress monitoring for:", shopDomain);
        
        // Start listening to sync progress
        syncProgressService.startListening(shopDomain, (progress: SyncProgress) => {
          console.log("📊 Received sync progress:", progress);
          
          setLoading({
            isLoading: progress.status === 'running',
            stage: progress.stage,
            progress: progress.progress,
            details: progress.details,
          });

          // If sync completed, refresh data from database automatically
          if (progress.status === 'completed') {
            setTimeout(async () => {
              console.log("✅ Smart sync completed, refreshing data from database...");
              try {
                // Use existing shop data and fetch from cache
                const shopDomain = shopData.myshopify_domain || shopData.domain || "";
                const accessToken = shopifyAPI.getAccessToken();
                
                // Fetch fresh data from database
                updateProgress("Loading", 50, "Loading fresh data from database...");
                
                const [productsRes, ordersRes, customersRes] = await Promise.all([
                  cachedDataService.getProducts(shopDomain, accessToken || undefined, { limit: 10000 }),
                  cachedDataService.getOrders(shopDomain, accessToken || undefined, { limit: 10000 }),
                  cachedDataService.getCustomers(shopDomain, accessToken || undefined, { limit: 10000 })
                ]);

                // Update data
                setData({
                  products: productsRes.products || [],
                  orders: ordersRes.orders || [],
                  customers: customersRes.customers || [],
                  shop: shopData,
                  analytics: calculateAnalyticsFromData(
                    productsRes.products || [],
                    ordersRes.orders || [],
                    customersRes.customers || []
                  ),
                });
                
                setHasData(true);
                console.log("✅ Fresh data loaded from database");
              } catch (error) {
                console.error("Error loading fresh data:", error);
              } finally {
                // Clear loading state
                setLoading({ isLoading: false, stage: "", progress: 0, details: "" });
              }
            }, 1000);
          }
        });
      }
    }

    // Cleanup on unmount or disconnect
    return () => {
      if (shopData) {
        const shopDomain = shopData.myshopify_domain || shopData.domain || "";
        if (shopDomain) {
          syncProgressService.stopListening(shopDomain);
        }
      }
    };
  }, [isConnected, shopData]);

  const updateProgress = (stage: string, progress: number, details: string) => {
    setLoading({ isLoading: true, stage, progress, details });
  };

  const fetchAllData = useCallback(async () => {
    if (!isConnected || !shopData) return;

    setLoading({
      isLoading: true,
      stage: "Initializing",
      progress: 0,
      details: "Preparing to fetch data...",
    });
    setError(null);

    try {
      // Step 1: Use existing shop data - no API call needed!
      updateProgress("Shop Info", 10, "Using cached shop information...");
      const shopDomain = shopData.myshopify_domain || "";
      const accessToken = shopifyAPI.getAccessToken();

      if (!shopDomain) {
        throw new Error("Unable to get shop domain from cached data");
      }

      console.log(
        "📋 Using cached shop domain:",
        shopDomain,
        "- No API call needed!"
      );

      // Step 2: Fetch products from MongoDB only
      updateProgress("Products", 25, "Loading all products from cache...");
      const productsRes = await cachedDataService.getProducts(
        shopDomain,
        accessToken || undefined,
        { limit: 10000 }
      );

      // Step 3: Fetch orders
      updateProgress("Orders", 50, "Loading all orders...");
      const ordersRes = await cachedDataService.getOrders(
        shopDomain,
        accessToken || undefined,
        { limit: 10000 }
      );

      // Step 4: Fetch customers
      updateProgress("Customers", 75, "Loading all customers...");
      const customersRes = await cachedDataService.getCustomers(
        shopDomain,
        accessToken || undefined,
        { limit: 10000 }
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
        shop: shopData, // Use shopData from context instead of API call
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
  }, [isConnected, shopData]);

  const refreshData = useCallback(async () => {
    if (!isConnected || !shopData) return;

    console.log("🔄 Refreshing data - fetching latest from Shopify...");
    
    const shopDomain = shopData.myshopify_domain || shopData.domain || "";
    const accessToken = shopifyAPI.getAccessToken();

    if (!shopDomain || !accessToken) {
      console.error("Missing shop domain or access token for refresh");
      return;
    }

    setLoading({
      isLoading: true,
      stage: "Refreshing",
      progress: 10,
      details: "Fetching latest data from Shopify...",
    });

    try {
      // Trigger smart sync to get latest data
      const response = await fetch(
        "http://localhost:3001/api/shopify/smart-sync",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shop: shopDomain,
            accessToken: accessToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Smart sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Data refresh completed:", result.results);

      // After smart sync, fetch updated data from database
      setHasData(false); // Reset data state
      await fetchAllData();
      
    } catch (error) {
      console.error("❌ Data refresh failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to refresh data: ${errorMessage}`);
      setLoading({ isLoading: false, stage: "", progress: 0, details: "" });
    }
  }, [isConnected, shopData, fetchAllData]);

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
