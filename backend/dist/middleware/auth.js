"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const AppError_1 = require("../utils/AppError");
const jwt_1 = require("../utils/jwt");
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization ?? '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!accessToken && !req.cookies?.access_token) {
        next(new AppError_1.AppError(401, 'Authentication required'));
        return;
    }
    try {
        const tokenToVerify = accessToken ?? req.cookies.access_token;
        const payload = (0, jwt_1.verifyAccessToken)(tokenToVerify);
        req.user = {
            ...payload,
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        next(new AppError_1.AppError(401, 'Invalid or expired access token'));
    }
};
exports.requireAuth = requireAuth;
const requireRole = (roles) => {
    return (req, _res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            next(new AppError_1.AppError(403, 'You do not have permission to perform this action'));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map