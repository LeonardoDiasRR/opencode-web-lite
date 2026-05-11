import type { Request, Response, NextFunction } from 'express';
import { validateToken } from './token.js';

export function authMiddleware(getToken: () => string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!validateToken(token, getToken())) {
      res.status(401).json({ error: 'Invalid or missing token', code: 'UNAUTHORIZED' });
      return;
    }
    next();
  };
}
