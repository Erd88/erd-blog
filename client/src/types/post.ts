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
  author_name: string;
  author_avatar: string | null;
  category_name: string | null;
  category_slug: string | null;
  comment_count: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  category_id?: number | null;
  status: 'draft' | 'published';
}
