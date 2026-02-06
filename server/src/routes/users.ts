import { Router, Request, Response, NextFunction } from 'express';
import { dbAll, dbGet, dbRun } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { ApiError } from '../middleware/errorHandler.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

const router = Router();

router.use(authenticate, adminOnly);

// List users
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, string>);
    const countRow = dbGet<{ total: number }>('SELECT COUNT(*) as total FROM users');
    const offset = (page - 1) * limit;

    const users = dbAll(
      `SELECT id, email, display_name, role, avatar_url, bio, is_banned, created_at, updated_at
       FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      data: users,
      pagination: paginationMeta(countRow?.total || 0, { page, limit }),
    });
  } catch (err) {
    next(err);
  }
});

// Change role
router.patch('/:id/role', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      throw new ApiError(400, 'Invalid role', 'INVALID_ROLE');
    }

    const result = dbRun("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?", [role, parseInt(req.params.id as string)]);
    if (result.changes === 0) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    res.json({ data: { message: 'Role updated' } });
  } catch (err) {
    next(err);
  }
});

// Ban/unban
router.patch('/:id/ban', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { is_banned } = req.body;
    const result = dbRun("UPDATE users SET is_banned = ?, updated_at = datetime('now') WHERE id = ?", [
      is_banned ? 1 : 0, parseInt(req.params.id as string)
    ]);
    if (result.changes === 0) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    res.json({ data: { message: is_banned ? 'User banned' : 'User unbanned' } });
  } catch (err) {
    next(err);
  }
});

export default router;
