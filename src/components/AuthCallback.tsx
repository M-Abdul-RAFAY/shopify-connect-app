import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { shopifyAPI } from "../services/shopifyAPI";
import { useShopify } from "../contexts/ShopifyContext";

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshShopData } = useShopify();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const hasExecuted = useRef(false);

  const handleCallback = useCallback(async () => {
    // Prevent multiple executions
    if (hasExecuted.current) {
      console.log("AuthCallback already executed, skipping...");
      return;
    }

    hasExecuted.current = true;
    console.log("AuthCallback - Starting execution...");

    try {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      console.log("AuthCallback - URL params:", {
        code: !!code,
        state: !!state,
        error,
      });

      if (error) {
        console.error("OAuth error from Shopify:", error);
        setStatus("error");
        setMessage(`Authorization failed: ${error}`);
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (!code || !state) {
        console.error("Missing OAuth parameters:", {
          code: !!code,
          state: !!state,
        });
        setStatus("error");
        setMessage("Missing authorization code or state parameter");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      console.log("Attempting to exchange code for token...");
      // Exchange code for access token
      const result = await shopifyAPI.exchangeCodeForToken(code, state);
      console.log("Token exchange successful:", {
        hasToken: !!result.access_token,
      });

      console.log("Refreshing shop data...");
      // Refresh shop data in context
      await refreshShopData();
      console.log("Shop data refresh completed");

      setStatus("success");
      setMessage("Successfully connected to your Shopify store!");

      // Add a small delay to ensure context state is updated before navigation
      console.log("Waiting for state to sync before navigation...");
      setTimeout(() => {
        console.log("Navigating to dashboard...");
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("OAuth callback error:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      setStatus("error");
      setMessage(
        `Failed to complete authorization: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setTimeout(() => navigate("/"), 3000);
    }
  }, [searchParams, navigate, refreshShopData]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader className="w-16 h-16 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case "error":
        return <XCircle className="w-16 h-16 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">{getStatusIcon()}</div>

        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === "loading" && "Connecting to Shopify..."}
          {status === "success" && "Connection Successful!"}
          {status === "error" && "Connection Failed"}
        </h1>

        <p className="text-gray-600 mb-6">
          {message || "Please wait while we complete the connection process."}
        </p>

        {status === "loading" && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">
              This may take a few moments...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                Your Shopify store has been successfully connected. You'll be
                redirected to the dashboard shortly.
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                Something went wrong during the connection process. You'll be
                redirected back to try again.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
