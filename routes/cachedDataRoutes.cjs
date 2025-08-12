const express = require("express");
const {
  Product,
  Order,
  Customer,
  Shop,
  SyncStatus,
} = require("../models/shopifyModels.cjs");
const syncService = require("../services/syncService.cjs");

const router = express.Router();

// Get all products from cache with filtering and pagination
router.get("/products/:shopDomain", async (req, res) => {
  try {
    const { shopDomain } = req.params;
    const {
      page = 1,
      limit = 250,
      search = "",
      vendor = "",
      product_type = "",
      status = "",
      sort = "title",
      order = "asc",
    } = req.query;

    // Build filter query
    const filter = { shopDomain };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { handle: { $regex: search, $options: "i" } },
      ];
    }

    if (vendor) filter.vendor = { $regex: vendor, $options: "i" };
    if (product_type)
      filter.product_type = { $regex: product_type, $options: "i" };
    if (status) filter.status = status;

    // Build sort query
    const sortOrder = order === "desc" ? -1 : 1;
    const sortQuery = {};
    sortQuery[sort] = sortOrder;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Get unique values for filters
    const [vendors, productTypes] = await Promise.all([
      Product.distinct("vendor", { shopDomain }),
      Product.distinct("product_type", { shopDomain }),
    ]);

    res.json({
      products,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_count: total,
        per_page: parseInt(limit),
      },
      filters: {
        vendors: vendors.filter((v) => v).sort(),
        product_types: productTypes.filter((pt) => pt).sort(),
        statuses: ["active", "archived", "draft"],
      },
      lastSynced: products.length > 0 ? products[0].lastSynced : null,
    });
  } catch (error) {
    console.error("Error fetching cached products:", error);
    res.status(500).json({ error: "Failed to fetch products from cache" });
  }
});

// Get all orders from cache with filtering and pagination
router.get("/orders/:shopDomain", async (req, res) => {
  try {
    const { shopDomain } = req.params;
    const {
      page = 1,
      limit = 250,
      search = "",
      financial_status = "",
      fulfillment_status = "",
      date_from = "",
      date_to = "",
      sort = "created_at",
      order = "desc",
    } = req.query;

    // Build filter query
    const filter = { shopDomain };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "customer.first_name": { $regex: search, $options: "i" } },
        { "customer.last_name": { $regex: search, $options: "i" } },
      ];
    }

    if (financial_status) filter.financial_status = financial_status;
    if (fulfillment_status) filter.fulfillment_status = fulfillment_status;

    if (date_from || date_to) {
      filter.created_at = {};
      if (date_from) filter.created_at.$gte = date_from;
      if (date_to) filter.created_at.$lte = date_to;
    }

    // Build sort query
    const sortOrder = order === "desc" ? -1 : 1;
    const sortQuery = {};

    if (sort === "total_price") {
      // For price sorting, convert string to number
      sortQuery["total_price"] = sortOrder;
    } else {
      sortQuery[sort] = sortOrder;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    // Calculate analytics
    const analyticsFilter = { shopDomain };
    const [totalRevenue, orderCount, avgOrderValue] = await Promise.all([
      Order.aggregate([
        { $match: analyticsFilter },
        {
          $group: { _id: null, total: { $sum: { $toDouble: "$total_price" } } },
        },
      ]),
      Order.countDocuments(analyticsFilter),
      Order.aggregate([
        { $match: analyticsFilter },
        { $group: { _id: null, avg: { $avg: { $toDouble: "$total_price" } } } },
      ]),
    ]);

    res.json({
      orders,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_count: total,
        per_page: parseInt(limit),
      },
      analytics: {
        total_revenue: totalRevenue[0]?.total || 0,
        order_count: orderCount,
        average_order_value: avgOrderValue[0]?.avg || 0,
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
        fulfillment_statuses: ["fulfilled", "partial", "restocked", null],
      },
      lastSynced: orders.length > 0 ? orders[0].lastSynced : null,
    });
  } catch (error) {
    console.error("Error fetching cached orders:", error);
    res.status(500).json({ error: "Failed to fetch orders from cache" });
  }
});

// Get all customers from cache with filtering and pagination
router.get("/customers/:shopDomain", async (req, res) => {
  try {
    const { shopDomain } = req.params;
    const {
      page = 1,
      limit = 250,
      search = "",
      state = "",
      min_orders = "",
      max_orders = "",
      min_spent = "",
      max_spent = "",
      sort = "created_at",
      order = "desc",
    } = req.query;

    // Build filter query
    const filter = { shopDomain };

    if (search) {
      filter.$or = [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (state) filter.state = state;

    if (min_orders || max_orders) {
      filter.orders_count = {};
      if (min_orders) filter.orders_count.$gte = parseInt(min_orders);
      if (max_orders) filter.orders_count.$lte = parseInt(max_orders);
    }

    if (min_spent || max_spent) {
      // Convert total_spent string to number for comparison
      const spentFilter = {};
      if (min_spent) spentFilter.$gte = parseFloat(min_spent);
      if (max_spent) spentFilter.$lte = parseFloat(max_spent);

      // This requires a more complex aggregation, for now we'll do basic filtering
      if (min_spent) filter.total_spent = { $gte: min_spent };
    }

    // Build sort query
    const sortOrder = order === "desc" ? -1 : 1;
    const sortQuery = {};

    if (sort === "total_spent") {
      // For spending sorting, we need to convert string to number
      sortQuery["total_spent"] = sortOrder;
    } else {
      sortQuery[sort] = sortOrder;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Customer.countDocuments(filter),
    ]);

    // Calculate analytics
    const analyticsFilter = { shopDomain };
    const [totalCustomers, totalSpent, avgOrdersPerCustomer] =
      await Promise.all([
        Customer.countDocuments(analyticsFilter),
        Customer.aggregate([
          { $match: analyticsFilter },
          {
            $group: {
              _id: null,
              total: { $sum: { $toDouble: "$total_spent" } },
            },
          },
        ]),
        Customer.aggregate([
          { $match: analyticsFilter },
          { $group: { _id: null, avg: { $avg: "$orders_count" } } },
        ]),
      ]);

    res.json({
      customers,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_count: total,
        per_page: parseInt(limit),
      },
      analytics: {
        total_customers: totalCustomers,
        total_spent: totalSpent[0]?.total || 0,
        average_orders_per_customer: avgOrdersPerCustomer[0]?.avg || 0,
      },
      filters: {
        states: ["enabled", "disabled", "invited", "declined"],
      },
      lastSynced: customers.length > 0 ? customers[0].lastSynced : null,
    });
  } catch (error) {
    console.error("Error fetching cached customers:", error);
    res.status(500).json({ error: "Failed to fetch customers from cache" });
  }
});

// Get shop information
router.get("/shop/:shopDomain", async (req, res) => {
  try {
    const { shopDomain } = req.params;
    const shop = await Shop.findOne({ domain: shopDomain }).lean();

    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    res.json(shop);
  } catch (error) {
    console.error("Error fetching shop info:", error);
    res.status(500).json({ error: "Failed to fetch shop information" });
  }
});

// Get sync status for a shop
router.get("/sync-status/:shopDomain", async (req, res) => {
  try {
    const { shopDomain } = req.params;
    const status = await syncService.getSyncStatus(shopDomain);
    res.json(status);
  } catch (error) {
    console.error("Error fetching sync status:", error);
    res.status(500).json({ error: "Failed to fetch sync status" });
  }
});

// Force sync for a shop
router.post("/sync/:shopDomain", async (req, res) => {
  try {
    const { shopDomain } = req.params;
    const { dataType = "all", accessToken } = req.body;

    // Start sync in background
    const result = await syncService.forceSyncShop(
      shopDomain,
      dataType,
      accessToken
    );

    res.json({
      message: "Sync initiated",
      shopDomain,
      dataType,
      result,
    });
  } catch (error) {
    console.error("Error initiating sync:", error);
    res.status(500).json({ error: "Failed to initiate sync" });
  }
});

// Get analytics dashboard data
router.get("/analytics/:shopDomain", async (req, res) => {
  try {
    const { shopDomain } = req.params;
    const { period = "30d" } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "7d":
        dateFilter = {
          created_at: {
            $gte: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        };
        break;
      case "30d":
        dateFilter = {
          created_at: {
            $gte: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        };
        break;
      case "90d":
        dateFilter = {
          created_at: {
            $gte: new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        };
        break;
    }

    const filter = { shopDomain, ...dateFilter };

    // Get comprehensive analytics
    const [
      totalRevenue,
      orderCount,
      customerCount,
      productCount,
      avgOrderValue,
      topProducts,
      recentOrders,
      monthlyRevenue,
    ] = await Promise.all([
      // Total revenue
      Order.aggregate([
        { $match: filter },
        {
          $group: { _id: null, total: { $sum: { $toDouble: "$total_price" } } },
        },
      ]),

      // Order count
      Order.countDocuments(filter),

      // Customer count
      Customer.countDocuments({ shopDomain }),

      // Product count
      Product.countDocuments({ shopDomain }),

      // Average order value
      Order.aggregate([
        { $match: filter },
        { $group: { _id: null, avg: { $avg: { $toDouble: "$total_price" } } } },
      ]),

      // Top products by revenue
      Order.aggregate([
        { $match: filter },
        { $unwind: "$line_items" },
        {
          $group: {
            _id: "$line_items.product_id",
            title: { $first: "$line_items.title" },
            revenue: {
              $sum: {
                $multiply: [
                  { $toDouble: "$line_items.price" },
                  "$line_items.quantity",
                ],
              },
            },
            quantity: { $sum: "$line_items.quantity" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),

      // Recent orders
      Order.find(filter).sort({ created_at: -1 }).limit(10).lean(),

      // Monthly revenue trend (last 12 months)
      Order.aggregate([
        { $match: { shopDomain } },
        {
          $group: {
            _id: {
              year: {
                $year: { $dateFromString: { dateString: "$created_at" } },
              },
              month: {
                $month: { $dateFromString: { dateString: "$created_at" } },
              },
            },
            revenue: { $sum: { $toDouble: "$total_price" } },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      period,
      metrics: {
        total_revenue: totalRevenue[0]?.total || 0,
        order_count: orderCount,
        customer_count: customerCount,
        product_count: productCount,
        average_order_value: avgOrderValue[0]?.avg || 0,
      },
      top_products: topProducts,
      recent_orders: recentOrders,
      monthly_trend: monthlyRevenue,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

module.exports = router;
