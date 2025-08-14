import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { shopifyAPI, ShopifyStore } from "../services/shopifyAPI";

interface ShopifyContextType {
  isConnected: boolean;
  isLoading: boolean;
  shopData: ShopifyStore | null;
  error: string | null;
  isDemoMode: boolean;
  connectShop: (shopDomain: string) => Promise<void>;
  connectWithCredentials: (
    shopDomain: string,
    accessToken: string,
    apiKey?: string,
    apiSecret?: string
  ) => Promise<void>;
  disconnectShop: () => void;
  refreshShopData: () => Promise<void>;
  syncInitialData: () => Promise<void>;
  fetchAndStoreAllData: () => Promise<void>;
  clearError: () => void;
}

const ShopifyContext = createContext<ShopifyContextType | undefined>(undefined);

export const useShopify = () => {
  const context = useContext(ShopifyContext);
  if (context === undefined) {
    throw new Error("useShopify must be used within a ShopifyProvider");
  }
  return context;
};

interface ShopifyProviderProps {
  children: ReactNode;
}

export const ShopifyProvider: React.FC<ShopifyProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shopData, setShopData] = useState<ShopifyStore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const checkExistingConnection = async () => {
    setIsLoading(true);
    try {
      if (shopifyAPI.isAuthenticated()) {
        const response = await shopifyAPI.getShop();
        setShopData(response.shop);
        setIsConnected(true);
        setIsDemoMode(false);
        setError(null);
      } else {
        // Check if demo mode is enabled
        const demoMode = import.meta.env.VITE_DEV_MODE === "true";
        if (demoMode) {
          setIsDemoMode(true);
          // You can set mock shop data here for demo purposes
        }
      }
    } catch (err) {
      console.error("Failed to check existing connection:", err);
      // Clear invalid credentials
      shopifyAPI.clearCredentials();
      setError("Failed to connect to Shopify store");
    } finally {
      setIsLoading(false);
    }
  };

  const connectShop = async (shopDomain: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const authUrl = await shopifyAPI.initiateAuth(shopDomain);
      // Redirect to Shopify OAuth
      window.location.href = authUrl;
    } catch (err) {
      setError("Failed to initiate Shopify connection");
      setIsLoading(false);
    }
  };

  const connectWithCredentials = async (
    shopDomain: string,
    accessToken: string,
    apiKey?: string,
    apiSecret?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Connecting with API credentials...");
      const response = await shopifyAPI.connectWithCredentials(
        shopDomain,
        accessToken,
        apiKey,
        apiSecret
      );

      setShopData(response.shop);
      setIsConnected(true);
      setIsDemoMode(false);
      setError(null);
      console.log("API connection successful");

      // Trigger comprehensive sync after successful connection
      await syncInitialData();
      console.log("Comprehensive sync completed after API connection");
    } catch (err) {
      console.error("API connection failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect with API credentials"
      );
      setIsConnected(false);
      setShopData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectShop = () => {
    shopifyAPI.clearCredentials();
    setIsConnected(false);
    setShopData(null);
    setIsDemoMode(false);
    setError(null);
  };

  const refreshShopData = async () => {
    console.log("RefreshShopData - Checking authentication status...");
    console.log("shopifyAPI.isAuthenticated():", shopifyAPI.isAuthenticated());

    if (!shopifyAPI.isAuthenticated()) {
      console.log("Not authenticated, skipping shop data refresh");
      return;
    }

    try {
      console.log("Fetching shop data from Shopify API...");
      const response = await shopifyAPI.getShop();
      console.log("Shop data received:", response.shop.name);
      console.log("Setting isConnected to true and updating shop data...");
      setShopData(response.shop);
      setIsConnected(true);
      setIsDemoMode(false);
      setError(null);
      console.log("Context state updated successfully");
    } catch (err) {
      console.error("Failed to refresh shop data:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to refresh shop data: ${errorMessage}`);
      // Don't clear credentials here - the connection might still be valid
    }
  };

  const syncInitialData = async () => {
    if (!shopifyAPI.isAuthenticated()) {
      console.log("Not authenticated, skipping comprehensive sync");
      return;
    }

    try {
      console.log("🚀 Starting comprehensive data sync (ALL data)...");
      const shopDomain = shopData?.domain || shopifyAPI.getShopDomain();
      const accessToken = shopifyAPI.getAccessToken();

      if (!shopDomain || !accessToken) {
        console.error(
          "Missing shop domain or access token for comprehensive sync"
        );
        return;
      }

      const response = await fetch(
        "http://localhost:3001/api/shopify/comprehensive-sync",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shop: shopDomain,
            accessToken: accessToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Comprehensive sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Comprehensive sync completed:", result.results);
    } catch (err) {
      console.error("❌ Comprehensive sync failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to sync all data: ${errorMessage}`);
    }
  };

  const fetchAndStoreAllData = async () => {
    if (!shopifyAPI.isAuthenticated()) {
      console.log("Not authenticated, skipping fetch and store");
      return;
    }

    try {
      console.log("🚀 Fetching and storing ALL data...");
      const shopDomain = shopData?.domain || shopifyAPI.getShopDomain();
      const accessToken = shopifyAPI.getAccessToken();

      if (!shopDomain || !accessToken) {
        console.error(
          "Missing shop domain or access token for fetch and store"
        );
        return;
      }

      const response = await fetch(
        "http://localhost:3001/api/shopify/fetch-and-store-all",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shop: shopDomain,
            accessToken: accessToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Fetch and store failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Fetch and store completed:", result.results);
    } catch (err) {
      console.error("❌ Fetch and store failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to fetch and store data: ${errorMessage}`);
    }
  };

  const value: ShopifyContextType = {
    isConnected,
    isLoading,
    shopData,
    error,
    isDemoMode,
    connectShop,
    connectWithCredentials,
    disconnectShop,
    refreshShopData,
    syncInitialData,
    fetchAndStoreAllData,
    clearError,
  };

  return (
    <ShopifyContext.Provider value={value}>{children}</ShopifyContext.Provider>
  );
};
