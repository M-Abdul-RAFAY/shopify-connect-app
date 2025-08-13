import { useState, useEffect, useCallback } from "react";
import {
  shopifyAPI,
  ShopifyProduct,
  ShopifyOrder,
  ShopifyCustomer,
  ShopifyStore,
} from "../services/shopifyAPI";
import cachedDataService from "../services/cachedDataService";
import { useShopify } from "../contexts/ShopifyContext";

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

export const useShopifyData = () => {
  const { isConnected, shopData } = useShopify();
  const [data, setData] = useState({
    products: [] as ShopifyProduct[],
    orders: [] as ShopifyOrder[],
    customers: [] as ShopifyCustomer[],
    shop: null as ShopifyStore | null,
    analytics: null as AnalyticsData | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!isConnected || !shopData) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Starting to fetch all Shopify data using MongoDB cache...");

      // Use existing shop data - no API call needed!
      const shopDomain = shopData.myshopify_domain || "";
      const accessToken = shopifyAPI.getAccessToken();

      console.log(
        "📋 Using cached shop domain:",
        shopDomain,
        "- No API call needed!"
      );
      console.log("Access token available:", !!accessToken);

      // Use cached data service that automatically falls back to API if cache unavailable
      const [productsRes, ordersRes, customersRes] = await Promise.all([
        cachedDataService.getProducts(shopDomain, accessToken || undefined, {
          limit: 10000,
        }), // Get all products
        cachedDataService.getOrders(shopDomain, accessToken || undefined, {
          limit: 10000,
        }), // Get all orders
        cachedDataService.getCustomers(shopDomain, accessToken || undefined, {
          limit: 10000,
        }), // Get all customers
      ]);

      // Calculate analytics from the fetched data
      const calculatedAnalytics = calculateAnalyticsFromData(
        productsRes.products || [],
        ordersRes.orders || [],
        customersRes.customers || []
      );

      console.log("All Shopify data fetched successfully:", {
        products: productsRes.products?.length || 0,
        orders: ordersRes.orders?.length || 0,
        customers: customersRes.customers?.length || 0,
        shop: shopData?.name || "unknown",
        analytics: calculatedAnalytics ? "calculated" : "unavailable",
        source: `${productsRes.source || "api"}_${ordersRes.source || "api"}_${
          customersRes.source || "api"
        }`,
        totalProducts: productsRes.pagination?.total_count || 0,
        totalOrders: ordersRes.pagination?.total_count || 0,
        totalCustomers: customersRes.pagination?.total_count || 0,
      });

      setData({
        products: productsRes.products,
        orders: ordersRes.orders,
        customers: customersRes.customers,
        shop: shopData, // Use shopData from context instead of API call
        analytics: calculatedAnalytics,
      });
    } catch (err) {
      console.error("Detailed error in useShopifyData:", err);
      setError("Failed to fetch Shopify data");
      console.error("Failed to fetch Shopify data:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, shopData]);

  useEffect(() => {
    if (isConnected) {
      fetchAllData();
    }
  }, [isConnected, fetchAllData]);

  return { data, loading, error, refetch: fetchAllData };
};

export const useShopifyProducts = () => {
  const { isConnected } = useShopify();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      // Get shop domain
      const shopRes = await shopifyAPI.getShop();
      const shopDomain = shopRes.shop?.myshopify_domain || "";
      const accessToken = shopifyAPI.getAccessToken();

      // Use cached data service for unlimited products
      const response = await cachedDataService.getProducts(
        shopDomain,
        accessToken || undefined,
        { limit: 10000 }
      );
      console.log(
        `Fetched ${response.products.length} products from ${
          response.source
        } (total available: ${response.pagination?.total_count || "unknown"})`
      );
      setProducts(response.products);
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      fetchProducts();
    }
  }, [isConnected, fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

export const useShopifyOrders = () => {
  const { isConnected } = useShopify();
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      // Get shop domain
      const shopRes = await shopifyAPI.getShop();
      const shopDomain = shopRes.shop?.myshopify_domain || "";
      const accessToken = shopifyAPI.getAccessToken();

      // Use cached data service for unlimited orders
      const response = await cachedDataService.getOrders(
        shopDomain,
        accessToken || undefined,
        { limit: 10000 }
      );
      console.log(
        `Fetched ${response.orders.length} orders from ${
          response.source
        } (total available: ${response.pagination?.total_count || "unknown"})`
      );
      setOrders(response.orders);
    } catch (err) {
      setError("Failed to fetch orders");
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      fetchOrders();
    }
  }, [isConnected, fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
};

export const useShopifyCustomers = () => {
  const { isConnected } = useShopify();
  const [customers, setCustomers] = useState<ShopifyCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      // Get shop domain
      const shopRes = await shopifyAPI.getShop();
      const shopDomain = shopRes.shop?.myshopify_domain || "";
      const accessToken = shopifyAPI.getAccessToken();

      // Use cached data service for unlimited customers
      const response = await cachedDataService.getCustomers(
        shopDomain,
        accessToken || undefined,
        { limit: 10000 }
      );
      console.log(
        `Fetched ${response.customers.length} customers from ${
          response.source
        } (total available: ${response.pagination?.total_count || "unknown"})`
      );
      setCustomers(response.customers);
    } catch (err) {
      setError("Failed to fetch customers");
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      fetchCustomers();
    }
  }, [isConnected, fetchCustomers]);

  return { customers, loading, error, refetch: fetchCustomers };
};

export const useShopifyAnalytics = () => {
  const { isConnected, shopData } = useShopify();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!isConnected || !shopData) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all products, orders, customers from cache and calculate analytics
      const shopDomain = shopData.myshopify_domain || "";
      const accessToken = shopifyAPI.getAccessToken();
      const [productsRes, ordersRes, customersRes] = await Promise.all([
        cachedDataService.getProducts(shopDomain, accessToken || undefined, {
          limit: 10000,
        }),
        cachedDataService.getOrders(shopDomain, accessToken || undefined, {
          limit: 10000,
        }),
        cachedDataService.getCustomers(shopDomain, accessToken || undefined, {
          limit: 10000,
        }),
      ]);
      const calculated = calculateAnalyticsFromData(
        productsRes.products || [],
        ordersRes.orders || [],
        customersRes.customers || []
      );
      setAnalytics(calculated);
    } catch (err) {
      setError("Failed to fetch analytics");
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, shopData]);

  useEffect(() => {
    if (isConnected && shopData) {
      fetchAnalytics();
    }
  }, [isConnected, shopData, fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};

export const useShopifyOrderStats = () => {
  const { isConnected, shopData } = useShopify();
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    processing: 0,
    completed: 0,
    inTransit: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderStats = useCallback(async () => {
    if (!isConnected || !shopData) return;

    setLoading(true);
    setError(null);

    try {
      const shopDomain = shopData.myshopify_domain || "";
      const accessToken = shopifyAPI.getAccessToken();
      const response = await cachedDataService.getOrders(
        shopDomain,
        accessToken || undefined,
        { limit: 10000 }
      );
      const orders = response.orders;
      const stats = {
        totalOrders: orders.length,
        processing: orders.filter(
          (order) =>
            order.fulfillment_status === null ||
            order.fulfillment_status === "pending" ||
            order.fulfillment_status === "restocked"
        ).length,
        completed: orders.filter(
          (order) => order.fulfillment_status === "fulfilled"
        ).length,
        inTransit: orders.filter(
          (order) => order.fulfillment_status === "partial"
        ).length,
      };
      setOrderStats(stats);
    } catch (err) {
      setError("Failed to fetch order statistics");
      console.error("Failed to fetch order statistics:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, shopData]);

  useEffect(() => {
    if (isConnected && shopData) {
      fetchOrderStats();
    }
  }, [isConnected, shopData, fetchOrderStats]);

  return { orderStats, loading, error, refetch: fetchOrderStats };
};

interface FulfillmentData {
  shipments: any[];
  fulfillmentCenters: any[];
  totalShipments: number;
  avgProcessingTime: string;
  onTimeDeliveryRate: string;
}

export const useShopifyFulfillment = () => {
  const { isConnected, shopData } = useShopify();
  const [fulfillmentData, setFulfillmentData] =
    useState<FulfillmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFulfillmentData = useCallback(async () => {
    if (!isConnected || !shopData) return;

    setLoading(true);
    setError(null);

    try {
      // For demo: just use orders from cache and mock fulfillment stats
      const shopDomain = shopData.myshopify_domain || "";
      const accessToken = shopifyAPI.getAccessToken();
      const response = await cachedDataService.getOrders(
        shopDomain,
        accessToken || undefined,
        { limit: 10000 }
      );
      const orders = response.orders;

      // Map orders to shipment format expected by Fulfillment component
      const shipments = orders.map((order: any, index: number) => {
        // Extract tracking number from fulfillments array
        const trackingNumber =
          order.fulfillments && order.fulfillments.length > 0
            ? order.fulfillments[0].tracking_number
            : null;

        return {
          id: `SHP-${order.id || index}`,
          orderId: order.name || `#${order.id || index}`,
          customer:
            order.customer?.first_name && order.customer?.last_name
              ? `${order.customer.first_name} ${order.customer.last_name}`
              : order.billing_address?.name ||
                order.shipping_address?.name ||
                "Unknown Customer",
          origin: "Main Warehouse",
          destination: order.shipping_address
            ? `${order.shipping_address.address1 || ""}, ${
                order.shipping_address.city || ""
              }, ${order.shipping_address.province_code || ""}`
            : "Unknown Address",
          carrier:
            order.fulfillments && order.fulfillments.length > 0
              ? order.fulfillments[0].tracking_company || "PostEx"
              : ["FedEx", "UPS", "DHL", "USPS"][index % 4],
          trackingNumber: trackingNumber,
          status:
            order.fulfillment_status === "fulfilled"
              ? "Delivered"
              : order.fulfillment_status === "partial"
              ? "In Transit"
              : order.fulfillment_status === "restocked"
              ? "Exception"
              : "Processing",
          estimatedDelivery: order.created_at
            ? new Date(
                new Date(order.created_at).getTime() + 5 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split("T")[0]
            : "",
          actualDelivery:
            order.fulfillment_status === "fulfilled"
              ? order.updated_at?.split("T")[0]
              : null,
          items: order.line_items?.length || 1,
          weight: `${(Math.random() * 5 + 1).toFixed(1)} lbs`,
          cost: parseFloat(
            order.total_price || order.total_shipping || "10.99"
          ),
        };
      });

      // Mock fulfillment stats
      const fulfillmentStats = {
        shipments,
        fulfillmentCenters: [],
        totalShipments: shipments.length,
        avgProcessingTime: "2 days",
        onTimeDeliveryRate: "98%",
      };
      setFulfillmentData(fulfillmentStats);
    } catch (err) {
      setError("Failed to fetch fulfillment data");
      console.error("Failed to fetch fulfillment data:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, shopData]);

  useEffect(() => {
    if (isConnected && shopData) {
      fetchFulfillmentData();
    }
  }, [isConnected, shopData, fetchFulfillmentData]);

  return { fulfillmentData, loading, error, refetch: fetchFulfillmentData };
};
