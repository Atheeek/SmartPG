// backend/models/tenant.model.js
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    unique: true,
    // NEW: Add validation for exactly 10 digits
    match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    // unique: true is removed from here
  },
  joiningDate: { type: Date, required: true },
  advancePaid: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
    vacatedDate: { type: Date }, // <-- ADD THIS

  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
}, { timestamps: true });

// Index for the 'bed' field (Partial Index)
tenantSchema.index(
  { bed: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// UPDATED: Index for the 'email' field (now a proper Partial Index)
// This enforces uniqueness but allows multiple tenants to have a null email.
tenantSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $ne: null } } }
);

export default mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);