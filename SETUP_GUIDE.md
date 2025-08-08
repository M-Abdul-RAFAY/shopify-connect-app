# Shopify Connect App - Setup Guide

This application provides a seamless way to connect your Shopify store and manage your business data from a unified dashboard.

## 🚀 Features

### ✨ **One-Click Shopify Integration**

- **Seamless OAuth Connection**: Connect your Shopify store in just one click
- **Auto-Replace Placeholder Data**: Real Shopify data automatically replaces demo content
- **Real-Time Sync**: Live data synchronization with your Shopify store

### 📊 **Enhanced Dashboard**

- **Real Analytics**: Live sales, revenue, and customer data from your store
- **Dynamic KPIs**: Metrics that update based on your actual Shopify data
- **Store-Specific Information**: Shows your actual store name and details

### 🛍️ **Smart Inventory Management**

- **Live Product Data**: Real products from your Shopify catalog
- **Stock Levels**: Actual inventory quantities and alerts
- **Product Images**: Your real product photos and descriptions

### 📦 **Order Management**

- **Real Orders**: Actual customer orders from your Shopify store
- **Order Status Tracking**: Live fulfillment and payment status
- **Customer Information**: Real customer data and contact details

### 👥 **Customer Intelligence**

- **Real Customer Data**: Actual customer profiles and purchase history
- **Customer Tiers**: Automatic customer segmentation based on spend
- **Contact Information**: Real emails, phones, and addresses

## ⚡ Quick Start

### 1. **Environment Setup**

Copy the environment template:

```bash
cp .env.example .env
```

Configure your Shopify app credentials in `.env`:

```env
VITE_SHOPIFY_APP_ID=your_shopify_app_id
VITE_SHOPIFY_APP_SECRET=your_shopify_app_secret
VITE_SHOPIFY_REDIRECT_URI=https://16d791950278.ngrok-free.app/auth/callback
VITE_SHOPIFY_SCOPES=read_products,read_orders,read_customers,read_inventory
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Start Development Server**

```bash
npm run dev
```

### 4. **Connect Your Store**

1. Open the application in your browser
2. Click the **"Connect My Shopify Store"** button
3. Enter your Shopify store domain (or use the one-click option)
4. Authorize the connection in Shopify
5. Enjoy your real data-powered dashboard!

## 🔧 Shopify App Setup

### Creating a Shopify App

1. **Go to your Shopify Partners Dashboard**
2. **Create a new app**
3. **Configure OAuth settings**:
   - **App URL**: `https://16d791950278.ngrok-free.app`
   - **Allowed redirection URL(s)**: `https://16d791950278.ngrok-free.app/auth/callback`
4. **Copy your API credentials** to the `.env` file

### Required Permissions (Scopes)

The app requires these permissions to function properly:

- `read_products` - To display your product catalog
- `read_orders` - To show order data and analytics
- `read_customers` - To display customer information
- `read_inventory` - To show inventory levels
- `read_analytics` - For dashboard analytics

## 🎨 What Changes When Connected

### Before Connection

- Shows placeholder/demo data
- Generic dashboard with sample content
- Demo products, orders, and customers

### After Connection

- **Dashboard**: Real revenue, orders, and analytics from your store
- **Inventory**: Your actual products with real stock levels and images
- **Orders**: Live order data with customer information and status
- **Customers**: Real customer profiles with purchase history
- **Store Info**: Your actual store name and details in the sidebar

## 🛠️ Technical Features

### Smart Data Loading

- **Progressive Loading**: Shows loading states while fetching data
- **Error Handling**: Graceful error handling with retry options
- **Automatic Refresh**: Keep data up-to-date with manual refresh options

### Security

- **OAuth 2.0**: Secure authentication using Shopify's OAuth flow
- **Token Management**: Secure token storage with automatic cleanup
- **Data Protection**: All API calls use secure HTTPS connections

### Performance

- **Efficient API Calls**: Optimized requests to minimize load times
- **Caching**: Smart caching to reduce API calls
- **Real-time Updates**: Live data synchronization

## 🚀 Deployment

### Environment Variables for Production

Update these for production deployment:

```env
VITE_SHOPIFY_REDIRECT_URI=https://yourdomain.com/auth/callback
VITE_DEV_MODE=false
```

### Build for Production

```bash
npm run build
```

## 📝 Development

### Project Structure

```
src/
  components/
    Dashboard.tsx          # Demo dashboard
    DashboardShopify.tsx   # Real Shopify dashboard
    Inventory.tsx          # Demo inventory
    InventoryShopify.tsx   # Real Shopify inventory
    Orders.tsx             # Enhanced orders (supports both)
    CustomersShopify.tsx   # Real Shopify customers
    ShopifyConnect.tsx     # Enhanced connection UI
  contexts/
    ShopifyContext.tsx     # Shopify state management
  hooks/
    useShopifyData.ts      # Data fetching hooks
  services/
    shopifyAPI.ts          # Shopify API integration
```

### Adding New Features

1. **Create Shopify-enabled components** that show real data when connected
2. **Use the `useShopify()` hook** to check connection status
3. **Implement loading and error states** for better UX
4. **Use appropriate Shopify API endpoints** via the `shopifyAPI` service

## 🎯 Key Benefits

### For Store Owners

- **Unified Dashboard**: One place to manage your entire Shopify business
- **Real-Time Insights**: Live data from your actual store
- **Easy Setup**: Connect in seconds with OAuth

### For Developers

- **Clean Architecture**: Well-structured React + TypeScript codebase
- **Extensible**: Easy to add new features and integrations
- **Modern Stack**: Latest React, Vite, and TypeScript

## 🔄 Data Flow

1. **User clicks connect** → OAuth flow initiated
2. **Shopify redirects back** → Token exchanged and stored
3. **Components check connection** → Switch to real data mode
4. **API calls made** → Real Shopify data fetched
5. **UI updates** → Placeholder data replaced with real data

## 🆘 Troubleshooting

### Common Issues

**"Failed to connect to Shopify store"**

- Check your API credentials in `.env`
- Verify your redirect URI matches Shopify app settings
- Ensure your store domain is correct

**"No data showing after connection"**

- Check if your store has products/orders/customers
- Verify API permissions (scopes) are sufficient
- Check browser console for API errors

**"Loading indefinitely"**

- Check network connectivity
- Verify Shopify API is accessible
- Check for CORS issues in development

### Getting Help

1. Check the browser console for errors
2. Verify your `.env` configuration
3. Test the Shopify connection manually
4. Check API rate limits

---

## 🌟 Success!

Once connected, you'll see your real Shopify data powering the entire application. The transformation from placeholder to real data happens automatically, giving you a powerful, personalized dashboard for managing your Shopify business.

**Happy selling! 🛍️**
