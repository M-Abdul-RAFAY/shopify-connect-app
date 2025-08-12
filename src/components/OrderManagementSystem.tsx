import { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { usePostExTracking, usePostExOrder } from "../hooks/usePostExTracking";
import { postexAPI } from "../services/postexAPI";
import { useShopifyData } from "../hooks/useShopifyData";

// Types for fulfillment structure
interface Fulfillment {
  tracking_number?: string;
  tracking_company?: string;
}

// Order Tracking Modal Component
const OrderTrackingModal = ({
  trackingNumber,
  isOpen,
  onClose,
}: {
  trackingNumber: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { orderData, loading, error, timeline, currentStatus, refresh } =
    usePostExOrder(trackingNumber);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Order Tracking: {trackingNumber}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">
                Loading tracking information...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {orderData && currentStatus && (
            <>
              {/* Current Status */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Current Status
                    </h3>
                    <p className="text-gray-600">
                      Customer: {orderData.dist.customerName}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      postexAPI.getStatusInfo(
                        currentStatus.transactionStatusMessageCode
                      ).color
                    } text-white`}
                  >
                    {currentStatus.transactionStatusMessage}
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tracking Timeline
                </h3>
                <div className="space-y-4">
                  {timeline.map((status, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full mt-2 ${
                          status.statusInfo.color
                        } ${status.isLatest ? "ring-4 ring-blue-200" : ""}`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-medium ${
                              status.isLatest
                                ? "text-blue-600"
                                : "text-gray-900"
                            }`}
                          >
                            {status.transactionStatusMessage}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {status.formattedDate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Code: {status.transactionStatusMessageCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Order Management System Component
const OrderManagementSystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  const { data: shopifyData, loading: shopifyLoading } = useShopifyData();
  const { orders } = shopifyData;

  // Filter and extract tracking numbers from fulfilled orders only
  const fulfilledOrdersWithTracking = orders.filter((order) => {
    // Check if order has fulfillments with tracking numbers
    return order.fulfillments && 
           order.fulfillments.length > 0 && 
           order.fulfillments.some((fulfillment: Fulfillment) => 
             fulfillment.tracking_number && 
             fulfillment.tracking_company === "PostEx"
           );
  });

  // Extract tracking numbers from fulfilled orders
  const trackingNumbers = fulfilledOrdersWithTracking
    .map((order) => {
      // Get tracking number from fulfillments
      const fulfillment = order.fulfillments?.find((f: Fulfillment) => 
        f.tracking_number && f.tracking_company === "PostEx"
      );
      return fulfillment?.tracking_number;
    })
    .filter(Boolean);

  const {
    loading: trackingLoading,
    error: trackingError,
    getOrderWithTracking,
    refreshTracking,
  } = usePostExTracking(trackingNumbers);

  // Merge fulfilled Shopify orders with PostEx tracking data
  const ordersWithTracking = getOrderWithTracking(fulfilledOrdersWithTracking);

  // Helper function to get tracking number from fulfillments
  const getTrackingNumber = (order: any) => {
    const fulfillment = order.fulfillments?.find((f: Fulfillment) => 
      f.tracking_number && f.tracking_company === "PostEx"
    );
    return fulfillment?.tracking_number || null;
  };

  // Filter orders based on search term
  const filteredOrders = ordersWithTracking.filter(
    (order) =>
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customer?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getTrackingNumber(order)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTrackOrder = (trackingNumber: string) => {
    setSelectedOrder(trackingNumber);
    setTrackingModalOpen(true);
  };

  const getStatusIcon = (order: any) => {
    if (order.isDelivered)
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (order.currentStatus) {
      const statusInfo = postexAPI.getStatusInfo(
        order.currentStatus.transactionStatusMessageCode
      );
      if (statusInfo.type === "in-transit")
        return <Truck className="w-5 h-5 text-blue-600" />;
      if (statusInfo.type === "processing")
        return <Package className="w-5 h-5 text-orange-600" />;
      if (statusInfo.type === "failed" || statusInfo.type === "returned")
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (order: any) => {
    if (order.currentStatus) {
      // Check if order is delivered
      const statusInfo = postexAPI.getStatusInfo(
        order.currentStatus.transactionStatusMessageCode
      );
      if (statusInfo.type === "delivered") {
        return order.currentStatus.transactionStatusMessage;
      } else {
        // If not delivered, show "Pending Shipment in Progress"
        return "Pending Shipment in Progress";
      }
    }
    return "Pending Shipment in Progress";
  };

  const getStatusColor = (order: any) => {
    if (order.isDelivered) return "text-green-600 bg-green-50";
    if (order.currentStatus) {
      const statusInfo = postexAPI.getStatusInfo(
        order.currentStatus.transactionStatusMessageCode
      );
      if (statusInfo.type === "in-transit") return "text-blue-600 bg-blue-50";
      if (statusInfo.type === "processing")
        return "text-orange-600 bg-orange-50";
      if (statusInfo.type === "failed" || statusInfo.type === "returned")
        return "text-red-600 bg-red-50";
    }
    return "text-gray-600 bg-gray-50";
  };

  if (shopifyLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order Management System
          </h1>
          <p className="text-gray-600 mt-1">Loading orders...</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order Management System
          </h1>
          <p className="text-gray-600 mt-1">
            Track fulfilled orders with PostEx logistics integration
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={refreshTracking}
            disabled={trackingLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                trackingLoading ? "animate-spin" : ""
              }`}
            />
            Refresh Tracking
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, customers, or tracking numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
          </h2>
        </div>

        {trackingError && (
          <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                Some tracking data may be unavailable: {trackingError}
              </span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.name || order.order_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.customer?.first_name} {order.customer?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Rs.{" "}
                      {parseFloat(order.total_price || "0").toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order
                      )}`}
                    >
                      {getStatusIcon(order)}
                      <span>{getStatusText(order)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getTrackingNumber(order) || "No tracking"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {getTrackingNumber(order) && (
                      <button
                        onClick={() => {
                          const trackingNum = getTrackingNumber(order);
                          if (trackingNum) handleTrackOrder(trackingNum);
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Track
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No fulfilled orders with tracking found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Only orders with PostEx fulfillments and tracking numbers are shown here"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <OrderTrackingModal
          trackingNumber={selectedOrder}
          isOpen={trackingModalOpen}
          onClose={() => {
            setTrackingModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default OrderManagementSystem;
