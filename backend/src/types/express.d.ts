import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'admin' | 'buyer' | 'vendor';
      } & JwtPayload;
    }
  }
}

export {};
