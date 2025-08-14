import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

class CachedDataService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper function to normalize shop domain to full .myshopify.com format
  private normalizeShopDomain(shopDomain: string): string {
    if (shopDomain.includes(".myshopify.com")) {
      return shopDomain;
    }
    return `${shopDomain}.myshopify.com`;
  }

  // Check if cached data is available and recent
  async isCachedDataAvailable(shopDomain: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseURL}/cached/sync-status/${shopDomain}`
      );
      const status = response.data;

      // Check if we have actual data in cache (regardless of recent sync status)
      // Prioritize checking if data exists over when it was synced
      const dataTypes = ["products", "orders", "customers"];

      return dataTypes.some((type) => {
        const typeStatus = status[type];
        // Return true if we have any records, even if sync had errors
        return (
          typeStatus && typeStatus.totalRecords && typeStatus.totalRecords > 0
        );
      });
    } catch (error) {
      console.warn("Error checking cached data availability:", error);
      return false;
    }
  }

  // Get products from MongoDB database (comprehensive sync ensures all data is available)
  async getProducts(
    shopDomain: string,
    accessToken?: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      vendor?: string;
      product_type?: string;
      status?: string;
      sort?: string;
      order?: string;
    } = {}
  ) {
    console.log(`🔍 Fetching products from database for ${shopDomain}...`);
    try {
      // Normalize shop domain and use cached products endpoint that reads from database
      const normalizedShopDomain = this.normalizeShopDomain(shopDomain);
      const queryParams = new URLSearchParams({
        shop: normalizedShopDomain,
        ...Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined)
        ),
      });

      const response = await axios.get(
        `${this.baseURL}/cached/products?${queryParams}`
      );

      console.log(
        `✅ Successfully fetched ${
          response.data.products?.length || 0
        } products from database`
      );

      return {
        ...response.data,
        source: "database",
      };
    } catch (error) {
      console.error("❌ Database products fetch failed:", error);
      return {
        products: [],
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_count: 0,
          per_page: 0,
        },
        filters: {
          vendors: [],
          product_types: [],
          statuses: [],
        },
        source: "database-error",
        error: "Database unavailable - please ensure sync is completed",
      };
    }
  }

  // Get orders from database (cached data from comprehensive sync)
  async getOrders(
    shopDomain: string,
    accessToken?: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      financial_status?: string;
      fulfillment_status?: string;
      date_from?: string;
      date_to?: string;
      sort?: string;
      order?: string;
    } = {}
  ) {
    console.log(`🔍 Fetching orders from database for ${shopDomain}...`);
    try {
      // Normalize shop domain and use cached orders endpoint that fetches from database
      const normalizedShopDomain = this.normalizeShopDomain(shopDomain);
      const queryParams = new URLSearchParams({
        shop: normalizedShopDomain,
        ...Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined)
        ),
      });

      const response = await axios.get(
        `${this.baseURL}/cached/orders?${queryParams}`
      );

      const orders = response.data?.orders || [];
      console.log(
        `✅ Successfully fetched ${orders.length} orders from database`
      );

      return {
        orders: orders,
        pagination: response.data?.pagination || {
          current_page: params.page || 1,
          total_pages: 1,
          total_count: orders.length,
          per_page: params.limit || 250,
        },
        filters: {
          financial_statuses: [
            "pending",
            "authorized",
            "paid",
            "partially_paid",
            "refunded",
            "voided",
            "partially_refunded",
          ],
          fulfillment_statuses: [
            "fulfilled",
            "partial",
            "unfulfilled",
            "restocked",
          ],
        },
        analytics: response.data?.analytics || {
          total_revenue: 0,
          order_count: orders.length,
          average_order_value: 0,
        },
        source: "database",
      };
    } catch (error) {
      console.error("❌ Database orders fetch failed:", error);
      return {
        orders: [],
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_count: 0,
          per_page: 0,
        },
        filters: {
          financial_statuses: [],
          fulfillment_statuses: [],
        },
        analytics: {
          total_revenue: 0,
          order_count: 0,
          average_order_value: 0,
        },
        source: "database-error",
        error: "Database orders unavailable",
      };
    }
  }

  // Get customers from database (cached data from comprehensive sync)
  async getCustomers(
    shopDomain: string,
    accessToken?: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      state?: string;
      min_orders?: string;
      max_orders?: string;
      min_spent?: string;
      max_spent?: string;
      sort?: string;
      order?: string;
    } = {}
  ) {
    console.log(`🔍 Fetching customers from database for ${shopDomain}...`);
    try {
      // Normalize shop domain and use cached customers endpoint that fetches from database
      const normalizedShopDomain = this.normalizeShopDomain(shopDomain);
      const queryParams = new URLSearchParams({
        shop: normalizedShopDomain,
        ...Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined)
        ),
      });

      const response = await axios.get(
        `${this.baseURL}/cached/customers?${queryParams}`
      );

      const customers = response.data?.customers || [];
      console.log(
        `✅ Successfully fetched ${customers.length} customers from database`
      );

      return {
        customers: customers,
        pagination: response.data?.pagination || {
          current_page: params.page || 1,
          total_pages: 1,
          total_count: customers.length,
          per_page: params.limit || 250,
        },
        filters: {
          states: ["disabled", "enabled", "invited", "declined"],
        },
        source: "database",
      };
    } catch (error) {
      console.error("❌ Database customers fetch failed:", error);
      return {
        customers: [],
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_count: 0,
          per_page: 0,
        },
        filters: {
          states: [],
        },
        source: "database-error",
        error: "Database customers unavailable",
      };
    }
  }

  // Fetch and store all data in database
  async fetchAndStoreAllData(shopDomain: string, accessToken?: string) {
    try {
      console.log(`🗄️ Triggering fetch and store for ${shopDomain}...`);

      if (!accessToken) {
        throw new Error("Access token is required for data synchronization");
      }

      const response = await axios.post(
        `${this.baseURL}/shopify/fetch-and-store-all`,
        {
          shop: shopDomain,
          accessToken: accessToken,
        }
      );
      console.log(`✅ Database updated:`, response.data.results);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch and store data:", error);
      throw error;
    }
  }

  // Get analytics from cache
  async getAnalytics(shopDomain: string, period: string = "30d") {
    try {
      const response = await axios.get(
        `${this.baseURL}/cached/analytics/${shopDomain}`,
        {
          params: { period },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch analytics from cache:", error);
      throw error;
    }
  }

  // Force sync for a shop
  async triggerSync(
    shopDomain: string,
    dataType: string = "all",
    accessToken?: string
  ) {
    try {
      const response = await axios.post(
        `${this.baseURL}/cached/sync/${shopDomain}`,
        {
          dataType,
          accessToken,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to trigger sync:", error);
      throw error;
    }
  }

  // Get sync status
  async getSyncStatus(shopDomain: string) {
    try {
      const response = await axios.get(
        `${this.baseURL}/cached/sync-status/${shopDomain}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get sync status:", error);
      return {};
    }
  }

  // Store shop information after OAuth
  async storeShop(shopDomain: string, accessToken: string) {
    try {
      const response = await axios.post(`${this.baseURL}/shopify/store-shop`, {
        shop: shopDomain,
        accessToken,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to store shop:", error);
      throw error;
    }
  }
}

// Create singleton instance
const cachedDataService = new CachedDataService();

export default cachedDataService;
