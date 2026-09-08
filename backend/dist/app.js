"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const AppError_1 = require("./utils/AppError");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const normalizedOrigin = origin?.replace(/\/$/, '') ?? '';
        const allowlist = env_1.env.corsOrigins.map((value) => value.replace(/\/$/, ''));
        const isLocalDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowlist.includes(normalizedOrigin) || isLocalDevOrigin) {
            callback(null, true);
            return;
        }
        callback(new Error('CORS policy violation'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, morgan_1.default)(env_1.env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again later.' },
}));
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
app.use('/api', routes_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});
app.use((error, _req, res, _next) => {
    if (error instanceof AppError_1.AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }
    if (error instanceof Error) {
        console.error('Unhandled application error:', error.stack ?? error.message);
        res.status(500).json({
            success: false,
            message: env_1.env.nodeEnv === 'production' ? 'Internal server error' : error.message,
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map