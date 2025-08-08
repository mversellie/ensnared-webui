import { apiRequest } from './api';
import { PostDTO, CreatePostRequest, CreateCommentRequest, PostListResponse } from '@/types/api';

export const postService = {
  async createPost(postData: CreatePostRequest): Promise<PostDTO> {
    return apiRequest<PostDTO>('/posts/', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  async getPost(postId: string): Promise<PostDTO> {
    return apiRequest<PostDTO>(`/posts/${postId}`);
  },

  async getPosts(skip = 0, limit = 100): Promise<PostListResponse> {
    return apiRequest<PostListResponse>(`/posts/?skip=${skip}&limit=${limit}`);
  },

  async getUserPosts(userId: string): Promise<PostListResponse> {
    return apiRequest<PostListResponse>(`/users/${userId}/posts`);
  },

  async createComment(commentData: CreateCommentRequest): Promise<PostDTO> {
    return apiRequest<PostDTO>(`/posts/${commentData.post_id}/comments/`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  async getPostComments(postId: string): Promise<PostListResponse> {
    return apiRequest<PostListResponse>(`/posts/${postId}/comments`);
  },
};