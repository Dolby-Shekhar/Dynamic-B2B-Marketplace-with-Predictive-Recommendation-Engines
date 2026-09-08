import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByToken: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

refreshTokenSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

export type RefreshTokenDocument = InferSchemaType<typeof refreshTokenSchema>;
export const RefreshTokenModel: Model<RefreshTokenDocument> = mongoose.model(
  'RefreshToken',
  refreshTokenSchema,
);
