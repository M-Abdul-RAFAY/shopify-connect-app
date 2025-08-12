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
} from "lucide-react";
import { useShopifyFulfillment } from "../hooks/useShopifyData";
import { useShopify } from "../contexts/ShopifyContext";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../utils/pagination.tsx";

const Fulfillment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");

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
        return "bg-blue-100 text-blue-800";
      case "Ready to Ship":
        return "bg-yellow-100 text-yellow-800";
      case "In Transit":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Exception":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h1 className="text-3xl font-bold text-gray-900">
            Logistics & Fulfillment
          </h1>
          <p className="text-gray-600 mt-1">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {isConnected && fulfillmentData
                  ? fulfillmentData.totalShipments
                  : shipments.length}
              </h3>
              <p className="text-gray-600 text-sm">Active Shipments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {shipments.filter((s: any) => s.status === "In Transit").length}
              </h3>
              <p className="text-gray-600 text-sm">In Transit</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {isConnected && fulfillmentData
                  ? fulfillmentData.onTimeDeliveryRate
                  : "Connect Store"}
              </h3>
              <p className="text-gray-600 text-sm">On-Time Delivery</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {shipments.filter((s: any) => s.status === "Exception").length}
              </h3>
              <p className="text-gray-600 text-sm">Exceptions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search shipments, orders, tracking numbers..."
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedShipments.map((shipment: any) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-blue-600">
                        {shipment.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shipment.orderId}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {shipment.trackingNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {shipment.customer}
                    </div>
                    <div className="text-sm text-gray-500">
                      {shipment.items} items
                    </div>
                    <div className="text-xs text-gray-400">
                      {shipment.weight}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {shipment.origin}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Navigation className="w-3 h-3 mr-1" />
                        {shipment.destination.split(",")[0].length > 20
                          ? shipment.destination.split(",")[0].slice(0, 50) +
                            "…"
                          : shipment.destination.split(",")[0]}
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
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(shipment.estimatedDelivery)}
                      </div>
                      {shipment.actualDelivery && (
                        <div className="text-xs text-green-600">
                          Delivered: {formatDate(shipment.actualDelivery)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    $
                    {typeof shipment.cost === "number"
                      ? shipment.cost.toFixed(2)
                      : shipment.cost}
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
    </div>
  );
};

export default Fulfillment;
