import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Owner', 'SuperAdmin'], 
    default: 'Owner' 
  },
   status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
}, { timestamps: true });

// Hash password before saving
ownerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
ownerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Owner || mongoose.model('Owner', ownerSchema);
