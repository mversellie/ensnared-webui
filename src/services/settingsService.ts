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
    const data = await apiRequest<Record<string, any>>('/configuration/settings');
    memoryCache = data;
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
    return data;
  },

  async saveSettings(data: Record<string, any>): Promise<Record<string, any>> {
    const result = await apiRequest<Record<string, any>>('/configuration/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    // Update cache with new settings
    memoryCache = result;
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
      data: result,
      timestamp: Date.now(),
    }));
    return result;
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
