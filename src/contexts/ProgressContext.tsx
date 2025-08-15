import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { syncProgressService, SyncProgress } from "../services/syncProgressService";

interface LoadingProgress {
  isLoading: boolean;
  stage: string;
  progress: number;
  details: string;
}

interface ProgressContextType {
  loadingProgress: LoadingProgress;
  startProgressTracking: (shopDomain: string) => void;
  stopProgressTracking: () => void;
  updateProgress: (stage: string, progress: number, details: string) => void;
  setLoading: (loading: boolean) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({
  children,
}) => {
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    isLoading: false,
    stage: "",
    progress: 0,
    details: "",
  });

  const [currentShopDomain, setCurrentShopDomain] = useState<string>("");

  const updateProgress = useCallback((stage: string, progress: number, details: string) => {
    setLoadingProgress({
      isLoading: true,
      stage,
      progress,
      details,
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    if (!loading) {
      setLoadingProgress({
        isLoading: false,
        stage: "",
        progress: 0,
        details: "",
      });
    }
  }, []);

  const handleSyncProgress = useCallback((progress: SyncProgress) => {
    console.log("📊 Sync Progress Update:", progress);
    
    setLoadingProgress({
      isLoading: progress.status === 'running',
      stage: progress.stage,
      progress: progress.progress,
      details: progress.details,
    });

    // If sync is completed or failed, stop loading
    if (progress.status === 'completed' || progress.status === 'error') {
      setTimeout(() => {
        setLoadingProgress({
          isLoading: false,
          stage: "",
          progress: 0,
          details: "",
        });
      }, 2000); // Show completion message for 2 seconds
    }
  }, []);

  const startProgressTracking = useCallback((shopDomain: string) => {
    console.log(`🎯 Starting progress tracking for ${shopDomain}`);
    
    // Stop any existing tracking
    if (currentShopDomain) {
      syncProgressService.stopListening(currentShopDomain);
    }

    // Start new tracking
    setCurrentShopDomain(shopDomain);
    syncProgressService.startListening(shopDomain, handleSyncProgress);
    
    // Set initial loading state
    setLoadingProgress({
      isLoading: true,
      stage: "Initializing",
      progress: 0,
      details: "Connecting to sync service...",
    });
  }, [currentShopDomain, handleSyncProgress]);

  const stopProgressTracking = useCallback(() => {
    if (currentShopDomain) {
      syncProgressService.stopListening(currentShopDomain);
      setCurrentShopDomain("");
    }
    
    setLoadingProgress({
      isLoading: false,
      stage: "",
      progress: 0,
      details: "",
    });
  }, [currentShopDomain]);

  const value: ProgressContextType = {
    loadingProgress,
    startProgressTracking,
    stopProgressTracking,
    updateProgress,
    setLoading,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
