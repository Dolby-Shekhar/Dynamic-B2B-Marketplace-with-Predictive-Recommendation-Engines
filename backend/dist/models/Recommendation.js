"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const recommendationSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    productIds: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product' }],
    source: { type: String, enum: ['openai', 'rule-based', 'scoring-engine'], default: 'rule-based' },
    metadata: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
recommendationSchema.index({ userId: 1, createdAt: -1 });
exports.RecommendationModel = mongoose_1.default.model('Recommendation', recommendationSchema);
//# sourceMappingURL=Recommendation.js.map