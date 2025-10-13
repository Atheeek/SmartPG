// backend/models/payment.model.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true }, // <-- REPLACED month and year
  status: { type: String, 
    enum: ['Paid', 'Due', 'Vacated'], // <-- ADD 'Vacated'
     default: 'Due' },
  paymentDate: { type: Date },
}, { timestamps: true });

// We are now indexing by tenant and the new dueDate field
paymentSchema.index({ tenant: 1, dueDate: 1 }, { unique: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);