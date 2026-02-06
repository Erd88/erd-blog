import { Router, Request, Response, NextFunction } from 'express';
import { dbAll, dbGet, dbRun } from '../db/connection.js';
import { CreateCommentSchema, type CommentWithUser } from '../types/comment.js';
import { authenticate } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

// Public: list comments for a post
router.get('/posts/:postId/comments', (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = dbAll<CommentWithUser>(
      `SELECT c.*, u.display_name as user_name, u.avatar_url as user_avatar, u.role as user_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [parseInt(req.params.postId as string)]
    );

    res.json({ data: comments });
  } catch (err) {
    next(err);
  }
});

// Authenticated: add comment
router.post('/posts/:postId/comments', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateCommentSchema.parse(req.body);
    const postId = parseInt(req.params.postId as string);

    const post = dbGet("SELECT id FROM posts WHERE id = ? AND status = 'published'", [postId]);
    if (!post) {
      throw new ApiError(404, 'Post not found', 'NOT_FOUND');
    }

    const result = dbRun(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, req.user!.userId, data.content]
    );

    const comment = dbGet<CommentWithUser>(
      `SELECT c.*, u.display_name as user_name, u.avatar_url as user_avatar, u.role as user_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.lastInsertRowid]
    );

    res.status(201).json({ data: comment });
  } catch (err) {
    next(err);
  }
});

// Authenticated: delete comment (owner or admin)
router.delete('/comments/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = dbGet<{ user_id: number }>('SELECT * FROM comments WHERE id = ?', [parseInt(req.params.id as string)]);
    if (!comment) {
      throw new ApiError(404, 'Comment not found', 'NOT_FOUND');
    }

    if (comment.user_id !== req.user!.userId && req.user!.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to delete this comment', 'FORBIDDEN');
    }

    dbRun('DELETE FROM comments WHERE id = ?', [parseInt(req.params.id as string)]);
    res.json({ data: { message: 'Comment deleted' } });
  } catch (err) {
    next(err);
  }
});

export default router;
