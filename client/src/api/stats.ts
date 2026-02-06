import { api } from './client';
import type { ApiResponse } from '../types/api';

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  totalUsers: number;
  totalCategories: number;
  unreadMessages: number;
  recentPosts: {
    id: number;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    author_name: string;
  }[];
  recentComments: {
    id: number;
    content: string;
    created_at: string;
    user_name: string;
    post_title: string;
    post_slug: string;
  }[];
}

export function getStats() {
  return api.get<ApiResponse<DashboardStats>>('/admin/stats');
}
