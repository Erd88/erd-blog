import { z } from 'zod';

export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
});

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithUser extends Comment {
  user_name: string;
  user_avatar: string | null;
  user_role: string;
}
