const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://0124c68cd808.ngrok-free.app"],
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
