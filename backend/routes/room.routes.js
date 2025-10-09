import express from 'express';
import { createRoom, getRoomsByProperty } from '../controllers/room.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// We can protect all routes in this file at once like this
router.use(protect);

router.route('/').post(createRoom).get(getRoomsByProperty);

export default router;