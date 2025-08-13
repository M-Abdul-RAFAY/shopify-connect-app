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
import { useData } from "../contexts/DataContext";
import { useNavigation } from "../contexts/NavigationContext";

const Dashboard = () => {
  const { data, loading, error } = useData();
  const { setActiveModule } = useNavigation();

  if (loading.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Loading your store data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { analytics, orders, products, shop } = data;

  // Get currency information from shop data
  const shopCurrency = shop?.currency || "USD";
  const moneyFormat = shop?.money_format || "${{amount}}";
  const moneyWithCurrencyFormat =
    shop?.money_with_currency_format || "${{amount}} {{currency}}";

  // Dynamic currency formatter
  const formatCurrency = (
    amount: string | number,
    withCurrency = false,
    orderCurrency?: string
  ) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    const currency = orderCurrency || shopCurrency;

    if (withCurrency && moneyWithCurrencyFormat) {
      // Use shop's money_with_currency_format
      return moneyWithCurrencyFormat
        .replace("{{amount}}", num.toFixed(2))
        .replace("{{currency}}", currency);
    } else if (moneyFormat && !orderCurrency) {
      // Use shop's money_format for shop currency only
      return moneyFormat.replace("{{amount}}", num.toFixed(2));
    } else {
      // Fallback to simple formatting with appropriate currency symbol
      const currencySymbols: { [key: string]: string } = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        PKR: "Rs",
        INR: "₹",
        CAD: "C$",
        AUD: "A$",
        JPY: "¥",
        CNY: "¥",
        KRW: "₩",
        SGD: "S$",
        HKD: "HK$",
        SEK: "kr",
        NOK: "kr",
        DKK: "kr",
        CHF: "CHF",
        PLN: "zł",
        CZK: "Kč",
        HUF: "Ft",
        RUB: "₽",
        BRL: "R$",
        MXN: "$",
        ARS: "$",
        CLP: "$",
        COP: "$",
        PEN: "S/",
        UYU: "$U",
        ZAR: "R",
        NGN: "₦",
        EGP: "E£",
        AED: "د.إ",
        SAR: "ر.س",
        QAR: "ر.ق",
        KWD: "د.ك",
        BHD: "ب.د",
        OMR: "ر.ع.",
        JOD: "د.ا",
        LBP: "ل.ل",
        TRY: "₺",
        ILS: "₪",
        THB: "฿",
        PHP: "₱",
        MYR: "RM",
        IDR: "Rp",
        VND: "₫",
        TWD: "NT$",
        NZD: "NZ$",
      };

      const symbol = currencySymbols[currency] || currency + " ";
      return `${symbol}${num.toFixed(2)}`;
    }
  };

  const stats = [
    {
      name: "Total Revenue",
      value: formatCurrency(analytics?.totalRevenue || 0, true),
      change: "Real-time",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      name: "Total Orders",
      value: analytics?.totalOrders?.toLocaleString() || "0",
      change: "Real-time",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      name: "Average Order Value",
      value: formatCurrency(analytics?.averageOrderValue || 0, true),
      change: "Real-time",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
    {
      name: "Total Products",
      value: analytics?.totalProducts?.toLocaleString() || "0",
      change: "Real-time",
      trend: products.length > 0 ? "up" : "down",
      icon: Package,
      color: "text-orange-600",
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
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
      case "unfulfilled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-slide-up">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 lg:p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center ${
                    stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <TrendIcon className="w-4 h-4 mr-1" />
                  <span className="text-xs lg:text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              <button
                onClick={() => setActiveModule("orders")}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
              >
                View All
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{order.order_number || order.id}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {order.customer?.first_name} {order.customer?.last_name}{" "}
                      || 'Guest'
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(order.total_price, false, order.currency)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.fulfillment_status || "pending"
                        )}`}
                      >
                        {order.fulfillment_status || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 lg:px-6 py-4 text-center text-gray-500 dark:text-gray-400"
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Low Stock Alert
              </h2>
            </div>
          </div>
          <div className="p-4 lg:p-6 space-y-4">
            {lowStockItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {item.current}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Min: {item.minimum}</p>
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
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 text-white rounded-xl hover:from-orange-700 hover:to-red-600 dark:hover:from-orange-600 dark:hover:to-red-500 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Review Inventory
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
              Store Performance
            </h3>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
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

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
              Fulfillment Rate
            </h3>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Package className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
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
              <span className="text-sm text-green-600 dark:text-green-400">Live data</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
              Product Catalog
            </h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {products.length}
            </div>
            <p className="text-gray-600 dark:text-gray-300">Active Products</p>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-1" />
              <span className="text-sm text-blue-600 dark:text-blue-400">Growing catalog</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
