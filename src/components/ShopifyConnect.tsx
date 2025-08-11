import React, { useState } from "react";
import {
  ShoppingBag,
  Store,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Globe,
  CheckCircle,
  Users,
  Truck,
  TrendingUp,
  Sparkles,
  Lock,
} from "lucide-react";
import { useShopify } from "../contexts/ShopifyContext";

const ShopifyConnect: React.FC = () => {
  const [shopDomain, setShopDomain] = useState("");
  const [connectionMethod, setConnectionMethod] = useState<"oauth" | "api">(
    "oauth"
  );
  const [apiCredentials, setApiCredentials] = useState({
    accessToken: "",
    apiKey: "",
    apiSecret: "",
  });
  const { connectShop, connectWithCredentials, isLoading, error } =
    useShopify();

  const handleQuickConnect = async () => {
    if (!shopDomain.trim()) return;
    await connectShop(shopDomain.trim());
  };

  const handleConnect = async () => {
    if (!shopDomain.trim()) return;
    await connectShop(shopDomain);
  };

  const handleApiConnect = async () => {
    if (!shopDomain.trim() || !apiCredentials.accessToken.trim()) return;

    try {
      await connectWithCredentials(
        shopDomain.trim(),
        apiCredentials.accessToken.trim(),
        apiCredentials.apiKey.trim() || undefined,
        apiCredentials.apiSecret.trim() || undefined
      );
    } catch (error) {
      console.error("API connection failed:", error);
      // Error is handled by the context
    }
  };

  const features = [
    {
      icon: ShoppingBag,
      title: "Product Management",
      description: "Sync and manage all your products across channels",
      highlight: "Real-time inventory updates",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get insights into sales, customers, and performance",
      highlight: "AI-powered insights",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with OAuth 2.0 authentication",
      highlight: "SOC 2 compliance",
    },
    {
      icon: Zap,
      title: "Instant Sync",
      description: "Real-time data synchronization with your Shopify store",
      highlight: "Sub-second updates",
    },
  ];

  const benefits = [
    {
      icon: Globe,
      title: "Multi-Channel Management",
      description: "Unify all your sales channels in one dashboard",
    },
    {
      icon: Users,
      title: "Customer Intelligence",
      description: "Deep insights into customer behavior and lifetime value",
    },
    {
      icon: Truck,
      title: "Smart Fulfillment",
      description: "Automated order routing and inventory optimization",
    },
    {
      icon: TrendingUp,
      title: "Growth Analytics",
      description: "Predictive analytics to identify growth opportunities",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Connect Your Shopify Store
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Instantly
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Seamlessly integrate your Shopify store with RetailPro to unlock
            powerful analytics, inventory management, and sales insights in just
            one click.
          </p>

          {/* Quick Connect Section */}
          <div className="mb-12">
            <div className="max-w-md mx-auto mb-6">
              <label
                htmlFor="shopDomain"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Shopify Store Domain
              </label>
              <div className="relative">
                <input
                  id="shopDomain"
                  type="text"
                  placeholder="your-store.myshopify.com"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                />
                <Store className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter just the store name (e.g., "mystore") or full domain
              </p>
            </div>

            <button
              onClick={handleQuickConnect}
              disabled={isLoading || !shopDomain.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Connecting Your Store...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Connect My Shopify Store</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Secure OAuth 2.0 connection • Takes less than 30 seconds
            </p>
          </div>

          {/* Advanced Options Toggle - Hidden for now */}
          {/* 
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </button>
          */}
        </div>

        {/* API Connection Form */}
        <div className="max-w-lg mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Connect via API Credentials
              </h3>
              <p className="text-gray-600">
                Use your Shopify Custom App credentials for direct API access
              </p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How to get your credentials:</strong>
                  <br />
                  1. Go to your Shopify Admin → Settings → Apps and sales
                  channels
                  <br />
                  2. Click "Develop apps" → "Create an app"
                  <br />
                  3. Configure API scopes and install the app
                  <br />
                  4. Copy the Access Token from the API credentials section
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Connection Method Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Connection Method
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setConnectionMethod("oauth")}
                    className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      connectionMethod === "oauth"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    OAuth (Recommended)
                  </button>
                  <button
                    onClick={() => setConnectionMethod("api")}
                    className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      connectionMethod === "api"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    API Credentials
                  </button>
                </div>
              </div>

              {/* Shop Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shopify Store Domain *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    placeholder="your-store-name"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <div className="px-4 py-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 text-sm flex items-center">
                    .myshopify.com
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter just your store name, we'll add .myshopify.com
                  automatically
                </p>
              </div>

              {/* API Credentials Fields - Only show when API method is selected */}
              {connectionMethod === "api" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Token *
                    </label>
                    <input
                      type="password"
                      value={apiCredentials.accessToken}
                      onChange={(e) =>
                        setApiCredentials({
                          ...apiCredentials,
                          accessToken: e.target.value,
                        })
                      }
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The access token from your Shopify custom app
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key (Optional)
                    </label>
                    <input
                      type="text"
                      value={apiCredentials.apiKey}
                      onChange={(e) =>
                        setApiCredentials({
                          ...apiCredentials,
                          apiKey: e.target.value,
                        })
                      }
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your app's API key (if using webhook verification)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Secret (Optional)
                    </label>
                    <input
                      type="password"
                      value={apiCredentials.apiSecret}
                      onChange={(e) =>
                        setApiCredentials({
                          ...apiCredentials,
                          apiSecret: e.target.value,
                        })
                      }
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your app's API secret key (if using webhook verification)
                    </p>
                  </div>
                </>
              )}

              {/* Connect Button */}
              <button
                onClick={
                  connectionMethod === "oauth"
                    ? handleConnect
                    : handleApiConnect
                }
                disabled={
                  !shopDomain.trim() ||
                  isLoading ||
                  (connectionMethod === "api" &&
                    !apiCredentials.accessToken.trim())
                }
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Connect via{" "}
                      {connectionMethod === "oauth" ? "OAuth" : "API"}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* OAuth Info */}
              {connectionMethod === "oauth" && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800 mb-1">
                          Secure OAuth Connection
                        </h4>
                        <p className="text-sm text-green-700">
                          OAuth is the recommended and most secure way to
                          connect. You'll be redirected to Shopify to authorize
                          the connection.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Connection Info */}
              {connectionMethod === "api" && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800 mb-1">
                          Direct API Connection
                        </h4>
                        <p className="text-sm text-amber-700">
                          Using API credentials provides direct access. Make
                          sure your custom app has the required API scopes for
                          the features you want to use.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Required Scopes Info */}
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">
                      Recommended API Scopes:
                    </h5>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        • <code>read_products, write_products</code> - Product
                        management
                      </div>
                      <div>
                        • <code>read_orders, write_orders</code> - Order
                        management
                      </div>
                      <div>
                        • <code>read_customers, write_customers</code> -
                        Customer data
                      </div>
                      <div>
                        • <code>read_inventory, write_inventory</code> -
                        Inventory tracking
                      </div>
                      <div>
                        • <code>read_analytics</code> - Analytics and reports
                      </div>
                      <div>
                        • <code>read_fulfillments, write_fulfillments</code> -
                        Order fulfillment
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{feature.description}</p>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        {feature.highlight}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose RetailPro?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of retailers who have transformed their business
              with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security and Trust */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
            <Lock className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Your data is secure. We use OAuth 2.0 for authentication.
            </span>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopifyConnect;
