import express from 'express';
// We only import the functions we are actually using
import { 
    createProperty, 
    getProperties, 
    getPropertyDetails, 
    getHistoricalStats, 
    bulkAddRoomsAndBeds, 
    updateProperty, 
    deleteProperty 
} from '../controllers/property.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// This one line protects ALL routes defined in this file.
// Any request to /api/properties/* will now go through this security check first.
router.use(protect);

// Routes for the main collection (/api/properties)
router.route('/')
    .get(getProperties)
    .post(createProperty);

// Specific routes must come BEFORE dynamic routes with an :id
router.get('/stats/historical', getHistoricalStats);

// Routes that operate on a specific property by its ID (/api/properties/:id)
router.route('/:id')
    .put(updateProperty)
    .delete(deleteProperty);

// More specific routes for a single property
router.get('/:id/details', getPropertyDetails);
router.post('/:id/bulk-add', bulkAddRoomsAndBeds);

export default router;