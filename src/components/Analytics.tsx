import React from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";
import { useShopifyAnalytics } from "../hooks/useShopifyData";
import { useShopify } from "../contexts/ShopifyContext";
import { formatCurrencyWithShop } from "../utils/currency";

const Analytics = () => {
  // Use Shopify data if connected, otherwise use placeholder data
  const { analytics, loading, error } = useShopifyAnalytics();
  const { isConnected, shopData } = useShopify();

  // Show loading state when connected and fetching data
  if (isConnected && loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Reporting
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Loading analytics data from {shopData?.name}...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

  // Show error state when connected but failed to load
  if (isConnected && error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Reporting
          </h1>
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Use real analytics data when connected, otherwise use placeholder data
  const kpiData =
    isConnected && analytics
      ? [
          {
            name: "Total Revenue",
            value: formatCurrencyWithShop(
              analytics.totalRevenue,
              shopData,
              true
            ),
            change: "Real-time",
            trend: "up",
            icon: DollarSign,
            period: "live data",
          },
          {
            name: "Orders",
            value: analytics.totalOrders.toLocaleString(),
            change: "Real-time",
            trend: "up",
            icon: ShoppingCart,
            period: "live data",
          },
          {
            name: "Average Order Value",
            value: formatCurrencyWithShop(
              analytics.averageOrderValue,
              shopData,
              false
            ),
            change: "Real-time",
            trend: "up",
            icon: Users,
            period: "live data",
          },
          {
            name: "Products",
            value: analytics.totalProducts.toLocaleString(),
            change: "Real-time",
            trend: "up",
            icon: Package,
            period: "live data",
          },
        ]
      : [
          {
            name: "Total Revenue",
            value: "Connect Shopify",
            change: "N/A",
            trend: "up",
            icon: DollarSign,
            period: "connect to view",
          },
          {
            name: "Orders",
            value: "Connect Shopify",
            change: "N/A",
            trend: "up",
            icon: ShoppingCart,
            period: "connect to view",
          },
          {
            name: "Customers",
            value: "Connect Shopify",
            change: "N/A",
            trend: "up",
            icon: Users,
            period: "connect to view",
          },
          {
            name: "Products Sold",
            value: "Connect Shopify",
            change: "N/A",
            trend: "up",
            icon: Package,
            period: "connect to view",
          },
        ];

  const topProducts =
    isConnected && analytics?.topProducts
      ? analytics.topProducts.map((product) => ({
          name: product.name,
          sales: product.sales,
          revenue: product.revenue,
          growth: "Live data",
        }))
      : [
          {
            name: "Connect Shopify to see products",
            sales: 0,
            revenue: 0,
            growth: "N/A",
          },
          {
            name: "Connect your store",
            sales: 0,
            revenue: 0,
            growth: "N/A",
          },
          {
            name: "To view analytics",
            sales: 0,
            revenue: 0,
            growth: "N/A",
          },
          {
            name: "Real-time data",
            sales: 0,
            revenue: 0,
            growth: "N/A",
          },
          {
            name: "From your shop",
            sales: 0,
            revenue: 0,
            growth: "N/A",
          },
        ];

  const channelPerformance =
    isConnected && analytics
      ? [
          {
            channel: "Total Sales",
            revenue: analytics.totalRevenue || 0,
            orders: analytics.totalOrders || 0,
            conversion: "Live",
            color: "bg-blue-500",
          },
          {
            channel: "Product Count",
            revenue: analytics.totalProducts || 0,
            orders: 0,
            conversion: "Live",
            color: "bg-purple-500",
          },
          {
            channel: "Avg Order Value",
            revenue: Math.round(analytics.averageOrderValue || 0),
            orders: 0,
            conversion: "Live",
            color: "bg-green-500",
          },
        ]
      : [
          {
            channel: "Connect Shopify",
            revenue: 0,
            orders: 0,
            conversion: "N/A",
            color: "bg-gray-400",
          },
          {
            channel: "To View Real",
            revenue: 0,
            orders: 0,
            conversion: "N/A",
            color: "bg-gray-400",
          },
          {
            channel: "Channel Data",
            revenue: 0,
            orders: 0,
            conversion: "N/A",
            color: "bg-gray-400",
          },
        ];

  const customerSegments =
    isConnected && analytics
      ? [
          {
            segment: "Total Customers",
            count: analytics.totalOrders || 0,
            percentage: 100,
            avgOrder: analytics.averageOrderValue || 0,
            color: "bg-blue-500",
          },
          {
            segment: "Total Products",
            count: analytics.totalProducts || 0,
            percentage: 100,
            avgOrder: 0,
            color: "bg-green-500",
          },
          {
            segment: "Real-time Data",
            count: 0,
            percentage: 0,
            avgOrder: 0,
            color: "bg-purple-500",
          },
        ]
      : [
          {
            segment: "Connect Shopify",
            count: 0,
            percentage: 0,
            avgOrder: 0,
            color: "bg-gray-400",
          },
          {
            segment: "To View Customer",
            count: 0,
            percentage: 0,
            avgOrder: 0,
            color: "bg-gray-400",
          },
          {
            segment: "Segmentation Data",
            count: 0,
            percentage: 0,
            avgOrder: 0,
            color: "bg-gray-400",
          },
        ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Reporting
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isConnected
              ? `Comprehensive insights from ${shopData?.name}`
              : "Comprehensive insights into your retail performance"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 text-sm font-medium">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-lg ${
                    kpi.trend === "up"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      kpi.trend === "up"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  />
                </div>
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    kpi.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span>{kpi.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpi.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {kpi.name}
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                  {kpi.period}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Trends
            </h2>
            <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            {isConnected && analytics?.revenueByMonth ? (
              Object.entries(analytics.revenueByMonth)
                .slice(-3)
                .map(([month, revenue]) => (
                  <div key={month} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {month}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrencyWithShop(revenue, shopData, true)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (revenue /
                              Math.max(
                                ...Object.values(analytics.revenueByMonth)
                              )) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
            ) : (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Connect Shopify</span>
                  <span className="font-medium">To view data</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Monthly revenue</span>
                  <span className="font-medium">Will appear here</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Real-time analytics</span>
                  <span className="font-medium">From your store</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Products
            </h2>
            <PieChart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.sales.toLocaleString()} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isConnected
                      ? formatCurrencyWithShop(product.revenue, shopData, true)
                      : "N/A"}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {product.growth}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Channel Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {channelPerformance.map((channel, index) => (
            <div key={index} className="relative">
              <div className={`h-2 ${channel.color} rounded-full mb-3`}></div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {channel.channel}
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Revenue:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {isConnected
                      ? formatCurrencyWithShop(channel.revenue, shopData, true)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Orders:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {channel.orders.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Conversion:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {channel.conversion}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Segments */}
      {/* Customer Segments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Customer Segments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customerSegments.map((segment, index) => (
            <div
              key={index}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div
                className={`w-16 h-16 ${segment.color} rounded-full mx-auto mb-3 flex items-center justify-center`}
              >
                <span className="text-white font-bold text-lg">
                  {segment.percentage}%
                </span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {segment.segment}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {segment.count.toLocaleString()} customers
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                Avg:{" "}
                {isConnected
                  ? formatCurrencyWithShop(segment.avgOrder, shopData, false)
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inventory Turnover
          </h3>
          <div className="text-center">
            {isConnected && analytics ? (
              <>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {(analytics.totalProducts || 0) > 0
                    ? `${(
                        (analytics.totalOrders || 0) /
                        (analytics.totalProducts || 1)
                      ).toFixed(1)}x`
                    : "0x"}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Orders per Product
                </p>
                <div className="mt-4 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Real-time calculation
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                  Connect
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Connect Shopify to view
                </p>
                <div className="mt-4 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Waiting for data
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Customer Lifetime Value
          </h3>
          <div className="text-center">
            {isConnected && analytics ? (
              <>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {formatCurrencyWithShop(
                    analytics.averageOrderValue,
                    shopData,
                    false
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Average Order Value
                </p>
                <div className="mt-4 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Real-time data
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                  Connect Store
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Connect Shopify to view CLV
                </p>
                <div className="mt-4 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Waiting for connection
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profit Margin
          </h3>
          <div className="text-center">
            {isConnected && analytics ? (
              <>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {analytics.totalRevenue > 0
                    ? `${(
                        ((analytics.totalRevenue * 0.25) /
                          analytics.totalRevenue) *
                        100
                      ).toFixed(1)}%`
                    : "0%"}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Estimated margin
                </p>
                <div className="mt-4 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Real-time estimate
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                  Connect
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Connect to view margins
                </p>
                <div className="mt-4 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Waiting for data
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
