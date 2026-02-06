import { api } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: number;
  created_at: string;
}

export function submitContact(data: { name: string; email: string; subject: string; message: string }) {
  return api.post<ApiResponse<{ message: string }>>('/contact', data);
}

export function getContactMessages(page = 1, limit = 10) {
  return api.get<PaginatedResponse<ContactMessage>>(`/admin/contact?page=${page}&limit=${limit}`);
}

export function markAsRead(id: number) {
  return api.patch<ApiResponse<{ message: string }>>(`/admin/contact/${id}/read`, {});
}
