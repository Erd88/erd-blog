import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { Comment } from '../types/comment';

export function getComments(postId: number) {
  return api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`);
}

export function addComment(postId: number, content: string) {
  return api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, { content });
}

export function deleteComment(id: number) {
  return api.delete<ApiResponse<{ message: string }>>(`/comments/${id}`);
}
