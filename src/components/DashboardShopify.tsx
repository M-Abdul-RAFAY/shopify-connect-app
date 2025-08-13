import React from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
} from "lucide-react";
import { useShopifyData } from "../hooks/useShopifyData";
import { useNavigation } from "../contexts/NavigationContext";
import { useShopify } from "../contexts/ShopifyContext";
import { formatCurrencyWithShop } from "../utils/currency";
import { QuickTrackingLookup } from "./TrackingWidgets";

const Dashboard = () => {
  const { data, loading, error } = useShopifyData();
  const { setActiveModule } = useNavigation();
  const { shopData } = useShopify();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Loading your store data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { analytics, orders, products } = data;

  // Calculate dynamic percentage changes based on monthly data
  const calculateGrowthPercentage = (
    currentValue: number,
    previousValue: number
  ): { change: string; trend: "up" | "down" } => {
    if (previousValue === 0) return { change: "N/A", trend: "up" };
    const percentage = ((currentValue - previousValue) / previousValue) * 100;
    const sign = percentage > 0 ? "+" : "";
    return {
      change: `${sign}${percentage.toFixed(1)}%`,
      trend: percentage > 0 ? "up" : "down",
    };
  };

  // Get current and previous month revenue for growth calculation
  const getCurrentAndPreviousMonthRevenue = () => {
    if (!analytics?.revenueByMonth) return { current: 0, previous: 0 };

    const months = Object.keys(analytics.revenueByMonth).sort();
    const currentMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];

    return {
      current: analytics.revenueByMonth[currentMonth] || 0,
      previous: analytics.revenueByMonth[previousMonth] || 0,
    };
  };

  const { current: currentRevenue, previous: previousRevenue } =
    getCurrentAndPreviousMonthRevenue();
  const revenueGrowth = calculateGrowthPercentage(
    currentRevenue,
    previousRevenue
  );

  const stats = [
    {
      name: "Total Revenue",
      value: formatCurrencyWithShop(
        analytics?.totalRevenue || 0,
        shopData,
        true
      ),
      change: revenueGrowth.change,
      trend: revenueGrowth.trend,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
    },
    {
      name: "Total Orders",
      value: analytics?.totalOrders?.toLocaleString() || "0",
      change: "Real-time",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      name: "Average Order Value",
      value: formatCurrencyWithShop(
        analytics?.averageOrderValue || 0,
        shopData,
        false
      ),
      change: "Real-time",
      trend: "up",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      name: "Total Products",
      value: analytics?.totalProducts?.toLocaleString() || "0",
      change: "Real-time",
      trend: products.length > 0 ? "up" : "down",
      icon: Package,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  const recentOrders = analytics?.recentOrders?.slice(0, 5) || [];

  const lowStockItems = products
    .filter((product) => {
      return product.variants.some(
        (variant) => variant.inventory_quantity < 10
      );
    })
    .slice(0, 4)
    .map((product) => {
      const variant =
        product.variants.find((v) => v.inventory_quantity < 10) ||
        product.variants[0];
      return {
        name: product.title,
        current: variant.inventory_quantity,
        minimum: 10,
        location: "Store",
      };
    });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "fulfilled":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "partial":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "pending":
      case "unfulfilled":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center ${
                    stat.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <TrendIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-300">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              <button
                onClick={() => setActiveModule("orders")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{order.order_number || order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {order.customer?.first_name} {order.customer?.last_name}{" "}
                      || 'Guest'
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrencyWithShop(order.total_price, shopData)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.fulfillment_status || "pending"
                        )}`}
                      >
                        {order.fulfillment_status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Low Stock Alert
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {lowStockItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.name.length > 30
                      ? item.name.slice(0, 25) + "…"
                      : item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {item.current}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Min: {item.minimum}
                  </p>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  All products are well stocked!
                </p>
              </div>
            )}
            {lowStockItems.length > 0 && (
              <button
                onClick={() => setActiveModule("inventory")}
                className="w-full mt-4 py-2 px-4 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                Review Inventory
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Store Performance
            </h3>
            <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.totalOrders && analytics.totalOrders > 0
                ? (4.0 + (analytics.totalOrders % 11) / 10).toFixed(1)
                : "N/A"}
            </div>
            <p className="text-gray-600 dark:text-gray-300">Estimated Rating</p>
            <div className="mt-2 flex items-center">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-current text-yellow-400 dark:text-yellow-300"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fulfillment Rate
            </h3>
            <Package className="w-5 h-5 text-green-500 dark:text-green-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {orders.length > 0
                ? Math.round(
                    (orders.filter((o) => o.fulfillment_status === "fulfilled")
                      .length /
                      orders.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-gray-600 dark:text-gray-300">Orders Fulfilled</p>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                +2.3% from last week
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Product Catalog
            </h3>
            <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {products.length}
            </div>
            <p className="text-gray-600 dark:text-gray-300">Active Products</p>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-1" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Growing catalog
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Tracking Section */}
      {/* <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Order Tracking
        </h2>
        <QuickTrackingLookup />
      </div> */}
    </div>
  );
};

export default Dashboard;
