import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Settings,
  Bell,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { ShopifyProvider, useShopify } from "./contexts/ShopifyContext";
import { NavigationProvider } from "./contexts/NavigationContext";
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
  const { isConnected, isLoading, shopData, disconnectShop, refreshShopData } =
    useShopify();

  // Debug logging
  console.log("MainApp - Current state:", {
    isConnected,
    isLoading,
    hasShopData: !!shopData,
  });

  // Show connection screen if not connected
  if (!isConnected && !isLoading) {
    console.log("MainApp - Showing ShopifyConnect (not connected)");
    return <ShopifyConnect />;
  }

  // Show loading screen while checking connection
  if (isLoading) {
    console.log("MainApp - Showing loading screen");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your store data...</p>
        </div>
      </div>
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
    <NavigationProvider
      activeModule={activeModule}
      setActiveModule={setActiveModule}
    >
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                RetailPro
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Store Info */}
          {shopData && (
            <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">
                    {shopData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {shopData.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {shopData.domain}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 px-4 py-4 space-y-1">
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
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    activeModule === item.id
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Store Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <button
                onClick={refreshShopData}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-3" />
                Refresh Data
              </button>
              <button
                onClick={disconnectShop}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Disconnect Store
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-2">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="hidden lg:flex items-center ml-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 mr-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">
                      {shopData?.shop_owner || "Store Owner"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 p-6 overflow-auto">{renderModule()}</main>
        </div>
      </div>
    </NavigationProvider>
  );
};

function App() {
  return (
    <ShopifyProvider>
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </Router>
    </ShopifyProvider>
  );
}

export default App;
