// PostEx Logistics API Integration
export interface PostExStatus {
  transactionStatusMessage: string;
  transactionStatusMessageCode: string;
  modifiedDatetime: string;
}

export interface PostExOrderResponse {
  statusCode: string;
  statusMessage: string;
  dist: {
    customerName: string;
    trackingNumber: string;
    orderPickupDate: string;
    transactionStatusHistory: PostExStatus[];
  };
}

export interface PostExApiError {
  statusCode: string;
  statusMessage: string;
  error?: string;
}

// PostEx Status Code Mappings
export const POSTEX_STATUS_CODES = {
  "0001": { label: "At Warehouse", type: "processing", color: "bg-blue-500" },
  "0003": {
    label: "Received at Warehouse",
    type: "processing",
    color: "bg-blue-500",
  },
  "0004": {
    label: "Enroute for Delivery",
    type: "in-transit",
    color: "bg-yellow-500",
  },
  "0005": {
    label: "Delivered to Customer",
    type: "delivered",
    color: "bg-green-500",
  },
  "0031": {
    label: "Departed to Warehouse",
    type: "in-transit",
    color: "bg-yellow-500",
  },
  "0033": {
    label: "Departed to Destination",
    type: "in-transit",
    color: "bg-yellow-500",
  },
  "0035": {
    label: "Arrived at Transit Hub",
    type: "processing",
    color: "bg-blue-500",
  },
  "0038": {
    label: "Waiting for Delivery",
    type: "pending",
    color: "bg-orange-500",
  },
  "0040": {
    label: "Return in Transit",
    type: "returning",
    color: "bg-red-500",
  },
  "0041": {
    label: "Returned to Sender",
    type: "returned",
    color: "bg-red-500",
  },
  "0042": { label: "Delivery Failed", type: "failed", color: "bg-red-500" },
} as const;

export class PostExAPI {
  private baseURL = "https://api.postex.pk/services/courier/api";

  constructor(private apiKey?: string) {}

  /**
   * Track order by tracking number
   */
  async trackOrder(trackingNumber: string): Promise<PostExOrderResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/guest/get-order/${trackingNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PostExOrderResponse = await response.json();

      if (data.statusCode !== "200") {
        throw new Error(data.statusMessage || "Failed to fetch order data");
      }

      return data;
    } catch (error) {
      console.error("Error tracking PostEx order:", error);
      throw error;
    }
  }

  /**
   * Get multiple order statuses
   */
  async trackMultipleOrders(
    trackingNumbers: string[]
  ): Promise<Record<string, PostExOrderResponse | PostExApiError>> {
    const results: Record<string, PostExOrderResponse | PostExApiError> = {};

    await Promise.allSettled(
      trackingNumbers.map(async (trackingNumber) => {
        try {
          const result = await this.trackOrder(trackingNumber);
          results[trackingNumber] = result;
        } catch (error) {
          results[trackingNumber] = {
            statusCode: "ERROR",
            statusMessage:
              error instanceof Error ? error.message : "Unknown error",
            error: "Failed to fetch tracking data",
          };
        }
      })
    );

    return results;
  }

  /**
   * Get current status of an order
   */
  getCurrentStatus(orderData: PostExOrderResponse): PostExStatus | null {
    if (!orderData.dist?.transactionStatusHistory?.length) {
      return null;
    }

    // Return the most recent status (first in array as they're sorted by latest)
    return orderData.dist.transactionStatusHistory[0];
  }

  /**
   * Get status type and styling info
   */
  getStatusInfo(statusCode: string) {
    return (
      POSTEX_STATUS_CODES[statusCode as keyof typeof POSTEX_STATUS_CODES] || {
        label: "Unknown Status",
        type: "unknown",
        color: "bg-gray-500",
      }
    );
  }

  /**
   * Format tracking timeline for display
   */
  formatTimeline(orderData: PostExOrderResponse) {
    if (!orderData.dist?.transactionStatusHistory?.length) {
      return [];
    }

    return orderData.dist.transactionStatusHistory.map((status, index) => ({
      ...status,
      statusInfo: this.getStatusInfo(status.transactionStatusMessageCode),
      isLatest: index === 0,
      formattedDate: new Date(status.modifiedDatetime).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }));
  }

  /**
   * Check if order is delivered
   */
  isDelivered(orderData: PostExOrderResponse): boolean {
    const currentStatus = this.getCurrentStatus(orderData);
    return currentStatus?.transactionStatusMessageCode === "0005";
  }

  /**
   * Check if order is in transit
   */
  isInTransit(orderData: PostExOrderResponse): boolean {
    const currentStatus = this.getCurrentStatus(orderData);
    const inTransitCodes = ["0004", "0031", "0033"];
    return currentStatus
      ? inTransitCodes.includes(currentStatus.transactionStatusMessageCode)
      : false;
  }

  /**
   * Check if order has failed delivery
   */
  isDeliveryFailed(orderData: PostExOrderResponse): boolean {
    const currentStatus = this.getCurrentStatus(orderData);
    const failedCodes = ["0042", "0040", "0041"];
    return currentStatus
      ? failedCodes.includes(currentStatus.transactionStatusMessageCode)
      : false;
  }

  /**
   * Get estimated delivery date (if available)
   */
  getEstimatedDelivery(orderData: PostExOrderResponse): string | null {
    // PostEx API doesn't seem to provide estimated delivery in the example
    // You might need to calculate this based on pickup date and average delivery times
    if (orderData.dist?.orderPickupDate) {
      const pickupDate = new Date(orderData.dist.orderPickupDate);
      const estimatedDelivery = new Date(pickupDate);
      estimatedDelivery.setDate(pickupDate.getDate() + 3); // Assume 3 days delivery
      return estimatedDelivery.toISOString();
    }
    return null;
  }
}

// Export a default instance
export const postexAPI = new PostExAPI();

// Helper function to extract tracking numbers from order data
export const extractTrackingNumbers = (orders: any[]): string[] => {
  return orders
    .map((order) => order.tracking_number || order.trackingNumber)
    .filter(Boolean);
};

// Helper function to match Shopify orders with PostEx tracking
export const matchOrdersWithTracking = (
  shopifyOrders: any[],
  trackingData: Record<string, PostExOrderResponse | PostExApiError>
) => {
  return shopifyOrders.map((order) => {
    const trackingNumber = order.tracking_number || order.trackingNumber;
    const postexData = trackingNumber ? trackingData[trackingNumber] : null;

    return {
      ...order,
      postexTracking: postexData,
      hasTracking: !!trackingNumber,
      isDelivered:
        postexData && "dist" in postexData
          ? postexAPI.isDelivered(postexData)
          : false,
      currentStatus:
        postexData && "dist" in postexData
          ? postexAPI.getCurrentStatus(postexData)
          : null,
    };
  });
};
