"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    vendorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, lowercase: true }],
    imageUrl: { type: String, default: null },
    images: [{ type: String, default: null }],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    inventory: { type: Number, required: true, min: 0, default: 0 },
    isPublished: { type: Boolean, default: false },
    variants: [
        {
            sku: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            inventory: { type: Number, default: 0 },
        },
    ],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
}, { timestamps: true });
productSchema.index({ category: 1, isPublished: 1, price: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ tags: 1 });
exports.ProductModel = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.js.map