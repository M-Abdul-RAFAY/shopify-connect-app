import React from "react";
import {
  Loader2,
  Download,
  Database,
  BarChart3,
  CheckCircle,
} from "lucide-react";

interface LoadingProgressProps {
  stage: string;
  progress: number;
  details: string;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({
  stage,
  progress,
  details,
}) => {
  const getStageIcon = (currentStage: string) => {
    switch (currentStage) {
      case "Initializing":
        return <Loader2 className="w-6 h-6 animate-spin" />;
      case "Shop Info":
        return <Download className="w-6 h-6" />;
      case "Products":
      case "Orders":
      case "Customers":
        return <Database className="w-6 h-6" />;
      case "Analytics":
        return <BarChart3 className="w-6 h-6" />;
      case "Complete":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Loader2 className="w-6 h-6 animate-spin" />;
    }
  };

  const stages = [
    { name: "Shop Info", progress: 10 },
    { name: "Products", progress: 25 },
    { name: "Orders", progress: 50 },
    { name: "Customers", progress: 75 },
    { name: "Analytics", progress: 90 },
    { name: "Complete", progress: 100 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">{getStageIcon(stage)}</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Your Store Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Please wait while we fetch all your Shopify data...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>{stage}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-purple-600 dark:from-primary-400 dark:to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{details}</p>
        </div>

        {/* Stage Progress */}
        <div className="space-y-3">
          {stages.map((stageItem, index) => {
            const isCompleted = progress > stageItem.progress;
            const isCurrent = stage === stageItem.name;

            return (
              <div
                key={stageItem.name}
                className={`flex items-center space-x-3 p-2 rounded-xl transition-all duration-300 ${
                  isCurrent ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800" : ""
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-primary-500 text-white animate-pulse"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span
                  className={`text-sm font-medium transition-all duration-300 ${
                    isCompleted
                      ? "text-green-700"
                      : isCurrent
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {stageItem.name}
                </span>
                {isCurrent && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-500 dark:text-primary-400 ml-auto" />
                )}
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 ml-auto" />
                )}
              </div>
            );
          })}
        </div>

        {/* Loading Animation */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingProgress;
