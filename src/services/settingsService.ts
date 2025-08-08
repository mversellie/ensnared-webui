import { apiRequest } from './api';

export const settingsService = {
  async getSettings() {
    return apiRequest('/settings');
  },
  
  async saveSettings(data: any) {
    return apiRequest('/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};