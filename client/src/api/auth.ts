import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, User } from '../types/user';

export function login(email: string, password: string) {
  return api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
}

export function register(email: string, password: string, displayName: string) {
  return api.post<ApiResponse<AuthResponse>>('/auth/register', { email, password, displayName });
}

export function getMe() {
  return api.get<ApiResponse<User>>('/auth/me');
}
