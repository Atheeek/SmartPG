// backend/routes/expense.routes.js
import express from 'express';
import { createExpense, getExpenses,updateExpense, deleteExpense } from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.route('/').post(createExpense).get(getExpenses);
router.route('/:id').put(updateExpense).delete(deleteExpense);


export default router;