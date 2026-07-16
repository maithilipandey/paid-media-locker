import express from 'express';
import multer from 'multer';
import * as mediaController from '../controllers/mediaController.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', uploadLimiter, upload.single('file'), mediaController.uploadMedia);
router.get('/search', mediaController.searchMedia);
router.get('/:id', mediaController.getMedia);
router.get('/creator/:creatorId', mediaController.getCreatorMedia);
router.delete('/:id', mediaController.deleteMedia);
router.post('/:id/like', mediaController.likeMedia);

export default router;
