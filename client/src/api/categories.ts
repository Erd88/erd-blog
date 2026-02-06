import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { Category } from '../types/category';

export function getCategories() {
  return api.get<ApiResponse<Category[]>>('/categories');
}

export function getCategoryBySlug(slug: string) {
  return api.get<ApiResponse<Category>>(`/categories/${slug}`);
}

export function createCategory(data: { name: string; description?: string }) {
  return api.post<ApiResponse<Category>>('/categories', data);
}

export function updateCategory(id: number, data: { name?: string; description?: string }) {
  return api.put<ApiResponse<Category>>(`/categories/${id}`, data);
}

export function deleteCategory(id: number) {
  return api.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
}
