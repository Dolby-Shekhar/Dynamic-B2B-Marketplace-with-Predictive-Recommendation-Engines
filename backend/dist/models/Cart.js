"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cartItemSchema = new mongoose_1.default.Schema({
    productId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
}, { _id: false });
const cartSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.CartModel = mongoose_1.default.model('Cart', cartSchema);
//# sourceMappingURL=Cart.js.map