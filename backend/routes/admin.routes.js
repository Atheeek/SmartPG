import express from 'express';
import { getAllOwners, updateOwnerStatus } from '../controllers/admin.controller.js';
import { superAdminProtect } from '../middleware/superAdmin.middleware.js';

const router = express.Router();

// This entire router is protected by the superAdminProtect middleware
router.use(superAdminProtect);

router.get('/owners', getAllOwners);
router.put('/owners/:id/status', updateOwnerStatus); // <-- ADD THIS


export default router;