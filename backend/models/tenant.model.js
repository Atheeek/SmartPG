import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    // REMOVE unique: true from here. The index below will handle it.
    match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  joiningDate: { type: Date, required: true },
  advancePaid: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  vacatedDate: { type: Date },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
}, { timestamps: true });

// --- THIS IS THE CORRECTED SET OF INDEXES ---

// 1. A phone number must be unique, but only for ACTIVE tenants.
tenantSchema.index(
  { phone: 1, owner: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { isActive: true } 
  }
);

// 2. A bed can only be assigned to one ACTIVE tenant.
tenantSchema.index(
  { bed: 1 },
  { 
    unique: true, 
    partialFilterExpression: { isActive: true } 
  }
);

// 3. An email must be unique if it's provided, but only for ACTIVE tenants.
tenantSchema.index(
  { email: 1, owner: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { email: { $ne: null }, isActive: true } 
  }
);

export default mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);