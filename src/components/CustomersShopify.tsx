import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
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

const CustomersShopify = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const { customers, loading, error } = useShopifyCustomers();
  const { data: shopData } = useShopifyData();
  const { isConnected, shopData: contextShopData } = useShopify();

  // Get shop currency or fallback to USD
  const shopCurrency = shopData?.shop?.currency || "USD";

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

  const getTierFromSpent = (totalSpent: string) => {
    const spent = parseFloat(totalSpent);
    if (spent >= 1000) return "Platinum";
    if (spent >= 500) return "Gold";
    if (spent >= 100) return "Silver";
    return "Bronze";
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-purple-100 text-purple-800";
      case "Gold":
        return "bg-yellow-100 text-yellow-800";
      case "Silver":
        return "bg-gray-100 text-gray-800";
      case "Bronze":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage customers from {shopData?.shop?.name} • {customers.length}{" "}
            total customers
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {customerStats.total}
              </p>
              <p className="text-gray-600">Total Customers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(customerStats.totalSpent)}
              </p>
              <p className="text-gray-600">Total Spent</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(customerStats.averageSpent)}
              </p>
              <p className="text-gray-600">Average Spent</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {customerStats.totalOrders}
              </p>
              <p className="text-gray-600">Total Orders</p>
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
                placeholder="Search customers by name, email, or phone..."
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at">Newest First</option>
              <option value="total_spent">Highest Spent</option>
              <option value="orders_count">Most Orders</option>
              <option value="last_name">Name A-Z</option>
            </select>
            <button className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCustomers.map((customer) => {
          const tier = getTierFromSpent(customer.total_spent);
          return (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {customer.first_name?.charAt(0) ||
                      customer.email?.charAt(0) ||
                      "?"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {customer.first_name && customer.last_name
                        ? `${customer.first_name} ${customer.last_name}`
                        : customer.email}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(
                        tier
                      )}`}
                    >
                      {tier}
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    {customer.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}

                    {customer.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone}</span>
                      </div>
                    )}

                    {customer.default_address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">
                          {customer.default_address.city},{" "}
                          {customer.default_address.country}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(customer.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Spent</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(customer.total_spent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Orders</p>
                        <p className="font-semibold text-gray-900">
                          {customer.orders_count}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {sortedCustomers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No customers found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {Math.min(sortedCustomers.length, 50)} of{" "}
            {sortedCustomers.length} customers
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersShopify;
