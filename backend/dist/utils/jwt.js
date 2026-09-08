"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const signAccessToken = (payload) => {
    const options = {
        expiresIn: '15m',
        issuer: 'b2b-marketplace',
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtAccessSecret, options);
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (payload) => {
    const options = {
        expiresIn: '7d',
        issuer: 'b2b-marketplace',
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtRefreshSecret, options);
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
    if (!decoded.userId || !decoded.email || !decoded.role) {
        throw new Error('Invalid access token payload');
    }
    return decoded;
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtRefreshSecret);
    if (!decoded.userId || !decoded.email || !decoded.role || typeof decoded.tokenVersion !== 'number') {
        throw new Error('Invalid refresh token payload');
    }
    return decoded;
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map