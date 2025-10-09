import express from 'express';
import {
  generateMonthlyDues,
  // getDuePayments,
  getPaymentsByMonth,
  markAsPaid,getOutstandingPayments,
  getTenantPaymentHistory,getPaymentsForCurrentMonth 
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.post('/generate-dues', generateMonthlyDues);
// router.get('/dues', getDuePayments);
router.get('/current-month', getPaymentsForCurrentMonth); // <-- Add this new route
router.get('/outstanding', getOutstandingPayments);

router.get('/history', getTenantPaymentHistory);
router.get('/by-month', getPaymentsByMonth); // Add this new route

router.put('/:id/mark-paid', markAsPaid);

export default router;