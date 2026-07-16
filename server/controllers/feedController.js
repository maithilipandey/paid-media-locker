import Media from '../models/Media.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

export const getDiscoveryFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = 'recent' } = req.query;
    const skip = (page - 1) * limit;

    let sortQuery = { createdAt: -1 };

    if (sort === 'trending') {
      sortQuery = { views: -1, createdAt: -1 };
    } else if (sort === 'popular') {
      sortQuery = { purchases: -1, createdAt: -1 };
    } else if (sort === 'price_low') {
      sortQuery = { price: 1 };
    } else if (sort === 'price_high') {
      sortQuery = { price: -1 };
    }

    const media = await Media.find({
      status: 'active',
    })
      .populate('creator', 'username displayName profileImage')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await Media.countDocuments({ status: 'active' });

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

export const getFollowingFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id).lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const media = await Media.find({
      creator: { $in: user.following },
      status: 'active',
    })
      .populate('creator', 'username displayName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await Media.countDocuments({
      creator: { $in: user.following },
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

export const getTrendingMedia = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const media = await Media.find({
      status: 'active',
    })
      .populate('creator', 'username displayName profileImage')
      .sort({ views: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    res.json({
      data: media,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    // Get user's purchased media
    const user = await User.findById(req.user.id);

    // Get tags from purchased media (simplified - would be more complex in production)
    const media = await Media.find({
      status: 'active',
    })
      .populate('creator', 'username displayName profileImage')
      .sort({ purchases: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    res.json({
      data: media,
    });
  } catch (error) {
    next(error);
  }
};
