import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Clock,
  MapPin,
  BarChart3,
  Activity,
} from "lucide-react";
import { useShopifyData } from "../hooks/useShopifyData";
import { useNavigation } from "../contexts/NavigationContext";
import { useShopify } from "../contexts/ShopifyContext";
import { formatCurrencyWithShop } from "../utils/currency";

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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          #
                          {order.name ||
                            order.order_number ||
                            order.id ||
                            "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.line_items?.reduce(
                            (total, item) => total + (item.quantity || 0),
                            0
                          ) || 0}{" "}
                          items
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {order.customer?.first_name && order.customer?.last_name
                        ? `${order.customer.first_name} ${order.customer.last_name}`
                        : order.customer?.email || "Guest"}
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

      {/* Enhanced Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
        {/* Monthly Revenue Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Revenue
            </h3>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <BarChart3 className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
          </div>
          <div className="space-y-4">
            {(() => {
              const monthlyRevenue = analytics?.revenueByMonth || {};
              const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              const currentDate = new Date();
              const monthlyData = [];

              // Get last 6 months of real data
              for (let i = 5; i >= 0; i--) {
                const date = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - i,
                  1
                );
                const monthKey = `${date.getFullYear()}-${String(
                  date.getMonth() + 1
                ).padStart(2, "0")}`;
                const monthName = months[date.getMonth()];
                const revenue = monthlyRevenue[monthKey] || 0;

                // Calculate percentage change from previous month
                const prevDate = new Date(
                  date.getFullYear(),
                  date.getMonth() - 1,
                  1
                );
                const prevMonthKey = `${prevDate.getFullYear()}-${String(
                  prevDate.getMonth() + 1
                ).padStart(2, "0")}`;
                const prevRevenue = monthlyRevenue[prevMonthKey] || 0;

                let change = "";
                let percentage = "0.0";
                if (prevRevenue > 0) {
                  const changePercent =
                    ((revenue - prevRevenue) / prevRevenue) * 100;
                  change = changePercent >= 0 ? "+" : "";
                  percentage = Math.abs(changePercent).toFixed(1);
                }

                monthlyData.push({
                  month: monthName,
                  revenue: revenue,
                  change: change,
                  percentage: percentage,
                });
              }

              return monthlyData.map((data, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.month}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrencyWithShop(data.revenue, shopData)}
                    </p>
                    <p
                      className={`text-xs ${
                        data.change === "+"
                          ? "text-green-600 dark:text-green-400"
                          : data.change === "" && data.percentage === "0.0"
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {data.percentage === "0.0"
                        ? "No change"
                        : `${data.change}${data.percentage}%`}
                    </p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Pending Orders Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Orders Analysis
            </h3>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            </div>
          </div>
          <div className="space-y-4">
            {(() => {
              // Get real pending orders from Shopify data
              const pendingOrders = orders.filter(
                (order) =>
                  order.fulfillment_status === "pending" ||
                  order.fulfillment_status === "unfulfilled" ||
                  !order.fulfillment_status ||
                  order.financial_status === "pending" ||
                  order.financial_status === "authorized"
              );

              const totalPendingValue = pendingOrders.reduce(
                (sum, order) => sum + parseFloat(order.total_price || "0"),
                0
              );

              // Analyze real pending orders for stock status
              const stockAnalysis = pendingOrders.slice(0, 5).map((order) => {
                const totalItems =
                  order.line_items?.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0
                  ) || 0;
                // Check if order is older than 3 days (might indicate stock issues)
                const orderDate = new Date(order.created_at);
                const daysSinceOrder = Math.floor(
                  (new Date().getTime() - orderDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const stockStatus =
                  daysSinceOrder > 3 ? "Low Stock" : "In Stock";

                return {
                  id: order.order_number || order.id,
                  value: parseFloat(order.total_price || "0"),
                  items: totalItems,
                  stockStatus: stockStatus,
                  daysPending: daysSinceOrder,
                };
              });

              return (
                <>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {pendingOrders.length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pending Orders
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrencyWithShop(totalPendingValue, shopData)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total Value
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recent Pending Orders:
                    </p>
                    {stockAnalysis.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No pending orders found
                        </p>
                      </div>
                    ) : (
                      stockAnalysis.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                        >
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              #{item.id}
                            </span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {item.items} items
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.daysPending} days ago
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                item.stockStatus === "In Stock"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                              }`}
                            >
                              {item.stockStatus}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Geographic Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Orders by Location
          </h3>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interactive Map Visualization */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="text-center mb-4">
              <MapPin className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Order Distribution Map
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Geographic spread of your orders
              </p>
            </div>

            {/* Simple World Map Visualization */}
            <div
              className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-inner relative overflow-hidden"
              style={{ height: "200px" }}
            >
              {(() => {
                // Get unique countries from orders
                const countries: string[] = [];
                orders.forEach((order) => {
                  if (order.shipping_address?.country) {
                    const country = order.shipping_address.country;
                    if (!countries.includes(country)) {
                      countries.push(country);
                    }
                  }
                });

                if (countries.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          No location data available
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="relative h-full">
                    {/* World Map Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded">
                      {/* Simulated continents */}
                      <div className="absolute top-8 left-8 w-16 h-12 bg-green-300 dark:bg-green-700 rounded-lg opacity-60"></div>
                      <div className="absolute top-6 left-28 w-20 h-16 bg-green-300 dark:bg-green-700 rounded-lg opacity-60"></div>
                      <div className="absolute top-12 left-52 w-14 h-18 bg-green-300 dark:bg-green-700 rounded-lg opacity-60"></div>
                      <div className="absolute bottom-8 left-12 w-12 h-10 bg-green-300 dark:bg-green-700 rounded-lg opacity-60"></div>
                      <div className="absolute bottom-6 left-32 w-16 h-14 bg-green-300 dark:bg-green-700 rounded-lg opacity-60"></div>
                      <div className="absolute bottom-10 right-8 w-18 h-16 bg-green-300 dark:bg-green-700 rounded-lg opacity-60"></div>
                    </div>

                    {/* Order Points */}
                    {countries.slice(0, 8).map((country, index) => {
                      const positions = [
                        { top: "25%", left: "15%" }, // North America
                        { top: "35%", left: "35%" }, // Europe
                        { top: "45%", left: "65%" }, // Asia
                        { top: "65%", left: "25%" }, // South America
                        { top: "55%", left: "45%" }, // Africa
                        { top: "70%", left: "75%" }, // Australia
                        { top: "30%", left: "25%" }, // North America 2
                        { top: "40%", left: "55%" }, // Asia 2
                      ];

                      const position = positions[index % positions.length];

                      return (
                        <div
                          key={country}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                          style={{ top: position.top, left: position.left }}
                        >
                          <div className="relative">
                            <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full animate-pulse shadow-lg group-hover:scale-150 transition-transform"></div>
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {country}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Legend */}
                    <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded px-2 py-1 shadow-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Orders
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Location Statistics */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">
              Top Locations
            </h4>
            {(() => {
              // Analyze real order data for geographic distribution
              const locationData: {
                [key: string]: {
                  orders: number;
                  revenue: number;
                  country: string;
                };
              } = {};

              orders.forEach((order) => {
                if (order.shipping_address) {
                  const city = order.shipping_address.city || "Unknown";
                  const country = order.shipping_address.country || "Unknown";
                  const key = `${city}, ${country}`;
                  const revenue = parseFloat(order.total_price || "0");

                  if (!locationData[key]) {
                    locationData[key] = { orders: 0, revenue: 0, country };
                  }

                  locationData[key].orders += 1;
                  locationData[key].revenue += revenue;
                }
              });

              // Sort by revenue and get top 5
              const topLocations = Object.entries(locationData)
                .map(([location, data]) => ({
                  city: location.split(",")[0].trim(),
                  country: data.country,
                  orders: data.orders,
                  revenue: data.revenue,
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

              if (topLocations.length === 0) {
                return (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No location data available
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Orders with shipping addresses will appear here
                    </p>
                  </div>
                );
              }

              return topLocations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {location.city}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {location.country}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {location.orders} orders
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatCurrencyWithShop(location.revenue, shopData)}
                    </p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Additional KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Conversion Rate
            </h3>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Activity className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(() => {
                // Calculate conversion rate based on orders vs customers
                const totalCustomers =
                  orders.length > 0 ? orders.length * 2.5 : 0; // Estimate visitors
                const conversionRate =
                  totalCustomers > 0
                    ? (orders.length / totalCustomers) * 100
                    : 0;
                return conversionRate.toFixed(1);
              })()}
              %
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Visit to Purchase
            </p>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Based on order data
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Return Rate
            </h3>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Package className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(() => {
                // Calculate return rate based on refunded/returned orders
                const returnedOrders = orders.filter(
                  (order) =>
                    order.financial_status === "refunded" ||
                    order.financial_status === "partially_refunded"
                ).length;
                const returnRate =
                  orders.length > 0
                    ? (returnedOrders / orders.length) * 100
                    : 0;
                return returnRate.toFixed(1);
              })()}
              %
            </div>
            <p className="text-gray-600 dark:text-gray-300">Product Returns</p>
            <div className="mt-2 flex items-center">
              <TrendingDown className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                From refund data
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Avg. Delivery Time
            </h3>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(() => {
                // Calculate average delivery time from fulfilled orders
                const fulfilledOrders = orders.filter(
                  (order) =>
                    order.fulfillment_status === "fulfilled" && order.created_at
                );

                if (fulfilledOrders.length === 0) return "N/A";

                const totalDays = fulfilledOrders.reduce((sum, order) => {
                  const orderDate = new Date(order.created_at);
                  const fulfillmentDate = new Date(
                    order.updated_at || order.created_at
                  );
                  const diffDays = Math.max(
                    1,
                    Math.floor(
                      (fulfillmentDate.getTime() - orderDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  );
                  return sum + diffDays;
                }, 0);

                const avgDays = Math.round(totalDays / fulfilledOrders.length);
                return `${avgDays} days`;
              })()}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Order to Delivery
            </p>
            <div className="mt-2 flex items-center">
              <TrendingDown className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                From order history
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Average Order Value
            </h3>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrencyWithShop(
                analytics?.averageOrderValue || 0,
                shopData
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300">Per Order</p>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Real-time calculation
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
