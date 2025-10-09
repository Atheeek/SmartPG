// backend/models/bed.model.js
import mongoose from 'mongoose';

// PART 1: The schema definition (This was likely deleted by mistake)
const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Available', 'Occupied'], default: 'Available' },
  rentAmount: { type: Number, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
}, { timestamps: true });

// PART 2: The index definition
bedSchema.index({ bedNumber: 1, room: 1 }, { unique: true });

// PART 3: The corrected model export
export default mongoose.models.Bed || mongoose.model('Bed', bedSchema);