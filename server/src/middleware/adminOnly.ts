import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler.js';

export function adminOnly(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
  }
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required', 'FORBIDDEN');
  }
  next();
}
