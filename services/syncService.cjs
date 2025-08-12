const cron = require("node-cron");
const axios = require("axios");
const {
  Shop,
  Product,
  Order,
  Customer,
  SyncStatus,
} = require("../models/shopifyModels.cjs");

class ShopifySyncService {
  constructor() {
    this.syncInProgress = new Set(); // Track ongoing syncs per shop
    this.isScheduled = false;
  }

  // Initialize sync schedule
  startScheduledSync() {
    if (this.isScheduled) {
      console.log("Sync schedule already running");
      return;
    }

    // Run sync every 30 minutes for all shops
    cron.schedule("*/30 * * * *", async () => {
      console.log("Starting scheduled sync for all shops...");
      await this.syncAllShops();
    });

    // Run sync every hour for orders (more frequent for recent orders)
    cron.schedule("0 * * * *", async () => {
      console.log("Starting hourly order sync...");
      await this.syncRecentOrders();
    });

    this.isScheduled = true;
    console.log("Shopify sync scheduler started");
  }

  // Sync all data for all shops
  async syncAllShops() {
    try {
      const shops = await Shop.find({});
      console.log(`Found ${shops.length} shops to sync`);

      for (const shop of shops) {
        if (!this.syncInProgress.has(shop.domain)) {
          await this.syncShopData(shop.domain);
        } else {
          console.log(`Sync already in progress for ${shop.domain}`);
        }
      }
    } catch (error) {
      console.error("Error syncing all shops:", error);
    }
  }

  // Sync all data types for a specific shop
  async syncShopData(shopDomain, accessToken = null) {
    if (this.syncInProgress.has(shopDomain)) {
      console.log(`Sync already in progress for ${shopDomain}`);
      return { success: false, message: "Sync already in progress" };
    }

    this.syncInProgress.add(shopDomain);
    console.log(`Starting full sync for shop: ${shopDomain}`);

    try {
      // Get access token if not provided
      if (!accessToken) {
        const shop = await Shop.findOne({ domain: shopDomain });
        if (!shop) {
          throw new Error("Shop not found in database");
        }
        // In a real app, you'd retrieve the stored access token
        // For now, we'll assume it's passed or stored securely
      }

      const results = {
        products: await this.syncProducts(shopDomain, accessToken),
        orders: await this.syncOrders(shopDomain, accessToken),
        customers: await this.syncCustomers(shopDomain, accessToken),
      };

      console.log(`Completed full sync for ${shopDomain}:`, results);
      return { success: true, results };
    } catch (error) {
      console.error(`Error syncing shop ${shopDomain}:`, error);
      return { success: false, error: error.message };
    } finally {
      this.syncInProgress.delete(shopDomain);
    }
  }

  // Sync products with pagination
  async syncProducts(shopDomain, accessToken) {
    console.log(`Syncing products for ${shopDomain}`);

    try {
      // Update sync status
      await this.updateSyncStatus(shopDomain, "products", "started");

      let allProducts = [];
      let sinceId = 0;
      let hasMore = true;
      let totalFetched = 0;

      while (hasMore) {
        try {
          const url = `https://${shopDomain}/admin/api/2024-07/products.json?limit=250&since_id=${sinceId}&fields=id,title,vendor,product_type,handle,status,tags,body_html,variants,images,created_at,updated_at,published_at`;

          console.log(`Fetching products since ID: ${sinceId}`);

          const response = await this.makeShopifyRequest(url, accessToken);
          const products = response.data.products;

          if (products.length === 0) {
            hasMore = false;
            break;
          }

          // Process products in batches
          for (const product of products) {
            await this.upsertProduct(shopDomain, product);
            sinceId = Math.max(sinceId, product.id);
            totalFetched++;
          }

          allProducts.push(...products);

          // If we got less than 250, we're done
          if (products.length < 250) {
            hasMore = false;
          }

          console.log(
            `Fetched ${products.length} products, total: ${totalFetched}`
          );

          // Small delay to respect rate limits
          await this.delay(100);
        } catch (error) {
          console.error(
            `Error fetching products batch for ${shopDomain}:`,
            error.message
          );

          if (error.response?.status === 429) {
            console.log("Rate limited, waiting 2 seconds...");
            await this.delay(2000);
            continue; // Retry this batch
          }

          throw error;
        }
      }

      await this.updateSyncStatus(
        shopDomain,
        "products",
        "completed",
        totalFetched
      );
      console.log(
        `Completed product sync for ${shopDomain}: ${totalFetched} products`
      );

      return { success: true, count: totalFetched };
    } catch (error) {
      await this.updateSyncStatus(
        shopDomain,
        "products",
        "error",
        0,
        error.message
      );
      console.error(`Product sync failed for ${shopDomain}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Sync orders with pagination
  async syncOrders(shopDomain, accessToken) {
    console.log(`Syncing orders for ${shopDomain}`);

    try {
      await this.updateSyncStatus(shopDomain, "orders", "started");

      let sinceId = 0;
      let hasMore = true;
      let totalFetched = 0;

      while (hasMore) {
        try {
          const url = `https://${shopDomain}/admin/api/2024-07/orders.json?limit=250&since_id=${sinceId}&status=any&fields=id,name,email,total_price,subtotal_price,total_tax,currency,financial_status,fulfillment_status,created_at,updated_at,cancelled_at,customer,shipping_address,line_items,shipping_lines,fulfillments,tags,note,processing_method`;

          console.log(`Fetching orders since ID: ${sinceId}`);

          const response = await this.makeShopifyRequest(url, accessToken);
          const orders = response.data.orders;

          if (orders.length === 0) {
            hasMore = false;
            break;
          }

          for (const order of orders) {
            await this.upsertOrder(shopDomain, order);
            sinceId = Math.max(sinceId, order.id);
            totalFetched++;
          }

          if (orders.length < 250) {
            hasMore = false;
          }

          console.log(
            `Fetched ${orders.length} orders, total: ${totalFetched}`
          );
          await this.delay(100);
        } catch (error) {
          console.error(
            `Error fetching orders batch for ${shopDomain}:`,
            error.message
          );

          if (error.response?.status === 429) {
            console.log("Rate limited, waiting 2 seconds...");
            await this.delay(2000);
            continue;
          }

          throw error;
        }
      }

      await this.updateSyncStatus(
        shopDomain,
        "orders",
        "completed",
        totalFetched
      );
      console.log(
        `Completed order sync for ${shopDomain}: ${totalFetched} orders`
      );

      return { success: true, count: totalFetched };
    } catch (error) {
      await this.updateSyncStatus(
        shopDomain,
        "orders",
        "error",
        0,
        error.message
      );
      console.error(`Order sync failed for ${shopDomain}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Sync customers with pagination
  async syncCustomers(shopDomain, accessToken) {
    console.log(`Syncing customers for ${shopDomain}`);

    try {
      await this.updateSyncStatus(shopDomain, "customers", "started");

      let sinceId = 0;
      let hasMore = true;
      let totalFetched = 0;

      while (hasMore) {
        try {
          const url = `https://${shopDomain}/admin/api/2024-07/customers.json?limit=250&since_id=${sinceId}&fields=id,first_name,last_name,email,phone,created_at,updated_at,orders_count,total_spent,last_order_id,last_order_name,verified_email,accepts_marketing,tags,state,note,addresses`;

          console.log(`Fetching customers since ID: ${sinceId}`);

          const response = await this.makeShopifyRequest(url, accessToken);
          const customers = response.data.customers;

          if (customers.length === 0) {
            hasMore = false;
            break;
          }

          for (const customer of customers) {
            await this.upsertCustomer(shopDomain, customer);
            sinceId = Math.max(sinceId, customer.id);
            totalFetched++;
          }

          if (customers.length < 250) {
            hasMore = false;
          }

          console.log(
            `Fetched ${customers.length} customers, total: ${totalFetched}`
          );
          await this.delay(100);
        } catch (error) {
          console.error(
            `Error fetching customers batch for ${shopDomain}:`,
            error.message
          );

          if (error.response?.status === 429) {
            console.log("Rate limited, waiting 2 seconds...");
            await this.delay(2000);
            continue;
          }

          throw error;
        }
      }

      await this.updateSyncStatus(
        shopDomain,
        "customers",
        "completed",
        totalFetched
      );
      console.log(
        `Completed customer sync for ${shopDomain}: ${totalFetched} customers`
      );

      return { success: true, count: totalFetched };
    } catch (error) {
      await this.updateSyncStatus(
        shopDomain,
        "customers",
        "error",
        0,
        error.message
      );
      console.error(`Customer sync failed for ${shopDomain}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Sync only recent orders (last 24 hours)
  async syncRecentOrders() {
    try {
      const shops = await Shop.find({});
      const yesterday = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();

      for (const shop of shops) {
        console.log(`Syncing recent orders for ${shop.domain}`);

        try {
          const url = `https://${shop.domain}/admin/api/2024-07/orders.json?limit=250&created_at_min=${yesterday}&status=any`;
          const response = await this.makeShopifyRequest(url);

          for (const order of response.data.orders) {
            await this.upsertOrder(shop.domain, order);
          }

          console.log(
            `Synced ${response.data.orders.length} recent orders for ${shop.domain}`
          );
        } catch (error) {
          console.error(
            `Error syncing recent orders for ${shop.domain}:`,
            error.message
          );
        }

        await this.delay(500);
      }
    } catch (error) {
      console.error("Error syncing recent orders:", error);
    }
  }

  // Helper methods for database operations
  async upsertProduct(shopDomain, productData) {
    try {
      await Product.findOneAndUpdate(
        { shopDomain, productId: productData.id },
        {
          shopDomain,
          productId: productData.id,
          title: productData.title,
          vendor: productData.vendor,
          product_type: productData.product_type,
          handle: productData.handle,
          status: productData.status,
          tags: productData.tags,
          body_html: productData.body_html,
          variants: productData.variants,
          images: productData.images,
          created_at: productData.created_at,
          updated_at: productData.updated_at,
          published_at: productData.published_at,
          lastSynced: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error upserting product ${productData.id}:`, error);
    }
  }

  async upsertOrder(shopDomain, orderData) {
    try {
      await Order.findOneAndUpdate(
        { shopDomain, orderId: orderData.id },
        {
          shopDomain,
          orderId: orderData.id,
          name: orderData.name,
          email: orderData.email,
          total_price: orderData.total_price,
          subtotal_price: orderData.subtotal_price,
          total_tax: orderData.total_tax,
          currency: orderData.currency,
          financial_status: orderData.financial_status,
          fulfillment_status: orderData.fulfillment_status,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          cancelled_at: orderData.cancelled_at,
          customer: orderData.customer,
          shipping_address: orderData.shipping_address,
          line_items: orderData.line_items,
          shipping_lines: orderData.shipping_lines,
          fulfillments: orderData.fulfillments,
          tags: orderData.tags,
          note: orderData.note,
          processing_method: orderData.processing_method,
          lastSynced: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error upserting order ${orderData.id}:`, error);
    }
  }

  async upsertCustomer(shopDomain, customerData) {
    try {
      await Customer.findOneAndUpdate(
        { shopDomain, customerId: customerData.id },
        {
          shopDomain,
          customerId: customerData.id,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          email: customerData.email,
          phone: customerData.phone,
          created_at: customerData.created_at,
          updated_at: customerData.updated_at,
          orders_count: customerData.orders_count,
          total_spent: customerData.total_spent,
          last_order_id: customerData.last_order_id,
          last_order_name: customerData.last_order_name,
          verified_email: customerData.verified_email,
          accepts_marketing: customerData.accepts_marketing,
          tags: customerData.tags,
          state: customerData.state,
          note: customerData.note,
          addresses: customerData.addresses,
          lastSynced: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error upserting customer ${customerData.id}:`, error);
    }
  }

  async updateSyncStatus(
    shopDomain,
    dataType,
    status,
    totalRecords = 0,
    errorMessage = null
  ) {
    try {
      const update = {
        shopDomain,
        dataType,
        totalRecords,
      };

      if (status === "started") {
        update.lastSyncStarted = new Date();
        update.isSync = true;
      } else if (status === "completed") {
        update.lastSyncCompleted = new Date();
        update.isSync = false;
        update.nextScheduledSync = new Date(Date.now() + 30 * 60 * 1000); // Next sync in 30 minutes
      } else if (status === "error") {
        update.isSync = false;
        update.errorMessage = errorMessage;
      }

      await SyncStatus.findOneAndUpdate({ shopDomain, dataType }, update, {
        upsert: true,
        new: true,
      });
    } catch (error) {
      console.error(
        `Error updating sync status for ${shopDomain}/${dataType}:`,
        error
      );
    }
  }

  async makeShopifyRequest(url, accessToken = null) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["X-Shopify-Access-Token"] = accessToken;
    }

    return axios.get(url, { headers });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get sync status for a shop
  async getSyncStatus(shopDomain) {
    try {
      const statuses = await SyncStatus.find({ shopDomain });
      return statuses.reduce((acc, status) => {
        acc[status.dataType] = {
          lastSyncStarted: status.lastSyncStarted,
          lastSyncCompleted: status.lastSyncCompleted,
          totalRecords: status.totalRecords,
          isSync: status.isSync,
          errorMessage: status.errorMessage,
          nextScheduledSync: status.nextScheduledSync,
        };
        return acc;
      }, {});
    } catch (error) {
      console.error(`Error getting sync status for ${shopDomain}:`, error);
      return {};
    }
  }

  // Force sync for a specific shop and data type
  async forceSyncShop(shopDomain, dataType = "all", accessToken = null) {
    console.log(`Force syncing ${dataType} for ${shopDomain}`);

    if (dataType === "all") {
      return await this.syncShopData(shopDomain, accessToken);
    }

    switch (dataType) {
      case "products":
        return await this.syncProducts(shopDomain, accessToken);
      case "orders":
        return await this.syncOrders(shopDomain, accessToken);
      case "customers":
        return await this.syncCustomers(shopDomain, accessToken);
      default:
        return { success: false, error: "Invalid data type" };
    }
  }
}

// Create singleton instance
const syncService = new ShopifySyncService();

module.exports = syncService;
