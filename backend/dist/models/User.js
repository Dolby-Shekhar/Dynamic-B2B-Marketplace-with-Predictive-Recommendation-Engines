"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'buyer', 'vendor'],
        default: 'buyer',
    },
    organizationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Organization', default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
}, {
    timestamps: true,
});
userSchema.index({ role: 1, isActive: 1 });
userSchema.methods.comparePassword = async function comparePassword(password) {
    return bcryptjs_1.default.compare(password, this.passwordHash);
};
exports.UserModel = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map