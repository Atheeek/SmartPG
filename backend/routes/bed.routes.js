import express from 'express';
import { createBed, getBedsByRoom,resetOrphanedBeds ,updateBed, deleteBed,getAvailableBeds  } from '../controllers/bed.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All bed routes are protected
router.use(protect);

router.route('/').post(createBed).get(getBedsByRoom);
router.post('/reset-statuses', resetOrphanedBeds);
// ADD an UPDATE and DELETE route for a specific bed ID
router.route('/:id').put(updateBed).delete(deleteBed);
router.get('/available', getAvailableBeds); // Add this line

router.post('/reset-statuses', resetOrphanedBeds);

export default router;