interface SyncResults {
  orders: { total: number; new: number; updated: number; errors: number };
  products: { total: number; new: number; updated: number; errors: number };
  customers: { total: number; new: number; updated: number; errors: number };
  startTime: Date;
  endTime: Date | null;
  status: string;
}

interface SyncProgress {
  stage: string;
  progress: number;
  details: string;
  status: 'running' | 'completed' | 'error';
  results?: SyncResults;
}

interface SyncProgressListener {
  (progress: SyncProgress): void;
}

class SyncProgressService {
  private eventSources: Map<string, EventSource> = new Map();
  private listeners: Map<string, SyncProgressListener[]> = new Map();

  // Start listening to sync progress for a specific shop domain
  startListening(shopDomain: string, listener: SyncProgressListener): void {
    // Clean up any existing connection
    this.stopListening(shopDomain);

    // Normalize shop domain (remove .myshopify.com if present)
    const normalizedDomain = shopDomain.replace('.myshopify.com', '');

    // Create new EventSource connection
    const eventSource = new EventSource(
      `http://localhost:3001/api/shopify/sync-progress/${normalizedDomain}`,
      {
        withCredentials: false
      }
    );

    // Store the connection
    this.eventSources.set(shopDomain, eventSource);

    // Initialize listeners array if not exists
    if (!this.listeners.has(shopDomain)) {
      this.listeners.set(shopDomain, []);
    }
    this.listeners.get(shopDomain)!.push(listener);

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          const progress: SyncProgress = {
            stage: data.stage,
            progress: data.progress,
            details: data.details,
            status: data.status,
            results: data.results
          };
          
          // Notify all listeners
          const shopListeners = this.listeners.get(shopDomain) || [];
          shopListeners.forEach(l => l(progress));
        } else if (data.type === 'end') {
          // Sync completed, clean up
          this.stopListening(shopDomain);
        }
      } catch (error) {
        console.error('Error parsing sync progress data:', error);
      }
    };

    // Handle connection opened
    eventSource.onopen = () => {
      console.log(`✅ Connected to sync progress for ${shopDomain}`);
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error(`❌ Sync progress connection error for ${shopDomain}:`, error);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (this.eventSources.has(shopDomain)) {
          console.log(`🔄 Reconnecting to sync progress for ${shopDomain}...`);
          this.startListening(shopDomain, listener);
        }
      }, 5000);
    };
  }

  // Stop listening to sync progress
  stopListening(shopDomain: string): void {
    const eventSource = this.eventSources.get(shopDomain);
    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(shopDomain);
    }
    
    this.listeners.delete(shopDomain);
  }

  // Add additional listener to existing connection
  addListener(shopDomain: string, listener: SyncProgressListener): void {
    if (!this.listeners.has(shopDomain)) {
      this.listeners.set(shopDomain, []);
    }
    this.listeners.get(shopDomain)!.push(listener);
  }

  // Remove specific listener
  removeListener(shopDomain: string, listener: SyncProgressListener): void {
    const shopListeners = this.listeners.get(shopDomain);
    if (shopListeners) {
      const index = shopListeners.indexOf(listener);
      if (index > -1) {
        shopListeners.splice(index, 1);
      }
    }
  }

  // Clean up all connections
  cleanup(): void {
    for (const [shopDomain] of this.eventSources) {
      this.stopListening(shopDomain);
    }
  }
}

// Export singleton instance
export const syncProgressService = new SyncProgressService();
export type { SyncProgress, SyncProgressListener };
