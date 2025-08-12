const mongoose = require("mongoose");

// Shop model
const shopSchema = new mongoose.Schema({
  shopId: { type: Number, required: true, unique: true },
  domain: { type: String, required: true, unique: true },
  name: String,
  email: String,
  currency: String,
  country: String,
  province: String,
  address1: String,
  city: String,
  zip: String,
  phone: String,
  money_format: String,
  money_with_currency_format: String,
  plan_name: String,
  enabled_presentment_currencies: [String],
  lastUpdated: { type: Date, default: Date.now },
});

// Product model
const productSchema = new mongoose.Schema(
  {
    shopDomain: { type: String, required: true, index: true },
    productId: { type: Number, required: true },
    title: String,
    vendor: String,
    product_type: String,
    handle: String,
    status: String,
    tags: String,
    body_html: String,
    variants: [
      {
        id: Number,
        title: String,
        price: String,
        sku: String,
        inventory_quantity: Number,
        weight: Number,
        weight_unit: String,
        inventory_management: String,
        inventory_policy: String,
        fulfillment_service: String,
        created_at: String,
        updated_at: String,
      },
    ],
    images: [
      {
        id: Number,
        src: String,
        alt: String,
        position: Number,
      },
    ],
    created_at: String,
    updated_at: String,
    published_at: String,
    lastSynced: { type: Date, default: Date.now },
  },
  {
    indexes: [
      { shopDomain: 1, productId: 1 }, // Compound unique index
      { shopDomain: 1, status: 1 },
      { shopDomain: 1, vendor: 1 },
      { shopDomain: 1, product_type: 1 },
    ],
  }
);

// Order model
const orderSchema = new mongoose.Schema(
  {
    shopDomain: { type: String, required: true, index: true },
    orderId: { type: Number, required: true },
    name: String,
    email: String,
    total_price: String,
    subtotal_price: String,
    total_tax: String,
    currency: String,
    financial_status: String,
    fulfillment_status: String,
    created_at: String,
    updated_at: String,
    cancelled_at: String,
    customer: {
      id: Number,
      first_name: String,
      last_name: String,
      email: String,
      phone: String,
    },
    shipping_address: {
      first_name: String,
      last_name: String,
      company: String,
      address1: String,
      address2: String,
      city: String,
      province: String,
      country: String,
      zip: String,
      phone: String,
    },
    line_items: [
      {
        id: Number,
        product_id: Number,
        variant_id: Number,
        title: String,
        quantity: Number,
        price: String,
        sku: String,
        vendor: String,
      },
    ],
    shipping_lines: [
      {
        id: Number,
        title: String,
        price: String,
        code: String,
        source: String,
        carrier_identifier: String,
        carrier_service_id: Number,
      },
    ],
    fulfillments: [
      {
        id: Number,
        status: String,
        tracking_company: String,
        tracking_number: String,
        tracking_url: String,
        created_at: String,
        updated_at: String,
      },
    ],
    tags: String,
    note: String,
    processing_method: String,
    lastSynced: { type: Date, default: Date.now },
  },
  {
    indexes: [
      { shopDomain: 1, orderId: 1 }, // Compound unique index
      { shopDomain: 1, financial_status: 1 },
      { shopDomain: 1, fulfillment_status: 1 },
      { shopDomain: 1, created_at: -1 }, // For date sorting
    ],
  }
);

// Customer model
const customerSchema = new mongoose.Schema(
  {
    shopDomain: { type: String, required: true, index: true },
    customerId: { type: Number, required: true },
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    created_at: String,
    updated_at: String,
    orders_count: { type: Number, default: 0 },
    total_spent: { type: String, default: "0.00" },
    last_order_id: Number,
    last_order_name: String,
    verified_email: { type: Boolean, default: false },
    accepts_marketing: { type: Boolean, default: false },
    tags: String,
    state: String,
    note: String,
    addresses: [
      {
        id: Number,
        first_name: String,
        last_name: String,
        company: String,
        address1: String,
        address2: String,
        city: String,
        province: String,
        country: String,
        zip: String,
        phone: String,
        default: Boolean,
      },
    ],
    lastSynced: { type: Date, default: Date.now },
  },
  {
    indexes: [
      { shopDomain: 1, customerId: 1 }, // Compound unique index
      { shopDomain: 1, email: 1 },
      { shopDomain: 1, total_spent: -1 }, // For spending sorting
      { shopDomain: 1, orders_count: -1 }, // For order count sorting
    ],
  }
);

// Sync Status model to track synchronization progress
const syncStatusSchema = new mongoose.Schema(
  {
    shopDomain: { type: String, required: true, unique: true },
    dataType: { type: String, required: true }, // 'products', 'orders', 'customers'
    lastSyncStarted: Date,
    lastSyncCompleted: Date,
    lastSyncPageInfo: String, // For pagination
    totalRecords: { type: Number, default: 0 },
    isSync: { type: Boolean, default: false },
    errorMessage: String,
    nextScheduledSync: Date,
  },
  {
    indexes: [
      { shopDomain: 1, dataType: 1 }, // Compound unique index
    ],
  }
);

// Create models
const Shop = mongoose.model("Shop", shopSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const Customer = mongoose.model("Customer", customerSchema);
const SyncStatus = mongoose.model("SyncStatus", syncStatusSchema);

module.exports = {
  Shop,
  Product,
  Order,
  Customer,
  SyncStatus,
};
