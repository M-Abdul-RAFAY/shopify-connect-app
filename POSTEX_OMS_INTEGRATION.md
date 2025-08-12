# PostEx Order Management System (OMS) Integration

## Overview

Your Shopify application now includes a comprehensive **Order Management System (OMS)** with **PostEx logistics tracking integration**. This allows you to track the real-time status of your orders using PostEx's API.

## Features Implemented

### 1. **PostEx API Service** (`src/services/postexAPI.ts`)

- Complete PostEx API integration
- Real-time order tracking by tracking number
- Status code mapping and interpretation
- Timeline formatting and delivery status checking
- Error handling and retry logic

### 2. **React Hooks** (`src/hooks/usePostExTracking.ts`)

- `usePostExTracking` - Track multiple orders
- `usePostExOrder` - Track single order with detailed timeline
- Real-time data updates and caching
- Loading states and error handling

### 3. **Tracking Widgets** (`src/components/TrackingWidgets.tsx`)

- **TrackingStatus** - Compact status display
- **TrackingTimeline** - Expandable timeline view
- **QuickTrackingLookup** - Search by tracking number
- Responsive design with proper error handling

### 4. **Enhanced Components**

- **Orders** component now includes quick tracking lookup
- **DashboardShopify** component features tracking widget
- **OrderManagementSystem** - Full OMS with PostEx integration (available via "Order Tracking" menu)

## How to Use

### 1. **Quick Tracking (Orders Page)**

1. Go to **Orders** page
2. Use the "Quick Order Tracking" widget at the top
3. Enter any PostEx tracking number (e.g., `21032470001639`)
4. Click the search button to see real-time status

### 2. **Full Order Management (OMS)**

1. Click **"Order Tracking"** in the navigation menu
2. View all your Shopify orders with PostEx tracking integration
3. Click "Track" on any order with a tracking number
4. View detailed timeline and delivery status

### 3. **Dashboard Integration**

1. Go to **Dashboard**
2. Scroll down to the "Order Tracking" section
3. Use the quick lookup to track any order

## PostEx Status Codes Supported

| Code | Status                  | Description                     |
| ---- | ----------------------- | ------------------------------- |
| 0001 | At Warehouse            | Package at pickup location      |
| 0003 | Received at Warehouse   | Package received for processing |
| 0004 | Enroute for Delivery    | Out for delivery                |
| 0005 | Delivered to Customer   | Successfully delivered          |
| 0031 | Departed to Warehouse   | In transit to warehouse         |
| 0033 | Departed to Destination | In transit to destination       |
| 0035 | Arrived at Transit Hub  | At sorting/transit facility     |
| 0038 | Waiting for Delivery    | Ready for delivery              |
| 0040 | Return in Transit       | Being returned to sender        |
| 0041 | Returned to Sender      | Successfully returned           |
| 0042 | Delivery Failed         | Delivery attempt failed         |

## API Integration Details

### Example API Call

```
GET https://api.postex.pk/services/courier/api/guest/get-order/21032470001639
```

### Response Structure

```json
{
  "statusCode": "200",
  "statusMessage": "Successfully Operated",
  "dist": {
    "customerName": "Customer Name",
    "trackingNumber": "21032470001639",
    "orderPickupDate": "2025-08-06T21:16:17.000+0500",
    "transactionStatusHistory": [
      {
        "transactionStatusMessage": "Delivered to Customer",
        "transactionStatusMessageCode": "0005",
        "modifiedDatetime": "2025-08-10T16:28:20.000+0500"
      }
    ]
  }
}
```

## Testing the Integration

### Test with Sample Tracking Number

Use this sample tracking number to test: `21032470001639`

This will show a complete delivery timeline from pickup to delivery.

### Real-time Features

- **Auto-refresh** - Click refresh button to get latest status
- **Timeline view** - Expandable history of all status updates
- **Status indicators** - Color-coded status badges
- **Error handling** - Proper error messages for invalid tracking numbers

## Benefits for Your Business

1. **Real-time Visibility** - Track orders from pickup to delivery
2. **Customer Service** - Provide customers with accurate delivery updates
3. **Operational Efficiency** - Monitor delivery performance and identify issues
4. **Integration** - Seamlessly integrated with your existing Shopify data
5. **User Experience** - Clean, intuitive interface for tracking orders

## Next Steps

1. **API Authentication** - Add your PostEx API key if required
2. **Shopify Integration** - Map tracking numbers from Shopify orders
3. **Notifications** - Add email/SMS notifications for status updates
4. **Analytics** - Track delivery performance metrics
5. **Customer Portal** - Allow customers to track their own orders

Your OMS is now ready to provide comprehensive order tracking with PostEx logistics! 🚚📦
