import express from 'express';
import { createProperty , getPropertyDetails , getProperties , getDashboardStats,bulkAddRoomsAndBeds ,getHistoricalStats  } from '../controllers/property.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Apply protection to all routes in this file


// Applying the 'protect' middleware to these routes
router.route('/').post(protect, createProperty).get(protect, getProperties);
router.route('/:id/details').get(protect, getPropertyDetails);
router.get('/stats', getDashboardStats);
router.post('/:id/bulk-add', bulkAddRoomsAndBeds);
router.get('/stats/historical', getHistoricalStats);




export default router;