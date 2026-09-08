import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type CartDocument = InferSchemaType<typeof cartSchema>;
export const CartModel: Model<CartDocument> = mongoose.model('Cart', cartSchema);
