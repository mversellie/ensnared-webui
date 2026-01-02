import { apiRequest } from './api';

const SETTINGS_CACHE_KEY = 'cached_settings';

interface CachedSettings {
  data: Record<string, any>;
  timestamp: number;
}

let memoryCache: Record<string, any> | null = null;

export const settingsService = {
  async getSettings(): Promise<Record<string, any>> {
    // Return memory cache if available
    if (memoryCache) {
      return memoryCache;
    }

    // Try localStorage cache
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      try {
        const parsed: CachedSettings = JSON.parse(cached);
        memoryCache = parsed.data;
        return memoryCache;
      } catch {
        // Invalid cache, fetch fresh
      }
    }

    // Fetch from API and cache
    return this.fetchAndCache();
  },

  async fetchAndCache(): Promise<Record<string, any>> {
    // Fetch settings and progress in parallel
    const [settings, progress] = await Promise.all([
      apiRequest<Record<string, any>>('/configuration/settings'),
      apiRequest<{ status: string }>('/setup/progress'),
    ]);
    
    const data = { ...settings, setupStatus: progress.status };
    memoryCache = data;
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
    return data;
  },

  async saveSettings(data: Record<string, any>): Promise<Record<string, any>> {
    // Extract setupStatus for separate handling
    const { setupStatus, ...settingsData } = data;
    
    // Prevent setupStatus from reverting to a previous state
    const statusOrder = ['Not Started', 'Named', 'EndpointsConfigured', 'ContentConfigured', 'Creating', 'Finished'];
    
    let shouldUpdateStatus = false;
    if (setupStatus) {
      const currentStatus = memoryCache?.setupStatus || this.getCachedSettings()?.setupStatus;
      const currentIndex = statusOrder.indexOf(currentStatus);
      const newIndex = statusOrder.indexOf(setupStatus);
      
      // Only update if moving forward or status not found in order
      shouldUpdateStatus = currentIndex <= newIndex || currentIndex === -1 || newIndex === -1;
    }

    // Save settings and optionally update progress
    const promises: Promise<any>[] = [];
    
    if (Object.keys(settingsData).length > 0) {
      promises.push(apiRequest<Record<string, any>>('/configuration/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData),
      }));
    }
    
    if (shouldUpdateStatus) {
      promises.push(apiRequest<{ status: string }>('/setup/progress', {
        method: 'POST',
        body: JSON.stringify({ status: setupStatus }),
      }));
    }

    await Promise.all(promises);
    
    // Refresh cache after save
    return this.fetchAndCache();
  },

  getCachedSettings(): Record<string, any> | null {
    if (memoryCache) return memoryCache;
    
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      try {
        const parsed: CachedSettings = JSON.parse(cached);
        memoryCache = parsed.data;
        return memoryCache;
      } catch {
        return null;
      }
    }
    return null;
  },

  clearCache(): void {
    memoryCache = null;
    localStorage.removeItem(SETTINGS_CACHE_KEY);
  },

  async refreshSettings(): Promise<Record<string, any>> {
    return this.fetchAndCache();
  },
};
