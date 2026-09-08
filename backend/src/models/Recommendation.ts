import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    source: { type: String, enum: ['openai', 'rule-based', 'scoring-engine'], default: 'rule-based' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

recommendationSchema.index({ userId: 1, createdAt: -1 });

export type RecommendationDocument = InferSchemaType<typeof recommendationSchema>;
export const RecommendationModel: Model<RecommendationDocument> = mongoose.model(
  'Recommendation',
  recommendationSchema,
);
