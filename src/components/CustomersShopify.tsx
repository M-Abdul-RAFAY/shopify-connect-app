import { useState } from "react";
import {
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useShopifyCustomers, useShopifyData } from "../hooks/useShopifyData";
import { useShopify } from "../contexts/ShopifyContext";
import { formatCurrency as formatCurrencyUtil } from "../utils/currency";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../utils/pagination.tsx";

const CustomersShopify = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const { customers, loading, error } = useShopifyCustomers();
  const { data: shopData } = useShopifyData();
  const { isConnected } = useShopify();

  // Get shop currency or fallback to USD
  const shopCurrency = shopData?.shop?.currency || "USD";

  // Filter and sort customers
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.first_name?.toLowerCase().includes(searchLower) ||
      customer.last_name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Apply sorting to filtered customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "created_at":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "total_spent":
        return parseFloat(b.total_spent) - parseFloat(a.total_spent);
      case "orders_count":
        return b.orders_count - a.orders_count;
      case "last_name": {
        const aLastName = a.last_name || a.email;
        const bLastName = b.last_name || b.email;
        return aLastName.localeCompare(bLastName);
      }
      default:
        return 0;
    }
  });

  // Add pagination
  const paginationData = usePagination(sortedCustomers, 10);
  const paginatedCustomers = paginationData.items;

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-600">
              Please connect your Shopify store to view real customer data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Loading your customers from {shopData?.shop?.name}...
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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const customerStats = {
    total: customers.length,
    totalSpent: customers.reduce(
      (sum, customer) => sum + parseFloat(customer.total_spent),
      0
    ),
    averageSpent:
      customers.length > 0
        ? customers.reduce(
            (sum, customer) => sum + parseFloat(customer.total_spent),
            0
          ) / customers.length
        : 0,
    totalOrders: customers.reduce(
      (sum, customer) => sum + customer.orders_count,
      0
    ),
  };

  const formatCurrency = (amount: string | number) => {
    return formatCurrencyUtil(amount, shopCurrency);
  };

  const formatDate = (dateString: string) => {
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Customers
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage customers from {shopData?.shop?.name} • {customers.length}{" "}
            total customers
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 group-hover:scale-110 transition-transform duration-200">
              <Users className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {customerStats.total}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Total Customers
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 group-hover:scale-110 transition-transform duration-200">
              <DollarSign className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(customerStats.totalSpent)}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Total Spent
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 group-hover:scale-110 transition-transform duration-200">
              <Star className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(customerStats.averageSpent)}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Average Spent
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 group-hover:scale-110 transition-transform duration-200">
              <ShoppingBag className="w-5 lg:w-6 h-5 lg:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {customerStats.totalOrders}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Total Orders
              </p>
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
                placeholder="Search customers by name, email, or phone..."
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              <option value="created_at">Newest First</option>
              <option value="total_spent">Highest Spent</option>
              <option value="orders_count">Most Orders</option>
              <option value="last_name">Name A-Z</option>
            </select>
            <button className="flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 animate-slide-up">
        {paginatedCustomers.map((customer) => {
          return (
            <div
              key={customer.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-lg">
                    {customer.first_name?.charAt(0) ||
                      customer.email?.charAt(0) ||
                      "?"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {customer.first_name && customer.last_name
                        ? `${customer.first_name} ${customer.last_name}`
                        : customer.email}
                    </h3>
                  </div>

                  <div className="mt-2 space-y-2">
                    {customer.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                          {customer.email}
                        </span>
                      </div>
                    )}

                    {customer.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          {customer.phone}
                        </span>
                      </div>
                    )}

                    {customer.default_address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">
                          {customer.default_address.city},{" "}
                          {customer.default_address.country}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(customer.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Total Spent
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(customer.total_spent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Orders
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {customer.orders_count}
                        </p>
                      </div>
                    </div>

                    {/* Last Order Information */}
                    {customer.last_order_name && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <ShoppingBag className="w-4 h-4" />
                          <span>
                            Last Order:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {customer.last_order_name}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {sortedCustomers.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
              No customers found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <PaginationControls
        pagination={paginationData.pagination}
        onPageChange={paginationData.setCurrentPage}
        onPageSizeChange={paginationData.setPageSize}
      />
    </div>
  );
};

export default CustomersShopify;
