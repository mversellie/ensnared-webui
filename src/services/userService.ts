import { apiRequest } from './api';
import { UserDTO, CreateUserRequest, UserListResponse } from '@/types/api';

export const userService = {
  async createUser(userData: CreateUserRequest): Promise<UserDTO> {
    return apiRequest<UserDTO>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getUser(userId: string): Promise<UserDTO> {
    return apiRequest<UserDTO>(`/users/${userId}`);
  },

  async getUsers(skip = 0, limit = 100): Promise<UserListResponse> {
    return apiRequest<UserListResponse>(`/users/?skip=${skip}&limit=${limit}`);
  },
};