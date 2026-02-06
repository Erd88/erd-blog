import { Router, Request, Response, NextFunction } from 'express';
import { dbAll, dbGet, dbRun } from '../db/connection.js';
import { CreateCategorySchema, UpdateCategorySchema, type CategoryWithCount } from '../types/category.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { ApiError } from '../middleware/errorHandler.js';
import { slugify } from '../utils/slugify.js';

const router = Router();

// Public: list categories with post count
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = dbAll<CategoryWithCount>(
      `SELECT c.*, COUNT(CASE WHEN p.status = 'published' THEN 1 END) as post_count
       FROM categories c
       LEFT JOIN posts p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
});

// Public: get single category by slug
router.get('/:slug', (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = dbGet<CategoryWithCount>(
      `SELECT c.*, COUNT(CASE WHEN p.status = 'published' THEN 1 END) as post_count
       FROM categories c
       LEFT JOIN posts p ON p.category_id = c.id
       WHERE c.slug = ?
       GROUP BY c.id`,
      [req.params.slug as string]
    );

    if (!category) {
      throw new ApiError(404, 'Category not found', 'NOT_FOUND');
    }

    res.json({ data: category });
  } catch (err) {
    next(err);
  }
});

// Admin: create category
router.post('/', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateCategorySchema.parse(req.body);
    const slug = slugify(data.name);

    const existing = dbGet('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing) {
      throw new ApiError(409, 'Category already exists', 'DUPLICATE');
    }

    const result = dbRun(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [data.name, slug, data.description || null]
    );

    const category = dbGet('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid as number]);
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
});

// Admin: update category
router.put('/:id', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = UpdateCategorySchema.parse(req.body);
    const catId = parseInt(req.params.id as string);
    const existing = dbGet('SELECT * FROM categories WHERE id = ?', [catId]);
    if (!existing) {
      throw new ApiError(404, 'Category not found', 'NOT_FOUND');
    }

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?', 'slug = ?');
      values.push(data.name, slugify(data.name));
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description || null);
    }

    if (updates.length > 0) {
      values.push(String(catId));
      dbRun(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const category = dbGet('SELECT * FROM categories WHERE id = ?', [catId]);
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
});

// Admin: delete category
router.delete('/:id', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = dbRun('DELETE FROM categories WHERE id = ?', [parseInt(req.params.id as string)]);
    if (result.changes === 0) {
      throw new ApiError(404, 'Category not found', 'NOT_FOUND');
    }
    res.json({ data: { message: 'Category deleted' } });
  } catch (err) {
    next(err);
  }
});

export default router;
