"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenCookieOptions = exports.accessTokenCookieOptions = exports.REFRESH_TOKEN_COOKIE_NAME = exports.ACCESS_TOKEN_COOKIE_NAME = void 0;
exports.ACCESS_TOKEN_COOKIE_NAME = 'access_token';
exports.REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
exports.accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000,
};
exports.refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
//# sourceMappingURL=cookie.js.map