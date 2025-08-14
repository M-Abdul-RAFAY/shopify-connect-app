const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "hhttps://fc46941ec5b8.ngrok-free.app"],
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Shopify backend server is running" });
});

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

// Fresh data endpoints for real-time service
app.get("/api/shopify/fresh-orders", async (req, res) => {
  try {
    const { shop, accessToken } = req.query;

    if (!shop || !accessToken) {
      return res.status(400).json({
        error: "Missing required parameters: shop and accessToken",
      });
    }

    console.log(`🔄 Fetching fresh orders for ${shop}...`);
    const url = `https://${shop}/admin/api/2024-07/orders.json?status=any&limit=250&order=created_at desc`;

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

    console.log(`🔄 Fetching fresh products for ${shop}...`);
    const url = `https://${shop}/admin/api/2024-07/products.json?limit=250`;

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

    console.log(`🔄 Fetching fresh customers for ${shop}...`);
    const url = `https://${shop}/admin/api/2024-07/customers.json?limit=250`;

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

// Initial data sync endpoint - fetches all data when user connects
app.post("/api/shopify/sync-initial-data", async (req, res) => {
  try {
    const { shop, accessToken } = req.body;

    if (!shop || !accessToken) {
      return res.status(400).json({
        error: "Missing required parameters: shop and accessToken",
      });
    }

    console.log(`🚀 Starting initial data sync for ${shop}...`);

    // Fetch all data in parallel
    const [ordersRes, productsRes, customersRes] = await Promise.all([
      axios.get(
        `https://${shop}/admin/api/2024-07/orders.json?status=any&limit=250&order=created_at desc`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      ),
      axios.get(`https://${shop}/admin/api/2024-07/products.json?limit=250`, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }),
      axios.get(`https://${shop}/admin/api/2024-07/customers.json?limit=250`, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }),
    ]);

    const syncedData = {
      orders: ordersRes.data.orders || [],
      products: productsRes.data.products || [],
      customers: customersRes.data.customers || [],
      syncedAt: new Date(),
    };

    console.log(`✅ Initial sync completed for ${shop}:`, {
      orders: syncedData.orders.length,
      products: syncedData.products.length,
      customers: syncedData.customers.length,
    });

    res.json({
      success: true,
      message: "Initial data sync completed",
      data: syncedData,
    });
  } catch (error) {
    console.error(
      "❌ Initial data sync failed:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to sync initial data",
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
