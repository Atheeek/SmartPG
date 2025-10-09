// backend/controllers/expense.controller.js
import Expense from '../models/expense.model.js';
import Property from '../models/property.model.js';
import { startOfMonth, endOfMonth } from 'date-fns';

export const createExpense = async (req, res) => {
    try {
        const { description, amount, category, date, propertyId } = req.body;
        const property = await Property.findById(propertyId);
        if (!property || property.owner.toString() !== req.owner._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const expense = await Expense.create({
            description, amount, category, date,
            property: propertyId,
            owner: req.owner._id,
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: `Error creating expense: ${error.message}` });
    }
};

export const getExpenses = async (req, res) => {
    try {
        const { propertyId, year, month } = req.query;
        const ownerId = req.owner._id;

        const startDate = startOfMonth(new Date(year, month - 1));
        const endDate = endOfMonth(new Date(year, month - 1));

        let propertyFilter = { owner: ownerId };
        if (propertyId && propertyId !== 'all') {
            propertyFilter._id = propertyId;
        }
        
        const ownerProperties = await Property.find(propertyFilter).select('_id');
        const propertyIds = ownerProperties.map(p => p._id);

        const expenses = await Expense.find({
            property: { $in: propertyIds },
            date: { $gte: startDate, $lte: endDate }
        }).populate('property', 'name').sort({ date: -1 });

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// Add these two new functions to backend/controllers/expense.controller.js
// The new diagnostic version of updateExpense
// A TEMPORARY DIAGNOSTIC version of updateExpense
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        if (expense.owner.toString() !== req.owner._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { description, amount, category, date, propertyId } = req.body;
        expense.description = description !== undefined ? description : expense.description;
        expense.amount = amount !== undefined ? amount : expense.amount;
        expense.category = category !== undefined ? category : expense.category;
        expense.date = date !== undefined ? date : expense.date;
        expense.property = propertyId !== undefined ? propertyId : expense.property;
        const updatedExpense = await expense.save();
        res.json(updatedExpense);
    } catch (error) {
        res.status(400).json({ message: `Error updating expense: ${error.message}` });
    }
};
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        if (expense.owner.toString() !== req.owner._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await expense.deleteOne();
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};