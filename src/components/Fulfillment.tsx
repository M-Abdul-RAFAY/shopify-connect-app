import { useState } from "react";
import {
  Search,
  Filter,
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Calendar,
  Eye,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useShopifyFulfillment } from "../hooks/useShopifyData";
import { useShopify } from "../contexts/ShopifyContext";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../utils/pagination.tsx";
import { usePostExOrder } from "../hooks/usePostExTracking";
import { ToastContainer } from "./ToastNew";
import { formatCurrencyWithShop } from "../utils/currency";

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
  const { loading, error, timeline, currentStatus, refresh } =
    usePostExOrder(trackingNumber);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Tracking: {trackingNumber}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Loading tracking information...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200">
                  Error loading tracking information
                </span>
              </div>
            </div>
          )}

          {currentStatus && (
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Current Status
                  </h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {currentStatus.transactionStatusMessage}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Last updated: {currentStatus.modifiedDatetime}
                  </p>
                </div>
              </div>
            </div>
          )}

          {timeline && timeline.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tracking Timeline
              </h3>
              <div className="space-y-4">
                {timeline.map((status, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {status.transactionStatusMessage}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {status.modifiedDatetime}
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
          )}
        </div>
      </div>
    </div>
  );
};

const Fulfillment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "warning" | "info";
      message: string;
      duration?: number;
    }>
  >([]);

  // Use Shopify data if connected, otherwise use placeholder data
  const { fulfillmentData, loading, error } = useShopifyFulfillment();
  const { isConnected, shopData } = useShopify();

  // Placeholder data for when not connected to Shopify
  const placeholderShipments = [
    {
      id: "SHP-2024-001",
      orderId: "#ORD-2024-001",
      customer: "Alice Johnson",
      origin: "Main Warehouse",
      destination: "123 Main St, New York, NY 10001",
      carrier: "FedEx",
      trackingNumber: "1Z999AA1012345675",
      status: "In Transit",
      estimatedDelivery: "2024-01-20",
      actualDelivery: null,
      items: 3,
      weight: "2.5 lbs",
      cost: 12.99,
    },
    {
      id: "SHP-2024-002",
      orderId: "#ORD-2024-002",
      customer: "Bob Smith",
      origin: "West Coast Hub",
      destination: "456 Oak Ave, Los Angeles, CA 90210",
      carrier: "UPS",
      trackingNumber: "1Z999AA1087654321",
      status: "Delivered",
      estimatedDelivery: "2024-01-18",
      actualDelivery: "2024-01-17",
      items: 1,
      weight: "1.2 lbs",
      cost: 8.99,
    },
    {
      id: "SHP-2024-003",
      orderId: "#ORD-2024-003",
      customer: "Carol Davis",
      origin: "Chicago Store",
      destination: "789 Pine St, Chicago, IL 60601",
      carrier: "DHL",
      trackingNumber: "4321567890123456",
      status: "Processing",
      estimatedDelivery: "2024-01-21",
      actualDelivery: null,
      items: 2,
      weight: "3.1 lbs",
      cost: 15.5,
    },
    {
      id: "SHP-2024-004",
      orderId: "#ORD-2024-004",
      customer: "David Wilson",
      origin: "Southeast Hub",
      destination: "321 Elm Dr, Miami, FL 33101",
      carrier: "USPS",
      trackingNumber: "9405511899562389474747",
      status: "Exception",
      estimatedDelivery: "2024-01-22",
      actualDelivery: null,
      items: 4,
      weight: "5.8 lbs",
      cost: 22.75,
    },
    {
      id: "SHP-2024-005",
      orderId: "#ORD-2024-005",
      customer: "Eva Brown",
      origin: "Northwest Hub",
      destination: "654 Maple Ln, Seattle, WA 98101",
      carrier: "FedEx",
      trackingNumber: "1Z999AA1098765432",
      status: "Ready to Ship",
      estimatedDelivery: "2024-01-24",
      actualDelivery: null,
      items: 1,
      weight: "4.2 lbs",
      cost: 18.99,
    },
    {
      id: "SHP-2024-006",
      orderId: "#ORD-2024-006",
      customer: "Frank Wilson",
      origin: "East Coast Hub",
      destination: "987 Oak Street, Boston, MA 02101",
      carrier: "PostEx",
      trackingNumber: "", // No tracking number
      status: "Processing",
      estimatedDelivery: "2024-01-25",
      actualDelivery: null,
      items: 2,
      weight: "1.8 lbs",
      cost: 14.5,
    },
  ];

  const placeholderFulfillmentCenters = [
    {
      name: "Main Warehouse",
      location: "New York, NY",
      activeOrders: 45,
      capacity: "85%",
      status: "Operational",
    },
    {
      name: "West Coast Hub",
      location: "Los Angeles, CA",
      activeOrders: 32,
      capacity: "72%",
      status: "Operational",
    },
    {
      name: "Chicago Store",
      location: "Chicago, IL",
      activeOrders: 18,
      capacity: "45%",
      status: "Operational",
    },
    {
      name: "Southeast Hub",
      location: "Miami, FL",
      activeOrders: 28,
      capacity: "68%",
      status: "Maintenance",
    },
  ];

  // Use real Shopify data when connected, otherwise use placeholder data
  const shipments =
    isConnected && fulfillmentData?.shipments
      ? fulfillmentData.shipments
      : placeholderShipments;
  const fulfillmentCenters =
    isConnected && fulfillmentData?.fulfillmentCenters
      ? fulfillmentData.fulfillmentCenters
      : placeholderFulfillmentCenters;

  // Apply filtering
  const filteredShipments = shipments.filter((shipment: any) => {
    // Search filter with null safety
    const matchesSearch =
      (shipment.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (shipment.orderId?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (shipment.customer?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (shipment.trackingNumber?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    // Status filter
    const matchesStatus = !selectedStatus || shipment.status === selectedStatus;

    // Origin filter
    const matchesOrigin = !selectedOrigin || shipment.origin === selectedOrigin;

    return matchesSearch && matchesStatus && matchesOrigin;
  });

  // Add pagination for filtered data
  const paginationData = usePagination(filteredShipments, 10);
  const paginatedShipments = paginationData.items;

  // Toast management functions
  const addToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration = 3000
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Handle tracking order - updated to handle missing tracking numbers
  const handleTrackOrder = (shipment: any) => {
    // Check if shipment has a tracking number
    if (!shipment.trackingNumber || shipment.trackingNumber.trim() === "") {
      // Show toast notification for pending orders
      addToast(
        "Tracking information is pending for this order",
        "warning",
        4000
      );
      return;
    }

    // If tracking number exists, open the tracking modal
    setSelectedOrder(shipment.trackingNumber);
    setTrackingModalOpen(true);
  };

  // Show loading state when connected and fetching data
  if (isConnected && loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Logistics & Fulfillment
          </h1>
          <p className="text-gray-600 mt-1">
            Loading fulfillment data from {shopData?.name}...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state when connected but failed to load
  if (isConnected && error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Logistics & Fulfillment
          </h1>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
      case "Ready to Ship":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "In Transit":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400";
      case "Delivered":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "Exception":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing":
        return <Clock className="w-4 h-4" />;
      case "Ready to Ship":
        return <Package className="w-4 h-4" />;
      case "In Transit":
        return <Truck className="w-4 h-4" />;
      case "Delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "Exception":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Logistics & Fulfillment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isConnected
              ? `Manage shipments from ${shopData?.name} • ${
                  filteredShipments.length
                } shipments ${
                  filteredShipments.length !== shipments.length
                    ? `(filtered from ${shipments.length})`
                    : ""
                }`
              : "Manage shipments and fulfillment centers"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isConnected && fulfillmentData
                  ? fulfillmentData.totalShipments
                  : shipments.length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Active Shipments
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {shipments.filter((s: any) => s.status === "In Transit").length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                In Transit
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isConnected && fulfillmentData
                  ? fulfillmentData.onTimeDeliveryRate
                  : "Connect Store"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                On-Time Delivery
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {shipments.filter((s: any) => s.status === "Exception").length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Exceptions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search shipments, orders, tracking numbers..."
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Processing">Processing</option>
                <option value="Ready to Ship">Ready to Ship</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Exception">Exception</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
              >
                <option value="">All Origins</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="West Coast Hub">West Coast Hub</option>
                <option value="Chicago Store">Chicago Store</option>
                <option value="Southeast Hub">Southeast Hub</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedStatus("");
                    setSelectedOrigin("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shipments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Shipment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedShipments.map((shipment: any) => (
                <tr
                  key={shipment.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {shipment.orderId}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        {shipment.trackingNumber || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {shipment.customer}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {shipment.items} items
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {shipment.weight}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {shipment.origin}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Navigation className="w-3 h-3 mr-1" />
                        {shipment.destination.length > 25
                          ? shipment.destination.slice(0, 25) + "…"
                          : shipment.destination}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        shipment.status
                      )}`}
                    >
                      {getStatusIcon(shipment.status)}
                      <span className="ml-1">{shipment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrencyWithShop(shipment.cost || 0, shopData)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Order Total</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                        {formatDate(shipment.estimatedDelivery)}
                      </div>
                      {shipment.actualDelivery && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Delivered: {formatDate(shipment.actualDelivery)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleTrackOrder(shipment)}
                      className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationControls
          pagination={paginationData.pagination}
          onPageChange={paginationData.setCurrentPage}
          onPageSizeChange={paginationData.setPageSize}
        />
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default Fulfillment;
