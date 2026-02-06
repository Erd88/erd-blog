import { api } from './client';
import type { PaginatedResponse, ApiResponse } from '../types/api';
import type { User } from '../types/user';

export function getUsers(page = 1, limit = 10) {
  return api.get<PaginatedResponse<User>>(`/admin/users?page=${page}&limit=${limit}`);
}

export function changeRole(id: number, role: 'user' | 'admin') {
  return api.patch<ApiResponse<{ message: string }>>(`/admin/users/${id}/role`, { role });
}

export function toggleBan(id: number, isBanned: boolean) {
  return api.patch<ApiResponse<{ message: string }>>(`/admin/users/${id}/ban`, { is_banned: isBanned });
}
