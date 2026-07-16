import express from 'express';
import * as purchaseController from '../controllers/purchaseController.js';
import { purchaseLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/buy', purchaseLimiter, purchaseController.purchaseMedia);
router.get('/history', purchaseController.getPurchaseHistory);
router.get('/purchased', purchaseController.getPurchasedMedia);
router.get('/sales', purchaseController.getSalesHistory);
router.get('/download/:mediaId', purchaseController.getDownloadUrl);

export default router;
