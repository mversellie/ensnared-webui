import { apiRequest } from './api';
import { DirectMessageDTO, SendDirectMessageRequest, DirectMessageListResponse } from '@/types/api';

export const messageService = {
  async sendDirectMessage(messageData: SendDirectMessageRequest): Promise<DirectMessageDTO> {
    return apiRequest<DirectMessageDTO>('/direct-messages/', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  async getSentMessages(userId: string): Promise<DirectMessageListResponse> {
    return apiRequest<DirectMessageListResponse>(`/users/${userId}/direct-messages/sent`);
  },

  async getReceivedMessages(userId: string): Promise<DirectMessageListResponse> {
    return apiRequest<DirectMessageListResponse>(`/users/${userId}/direct-messages/received`);
  },
};