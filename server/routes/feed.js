import express from 'express';
import * as feedController from '../controllers/feedController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/discover', optionalAuth, feedController.getDiscoveryFeed);
router.get('/following', feedController.getFollowingFeed);
router.get('/trending', feedController.getTrendingMedia);
router.get('/recommendations', feedController.getRecommendations);

export default router;
