// backend/routes/report.routes.js
import express from 'express';
import { getProfitLossReport } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/profit-loss', getProfitLossReport);

export default router;