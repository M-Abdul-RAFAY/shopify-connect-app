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
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {isConnected && !statsLoading
                  ? orderStats.totalOrders.toLocaleString()
                  : "1,247"}
              </h3>
              <p className="text-gray-600 text-sm">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {isConnected && !statsLoading
                  ? orderStats.processing.toLocaleString()
                  : "156"}
              </h3>
              <p className="text-gray-600 text-sm">Processing</p>
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
                {isConnected && !statsLoading
                  ? orderStats.completed.toLocaleString()
                  : "1,089"}
              </h3>
              <p className="text-gray-600 text-sm">Completed</p>
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
                {isConnected && !statsLoading
                  ? orderStats.inTransit.toLocaleString()
                  : "298"}
              </h3>
              <p className="text-gray-600 text-sm">In Transit</p>
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
                placeholder="Search orders, customers, order IDs..."
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
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Pending">Pending</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              >
                <option value="">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedStatus("");
                    setSelectedChannel("");
                    setSelectedPaymentStatus("");
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

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-blue-600">
                        {order.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items} items
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {order.customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrencyWithShop(order.amount, shopData)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.channel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(order.orderDate)}
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
