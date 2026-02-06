import { Router, Request, Response, NextFunction } from 'express';
import { dbAll, dbGet } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const totalPosts = (dbGet<{ count: number }>('SELECT COUNT(*) as count FROM posts'))?.count || 0;
    const publishedPosts = (dbGet<{ count: number }>("SELECT COUNT(*) as count FROM posts WHERE status = 'published'"))?.count || 0;
    const draftPosts = (dbGet<{ count: number }>("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'"))?.count || 0;
    const totalComments = (dbGet<{ count: number }>('SELECT COUNT(*) as count FROM comments'))?.count || 0;
    const totalUsers = (dbGet<{ count: number }>('SELECT COUNT(*) as count FROM users'))?.count || 0;
    const totalCategories = (dbGet<{ count: number }>('SELECT COUNT(*) as count FROM categories'))?.count || 0;
    const unreadMessages = (dbGet<{ count: number }>('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0'))?.count || 0;

    const recentPosts = dbAll(
      `SELECT p.id, p.title, p.slug, p.status, p.created_at, u.display_name as author_name
       FROM posts p LEFT JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC LIMIT 5`
    );

    const recentComments = dbAll(
      `SELECT c.id, c.content, c.created_at, u.display_name as user_name, p.title as post_title, p.slug as post_slug
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN posts p ON c.post_id = p.id
       ORDER BY c.created_at DESC LIMIT 5`
    );

    res.json({
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalComments,
        totalUsers,
        totalCategories,
        unreadMessages,
        recentPosts,
        recentComments,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
