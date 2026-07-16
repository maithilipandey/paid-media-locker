import Media from '../models/Media.js';
import User from '../models/User.js';
import S3Service from '../services/s3Service.js';
import ImageService from '../services/imageService.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const uploadMedia = async (req, res, next) => {
  try {
    const { title, description, price, tags } = req.body;
    const file = req.file;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    if (!title || price === undefined) {
      throw new AppError('Title and price are required', 400);
    }

    // Validate file type
    const allowedTypes = (process.env.ALLOWED_MEDIA_TYPES || 'image/jpeg,image/png').split(',');
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError('File type not allowed', 400);
    }

    // Validate file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '50000000', 10);
    if (file.size > maxSize) {
      throw new AppError('File size exceeds limit', 400);
    }

    // Determine media type
    const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Process and upload media
    const mediaId = uuidv4();
    let uploadResult = {};

    if (mediaType === 'image') {
      uploadResult = await ImageService.uploadProcessedImages(
        file.buffer,
        file.mimetype,
        mediaId,
      );
    } else {
      // For videos, just upload original
      const originalKey = await S3Service.uploadFile(
        file.buffer,
        file.mimetype,
        `media/${mediaId}/original`,
      );
      uploadResult = { originalKey };
    }

    // Create media record
    const media = new Media({
      title,
      description: description || '',
      creator: req.user.id,
      mediaType,
      contentType: file.mimetype,
      fileSize: file.size,
      originalKey: uploadResult.originalKey,
      previewKey: uploadResult.previewKey,
      thumbnailKey: uploadResult.thumbnailKey,
      price: parseFloat(price),
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      width: uploadResult.metadata?.width,
      height: uploadResult.metadata?.height,
    });

    // Generate transaction hash
    media.generateTransactionHash();
    await media.save();

    // Update user's media count
    await User.findByIdAndUpdate(req.user.id, { $inc: { mediaCount: 1 } });

    res.status(201).json({
      message: 'Media uploaded successfully',
      media,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id)
      .populate('creator', 'username displayName profileImage')
      .lean();

    if (!media) {
      throw new AppError('Media not found', 404);
    }

    // Increment view count
    await Media.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json(media);
  } catch (error) {
    next(error);
  }
};

export const getCreatorMedia = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const media = await Media.find({
      creator: creatorId,
      status: 'active',
    })
      .populate('creator', 'username displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await Media.countDocuments({
      creator: creatorId,
      status: 'active',
    });

    res.json({
      data: media,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      throw new AppError('Media not found', 404);
    }

    if (media.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Not authorized to delete this media', 403);
    }

    // Delete from S3
    await Promise.all([
      S3Service.deleteFile(media.originalKey),
      media.thumbnailKey && S3Service.deleteFile(media.thumbnailKey),
      media.previewKey && S3Service.deleteFile(media.previewKey),
    ]);

    media.status = 'deleted';
    media.deletedAt = new Date();
    await media.save();

    res.json({
      message: 'Media deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const likeMedia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      throw new AppError('Media not found', 404);
    }

    const likeIndex = media.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      media.likes.splice(likeIndex, 1);
    } else {
      media.likes.push(req.user.id);
    }

    await media.save();

    res.json({
      message: likeIndex > -1 ? 'Like removed' : 'Media liked',
      likes: media.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

export const searchMedia = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const skip = (page - 1) * limit;

    const media = await Media.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
      status: 'active',
    })
      .populate('creator', 'username displayName')
      .sort({ views: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await Media.countDocuments({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
      status: 'active',
    });

    res.json({
      data: media,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateTransactionHash = (mediaData) => {
  const data = `${mediaData.title}:${mediaData.creator}:${mediaData.price}:${mediaData.uploadedAt}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};
