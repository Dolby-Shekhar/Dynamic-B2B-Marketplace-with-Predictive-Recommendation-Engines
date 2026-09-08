import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true },
    industry: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'pending' },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    taxId: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { timestamps: true },
);

organizationSchema.index({ name: 1, status: 1 });
organizationSchema.index({ industry: 1 });

export type OrganizationDocument = InferSchemaType<typeof organizationSchema>;
export const OrganizationModel: Model<OrganizationDocument> = mongoose.model(
  'Organization',
  organizationSchema,
);
