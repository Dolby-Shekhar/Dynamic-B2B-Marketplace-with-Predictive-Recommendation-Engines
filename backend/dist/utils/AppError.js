"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.isOperational = isOperational;
    }
}
exports.AppError = AppError;
//# sourceMappingURL=AppError.js.map