import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  RefreshCw,
  Bell,
  Search,
  ChevronDown,
  Store,
} from "lucide-react";
import { ShopifyProvider, useShopify } from "./contexts/ShopifyContext";
import { DataProvider, useData } from "./contexts/DataContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./components/Dashboard";
import DashboardShopify from "./components/DashboardShopify";
import Inventory from "./components/Inventory";
import InventoryShopify from "./components/InventoryShopify";
import Orders from "./components/Orders";
import Customers from "./components/Customers";
import CustomersShopify from "./components/CustomersShopify";
import Fulfillment from "./components/Fulfillment";
import Analytics from "./components/Analytics";
import ShopifyConnect from "./components/ShopifyConnect";
import AuthCallback from "./components/AuthCallback";
import LoadingProgress from "./components/LoadingProgress";
import ThemeToggle from "./components/ThemeToggle";

type Module =
  | "dashboard"
  | "inventory"
  | "orders"
  | "customers"
  | "fulfillment"
  | "analytics"
  | "settings";

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", name: "Inventory", icon: Package },
  { id: "orders", name: "Orders", icon: ShoppingCart },
  { id: "customers", name: "Customers", icon: Users },
  { id: "fulfillment", name: "Fulfillment", icon: Truck },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
  { id: "settings", name: "Settings", icon: Settings },
];

const MainApp: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isConnected, isLoading, shopData, disconnectShop } = useShopify();
  const { loading, hasData, fetchAllData, refreshData, error } = useData();

  // Auto-fetch data when connected (but not if there's an error)
  useEffect(() => {
    if (isConnected && !hasData && !loading.isLoading && !error) {
      console.log("Auto-fetching data on connection...");
      fetchAllData();
    }
  }, [isConnected, hasData, loading.isLoading, error, fetchAllData]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-user-menu]")) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Debug logging
  console.log("MainApp - Current state:", {
    isConnected,
    isLoading,
    hasShopData: !!shopData,
    hasData,
    loadingData: loading.isLoading,
  });

  // Show connection screen if not connected
  if (!isConnected && !isLoading) {
    console.log("MainApp - Showing ShopifyConnect (not connected)");
    return (
      <ThemeProvider>
        <ShopifyConnect />
      </ThemeProvider>
    );
  }

  // Show loading screen while checking connection
  if (isLoading) {
    console.log("MainApp - Showing connection loading screen");
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Connecting to your store...
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show data loading progress
  if (isConnected && loading.isLoading) {
    console.log("MainApp - Showing data loading progress");
    return (
      <ThemeProvider>
        <LoadingProgress
          stage={loading.stage}
          progress={loading.progress}
          details={loading.details}
        />
      </ThemeProvider>
    );
  }

  // Show loading if connected but no data yet
  if (isConnected && !hasData) {
    console.log("MainApp - Waiting for data...");
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Preparing your data...
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return isConnected ? <DashboardShopify /> : <Dashboard />;
      case "inventory":
        return isConnected ? <InventoryShopify /> : <Inventory />;
      case "orders":
        return <Orders />;
      case "customers":
        return isConnected ? <CustomersShopify /> : <Customers />;
      case "fulfillment":
        return <Fulfillment />;
      case "analytics":
        return <Analytics />;
      default:
        return isConnected ? <DashboardShopify /> : <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <NavigationProvider
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      >
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden transition-opacity duration-300"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
          fixed lg:sticky inset-y-0 lg:inset-y-auto left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:top-0 lg:h-screen flex flex-col sidebar-scroll overflow-y-auto
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
          >
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-700 dark:to-purple-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-white">
                  RetailPro
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Store Info */}
            {shopData && (
              <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {shopData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {shopData.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {shopData.domain}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Connected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id as Module);
                      setSidebarOpen(false);
                    }}
                    className={`
                    w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                    ${
                      activeModule === item.id
                        ? "bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg transform scale-105"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:transform hover:scale-105"
                    }
                  `}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                        activeModule === item.id
                          ? "scale-110"
                          : "group-hover:scale-110"
                      }`}
                    />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Store Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="space-y-2">
                <button
                  onClick={refreshData}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-3" />
                  Refresh Data
                </button>
                <button
                  onClick={disconnectShop}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:shadow-sm"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Disconnect Store
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
              <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>

                  {/* Search Bar - Responsive */}
                  <div className="hidden sm:flex items-center ml-4 flex-1 max-w-md xl:max-w-lg">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search orders, products, customers..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 lg:space-x-3">
                  {/* Mobile Search Button */}
                  <button className="sm:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>

                  {/* Notifications */}
                  <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform duration-200" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  </button>

                  {/* Theme Toggle */}
                  <ThemeToggle />

                  {/* User Menu */}
                  <div className="relative" data-user-menu>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                        <User className="w-4 h-4 text-white" />
                      </div>

                      <div className="hidden lg:block">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {shopData?.shop_owner || "Store Owner"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Administrator
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scale-in">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {shopData?.shop_owner || "Store Owner"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {shopData?.email || "admin@store.com"}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveModule("settings");
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            disconnectShop();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Disconnect Store
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 p-4 lg:p-6 overflow-auto bg-gray-50 dark:bg-gray-900 min-h-0">
              <div className="animate-fade-in">{renderModule()}</div>
            </main>
          </div>
        </div>
      </NavigationProvider>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ShopifyProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/*" element={<MainApp />} />
          </Routes>
        </Router>
      </DataProvider>
    </ShopifyProvider>
  );
}

export default App;
