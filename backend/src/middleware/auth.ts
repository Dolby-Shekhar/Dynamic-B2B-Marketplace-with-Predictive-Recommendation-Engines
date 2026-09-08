import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization ?? '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!accessToken && !req.cookies?.access_token) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  try {
    const tokenToVerify = accessToken ?? req.cookies.access_token;
    const payload = verifyAccessToken(tokenToVerify);

    req.user = {
      ...payload,
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(new AppError(401, 'Invalid or expired access token'));
  }
};

export const requireRole = (roles: Array<'admin' | 'buyer' | 'vendor'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      next(new AppError(403, 'You do not have permission to perform this action'));
      return;
    }

    next();
  };
};
