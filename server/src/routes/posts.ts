import { Router, Request, Response, NextFunction } from 'express';
import { dbAll, dbGet, dbRun } from '../db/connection.js';
import { CreatePostSchema, UpdatePostSchema, type PostWithAuthor } from '../types/post.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { ApiError } from '../middleware/errorHandler.js';
import { slugify } from '../utils/slugify.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

const router = Router();

const POST_SELECT = `
  SELECT p.*, u.display_name as author_name, u.avatar_url as author_avatar,
         c.name as category_name, c.slug as category_slug,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
  FROM posts p
  LEFT JOIN users u ON p.author_id = u.id
  LEFT JOIN categories c ON p.category_id = c.id
`;

// Public: list published posts
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, string>);
    const category = req.query.category as string | undefined;
    const sort = req.query.sort === 'oldest' ? 'ASC' : 'DESC';

    let where = "WHERE p.status = 'published'";
    const params: (string | number)[] = [];

    if (category) {
      where += ' AND c.slug = ?';
      params.push(category);
    }

    const countRow = dbGet<{ total: number }>(
      `SELECT COUNT(*) as total FROM posts p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );

    const offset = (page - 1) * limit;
    const posts = dbAll<PostWithAuthor>(
      `${POST_SELECT} ${where} ORDER BY p.published_at ${sort} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: posts,
      pagination: paginationMeta(countRow?.total || 0, { page, limit }),
    });
  } catch (err) {
    next(err);
  }
});

// Public: search posts (LIKE-based)
router.get('/search', (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      res.json({ data: [] });
      return;
    }

    const { page, limit } = parsePagination(req.query as Record<string, string>);
    const searchPattern = `%${q}%`;

    const countRow = dbGet<{ total: number }>(
      `SELECT COUNT(*) as total FROM posts p
       WHERE (p.title LIKE ? OR p.content LIKE ?) AND p.status = 'published'`,
      [searchPattern, searchPattern]
    );

    const offset = (page - 1) * limit;
    const posts = dbAll<PostWithAuthor>(
      `${POST_SELECT}
       WHERE (p.title LIKE ? OR p.content LIKE ?) AND p.status = 'published'
       ORDER BY p.published_at DESC
       LIMIT ? OFFSET ?`,
      [searchPattern, searchPattern, limit, offset]
    );

    res.json({
      data: posts,
      pagination: paginationMeta(countRow?.total || 0, { page, limit }),
    });
  } catch (err) {
    next(err);
  }
});

// Public: single post by slug
router.get('/:slug', (req: Request, res: Response, next: NextFunction) => {
  try {
    // Avoid matching admin routes
    if (req.params.slug === 'admin') {
      next();
      return;
    }
    const post = dbGet<PostWithAuthor>(
      `${POST_SELECT} WHERE p.slug = ? AND p.status = 'published'`,
      [req.params.slug as string]
    );

    if (!post) {
      throw new ApiError(404, 'Post not found', 'NOT_FOUND');
    }

    res.json({ data: post });
  } catch (err) {
    next(err);
  }
});

// Admin: list all posts
router.get('/admin/all', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, string>);
    const countRow = dbGet<{ total: number }>('SELECT COUNT(*) as total FROM posts');
    const offset = (page - 1) * limit;

    const posts = dbAll<PostWithAuthor>(
      `${POST_SELECT} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      data: posts,
      pagination: paginationMeta(countRow?.total || 0, { page, limit }),
    });
  } catch (err) {
    next(err);
  }
});

// Admin: get post by ID
router.get('/admin/:id', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = dbGet<PostWithAuthor>(
      `${POST_SELECT} WHERE p.id = ?`,
      [parseInt(req.params.id as string)]
    );

    if (!post) {
      throw new ApiError(404, 'Post not found', 'NOT_FOUND');
    }

    res.json({ data: post });
  } catch (err) {
    next(err);
  }
});

// Admin: create post
router.post('/', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreatePostSchema.parse(req.body);
    let slug = slugify(data.title);

    const existing = dbGet('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const excerpt = data.excerpt || data.content.slice(0, 200).replace(/[#*`>\-\[\]]/g, '').trim();
    const publishedAt = data.status === 'published' ? new Date().toISOString() : null;

    const result = dbRun(
      `INSERT INTO posts (title, slug, content, excerpt, cover_image_url, author_id, category_id, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.title, slug, data.content, excerpt,
       data.cover_image_url || null, req.user!.userId,
       data.category_id || null, data.status, publishedAt]
    );

    const post = dbGet<PostWithAuthor>(`${POST_SELECT} WHERE p.id = ?`, [result.lastInsertRowid]);
    res.status(201).json({ data: post });
  } catch (err) {
    next(err);
  }
});

// Admin: update post
router.put('/admin/:id', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = UpdatePostSchema.parse(req.body);
    const postId = parseInt(req.params.id as string);
    const existing = dbGet<PostWithAuthor>('SELECT * FROM posts WHERE id = ?', [postId]);

    if (!existing) {
      throw new ApiError(404, 'Post not found', 'NOT_FOUND');
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
      let slug = slugify(data.title);
      const slugConflict = dbGet('SELECT id FROM posts WHERE slug = ? AND id != ?', [slug, postId]);
      if (slugConflict) slug = `${slug}-${Date.now()}`;
      updates.push('slug = ?');
      values.push(slug);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(data.excerpt);
    }
    if (data.cover_image_url !== undefined) {
      updates.push('cover_image_url = ?');
      values.push(data.cover_image_url || null);
    }
    if (data.category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(data.category_id || null);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
      if (data.status === 'published' && !existing.published_at) {
        updates.push('published_at = ?');
        values.push(new Date().toISOString());
      }
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(postId);
      dbRun(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const post = dbGet<PostWithAuthor>(`${POST_SELECT} WHERE p.id = ?`, [postId]);
    res.json({ data: post });
  } catch (err) {
    next(err);
  }
});

// Admin: delete post
router.delete('/admin/:id', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = dbRun('DELETE FROM posts WHERE id = ?', [parseInt(req.params.id as string)]);
    if (result.changes === 0) {
      throw new ApiError(404, 'Post not found', 'NOT_FOUND');
    }
    res.json({ data: { message: 'Post deleted' } });
  } catch (err) {
    next(err);
  }
});

export default router;
