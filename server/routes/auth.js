import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/verify', authenticateToken, authController.verifyToken);
router.post('/refresh', authenticateToken, authController.refreshToken);
router.post('/change-password', authenticateToken, authController.changePassword);

export default router;
