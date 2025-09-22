"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
  Bell,
  ChevronDown,
  Store,
  LogOut,
} from "lucide-react";
import { ShopifyProvider, useShopify } from "../src/contexts/ShopifyContext";
import { DataProvider } from "../src/contexts/DataContext";

// Dynamic imports for components that use browser APIs
const Dashboard = dynamic(() => import("../src/components/Dashboard"), {
  ssr: false,
});
const DashboardShopify = dynamic(
  () => import("../src/components/DashboardShopify"),
  { ssr: false }
);
const Inventory = dynamic(() => import("../src/components/Inventory"), {
  ssr: false,
});
const InventoryShopify = dynamic(
  () => import("../src/components/InventoryShopify"),
  { ssr: false }
);
const Orders = dynamic(() => import("../src/components/Orders"), {
  ssr: false,
});
const Customers = dynamic(() => import("../src/components/Customers"), {
  ssr: false,
});
const CustomersShopify = dynamic(
  () => import("../src/components/CustomersShopify"),
  { ssr: false }
);
const OrdersShopify = dynamic(() => import("../src/components/OrdersShopify"), {
  ssr: false,
});
const Fulfillment = dynamic(() => import("../src/components/Fulfillment"), {
  ssr: false,
});
const Analytics = dynamic(() => import("../src/components/Analytics"), {
  ssr: false,
});
const AuthCallback = dynamic(() => import("../src/components/AuthCallback"), {
  ssr: false,
});
const ShopifyConnect = dynamic(
  () => import("../src/components/ShopifyConnect"),
  { ssr: false }
);
const OrderManagementSystem = dynamic(
  () => import("../src/components/OrderManagementSystem"),
  { ssr: false }
);
const DatabaseDemo = dynamic(() => import("../src/components/DatabaseDemo"), {
  ssr: false,
});
const TrackingWidgets = dynamic(
  () => import("../src/components/TrackingWidgets"),
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ShopifyProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </ShopifyProvider>
  );
}

function AppContent() {
  const { shopData, isConnected } = useShopify();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "customers", label: "Customers", icon: Users },
    { id: "fulfillment", label: "Fulfillment", icon: Truck },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "oms", label: "OMS", icon: Settings },
    { id: "database", label: "Database", icon: Store },
    { id: "tracking", label: "Tracking", icon: Truck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return isConnected ? <DashboardShopify /> : <Dashboard />;
      case "inventory":
        return isConnected ? <InventoryShopify /> : <Inventory />;
      case "orders":
        return isConnected ? <OrdersShopify /> : <Orders />;
      case "customers":
        return isConnected ? <CustomersShopify /> : <Customers />;
      case "fulfillment":
        return <Fulfillment />;
      case "analytics":
        return <Analytics />;
      case "oms":
        return <OrderManagementSystem />;
      case "database":
        return <DatabaseDemo />;
      case "tracking":
        return <TrackingWidgets />;
      default:
        return isConnected ? <DashboardShopify /> : <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="*"
          element={
            <>
              {!isConnected && activeTab === "dashboard" ? (
                <ShopifyConnect />
              ) : (
                <>
                  {/* Sidebar */}
                  <div
                    className={`${
                      isSidebarCollapsed ? "w-16" : "w-64"
                    } bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out`}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                      {!isSidebarCollapsed && (
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                          Shopify App
                        </h1>
                      )}
                      <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>

                    <nav className="mt-6">
                      <div className="px-3">
                        {menuItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
                              activeTab === item.id
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <item.icon className="w-5 h-5 mr-3" />
                            {!isSidebarCollapsed && (
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </nav>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <h2 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
                            {activeTab}
                          </h2>
                        </div>

                        <div className="flex items-center space-x-4">
                          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </button>

                          {isConnected && shopData && (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setShowProfileDropdown(!showProfileDropdown)
                                }
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                                    {shopData.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {shopData.domain}
                                  </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              </button>

                              {showProfileDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <User className="w-4 h-4 mr-3" />
                                    Profile
                                  </button>
                                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Settings className="w-4 h-4 mr-3" />
                                    Settings
                                  </button>
                                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                                  <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Sign out
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                      <div className="p-6">{renderContent()}</div>
                    </main>
                  </div>
                </>
              )}
            </>
          }
        />
      </Routes>
    </div>
  );
}
