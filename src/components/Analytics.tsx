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

const Analytics = () => {
  // Use Shopify data if connected, otherwise use placeholder data
  const { analytics, loading, error } = useShopifyAnalytics();
  const { isConnected, shopData } = useShopify();

  // Show loading state when connected and fetching data
  if (isConnected && loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Reporting
          </h1>
          <p className="text-gray-600 mt-1">
            Loading analytics data from {shopData?.name}...
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
            Analytics & Reporting
          </h1>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
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
            value: `$${analytics.totalRevenue.toLocaleString()}`,
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
            period: "vs last month",
          },
          {
            name: "Orders",
            value: analytics.totalOrders.toLocaleString(),
            change: "+8.2%",
            trend: "up",
            icon: ShoppingCart,
            period: "vs last month",
          },
          {
            name: "Average Order Value",
            value: `$${analytics.averageOrderValue.toFixed(2)}`,
            change: "+5.1%",
            trend: "up",
            icon: Users,
            period: "vs last month",
          },
          {
            name: "Products",
            value: analytics.totalProducts.toLocaleString(),
            change: "-2.3%",
            trend: "down",
            icon: Package,
            period: "vs last month",
          },
        ]
      : [
          {
            name: "Total Revenue",
            value: "$2,847,532",
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
            period: "vs last month",
          },
          {
            name: "Orders",
            value: "18,247",
            change: "+8.2%",
            trend: "up",
            icon: ShoppingCart,
            period: "vs last month",
          },
          {
            name: "Customers",
            value: "34,892",
            change: "+5.1%",
            trend: "up",
            icon: Users,
            period: "vs last month",
          },
          {
            name: "Products Sold",
            value: "45,678",
            change: "-2.3%",
            trend: "down",
            icon: Package,
            period: "vs last month",
          },
        ];

  const topProducts =
    isConnected && analytics?.topProducts
      ? analytics.topProducts.map((product: any) => ({
          name: product.name,
          sales: product.sales,
          revenue: product.revenue,
          growth: "+15.3%", // Could be calculated based on historical data
        }))
      : [
          {
            name: "iPhone 15 Pro",
            sales: 1247,
            revenue: 1246753,
            growth: "+15.3%",
          },
          {
            name: "Samsung Galaxy S24",
            sales: 892,
            revenue: 802908,
            growth: "+8.7%",
          },
          {
            name: "MacBook Air M2",
            sales: 456,
            revenue: 546744,
            growth: "+12.1%",
          },
          {
            name: "AirPods Pro",
            sales: 1834,
            revenue: 458500,
            growth: "+22.4%",
          },
          { name: "iPad Air", sales: 623, revenue: 373800, growth: "+6.8%" },
        ];

  const channelPerformance = [
    {
      channel: "Online Store",
      revenue: 1245678,
      orders: 8967,
      conversion: 3.2,
      color: "bg-blue-500",
    },
    {
      channel: "Mobile App",
      revenue: 892345,
      orders: 6234,
      conversion: 4.1,
      color: "bg-purple-500",
    },
    {
      channel: "In-Store",
      revenue: 567890,
      orders: 2156,
      conversion: 8.7,
      color: "bg-green-500",
    },
    {
      channel: "Marketplace",
      revenue: 234567,
      orders: 1234,
      conversion: 2.8,
      color: "bg-orange-500",
    },
  ];

  const customerSegments = [
    {
      segment: "New Customers",
      count: 8945,
      percentage: 25.6,
      avgOrder: 156.78,
      color: "bg-blue-500",
    },
    {
      segment: "Returning Customers",
      count: 18234,
      percentage: 52.3,
      avgOrder: 234.56,
      color: "bg-green-500",
    },
    {
      segment: "VIP Customers",
      count: 5678,
      percentage: 16.3,
      avgOrder: 567.89,
      color: "bg-purple-500",
    },
    {
      segment: "At-Risk Customers",
      count: 2035,
      percentage: 5.8,
      avgOrder: 89.45,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Reporting
          </h1>
          <p className="text-gray-600 mt-1">
            {isConnected
              ? `Comprehensive insights from ${shopData?.name}`
              : "Comprehensive insights into your retail performance"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
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
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-lg ${
                    kpi.trend === "up" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      kpi.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </div>
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    kpi.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span>{kpi.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {kpi.value}
                </h3>
                <p className="text-gray-600 text-sm">{kpi.name}</p>
                <p className="text-gray-500 text-xs mt-1">{kpi.period}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Revenue Trends
            </h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Jan 2024</span>
              <span className="font-medium">$284,532</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Feb 2024</span>
              <span className="font-medium">$324,789</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "95%" }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Mar 2024</span>
              <span className="font-medium">$298,456</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "88%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Products
            </h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {product.sales.toLocaleString()} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">{product.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Channel Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {channelPerformance.map((channel, index) => (
            <div key={index} className="relative">
              <div className={`h-2 ${channel.color} rounded-full mb-3`}></div>
              <h3 className="font-medium text-gray-900 mb-2">
                {channel.channel}
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">
                    ${channel.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders:</span>
                  <span className="font-medium">
                    {channel.orders.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversion:</span>
                  <span className="font-medium">{channel.conversion}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Customer Segments
        </h2>
        <div className="space-y-4">
          {customerSegments.map((segment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 ${segment.color} rounded`}></div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {segment.segment}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {segment.count.toLocaleString()} customers (
                    {segment.percentage}%)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Avg Order: ${segment.avgOrder}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Inventory Turnover
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">8.5x</div>
            <p className="text-gray-600 text-sm">Annual turnover rate</p>
            <div className="mt-4 flex items-center justify-center text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12% vs last year
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Lifetime Value
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">$1,245</div>
            <p className="text-gray-600 text-sm">Average CLV</p>
            <div className="mt-4 flex items-center justify-center text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8% vs last quarter
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Profit Margin
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">24.8%</div>
            <p className="text-gray-600 text-sm">Gross margin</p>
            <div className="mt-4 flex items-center justify-center text-red-600 text-sm">
              <TrendingDown className="w-4 h-4 mr-1" />
              -1.2% vs last month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
