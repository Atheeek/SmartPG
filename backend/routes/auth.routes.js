import express from 'express';
import { registerOwner, loginOwner } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerOwner);
router.post('/login', loginOwner);

export default router;