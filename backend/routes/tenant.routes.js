import express from 'express';
import { createTenant, getTenantsByProperty, vacateTenant,updateTenant,getTenantDetails ,getAllTenants ,transferTenant  } from '../controllers/tenant.controller.js';
import { protect } from '../middleware/auth.middleware.js';
const router = express.Router();

router.use(protect);


router.route('/')
  .post(createTenant)
  .get(getTenantsByProperty);
  
router.route('/:id/vacate').put(vacateTenant);
router.route('/:id').put(updateTenant);
router.get('/:id/details', getTenantDetails);
router.get('/all', getAllTenants);
// In backend/routes/tenant.routes.js
router.put('/:id/transfer', transferTenant); // Add this line

export default router;