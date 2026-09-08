import jwt, { type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: 'admin' | 'buyer' | 'vendor';
};

export const signAccessToken = (payload: AuthTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: '15m',
    issuer: 'b2b-marketplace',
  };

  return jwt.sign(payload, env.jwtAccessSecret as Secret, options);
};

export const signRefreshToken = (payload: AuthTokenPayload & { tokenVersion: number }): string => {
  const options: SignOptions = {
    expiresIn: '7d',
    issuer: 'b2b-marketplace',
  };

  return jwt.sign(payload, env.jwtRefreshSecret as Secret, options);
};

export const verifyAccessToken = (token: string): JwtPayload & AuthTokenPayload => {
  const decoded = jwt.verify(token, env.jwtAccessSecret as Secret) as JwtPayload & AuthTokenPayload;

  if (!decoded.userId || !decoded.email || !decoded.role) {
    throw new Error('Invalid access token payload');
  }

  return decoded;
};

export const verifyRefreshToken = (token: string): JwtPayload & AuthTokenPayload & { tokenVersion: number } => {
  const decoded = jwt.verify(token, env.jwtRefreshSecret as Secret) as JwtPayload &
    AuthTokenPayload &
    { tokenVersion: number };

  if (!decoded.userId || !decoded.email || !decoded.role || typeof decoded.tokenVersion !== 'number') {
    throw new Error('Invalid refresh token payload');
  }

  return decoded;
};
