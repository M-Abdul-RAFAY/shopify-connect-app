import React, { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePostExOrder } from "../hooks/usePostExTracking";
import { postexAPI } from "../services/postexAPI";

// Simple tracking status component
export const TrackingStatus = ({
  trackingNumber,
  compact = false,
}: {
  trackingNumber: string;
  compact?: boolean;
}) => {
  const {
    orderData,
    loading,
    error,
    currentStatus,
    isDelivered,
    isInTransit,
    isDeliveryFailed,
  } = usePostExOrder(trackingNumber);

  const getStatusIcon = () => {
    if (loading)
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
    if (error) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (isDelivered) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (isDeliveryFailed) return <XCircle className="w-4 h-4 text-red-600" />;
    if (isInTransit) return <Truck className="w-4 h-4 text-blue-600" />;
    if (currentStatus) return <Package className="w-4 h-4 text-orange-600" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (loading) return "Loading...";
    if (error) return "Error";
    if (isDelivered)
      return currentStatus?.transactionStatusMessage || "Delivered";
    if (isDeliveryFailed)
      return currentStatus?.transactionStatusMessage || "Delivery Failed";
    if (isInTransit)
      return currentStatus?.transactionStatusMessage || "In Transit";
    if (currentStatus) return currentStatus.transactionStatusMessage;
    return "No tracking info";
  };

  const getStatusColor = () => {
    if (loading) return "text-blue-600";
    if (error) return "text-red-600";
    if (isDelivered) return "text-green-600";
    if (isDeliveryFailed) return "text-red-600";
    if (isInTransit) return "text-blue-600";
    if (currentStatus) return "text-orange-600";
    return "text-gray-400";
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Tracking: {trackingNumber}
        </span>
        {getStatusIcon()}
      </div>
      <div className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </div>
      {orderData && (
        <div className="text-xs text-gray-500 mt-1">
          Customer: {orderData.dist.customerName}
        </div>
      )}
    </div>
  );
};

// Expandable tracking timeline component
export const TrackingTimeline = ({
  trackingNumber,
}: {
  trackingNumber: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { orderData, loading, error, timeline, refresh } =
    usePostExOrder(trackingNumber);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading tracking information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <Package className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-gray-600">No tracking data available</span>
        </div>
      </div>
    );
  }

  const currentStatus = timeline[0];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tracking: {trackingNumber}
          </h3>
          <p className="text-sm text-gray-600">
            Customer: {orderData.dist.customerName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refresh}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            postexAPI.getStatusInfo(currentStatus.transactionStatusMessageCode)
              .color
          } text-white`}
        >
          {currentStatus.transactionStatusMessage}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Last updated: {currentStatus.formattedDate}
        </p>
      </div>

      {/* Timeline */}
      {expanded && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">
            Tracking History
          </h4>
          {timeline.map((status, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  status.statusInfo.color
                } ${status.isLatest ? "ring-4 ring-blue-200" : ""}`}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5
                    className={`text-sm font-medium ${
                      status.isLatest ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {status.transactionStatusMessage}
                  </h5>
                  <span className="text-xs text-gray-500">
                    {status.formattedDate}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Code: {status.transactionStatusMessageCode}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Quick tracking lookup component
export const QuickTrackingLookup = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setShowResult(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Order Tracking
      </h3>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!trackingNumber.trim()}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 dark:hover:from-primary-600 dark:hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
          >
            <Eye className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Track</span>
          </button>
        </div>
      </form>

      {showResult && trackingNumber && (
        <div className="animate-slide-up">
          <TrackingTimeline trackingNumber={trackingNumber} />
        </div>
      )}
    </div>
  );
};
