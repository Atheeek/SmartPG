// backend/models/tenant.model.js
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    // REMOVE unique: true from here. The index below will handle it.
    match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number'],
  },
  email: { /* ... same as before ... */ },
  joiningDate: { type: Date, required: true },
  advancePaid: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  vacatedDate: { type: Date },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true }, // <-- ADD THIS
}, { timestamps: true });

// --- UPDATED INDEXES ---
// The combination of a phone number AND an owner must be unique.
tenantSchema.index({ phone: 1, owner: 1 }, { unique: true });

tenantSchema.index({ bed: 1 }, { unique: true, partialFilterExpression: { isActive: true } });
tenantSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $ne: null } } });

export default mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);