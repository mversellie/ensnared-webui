// API DTOs matching your FastAPI backend
export interface UserDTO {
  id: string;
  username: string;
  created_at: string;
}

export interface PostDTO {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_comment: boolean;
  parent_id?: string;
  concepts: string[];
}

export interface FriendshipDTO {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
}

export interface DirectMessageDTO {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
}

// Request DTOs
export interface CreateUserRequest {
  username: string;
}

export interface CreatePostRequest {
  content: string;
  user_id: string;
}

export interface CreateCommentRequest {
  content: string;
  user_id: string;
  post_id: string;
}

export interface CreateFriendshipRequest {
  user_id: string;
  friend_id: string;
}

export interface SendDirectMessageRequest {
  content: string;
  sender_id: string;
  receiver_id: string;
}

// Response DTOs
export interface UserListResponse {
  users: UserDTO[];
}

export interface PostListResponse {
  posts: PostDTO[];
}

export interface FriendshipListResponse {
  friendships: FriendshipDTO[];
}

export interface DirectMessageListResponse {
  messages: DirectMessageDTO[];
}