# Shopify Integration Setup

This application now integrates with Shopify stores. Follow these steps to set up the integration:

## 1. Create a Shopify App

1. Go to your Shopify Partner Dashboard: https://partners.shopify.com/
2. Create a new app or use an existing one
3. Note down your App ID and App Secret

## 2. Configure Environment Variables

Copy the `.env` file and update the values:

```bash
# Shopify App Configuration
VITE_SHOPIFY_APP_ID=your_actual_shopify_app_id_here
VITE_SHOPIFY_APP_SECRET=your_actual_shopify_app_secret_here
VITE_SHOPIFY_SCOPES=read_products,read_orders,read_customers,read_inventory,read_analytics
VITE_SHOPIFY_REDIRECT_URI=https://01bcd64792c3.ngrok-free.app/auth/callback
VITE_API_BASE_URL=https://01bcd64792c3.ngrok-free.app/api
```

## 3. Shopify App Settings

In your Shopify app settings:

1. Set the **App URL** to: `https://01bcd64792c3.ngrok-free.app`
2. Set the **Allowed redirection URL(s)** to: `https://01bcd64792c3.ngrok-free.app/auth/callback`
3. Make sure your app has the required scopes enabled

## 4. Testing the Integration

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. You should see the Shopify connection screen
4. Enter your store domain (without .myshopify.com)
5. Complete the OAuth flow

## 5. Features

Once connected, the application will:

- **Dashboard**: Show real revenue, orders, and analytics from your store
- **Inventory**: Display actual products with stock levels and prices
- **Orders**: Show real customer orders with status and details
- **Customers**: Display actual customer data from your store
- **Analytics**: Provide insights based on your actual store data

## 6. Security Notes

- Never commit your actual API keys to version control
- Use environment variables for all sensitive data
- The OAuth flow ensures secure authentication with Shopify

## 7. Development

The app uses several custom hooks for data fetching:

- `useShopifyData()` - Fetches all store data
- `useShopifyProducts()` - Fetches products only
- `useShopifyOrders()` - Fetches orders only
- `useShopifyCustomers()` - Fetches customers only
- `useShopifyAnalytics()` - Fetches analytics data

Data is automatically refreshed when the store connection is established.

## 8. Error Handling

The app includes comprehensive error handling:

- Connection failures show user-friendly messages
- Failed API calls display appropriate errors
- Loading states provide visual feedback
- Automatic retry mechanisms for temporary failures
