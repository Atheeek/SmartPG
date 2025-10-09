// backend/models/expense.model.js
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Utilities', 'Maintenance', 'Salaries', 'Supplies', 'Rent', 'Other'],
  },
  date: { type: Date, required: true, default: Date.now },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);