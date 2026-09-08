"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const refreshTokenSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByToken: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
}, {
    timestamps: true,
});
refreshTokenSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });
exports.RefreshTokenModel = mongoose_1.default.model('RefreshToken', refreshTokenSchema);
//# sourceMappingURL=RefreshToken.js.map