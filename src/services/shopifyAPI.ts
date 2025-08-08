import axios from "axios";
import Cookies from "js-cookie";

export interface ShopifyStore {
  id: number;
  name: string;
  email: string;
  domain: string;
  province: string;
  country: string;
  address1: string;
  zip: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  primary_locale: string;
  primary_location_id: number;
  timezone: string;
  iana_timezone: string;
  shop_owner: string;
  money_format: string;
  money_with_currency_format: string;
  weight_unit: string;
  province_code: string;
  taxes_included: boolean;
  auto_configure_tax_inclusivity: boolean;
  tax_shipping: boolean;
  county_taxes: boolean;
  plan_display_name: string;
  plan_name: string;
  has_discounts: boolean;
  has_gift_cards: boolean;
  myshopify_domain: string;
  google_apps_domain: string;
  google_apps_login_enabled: boolean;
  money_in_emails_format: string;
  money_with_currency_in_emails_format: string;
  eligible_for_payments: boolean;
  requires_extra_payments_agreement: boolean;
  password_enabled: boolean;
  has_storefront: boolean;
  finances: boolean;
  checkout_api_supported: boolean;
  multi_location_enabled: boolean;
  setup_required: boolean;
  pre_launch_enabled: boolean;
  enabled_presentment_currencies: string[];
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  handle: string;
  status: string;
  tags: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  options: ShopifyOption[];
  created_at: string;
  updated_at: string;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string;
  fulfillment_service: string;
  inventory_management: string;
  option1: string;
  option2: string;
  option3: string;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string;
  grams: number;
  image_id: number;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id: string;
}

export interface ShopifyOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyOrder {
  id: number;
  email: string;
  closed_at: string;
  created_at: string;
  updated_at: string;
  number: number;
  note: string;
  token: string;
  gateway: string;
  test: boolean;
  total_price: string;
  subtotal_price: string;
  total_weight: number;
  total_tax: string;
  taxes_included: boolean;
  currency: string;
  financial_status: string;
  confirmed: boolean;
  total_discounts: string;
  total_line_items_price: string;
  cart_token: string;
  buyer_accepts_marketing: boolean;
  name: string;
  referring_site: string;
  landing_site: string;
  cancelled_at: string;
  cancel_reason: string;
  total_price_usd: string;
  checkout_token: string;
  reference: string;
  user_id: number;
  location_id: number;
  source_identifier: string;
  source_url: string;
  processed_at: string;
  device_id: number;
  phone: string;
  customer_locale: string;
  app_id: number;
  browser_ip: string;
  landing_site_ref: string;
  order_number: number;
  discount_applications: any[];
  discount_codes: any[];
  note_attributes: any[];
  payment_gateway_names: string[];
  processing_method: string;
  checkout_id: number;
  source_name: string;
  fulfillment_status: string;
  tax_lines: any[];
  tags: string;
  contact_email: string;
  order_status_url: string;
  presentment_currency: string;
  total_line_items_price_set: any;
  total_discounts_set: any;
  total_shipping_price_set: any;
  subtotal_price_set: any;
  total_price_set: any;
  total_tax_set: any;
  line_items: ShopifyLineItem[];
  shipping_lines: any[];
  billing_address: ShopifyAddress;
  shipping_address: ShopifyAddress;
  fulfillments: any[];
  client_details: any;
  refunds: any[];
  customer: ShopifyCustomer;
}

export interface ShopifyLineItem {
  id: number;
  variant_id: number;
  title: string;
  quantity: number;
  sku: string;
  variant_title: string;
  vendor: string;
  fulfillment_service: string;
  product_id: number;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
  name: string;
  variant_inventory_management: string;
  properties: any[];
  product_exists: boolean;
  fulfillable_quantity: number;
  grams: number;
  price: string;
  total_discount: string;
  fulfillment_status: string;
  price_set: any;
  total_discount_set: any;
  discount_allocations: any[];
  duties: any[];
  admin_graphql_api_id: string;
  tax_lines: any[];
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number;
  note: string;
  verified_email: boolean;
  multipass_identifier: string;
  tax_exempt: boolean;
  phone: string;
  tags: string;
  last_order_name: string;
  currency: string;
  addresses: ShopifyAddress[];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string;
  tax_exemptions: any[];
  admin_graphql_api_id: string;
  default_address: ShopifyAddress;
}

export interface ShopifyAddress {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
}

class ShopifyAPI {
  private accessToken: string | null = null;
  private shop: string | null = null;

  constructor() {
    this.accessToken = Cookies.get("shopify_access_token") || null;
    this.shop = Cookies.get("shopify_shop") || null;
  }

  setCredentials(accessToken: string, shop: string) {
    this.accessToken = accessToken;
    this.shop = shop;
    Cookies.set("shopify_access_token", accessToken, { expires: 365 });
    Cookies.set("shopify_shop", shop, { expires: 365 });
  }

  clearCredentials() {
    this.accessToken = null;
    this.shop = null;
    Cookies.remove("shopify_access_token");
    Cookies.remove("shopify_shop");
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.shop);
  }

  getAuthUrl(): string {
    const scopes =
      import.meta.env.VITE_SHOPIFY_SCOPES ||
      "read_products,read_orders,read_customers,read_shop";
    const redirectUri =
      import.meta.env.VITE_SHOPIFY_REDIRECT_URI ||
      "https://16d791950278.ngrok-free.app/auth/callback";
    const state = Math.random().toString(36).substring(7);

    Cookies.set("shopify_oauth_state", state, { expires: 1 });

    return `https://{shop}.myshopify.com/admin/oauth/authorize?client_id=${
      import.meta.env.VITE_SHOPIFY_APP_ID
    }&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
  }

  async initiateAuth(shopDomain: string): Promise<string> {
    console.log("Raw shop domain received:", shopDomain);

    // Clean the shop domain more carefully
    let cleanShop = shopDomain
      .replace(/^https?:\/\//, "") // Remove protocol
      .replace(/\/$/, ""); // Remove trailing slash

    // If it already includes .myshopify.com, extract just the shop name
    if (cleanShop.includes(".myshopify.com")) {
      cleanShop = cleanShop.replace(".myshopify.com", "");
    }

    console.log("Cleaned shop domain:", cleanShop);

    const scopes =
      import.meta.env.VITE_SHOPIFY_SCOPES ||
      "read_products,read_orders,read_customers,read_shop";
    const redirectUri =
      import.meta.env.VITE_SHOPIFY_REDIRECT_URI ||
      "https://16d791950278.ngrok-free.app/auth/callback";
    const state = Math.random().toString(36).substring(7);

    Cookies.set("shopify_oauth_state", state, { expires: 1 });
    Cookies.set("shopify_shop_domain", cleanShop, { expires: 1 });

    const authUrl = `https://${cleanShop}.myshopify.com/admin/oauth/authorize?client_id=${
      import.meta.env.VITE_SHOPIFY_APP_ID
    }&scope=${scopes}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}`;

    console.log("Generated OAuth URL:", authUrl);
    return authUrl;
  }

  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<{ access_token: string; scope: string }> {
    console.log("Starting token exchange...");

    const savedState = Cookies.get("shopify_oauth_state");
    const shop = Cookies.get("shopify_shop_domain");

    console.log("Validation data:", {
      receivedState: state,
      savedState,
      shop,
      stateMatch: state === savedState,
    });

    if (state !== savedState) {
      throw new Error("Invalid state parameter");
    }

    if (!shop) {
      throw new Error("Shop domain not found");
    }

    // Use backend proxy instead of direct Shopify API call
    const backendUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "https://16d791950278.ngrok-free.app/api";
    const tokenUrl = `${backendUrl}/shopify/exchange-token`;

    console.log("Token exchange URL (via backend):", tokenUrl);

    try {
      const response = await axios.post(
        tokenUrl,
        {
          code: code,
          shop: shop,
          state: state,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Token exchange response status:", response.status);
      console.log("Token exchange response data:", {
        hasAccessToken: !!response.data.access_token,
        scope: response.data.scope,
      });

      const { access_token, scope } = response.data;
      this.setCredentials(access_token, shop);

      // Clean up temporary cookies
      Cookies.remove("shopify_oauth_state");
      Cookies.remove("shopify_shop_domain");

      console.log("Token exchange completed successfully");
      return { access_token, scope };
    } catch (error) {
      console.error("Token exchange failed:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      throw new Error(
        `Token exchange failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data?: any
  ): Promise<T> {
    if (!this.accessToken || !this.shop) {
      throw new Error("Not authenticated with Shopify");
    }

    try {
      console.log(
        `Making ${method} request via backend proxy: /api/shopify/proxy${endpoint}`
      );

      const response = await axios({
        method,
        url: `/api/shopify/proxy${endpoint}`,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": this.accessToken,
          "X-Shop-Domain": this.shop,
        },
        data: data ? JSON.stringify(data) : undefined,
      });

      console.log(`Request successful:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`API request failed:`, {
        endpoint,
        method,
        error: error instanceof Error ? error.message : error,
        status: axios.isAxiosError(error) ? error.response?.status : "unknown",
        data: axios.isAxiosError(error) ? error.response?.data : "unknown",
      });
      throw error;
    }
  }

  // Shop Information
  async getShop(): Promise<{ shop: ShopifyStore }> {
    return this.makeRequest<{ shop: ShopifyStore }>("/shop.json");
  }

  // Products
  async getProducts(
    limit: number = 50,
    page_info?: string
  ): Promise<{ products: ShopifyProduct[] }> {
    let endpoint = `/products.json?limit=${limit}`;
    if (page_info) {
      endpoint += `&page_info=${page_info}`;
    }
    return this.makeRequest<{ products: ShopifyProduct[] }>(endpoint);
  }

  async getProduct(id: number): Promise<{ product: ShopifyProduct }> {
    return this.makeRequest<{ product: ShopifyProduct }>(
      `/products/${id}.json`
    );
  }

  // Orders
  async getOrders(
    limit: number = 50,
    status: string = "any"
  ): Promise<{ orders: ShopifyOrder[] }> {
    return this.makeRequest<{ orders: ShopifyOrder[] }>(
      `/orders.json?limit=${limit}&status=${status}`
    );
  }

  async getOrder(id: number): Promise<{ order: ShopifyOrder }> {
    return this.makeRequest<{ order: ShopifyOrder }>(`/orders/${id}.json`);
  }

  // Customers
  async getCustomers(
    limit: number = 50
  ): Promise<{ customers: ShopifyCustomer[] }> {
    return this.makeRequest<{ customers: ShopifyCustomer[] }>(
      `/customers.json?limit=${limit}`
    );
  }

  async getCustomer(id: number): Promise<{ customer: ShopifyCustomer }> {
    return this.makeRequest<{ customer: ShopifyCustomer }>(
      `/customers/${id}.json`
    );
  }

  // Inventory
  async getInventoryLevels(inventoryItemIds: number[]): Promise<any> {
    const ids = inventoryItemIds.join(",");
    return this.makeRequest(`/inventory_levels.json?inventory_item_ids=${ids}`);
  }

  // Analytics - Using the Orders API to derive analytics
  async getAnalytics(): Promise<any> {
    const orders = await this.getOrders(250); // Get more orders for better analytics
    const products = await this.getProducts(250);

    const analytics = {
      totalRevenue: orders.orders.reduce(
        (sum, order) => sum + parseFloat(order.total_price),
        0
      ),
      totalOrders: orders.orders.length,
      averageOrderValue:
        orders.orders.length > 0
          ? orders.orders.reduce(
              (sum, order) => sum + parseFloat(order.total_price),
              0
            ) / orders.orders.length
          : 0,
      totalProducts: products.products.length,
      recentOrders: orders.orders.slice(0, 10),
      topProducts: this.calculateTopProducts(orders.orders),
      ordersByStatus: this.groupOrdersByStatus(orders.orders),
      revenueByMonth: this.calculateRevenueByMonth(orders.orders),
    };

    return analytics;
  }

  private calculateTopProducts(orders: ShopifyOrder[]): any[] {
    const productSales: {
      [key: string]: { name: string; sales: number; revenue: number };
    } = {};

    orders.forEach((order) => {
      order.line_items.forEach((item) => {
        const key = item.product_id.toString();
        if (!productSales[key]) {
          productSales[key] = {
            name: item.title,
            sales: 0,
            revenue: 0,
          };
        }
        productSales[key].sales += item.quantity;
        productSales[key].revenue += parseFloat(item.price) * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private groupOrdersByStatus(orders: ShopifyOrder[]): {
    [key: string]: number;
  } {
    return orders.reduce((acc, order) => {
      const status = order.fulfillment_status || "unfulfilled";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private calculateRevenueByMonth(orders: ShopifyOrder[]): {
    [key: string]: number;
  } {
    return orders.reduce((acc, order) => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      acc[monthKey] = (acc[monthKey] || 0) + parseFloat(order.total_price);
      return acc;
    }, {} as { [key: string]: number });
  }
}

export const shopifyAPI = new ShopifyAPI();
