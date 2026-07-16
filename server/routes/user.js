import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateProfile);
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getProfile);
router.post('/:userId/follow', userController.followUser);
router.get('/:userId/followers', userController.getFollowers);
router.get('/:userId/following', userController.getFollowing);

export default router;
