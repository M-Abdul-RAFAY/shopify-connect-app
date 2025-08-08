import { useState, useEffect, useCallback } from "react";
import {
  shopifyAPI,
  ShopifyProduct,
  ShopifyOrder,
  ShopifyCustomer,
} from "../services/shopifyAPI";
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

export const useShopifyData = () => {
  const { isConnected } = useShopify();
  const [data, setData] = useState({
    products: [] as ShopifyProduct[],
    orders: [] as ShopifyOrder[],
    customers: [] as ShopifyCustomer[],
    analytics: null as AnalyticsData | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const [productsRes, ordersRes, customersRes, analyticsRes] =
        await Promise.all([
          shopifyAPI.getProducts(50),
          shopifyAPI.getOrders(50),
          shopifyAPI.getCustomers(50),
          shopifyAPI.getAnalytics(),
        ]);

      setData({
        products: productsRes.products,
        orders: ordersRes.orders,
        customers: customersRes.customers,
        analytics: analyticsRes,
      });
    } catch (err) {
      setError("Failed to fetch Shopify data");
      console.error("Failed to fetch Shopify data:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

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
      const response = await shopifyAPI.getProducts(100);
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
      const response = await shopifyAPI.getOrders(100);
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
      const response = await shopifyAPI.getCustomers(100);
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
  const { isConnected } = useShopify();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await shopifyAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError("Failed to fetch analytics");
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      fetchAnalytics();
    }
  }, [isConnected, fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};
