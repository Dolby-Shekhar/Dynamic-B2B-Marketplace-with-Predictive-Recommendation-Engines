import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';

import { OrganizationModel } from '../models/Organization';
import { RefreshTokenModel } from '../models/RefreshToken';
import { UserModel } from '../models/User';
import { AppError } from '../utils/AppError';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from '../utils/cookie';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

const buildAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, accessTokenCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);
};

const normalizeUserAgent = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

const rotateRefreshToken = async (
  userId: string,
  previousToken: string,
  newToken: string,
  ipAddress: string | null,
  userAgent: string | null,
): Promise<void> => {
  const previousHash = crypto.createHash('sha256').update(previousToken).digest('hex');
  const existingToken = await RefreshTokenModel.findOne({ tokenHash: previousHash }).lean();

  if (!existingToken) {
    throw new AppError(401, 'Refresh token is invalid or has been revoked');
  }

  const newHash = crypto.createHash('sha256').update(newToken).digest('hex');

  await RefreshTokenModel.updateOne(
    { _id: existingToken._id },
    {
      $set: {
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        replacedByToken: newHash,
        ipAddress,
        userAgent,
      },
    },
  );

  await RefreshTokenModel.updateMany(
    { userId, tokenHash: { $ne: newHash } },
    { $set: { revokedAt: new Date() } },
  );
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role?: 'admin' | 'buyer' | 'vendor';
    };

    if (!firstName || !lastName || !email || !password) {
      next(new AppError(400, 'First name, last name, email, and password are required'));
      return;
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      next(new AppError(409, 'User with this email already exists'));
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await UserModel.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      role: role ?? 'buyer',
    });

    const accessToken = signAccessToken({
      userId: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = signRefreshToken({
      userId: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
      tokenVersion: 1,
    });

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await RefreshTokenModel.create({
      userId: newUser._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip ?? null,
      userAgent: normalizeUserAgent(req.headers['user-agent']) ?? null,
    });

    buildAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: String(newUser._id),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      next(new AppError(400, 'Email and password are required'));
      return;
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      next(new AppError(401, 'Invalid email or password'));
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      next(new AppError(401, 'Invalid email or password'));
      return;
    }

    const accessToken = signAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: 1,
    });

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await RefreshTokenModel.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip ?? null,
      userAgent: normalizeUserAgent(req.headers['user-agent']) ?? null,
    });

    buildAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (refreshToken) {
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await RefreshTokenModel.updateMany(
        { tokenHash: refreshTokenHash },
        { $set: { revokedAt: new Date(), replacedByToken: null } },
      );
    }

    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshTokenValue = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshTokenValue) {
      next(new AppError(401, 'Refresh token missing'));
      return;
    }

    const payload = verifyRefreshToken(refreshTokenValue);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');
    const storedToken = await RefreshTokenModel.findOne({ tokenHash: refreshTokenHash });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      await RefreshTokenModel.updateMany({ userId: payload.userId }, { $set: { revokedAt: new Date() } });
      next(new AppError(401, 'Refresh token invalid or expired'));
      return;
    }

    const user = await UserModel.findById(payload.userId).select('-passwordHash');
    if (!user) {
      next(new AppError(401, 'Refresh token user not found'));
      return;
    }

    const nextAccessToken = signAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    const nextRefreshToken = signRefreshToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: 2,
    });

    await rotateRefreshToken(
      String(user._id),
      refreshTokenValue,
      nextRefreshToken,
      req.ip ?? null,
      normalizeUserAgent(req.headers['user-agent']) ?? null,
    );

    buildAuthCookies(res, nextAccessToken, nextRefreshToken);
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const onboardVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      next(new AppError(401, 'User not authenticated'));
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      next(new AppError(404, 'User not found'));
      return;
    }

    const payload = req.body as {
      companyName?: string;
      legalName?: string;
      industry?: string;
      website?: string;
      contactEmail?: string;
      contactPhone?: string;
      taxId?: string;
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };

    const companyName = payload.companyName?.trim();
    const industry = payload.industry?.trim();

    if (!companyName || !industry) {
      next(new AppError(400, 'Company name and industry are required for vendor onboarding'));
      return;
    }

    const organization = await OrganizationModel.create({
      name: companyName,
      legalName: payload.legalName?.trim() || companyName,
      industry,
      status: 'active',
      address: {
        street: payload.street?.trim() || '',
        city: payload.city?.trim() || '',
        state: payload.state?.trim() || '',
        postalCode: payload.postalCode?.trim() || '',
        country: payload.country?.trim() || '',
      },
      contactEmail: payload.contactEmail?.trim() || user.email,
      contactPhone: payload.contactPhone?.trim() || '',
      taxId: payload.taxId?.trim() || '',
      website: payload.website?.trim() || '',
    });

    user.role = user.role === 'buyer' ? 'vendor' : user.role;
    user.organizationId = organization._id as any;
    user.isActive = true;
    await user.save();

    const accessToken = signAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: 1,
    });

    buildAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Vendor onboarding complete',
      organization,
      user: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organizationId: String(organization._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      next(new AppError(401, 'User not authenticated'));
      return;
    }

    const user = await UserModel.findById(userId).select('-passwordHash');
    if (!user) {
      next(new AppError(404, 'User not found'));
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId ? String(user.organizationId) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};
