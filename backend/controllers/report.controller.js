// backend/controllers/report.controller.js
import Payment from '../models/payment.model.js';
import Expense from '../models/expense.model.js';
import Property from '../models/property.model.js';
import { startOfMonth, endOfMonth } from 'date-fns';

// In backend/controllers/report.controller.js
export const getProfitLossReport = async (req, res) => {
    try {
        const { propertyId, year, month } = req.query;
        if (!year || !month) return res.status(400).json({ message: 'Year and month are required.' });

        const startDate = startOfMonth(new Date(year, month - 1));
        const endDate = endOfMonth(new Date(year, month - 1));

        let propertyFilter = { owner: req.owner._id };
        if (propertyId && propertyId !== 'all') {
            propertyFilter._id = propertyId;
        }
        
        const properties = await Property.find(propertyFilter).select('_id');
        const propertyIds = properties.map(p => p._id);

        // 1. Get all paid payments for the period
        const paidPayments = await Payment.find({ 
            property: { $in: propertyIds }, 
            status: 'Paid', 
            paymentDate: { $gte: startDate, $lte: endDate } 
        }).populate('tenant', 'fullName');

        const totalIncome = paidPayments.reduce((sum, p) => sum + p.amount, 0);

        // 2. Get all expenses for the period
        const monthlyExpenses = await Expense.find({
            property: { $in: propertyIds },
            date: { $gte: startDate, $lte: endDate }
        }).populate('property', 'name');

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        // 3. Get Expense Breakdown by Category
        const expenseBreakdown = await Expense.aggregate([
            { $match: { property: { $in: propertyIds }, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: '$category', value: { $sum: '$amount' } } },
            { $project: { name: '$_id', value: '$value', _id: 0 } }
        ]);

        res.json({
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            expenseBreakdown,
            incomeSources: paidPayments, // <-- NEW: Send detailed income list
            expenseDetails: monthlyExpenses, // <-- NEW: Send detailed expense list
        });
    } catch (error) {
        console.error("Error generating P/L report:", error);
        res.status(500).json({ message: "Server Error" });
    }
};