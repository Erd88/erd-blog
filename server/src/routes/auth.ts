import { Router, Request, Response, NextFunction } from 'express';
import { dbGet, dbRun } from '../db/connection.js';
import { RegisterSchema, LoginSchema, type User } from '../types/user.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

function sanitizeUser(user: User) {
  const { password_hash, ...rest } = user;
  return rest;
}

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const existing = dbGet('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existing) {
      throw new ApiError(409, 'Email already registered', 'EMAIL_EXISTS');
    }

    const hash = await hashPassword(data.password);
    const result = dbRun(
      'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
      [data.email, hash, data.displayName]
    );

    const user = dbGet<User>('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
    if (!user) throw new ApiError(500, 'Failed to create user');
    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({ data: { user: sanitizeUser(user), token } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = LoginSchema.parse(req.body);
    const user = dbGet<User>('SELECT * FROM users WHERE email = ?', [data.email]);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.is_banned) {
      throw new ApiError(403, 'Account has been banned', 'BANNED');
    }

    const valid = await comparePassword(data.password, user.password_hash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = signToken({ userId: user.id, role: user.role });
    res.json({ data: { user: sanitizeUser(user), token } });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = dbGet<User>('SELECT * FROM users WHERE id = ?', [req.user!.userId]);
    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }
    res.json({ data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
