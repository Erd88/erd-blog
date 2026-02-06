import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  category_id: z.number().int().positive().optional().nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: number;
  category_id: number | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author_name: string;
  author_avatar: string | null;
  category_name: string | null;
  category_slug: string | null;
  comment_count: number;
}
