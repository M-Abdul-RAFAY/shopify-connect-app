import { useState, useEffect, useCallback } from "react";
import {
  postexAPI,
  PostExOrderResponse,
  PostExApiError,
  matchOrdersWithTracking,
} from "../services/postexAPI";
import { ShopifyOrder } from "../services/shopifyAPI";

interface UsePostExTrackingReturn {
  trackingData: Record<string, PostExOrderResponse | PostExApiError>;
  loading: boolean;
  error: string | null;
  trackOrder: (trackingNumber: string) => Promise<void>;
  trackMultipleOrders: (trackingNumbers: string[]) => Promise<void>;
  refreshTracking: () => Promise<void>;
  getOrderWithTracking: (orders: ShopifyOrder[]) => any[];
}

export const usePostExTracking = (
  initialTrackingNumbers: string[] = []
): UsePostExTrackingReturn => {
  const [trackingData, setTrackingData] = useState<
    Record<string, PostExOrderResponse | PostExApiError>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedNumbers, setTrackedNumbers] = useState<Set<string>>(
    new Set(initialTrackingNumbers)
  );

  const trackOrder = useCallback(async (trackingNumber: string) => {
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await postexAPI.trackOrder(trackingNumber);
      setTrackingData((prev) => ({
        ...prev,
        [trackingNumber]: result,
      }));
      setTrackedNumbers((prev) => new Set([...prev, trackingNumber]));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to track order";
      setError(errorMessage);
      setTrackingData((prev) => ({
        ...prev,
        [trackingNumber]: {
          statusCode: "ERROR",
          statusMessage: errorMessage,
          error: errorMessage,
        },
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  const trackMultipleOrders = useCallback(async (trackingNumbers: string[]) => {
    if (!trackingNumbers.length) return;

    setLoading(true);
    setError(null);

    try {
      const results = await postexAPI.trackMultipleOrders(trackingNumbers);
      setTrackingData((prev) => ({
        ...prev,
        ...results,
      }));
      setTrackedNumbers((prev) => new Set([...prev, ...trackingNumbers]));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to track orders";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTracking = useCallback(async () => {
    const numbersToRefresh = Array.from(trackedNumbers);
    if (numbersToRefresh.length > 0) {
      await trackMultipleOrders(numbersToRefresh);
    }
  }, [trackedNumbers, trackMultipleOrders]);

  const getOrderWithTracking = useCallback(
    (orders: ShopifyOrder[]) => {
      return matchOrdersWithTracking(orders, trackingData);
    },
    [trackingData]
  );

  // Auto-track initial tracking numbers
  useEffect(() => {
    if (initialTrackingNumbers.length > 0) {
      trackMultipleOrders(initialTrackingNumbers);
    }
  }, [initialTrackingNumbers, trackMultipleOrders]);

  return {
    trackingData,
    loading,
    error,
    trackOrder,
    trackMultipleOrders,
    refreshTracking,
    getOrderWithTracking,
  };
};

// Hook for tracking a single order
export const usePostExOrder = (trackingNumber: string) => {
  const [orderData, setOrderData] = useState<PostExOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!trackingNumber) return;

    setLoading(true);
    setError(null);

    try {
      const result = await postexAPI.trackOrder(trackingNumber);
      setOrderData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch order";
      setError(errorMessage);
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  }, [trackingNumber]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const currentStatus = orderData
    ? postexAPI.getCurrentStatus(orderData)
    : null;
  const timeline = orderData ? postexAPI.formatTimeline(orderData) : [];
  const isDelivered = orderData ? postexAPI.isDelivered(orderData) : false;
  const isInTransit = orderData ? postexAPI.isInTransit(orderData) : false;
  const isDeliveryFailed = orderData
    ? postexAPI.isDeliveryFailed(orderData)
    : false;

  return {
    orderData,
    loading,
    error,
    currentStatus,
    timeline,
    isDelivered,
    isInTransit,
    isDeliveryFailed,
    refresh: fetchOrder,
  };
};
