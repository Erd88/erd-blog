import { api } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type { Post, CreatePostData } from '../types/post';

export function getPosts(params: {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.category) qs.set('category', params.category);
  if (params.sort) qs.set('sort', params.sort);
  return api.get<PaginatedResponse<Post>>(`/posts?${qs}`);
}

export function searchPosts(q: string, page = 1) {
  return api.get<PaginatedResponse<Post>>(`/posts/search?q=${encodeURIComponent(q)}&page=${page}`);
}

export function getPost(slug: string) {
  return api.get<ApiResponse<Post>>(`/posts/${slug}`);
}

// Admin
export function getAdminPosts(page = 1, limit = 10) {
  return api.get<PaginatedResponse<Post>>(`/posts/admin/all?page=${page}&limit=${limit}`);
}

export function getAdminPost(id: number) {
  return api.get<ApiResponse<Post>>(`/posts/admin/${id}`);
}

export function createPost(data: CreatePostData) {
  return api.post<ApiResponse<Post>>('/posts', data);
}

export function updatePost(id: number, data: Partial<CreatePostData>) {
  return api.put<ApiResponse<Post>>(`/posts/admin/${id}`, data);
}

export function deletePost(id: number) {
  return api.delete<ApiResponse<{ message: string }>>(`/posts/admin/${id}`);
}
