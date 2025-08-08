import { apiRequest } from './api';
import { FriendshipDTO, CreateFriendshipRequest, FriendshipListResponse } from '@/types/api';

export const friendshipService = {
  async createFriendship(friendshipData: CreateFriendshipRequest): Promise<FriendshipDTO> {
    return apiRequest<FriendshipDTO>('/friendships/', {
      method: 'POST',
      body: JSON.stringify(friendshipData),
    });
  },

  async getUserFriends(userId: string): Promise<FriendshipListResponse> {
    return apiRequest<FriendshipListResponse>(`/users/${userId}/friends`);
  },
};