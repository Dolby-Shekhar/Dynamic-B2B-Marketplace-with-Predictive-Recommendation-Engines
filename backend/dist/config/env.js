"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getCorsOrigins = () => {
    const value = [
        process.env.CORS_ORIGINS,
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:4173',
    ]
        .filter(Boolean)
        .join(',');
    return value
        .split(',')
        .map((origin) => origin.trim().replace(/\/$/, ''))
        .filter(Boolean);
};
exports.env = {
    port: Number(process.env.PORT ?? 5000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    mongoUri: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/b2b_marketplace',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'development-access-secret-change-me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'development-refresh-secret-change-me',
    frontendUrl: (process.env.FRONTEND_URL ?? 'http://localhost:4173').replace(/\/$/, ''),
    corsOrigins: getCorsOrigins(),
};
//# sourceMappingURL=env.js.map