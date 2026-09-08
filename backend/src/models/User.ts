import bcrypt from 'bcryptjs';
import mongoose, { type InferSchemaType, type Model } from 'mongoose';

export type UserRole = 'admin' | 'buyer' | 'vendor';

export interface UserDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  organizationId?: mongoose.Types.ObjectId | null;
  isActive: boolean;
  lastLoginAt?: Date | null;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'buyer', 'vendor'],
      default: 'buyer',
    },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ role: 1, isActive: 1 });

userSchema.methods.comparePassword = async function comparePassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export type UserEntity = InferSchemaType<typeof userSchema>;
export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);
