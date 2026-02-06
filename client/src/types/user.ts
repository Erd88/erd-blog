export interface User {
  id: number;
  email: string;
  display_name: string;
  role: 'user' | 'admin';
  avatar_url: string | null;
  bio: string | null;
  is_banned: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
