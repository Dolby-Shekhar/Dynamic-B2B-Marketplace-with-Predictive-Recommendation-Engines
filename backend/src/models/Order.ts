import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentReference: { type: String, default: null },
    fulfillmentAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof orderSchema>;
export const OrderModel: Model<OrderDocument> = mongoose.model('Order', orderSchema);
