import mongoose from 'mongoose';
const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
}, { timestamps: true });
export default mongoose.models.Property || mongoose.model('Property', propertySchema);