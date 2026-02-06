import { Router, Request, Response, NextFunction } from 'express';
import { dbAll, dbGet, dbRun } from '../db/connection.js';
import { ContactSchema, type ContactMessage } from '../types/contact.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { ApiError } from '../middleware/errorHandler.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

const router = Router();

// Public: submit contact form
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ContactSchema.parse(req.body);
    dbRun(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [data.name, data.email, data.subject, data.message]
    );

    res.status(201).json({ data: { message: 'Message sent successfully' } });
  } catch (err) {
    next(err);
  }
});

// Admin: list messages
router.get('/', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, string>);
    const countRow = dbGet<{ total: number }>('SELECT COUNT(*) as total FROM contact_messages');
    const offset = (page - 1) * limit;

    const messages = dbAll<ContactMessage>(
      'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    res.json({
      data: messages,
      pagination: paginationMeta(countRow?.total || 0, { page, limit }),
    });
  } catch (err) {
    next(err);
  }
});

// Admin: mark as read
router.patch('/:id/read', authenticate, adminOnly, (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = dbRun('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [parseInt(req.params.id as string)]);
    if (result.changes === 0) {
      throw new ApiError(404, 'Message not found', 'NOT_FOUND');
    }
    res.json({ data: { message: 'Marked as read' } });
  } catch (err) {
    next(err);
  }
});

export default router;
