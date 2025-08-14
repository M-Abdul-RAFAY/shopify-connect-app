const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

// MongoDB integration
const dbConnection = require("./config/database.cjs");
const syncService = require("./services/syncService.cjs");
const cachedDataRoutes = require("./routes/cachedDataRoutes.cjs");
const { Shop } = require("./models/shopifyModels.cjs");

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB on startup
async function initializeServer() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await dbConnection.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/shopify-app"
    );

    console.log("📊 Starting Shopify sync service...");
    syncService.startScheduledSync();

    console.log("✅ Server initialization complete");
  } catch (error) {
    console.error("❌ Server initialization failed:", error);
    console.log("⚠️  Continuing without MongoDB - using direct API calls");
  }
}

// Initialize server
initializeServer();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "hhttps://fc46941ec5b8.ngrok-free.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Shopify-Access-Token",
      "x-shopify-access-token",
      "X-Shop-Domain",
      "x-shop-domain",
    ],
  })
);
app.use(express.json());

// MongoDB cached data routes
app.use("/api/cached", cachedDataRoutes);

// MongoDB health check endpoint
app.get("/api/db-health", async (req, res) => {
  try {
    const healthStatus = await dbConnection.healthCheck();
    res.json({
      database: healthStatus,
      server: { status: "OK", message: "Shopify backend server is running" },
    });
  } catch (error) {
    res.status(500).json({
      database: { status: "error", message: error.message },
      server: { status: "OK", message: "Shopify backend server is running" },
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Shopify backend server is running" });
});

// Store used authorization codes to prevent reuse
const usedCodes = new Set();

// Shopify OAuth token exchange endpoint
app.post("/api/shopify/exchange-token", async (req, res) => {
  try {
    const { code, shop, state } = req.body;

    console.log("Token exchange request received:", {
      code: code ? "present" : "missing",
      shop,
      state: state ? "present" : "missing",
    });

    if (!code || !shop) {
      return res.status(400).json({
        error: "Missing required parameters: code and shop",
      });
    }

    // Check if this authorization code has already been used
    if (usedCodes.has(code)) {
      console.log(
        "Authorization code already used:",
        code.substring(0, 10) + "..."
      );
      return res.status(400).json({
        error: "Authorization code has already been used",
      });
    }

    // Mark the code as used
    usedCodes.add(code);

    // Exchange code for access token with Shopify
    const tokenUrl = `https://${shop}.myshopify.com/admin/oauth/access_token`;

    console.log("Making token exchange request to:", tokenUrl);

    const response = await axios.post(tokenUrl, {
      client_id: process.env.VITE_SHOPIFY_APP_ID,
      client_secret: process.env.VITE_SHOPIFY_APP_SECRET,
      code: code,
    });

    console.log("Shopify token exchange successful");

    res.json(response.data);
  } catch (error) {
    console.error("Token exchange error:", error.message);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    res.status(500).json({
      error: "Token exchange failed",
      details: error.response?.data || error.message,
    });
  }
});

// Store shop information in MongoDB after successful token exchange
app.post("/api/shopify/store-shop", async (req, res) => {
  try {
    const { shop, accessToken } = req.body;

    if (!shop || !accessToken) {
      return res.status(400).json({
        error: "Missing required parameters: shop and accessToken",
      });
    }

    // Get shop information from Shopify
    let fullShopDomain = shop;
    if (!shop.includes(".myshopify.com")) {
      fullShopDomain = `${shop}.myshopify.com`;
    }

    const shopUrl = `https://${fullShopDomain}/admin/api/2024-07/shop.json`;
    const response = await axios({
      method: "GET",
      url: shopUrl,
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    const shopData = response.data.shop;

    // Store shop in MongoDB
    try {
      await Shop.findOneAndUpdate(
        { domain: fullShopDomain },
        {
          shopId: shopData.id,
          domain: fullShopDomain,
          name: shopData.name,
          email: shopData.email,
          currency: shopData.currency,
          country: shopData.country,
          province: shopData.province,
          address1: shopData.address1,
          city: shopData.city,
          zip: shopData.zip,
          phone: shopData.phone,
          money_format: shopData.money_format,
          money_with_currency_format: shopData.money_with_currency_format,
          plan_name: shopData.plan_name,
          enabled_presentment_currencies:
            shopData.enabled_presentment_currencies,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(`Shop ${fullShopDomain} stored in MongoDB`);

      // Trigger initial sync for this shop
      console.log(`Starting initial sync for ${fullShopDomain}`);
      syncService.forceSyncShop(fullShopDomain, "all", accessToken);
    } catch (dbError) {
      console.error("Error storing shop in MongoDB:", dbError);
      // Continue without MongoDB storage
    }

    res.json({
      success: true,
      message: "Shop information stored and sync initiated",
      shop: shopData,
    });
  } catch (error) {
    console.error("Error storing shop:", error.message);
    res.status(500).json({
      error: "Failed to store shop information",
      details: error.response?.data || error.message,
    });
  }
});

// Shopify API credentials validation endpoint
app.post("/api/shopify/validate-credentials", async (req, res) => {
  try {
    const { shop, accessToken, apiKey, apiSecret } = req.body;

    console.log("API credentials validation request received:", {
      shop,
      accessToken: accessToken
        ? `${accessToken.substring(0, 10)}...`
        : "missing",
      apiKey: apiKey ? "present" : "missing",
      apiSecret: apiSecret ? "present" : "missing",
    });

    if (!shop || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: shop and accessToken",
      });
    }

    // Ensure we're using the full .myshopify.com domain
    let fullShopDomain = shop;
    if (!shop.includes(".myshopify.com")) {
      fullShopDomain = `${shop}.myshopify.com`;
    }

    // Test the credentials by making a shop.json request
    const shopUrl = `https://${fullShopDomain}/admin/api/2024-07/shop.json`;

    console.log(
      `Testing API credentials with shop info request to: ${shopUrl}`
    );

    const response = await axios({
      method: "GET",
      url: shopUrl,
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
        "User-Agent": "Shopify-Connect-App/1.0",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    console.log("API credentials validation successful:", response.status);

    res.json({
      success: true,
      message: "API credentials validated successfully",
      shop: response.data.shop,
    });
  } catch (error) {
    console.error("API credentials validation error:", error.message);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });

    let errorMessage = "Invalid API credentials";
    if (error.response?.status === 401) {
      errorMessage = "Invalid access token. Please check your credentials.";
    } else if (error.response?.status === 404) {
      errorMessage = "Store not found. Please check your shop domain.";
    } else if (error.response?.status === 403) {
      errorMessage = "Access denied. Please check your API permissions.";
    }

    res.status(error.response?.status || 500).json({
      success: false,
      error: errorMessage,
      details: error.response?.data || error.message,
    });
  }
});

// Shopify GraphQL API proxy endpoint
app.post("/api/shopify/graphql", async (req, res) => {
  try {
    const accessToken =
      req.headers["x-shopify-access-token"] ||
      req.headers["X-Shopify-Access-Token"];
    const shopDomain =
      req.headers["x-shop-domain"] || req.headers["X-Shop-Domain"];

    console.log("GraphQL request headers:", {
      "x-shopify-access-token": accessToken
        ? `${accessToken.substring(0, 10)}...`
        : "missing",
      "x-shop-domain": shopDomain || "missing",
    });

    if (!accessToken || !shopDomain) {
      console.log("Missing required headers for GraphQL");
      return res.status(401).json({
        error:
          "Missing required headers: X-Shopify-Access-Token and X-Shop-Domain",
      });
    }

    // Ensure we're using the full .myshopify.com domain
    let fullShopDomain = shopDomain;
    if (!shopDomain.includes(".myshopify.com")) {
      fullShopDomain = `${shopDomain}.myshopify.com`;
    }

    const graphqlUrl = `https://${fullShopDomain}/admin/api/2024-07/graphql.json`;

    console.log(`Making GraphQL request to: ${graphqlUrl}`);

    const response = await axios({
      method: "POST",
      url: graphqlUrl,
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
        "User-Agent": "Shopify-Connect-App/1.0",
        Accept: "application/json",
      },
      data: req.body,
      timeout: 15000,
    });

    console.log("GraphQL API response success:", response.status);
    res.json(response.data);
  } catch (error) {
    console.error("GraphQL API error:", error.message);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });

    res.status(error.response?.status || 500).json({
      error: "GraphQL API request failed",
      details: error.response?.data || error.message,
    });
  }
});

// Shopify API proxy endpoint
app.all("/api/shopify/proxy/*", async (req, res) => {
  try {
    // Handle both uppercase and lowercase header variations
    const accessToken =
      req.headers["x-shopify-access-token"] ||
      req.headers["X-Shopify-Access-Token"];
    const shopDomain =
      req.headers["x-shop-domain"] || req.headers["X-Shop-Domain"];

    console.log("Proxy request headers:", {
      "x-shopify-access-token": accessToken
        ? `${accessToken.substring(0, 10)}...`
        : "missing",
      "x-shop-domain": shopDomain || "missing",
      "content-type": req.headers["content-type"],
    });

    if (!accessToken || !shopDomain) {
      console.log("Missing required headers");
      return res.status(401).json({
        error:
          "Missing required headers: X-Shopify-Access-Token and X-Shop-Domain",
      });
    }

    // Extract the Shopify API endpoint from the path
    const shopifyEndpoint = req.path.replace("/api/shopify/proxy", "");

    // Ensure we're using the full .myshopify.com domain
    let fullShopDomain = shopDomain;
    if (!shopDomain.includes(".myshopify.com")) {
      fullShopDomain = `${shopDomain}.myshopify.com`;
    }

    const shopifyUrl = `https://${fullShopDomain}/admin/api/2024-07${shopifyEndpoint}`;

    console.log(`Proxying ${req.method} request to: ${shopifyUrl}`);

    // Prepare headers - don't send Content-Type for GET requests
    const headers = {
      "X-Shopify-Access-Token": accessToken,
      "User-Agent": "Shopify-Connect-App/1.0",
      Accept: "application/json",
    };

    // Only add Content-Type for requests with body data
    if (req.method !== "GET" && req.body && Object.keys(req.body).length > 0) {
      headers["Content-Type"] = "application/json";
    }

    console.log("Request headers to Shopify:", {
      "X-Shopify-Access-Token": `${accessToken.substring(0, 10)}...`,
      "User-Agent": headers["User-Agent"],
      "Content-Type": headers["Content-Type"] || "not set",
    });
    console.log("Full access token:", accessToken);
    console.log("Request query params:", req.query);
    console.log("Request body:", req.body);

    const response = await axios({
      method: req.method,
      url: shopifyUrl,
      headers: headers,
      data: req.method !== "GET" ? req.body : undefined,
      params: req.query,
      timeout: 10000,
    });

    console.log("Shopify API response success:", response.status);
    res.json(response.data);
  } catch (error) {
    console.error("Shopify API proxy error:", error.message);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });

    res.status(error.response?.status || 500).json({
      error: "Shopify API request failed",
      details: error.response?.data || error.message,
    });
  }
});

// Fresh data endpoints for real-time service
app.get("/api/shopify/fresh-orders", async (req, res) => {
  try {
    const { shop, accessToken } = req.query;

    if (!shop || !accessToken) {
      return res.status(400).json({
        error: "Missing required parameters: shop and accessToken",
      });
    }

    // Ensure we're using the full .myshopify.com domain
    let fullShopDomain = shop;
    if (!shop.includes(".myshopify.com")) {
      fullShopDomain = `${shop}.myshopify.com`;
    }

    console.log(`🔄 Fetching fresh orders for ${fullShopDomain}...`);
    const url = `https://${fullShopDomain}/admin/api/2024-07/orders.json?status=any&limit=250&order=created_at desc`;

    const response = await axios.get(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    console.log(
      `📦 Fresh orders fetched: ${response.data.orders?.length || 0} orders`
    );
    res.json({ orders: response.data.orders || [] });
  } catch (error) {
    console.error(
      "❌ Fresh orders fetch failed:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to fetch fresh orders",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/shopify/fresh-products", async (req, res) => {
  try {
    const { shop, accessToken } = req.query;

    if (!shop || !accessToken) {
      return res.status(400).json({
        error: "Missing required parameters: shop and accessToken",
      });
    }

    // Ensure we're using the full .myshopify.com domain
    let fullShopDomain = shop;
    if (!shop.includes(".myshopify.com")) {
      fullShopDomain = `${shop}.myshopify.com`;
    }

    console.log(`🔄 Fetching fresh products for ${fullShopDomain}...`);
    const url = `https://${fullShopDomain}/admin/api/2024-07/products.json?limit=250`;

    const response = await axios.get(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    console.log(
      `📦 Fresh products fetched: ${
        response.data.products?.length || 0
      } products`
    );
    res.json({ products: response.data.products || [] });
  } catch (error) {
    console.error(
      "❌ Fresh products fetch failed:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to fetch fresh products",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/shopify/fresh-customers", async (req, res) => {
  try {
    const { shop, accessToken } = req.query;

    if (!shop || !accessToken) {
      return res.status(400).json({
        error: "Missing required parameters: shop and accessToken",
      });
    }

    // Ensure we're using the full .myshopify.com domain
    let fullShopDomain = shop;
    if (!shop.includes(".myshopify.com")) {
      fullShopDomain = `${shop}.myshopify.com`;
    }

    console.log(`🔄 Fetching fresh customers for ${fullShopDomain}...`);
    const url = `https://${fullShopDomain}/admin/api/2024-07/customers.json?limit=250`;

    const response = await axios.get(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    console.log(
      `📦 Fresh customers fetched: ${
        response.data.customers?.length || 0
      } customers`
    );
    res.json({ customers: response.data.customers || [] });
  } catch (error) {
    console.error(
      "❌ Fresh customers fetch failed:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to fetch fresh customers",
      details: error.response?.data || error.message,
    });
  }
});

// Intelligent data sync endpoint - Full sync for new stores, incremental for existing
app.post("/api/shopify/sync-initial-data", async (req, res) => {
  try {
    const { shop, accessToken } = req.body;

    if (!shop || !accessToken) {
      return res.status(400).json({
        error: "Missing required parameters: shop and accessToken",
      });
    }

    // Ensure we're using the full .myshopify.com domain
    let fullShopDomain = shop;
    if (!shop.includes(".myshopify.com")) {
      fullShopDomain = `${shop}.myshopify.com`;
    }

    console.log(`🚀 Starting intelligent data sync for ${fullShopDomain}...`);

    // Check if this is a new store or existing store
    const isNewStore = await checkIfNewStore(fullShopDomain);

    if (isNewStore) {
      console.log(
        `🆕 New store detected - performing FULL sync for ${fullShopDomain}`
      );
      const result = await performFullSync(fullShopDomain, accessToken);
      res.json(result);
    } else {
      console.log(
        `🔄 Existing store detected - performing INCREMENTAL sync for ${fullShopDomain}`
      );
      const result = await performIncrementalSync(fullShopDomain, accessToken);
      res.json(result);
    }
  } catch (error) {
    console.error(
      "❌ Intelligent data sync failed:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to sync data",
      details: error.response?.data || error.message,
    });
  }
});

// Check if store is new (no data in database)
async function checkIfNewStore(shopDomain) {
  try {
    const { Order, Product, Customer } = require("./models/shopifyModels.cjs");

    const [orderCount, productCount, customerCount] = await Promise.all([
      Order.countDocuments({ shopDomain }),
      Product.countDocuments({ shopDomain }),
      Customer.countDocuments({ shopDomain }),
    ]);

    // If no data exists, it's a new store
    const isNew = orderCount === 0 && productCount === 0 && customerCount === 0;
    console.log(`📊 Store data check for ${shopDomain}:`, {
      orders: orderCount,
      products: productCount,
      customers: customerCount,
      isNewStore: isNew,
    });

    return isNew;
  } catch (error) {
    console.error("Error checking store status:", error);
    return true; // Default to full sync if check fails
  }
}

// Full sync for new stores - get ALL data in batches
async function performFullSync(shopDomain, accessToken) {
  console.log(
    `🔄 Starting FULL SYNC for ${shopDomain} - this may take a while...`
  );

  const syncResults = {
    orders: { total: 0, batches: 0 },
    products: { total: 0, batches: 0 },
    customers: { total: 0, batches: 0 },
  };

  try {
    // Sync all orders in batches
    console.log("📦 Syncing ALL orders...");
    syncResults.orders = await fetchAllDataInBatches(
      shopDomain,
      accessToken,
      "orders"
    );

    // Sync all products in batches
    console.log("📦 Syncing ALL products...");
    syncResults.products = await fetchAllDataInBatches(
      shopDomain,
      accessToken,
      "products"
    );

    // Sync all customers in batches
    console.log("📦 Syncing ALL customers...");
    syncResults.customers = await fetchAllDataInBatches(
      shopDomain,
      accessToken,
      "customers"
    );

    console.log(`✅ FULL SYNC completed for ${shopDomain}:`, syncResults);

    return {
      success: true,
      syncType: "FULL_SYNC",
      message: "Complete historical data sync completed",
      data: syncResults,
      syncedAt: new Date(),
    };
  } catch (error) {
    console.error("❌ Full sync failed:", error);
    throw error;
  }
}

// Incremental sync for existing stores - only get recent data until match
async function performIncrementalSync(shopDomain, accessToken) {
  console.log(`🔄 Starting INCREMENTAL SYNC for ${shopDomain}...`);

  const syncResults = {
    orders: { newRecords: 0, checkedPages: 0 },
    products: { newRecords: 0, checkedPages: 0 },
    customers: { newRecords: 0, checkedPages: 0 },
  };

  try {
    // Sync recent orders until we find matches
    console.log("📦 Syncing recent orders...");
    syncResults.orders = await fetchRecentDataUntilMatch(
      shopDomain,
      accessToken,
      "orders"
    );

    // Sync recent products until we find matches
    console.log("📦 Syncing recent products...");
    syncResults.products = await fetchRecentDataUntilMatch(
      shopDomain,
      accessToken,
      "products"
    );

    // Sync recent customers until we find matches
    console.log("📦 Syncing recent customers...");
    syncResults.customers = await fetchRecentDataUntilMatch(
      shopDomain,
      accessToken,
      "customers"
    );

    console.log(
      `✅ INCREMENTAL SYNC completed for ${shopDomain}:`,
      syncResults
    );

    return {
      success: true,
      syncType: "INCREMENTAL_SYNC",
      message: "Recent data sync completed",
      data: syncResults,
      syncedAt: new Date(),
    };
  } catch (error) {
    console.error("❌ Incremental sync failed:", error);
    throw error;
  }
}

// Fetch all data in batches for full sync
async function fetchAllDataInBatches(shopDomain, accessToken, dataType) {
  const { Order, Product, Customer } = require("./models/shopifyModels.cjs");

  let endpoint, Model, idField;
  switch (dataType) {
    case "orders":
      endpoint = "orders.json?status=any&limit=250&order=created_at desc";
      Model = Order;
      idField = "orderId";
      break;
    case "products":
      endpoint = "products.json?limit=250";
      Model = Product;
      idField = "productId";
      break;
    case "customers":
      endpoint = "customers.json?limit=250";
      Model = Customer;
      idField = "customerId";
      break;
    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }

  let totalRecords = 0;
  let batchCount = 0;
  let hasMore = true;
  let lastId = null;

  while (hasMore) {
    try {
      batchCount++;
      console.log(`📦 Fetching ${dataType} batch ${batchCount}...`);

      let url = `https://${shopDomain}/admin/api/2024-07/${endpoint}`;
      if (lastId) {
        url += `&since_id=${lastId}`;
      }

      const response = await axios.get(url, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      const records = response.data[dataType] || [];

      if (records.length === 0) {
        hasMore = false;
        break;
      }

      // Save to database
      for (const record of records) {
        const saveData = {
          ...record,
          shopDomain,
          lastUpdated: new Date(),
        };
        saveData[idField] = record.id; // Map Shopify ID to model field

        await Model.findOneAndUpdate(
          { [idField]: record.id, shopDomain },
          saveData,
          { upsert: true, new: true }
        );
      }

      totalRecords += records.length;
      lastId = records[records.length - 1].id;

      console.log(
        `✅ Batch ${batchCount}: ${records.length} ${dataType} saved (Total: ${totalRecords})`
      );

      // If we got less than 250, we're done
      if (records.length < 250) {
        hasMore = false;
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(
        `❌ Error fetching ${dataType} batch ${batchCount}:`,
        error.message
      );
      throw error;
    }
  }

  return { total: totalRecords, batches: batchCount };
}

// Fetch recent data until we find matching records in database
async function fetchRecentDataUntilMatch(shopDomain, accessToken, dataType) {
  const { Order, Product, Customer } = require("./models/shopifyModels.cjs");

  let endpoint, Model, idField;
  switch (dataType) {
    case "orders":
      endpoint = "orders.json?status=any&limit=250&order=created_at desc";
      Model = Order;
      idField = "orderId";
      break;
    case "products":
      endpoint = "products.json?limit=250";
      Model = Product;
      idField = "productId";
      break;
    case "customers":
      endpoint = "customers.json?limit=250";
      Model = Customer;
      idField = "customerId";
      break;
    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }

  let newRecords = 0;
  let checkedPages = 0;
  let hasMore = true;
  let lastId = null;

  while (hasMore && checkedPages < 10) {
    // Limit to 10 pages for safety
    try {
      checkedPages++;
      console.log(
        `🔍 Checking ${dataType} page ${checkedPages} for new records...`
      );

      let url = `https://${shopDomain}/admin/api/2024-07/${endpoint}`;
      if (lastId) {
        url += `&since_id=${lastId}`;
      }

      const response = await axios.get(url, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      const records = response.data[dataType] || [];

      if (records.length === 0) {
        hasMore = false;
        break;
      }

      let foundMatch = false;
      let recordsToSave = [];

      // Check each record to see if it exists in database
      for (const record of records) {
        const existingRecord = await Model.findOne({
          [idField]: record.id,
          shopDomain,
        });

        if (existingRecord) {
          // Found existing record - we can stop here
          console.log(
            `🎯 Found matching ${dataType} record (ID: ${record.id}) - stopping sync`
          );
          foundMatch = true;
          break;
        } else {
          // New record - add to save list
          recordsToSave.push(record);
        }
      }

      // Save new records
      for (const record of recordsToSave) {
        const saveData = {
          ...record,
          shopDomain,
          lastUpdated: new Date(),
        };
        saveData[idField] = record.id; // Map Shopify ID to model field

        await Model.findOneAndUpdate(
          { [idField]: record.id, shopDomain },
          saveData,
          { upsert: true, new: true }
        );
        newRecords++;
      }

      if (recordsToSave.length > 0) {
        console.log(
          `✅ Page ${checkedPages}: ${recordsToSave.length} new ${dataType} saved`
        );
      }

      // If we found a match or got less than 250 records, we're done
      if (foundMatch || records.length < 250) {
        hasMore = false;
      } else {
        lastId = records[records.length - 1].id;
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error(
        `❌ Error fetching recent ${dataType} page ${checkedPages}:`,
        error.message
      );
      throw error;
    }
  }

  return { newRecords, checkedPages };
}

// Manual sync trigger endpoint
app.post("/api/shopify/manual-sync", async (req, res) => {
  try {
    const { shop, accessToken, syncType = "incremental" } = req.body;

    if (!shop || !accessToken) {
      return res.status(400).json({
        error: "Missing required parameters: shop and accessToken",
      });
    }

    // Ensure we're using the full .myshopify.com domain
    let fullShopDomain = shop;
    if (!shop.includes(".myshopify.com")) {
      fullShopDomain = `${shop}.myshopify.com`;
    }

    console.log(
      `🔄 Manual ${syncType} sync triggered for ${fullShopDomain}...`
    );

    let result;
    if (syncType === "full") {
      console.log(`🆕 Performing MANUAL FULL sync for ${fullShopDomain}`);
      result = await performFullSync(fullShopDomain, accessToken);
    } else {
      console.log(
        `🔄 Performing MANUAL INCREMENTAL sync for ${fullShopDomain}`
      );
      result = await performIncrementalSync(fullShopDomain, accessToken);
    }

    res.json(result);
  } catch (error) {
    console.error(
      "❌ Manual sync failed:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to perform manual sync",
      details: error.response?.data || error.message,
    });
  }
});

// Catch all route
app.get("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Shopify backend server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `🔐 OAuth endpoint: http://localhost:${PORT}/api/shopify/exchange-token`
  );
});
