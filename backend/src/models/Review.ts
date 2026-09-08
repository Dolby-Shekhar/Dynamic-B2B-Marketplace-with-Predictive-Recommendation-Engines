import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    sentimentScore: { type: Number, default: 0, min: -1, max: 1 },
  },
  { timestamps: true },
);

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ sentiment: 1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;
export const ReviewModel: Model<ReviewDocument> = mongoose.model('Review', reviewSchema);
