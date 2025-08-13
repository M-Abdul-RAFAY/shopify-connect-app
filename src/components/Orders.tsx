import { useState } from "react";
import {
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Mail,
} from "lucide-react";
import {
  useShopifyOrders,
  useShopifyOrderStats,
} from "../hooks/useShopifyData";
import { useShopify } from "../contexts/ShopifyContext";
import { formatCurrencyWithShop } from "../utils/currency";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../utils/pagination.tsx";
import { TrackingStatus, QuickTrackingLookup } from "./TrackingWidgets";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

  // Use Shopify data if connected, otherwise use placeholder data
  const { orders: shopifyOrders, loading, error } = useShopifyOrders();
  const { orderStats, loading: statsLoading } = useShopifyOrderStats();
  const { isConnected, shopData } = useShopify();

  // Placeholder data for when not connected to Shopify
  const placeholderOrders = [
    {
      id: "#ORD-2024-001",
      customer: {
        name: "Alice Johnson",
        email: "alice.johnson@email.com",
        phone: "+1 (555) 123-4567",
      },
      items: 3,
      amount: 1249.99,
      status: "Processing",
      paymentStatus: "Paid",
      shippingAddress: "123 Main St, New York, NY 10001",
      orderDate: "2024-01-15T10:30:00",
      estimatedDelivery: "2024-01-20",
      channel: "Online Store",
      fulfillmentCenter: "Main Warehouse",
    },
    {
      id: "#ORD-2024-002",
      customer: {
        name: "Bob Smith",
        email: "bob.smith@email.com",
        phone: "+1 (555) 987-6543",
      },
      items: 1,
      amount: 89.5,
      status: "Shipped",
      paymentStatus: "Paid",
      shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
      orderDate: "2024-01-14T15:45:00",
      estimatedDelivery: "2024-01-18",
      channel: "Mobile App",
      fulfillmentCenter: "West Coast Hub",
    },
    {
      id: "#ORD-2024-003",
      customer: {
        name: "Carol Davis",
        email: "carol.davis@email.com",
        phone: "+1 (555) 456-7890",
      },
      items: 2,
      amount: 234.75,
      status: "Delivered",
      paymentStatus: "Paid",
      shippingAddress: "789 Pine St, Chicago, IL 60601",
      orderDate: "2024-01-12T09:15:00",
      estimatedDelivery: "2024-01-16",
      channel: "In-Store",
      fulfillmentCenter: "Chicago Store",
    },
    {
      id: "#ORD-2024-004",
      customer: {
        name: "David Wilson",
        email: "david.wilson@email.com",
        phone: "+1 (555) 321-0987",
      },
      items: 4,
      amount: 567.25,
      status: "Pending",
      paymentStatus: "Pending",
      shippingAddress: "321 Elm Dr, Miami, FL 33101",
      orderDate: "2024-01-15T14:20:00",
      estimatedDelivery: "2024-01-22",
      channel: "Marketplace",
      fulfillmentCenter: "Southeast Hub",
    },
    {
      id: "#ORD-2024-005",
      customer: {
        name: "Eva Brown",
        email: "eva.brown@email.com",
        phone: "+1 (555) 654-3210",
      },
      items: 1,
      amount: 1899.99,
      status: "Cancelled",
      paymentStatus: "Refunded",
      shippingAddress: "654 Maple Ln, Seattle, WA 98101",
      orderDate: "2024-01-13T11:30:00",
      estimatedDelivery: null,
      channel: "Online Store",
      fulfillmentCenter: "Northwest Hub",
    },
  ];

  // Use real Shopify data when connected, otherwise use placeholder data
  const orders =
    isConnected && shopifyOrders.length > 0
      ? shopifyOrders.map((order) => ({
          id: order.name,
          customer: {
            name: order.customer
              ? `${order.customer.first_name} ${order.customer.last_name}`
              : "Guest",
            email: order.customer?.email || order.email,
            phone: order.customer?.phone || "",
          },
          items: order.line_items.length,
          amount: parseFloat(order.total_price),
          status: order.fulfillment_status || "Pending",
          paymentStatus: order.financial_status === "paid" ? "Paid" : "Pending",
          shippingAddress: order.shipping_address
            ? `${order.shipping_address.address1}, ${
                order.shipping_address.city
              }, ${
                order.shipping_address.province ||
                order.shipping_address.country
              }`
            : "No address",
          orderDate: order.created_at,
          estimatedDelivery: null,
          channel: "Online Store",
          fulfillmentCenter: "Main Store",
        }))
      : placeholderOrders;

  // Filtered orders for searching and filtering
  const filteredOrders = orders.filter((order) => {
    // Search filter
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !selectedStatus || order.status === selectedStatus;

    // Channel filter
    const matchesChannel =
      !selectedChannel || order.channel === selectedChannel;

    // Payment status filter
    const matchesPaymentStatus =
      !selectedPaymentStatus || order.paymentStatus === selectedPaymentStatus;

    return (
      matchesSearch && matchesStatus && matchesChannel && matchesPaymentStatus
    );
  });

  // Initialize pagination with filtered data
  const paginationData = usePagination(filteredOrders, 10);
  const paginatedOrders = paginationData.items;

  // Show loading state when connected and fetching data
  if (isConnected && loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">
            Loading orders from {shopData?.name}...
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
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
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
      case "Shipped":
        return "bg-yellow-100 text-yellow-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing":
        return <Clock className="w-4 h-4" />;
      case "Shipped":
        return <Truck className="w-4 h-4" />;
      case "Delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "Pending":
        return <AlertCircle className="w-4 h-4" />;
      case "Cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {isConnected
              ? `Manage orders from ${shopData?.name} • ${
                  filteredOrders.length
                } orders ${
                  filteredOrders.length !== orders.length
                    ? `(filtered from ${orders.length})`
                    : ""
                }`
              : "Track and manage all customer orders"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3"></div>
      </div>

      {/* Quick Tracking Lookup */}
      <div className="animate-slide-up">
        <QuickTrackingLookup />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 group-hover:scale-110 transition-transform duration-200">
              <Package className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {isConnected && !statsLoading
                  ? orderStats.totalOrders.toLocaleString()
                  : "1,247"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 group-hover:scale-110 transition-transform duration-200">
              <Clock className="w-5 lg:w-6 h-5 lg:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {isConnected && !statsLoading
                  ? orderStats.processing.toLocaleString()
                  : "156"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Processing</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 group-hover:scale-110 transition-transform duration-200">
              <CheckCircle className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {isConnected && !statsLoading
                  ? orderStats.completed.toLocaleString()
                  : "1,089"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 group-hover:scale-110 transition-transform duration-200">
              <Truck className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {isConnected && !statsLoading
                  ? orderStats.inTransit.toLocaleString()
                  : "298"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">In Transit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders, customers, order IDs..."
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium transition-all duration-200 hover:shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Pending">Pending</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
              >
                <option value="">All Channels</option>
                <option value="Online Store">Online Store</option>
                <option value="Mobile App">Mobile App</option>
                <option value="In-Store">In-Store</option>
                <option value="Marketplace">Marketplace</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              >
                <option value="">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
              <div className="flex space-x-2 sm:col-span-2 lg:col-span-1">
                <button
                  onClick={() => {
                    setSelectedStatus("");
                    setSelectedChannel("");
                    setSelectedPaymentStatus("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-200 text-sm font-medium"
                >
                  Clear
                </button>
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 dark:hover:from-primary-600 dark:hover:to-purple-600 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {order.id}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.items} items
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.customer.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        <span className="truncate max-w-24 sm:max-w-32">{order.customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrencyWithShop(order.amount, shopData)}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {order.channel}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                      <span className="hidden sm:inline">{formatDate(order.orderDate)}</span>
                      <span className="sm:hidden">{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
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

export default Orders;
