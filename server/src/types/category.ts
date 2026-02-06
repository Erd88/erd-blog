import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  description: z.string().max(200).optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface CategoryWithCount extends Category {
  post_count: number;
}
