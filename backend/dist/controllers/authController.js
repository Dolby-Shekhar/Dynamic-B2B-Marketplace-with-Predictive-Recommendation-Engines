"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.onboardVendor = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const Organization_1 = require("../models/Organization");
const RefreshToken_1 = require("../models/RefreshToken");
const User_1 = require("../models/User");
const AppError_1 = require("../utils/AppError");
const cookie_1 = require("../utils/cookie");
const jwt_1 = require("../utils/jwt");
const buildAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie(cookie_1.ACCESS_TOKEN_COOKIE_NAME, accessToken, cookie_1.accessTokenCookieOptions);
    res.cookie(cookie_1.REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookie_1.refreshTokenCookieOptions);
};
const normalizeUserAgent = (value) => {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }
    return value ?? null;
};
const rotateRefreshToken = async (userId, previousToken, newToken, ipAddress, userAgent) => {
    const previousHash = node_crypto_1.default.createHash('sha256').update(previousToken).digest('hex');
    const existingToken = await RefreshToken_1.RefreshTokenModel.findOne({ tokenHash: previousHash }).lean();
    if (!existingToken) {
        throw new AppError_1.AppError(401, 'Refresh token is invalid or has been revoked');
    }
    const newHash = node_crypto_1.default.createHash('sha256').update(newToken).digest('hex');
    await RefreshToken_1.RefreshTokenModel.updateOne({ _id: existingToken._id }, {
        $set: {
            tokenHash: newHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revokedAt: null,
            replacedByToken: newHash,
            ipAddress,
            userAgent,
        },
    });
    await RefreshToken_1.RefreshTokenModel.updateMany({ userId, tokenHash: { $ne: newHash } }, { $set: { revokedAt: new Date() } });
};
const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        if (!firstName || !lastName || !email || !password) {
            next(new AppError_1.AppError(400, 'First name, last name, email, and password are required'));
            return;
        }
        const existingUser = await User_1.UserModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            next(new AppError_1.AppError(409, 'User with this email already exists'));
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const newUser = await User_1.UserModel.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            passwordHash,
            role: role ?? 'buyer',
        });
        const accessToken = (0, jwt_1.signAccessToken)({
            userId: String(newUser._id),
            email: newUser.email,
            role: newUser.role,
        });
        const refreshToken = (0, jwt_1.signRefreshToken)({
            userId: String(newUser._id),
            email: newUser.email,
            role: newUser.role,
            tokenVersion: 1,
        });
        const refreshTokenHash = node_crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        await RefreshToken_1.RefreshTokenModel.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            next(new AppError_1.AppError(400, 'Email and password are required'));
            return;
        }
        const user = await User_1.UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            next(new AppError_1.AppError(401, 'Invalid email or password'));
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            next(new AppError_1.AppError(401, 'Invalid email or password'));
            return;
        }
        const accessToken = (0, jwt_1.signAccessToken)({
            userId: String(user._id),
            email: user.email,
            role: user.role,
        });
        const refreshToken = (0, jwt_1.signRefreshToken)({
            userId: String(user._id),
            email: user.email,
            role: user.role,
            tokenVersion: 1,
        });
        const refreshTokenHash = node_crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        await RefreshToken_1.RefreshTokenModel.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.[cookie_1.REFRESH_TOKEN_COOKIE_NAME];
        if (refreshToken) {
            const refreshTokenHash = node_crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
            await RefreshToken_1.RefreshTokenModel.updateMany({ tokenHash: refreshTokenHash }, { $set: { revokedAt: new Date(), replacedByToken: null } });
        }
        res.clearCookie(cookie_1.ACCESS_TOKEN_COOKIE_NAME, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.clearCookie(cookie_1.REFRESH_TOKEN_COOKIE_NAME, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.status(200).json({ success: true, message: 'Logout successful' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const refreshToken = async (req, res, next) => {
    try {
        const refreshTokenValue = req.cookies?.[cookie_1.REFRESH_TOKEN_COOKIE_NAME];
        if (!refreshTokenValue) {
            next(new AppError_1.AppError(401, 'Refresh token missing'));
            return;
        }
        const payload = (0, jwt_1.verifyRefreshToken)(refreshTokenValue);
        const refreshTokenHash = node_crypto_1.default.createHash('sha256').update(refreshTokenValue).digest('hex');
        const storedToken = await RefreshToken_1.RefreshTokenModel.findOne({ tokenHash: refreshTokenHash });
        if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
            await RefreshToken_1.RefreshTokenModel.updateMany({ userId: payload.userId }, { $set: { revokedAt: new Date() } });
            next(new AppError_1.AppError(401, 'Refresh token invalid or expired'));
            return;
        }
        const user = await User_1.UserModel.findById(payload.userId).select('-passwordHash');
        if (!user) {
            next(new AppError_1.AppError(401, 'Refresh token user not found'));
            return;
        }
        const nextAccessToken = (0, jwt_1.signAccessToken)({
            userId: String(user._id),
            email: user.email,
            role: user.role,
        });
        const nextRefreshToken = (0, jwt_1.signRefreshToken)({
            userId: String(user._id),
            email: user.email,
            role: user.role,
            tokenVersion: 2,
        });
        await rotateRefreshToken(String(user._id), refreshTokenValue, nextRefreshToken, req.ip ?? null, normalizeUserAgent(req.headers['user-agent']) ?? null);
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
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const onboardVendor = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            next(new AppError_1.AppError(401, 'User not authenticated'));
            return;
        }
        const user = await User_1.UserModel.findById(userId);
        if (!user) {
            next(new AppError_1.AppError(404, 'User not found'));
            return;
        }
        const payload = req.body;
        const companyName = payload.companyName?.trim();
        const industry = payload.industry?.trim();
        if (!companyName || !industry) {
            next(new AppError_1.AppError(400, 'Company name and industry are required for vendor onboarding'));
            return;
        }
        const organization = await Organization_1.OrganizationModel.create({
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
        user.organizationId = organization._id;
        user.isActive = true;
        await user.save();
        const accessToken = (0, jwt_1.signAccessToken)({
            userId: String(user._id),
            email: user.email,
            role: user.role,
        });
        const refreshToken = (0, jwt_1.signRefreshToken)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.onboardVendor = onboardVendor;
const me = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            next(new AppError_1.AppError(401, 'User not authenticated'));
            return;
        }
        const user = await User_1.UserModel.findById(userId).select('-passwordHash');
        if (!user) {
            next(new AppError_1.AppError(404, 'User not found'));
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
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
//# sourceMappingURL=authController.js.map