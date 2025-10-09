import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, trim: true },
  floor: { type: Number, required: true },
// NEW, CORRECTED LINE
totalBeds: { type: Number, required: true },  roomType: { type: String, trim: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
}, { timestamps: true });
roomSchema.index({ roomNumber: 1, property: 1 }, { unique: true });
export default mongoose.models.Room || mongoose.model('Room', roomSchema);