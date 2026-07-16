import express from 'express';
import * as walletController from '../controllers/walletController.js';

const router = express.Router();

router.get('/balance', walletController.getWalletBalance);
router.get('/transactions', walletController.getTransactionHistory);
router.get('/stats', walletController.getStats);
router.post('/deposit', walletController.addFunds);
router.post('/withdraw', walletController.withdrawFunds);

export default router;
