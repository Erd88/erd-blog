export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar: string | null;
  user_role: string;
}
