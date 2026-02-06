import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export interface User {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  role: 'user' | 'admin';
  avatar_url: string | null;
  bio: string | null;
  is_banned: number;
  created_at: string;
  updated_at: string;
}

export type PublicUser = Omit<User, 'password_hash'>;
