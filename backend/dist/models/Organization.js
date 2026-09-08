"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const organizationSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
organizationSchema.index({ name: 1, status: 1 });
organizationSchema.index({ industry: 1 });
exports.OrganizationModel = mongoose_1.default.model('Organization', organizationSchema);
//# sourceMappingURL=Organization.js.map