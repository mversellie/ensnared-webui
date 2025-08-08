import { apiRequest } from './api';

export const settingsService = {
  async getSettings() {
    return apiRequest('/settings');
  }
};