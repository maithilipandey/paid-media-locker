import User from '../models/User.js';
import Media from '../models/Media.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -auditLog -lastLoginIP')
      .lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get user's media count
    const mediaCount = await Media.countDocuments({
      creator: userId,
      status: 'active',
    });

    // Get user's followers count
    const followerCount = user.followers?.length || 0;

    res.json({
      ...user,
      mediaCount,
      followerCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -auditLog')
      .lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, profileImage } = req.body;

    const updateData = {};

    if (displayName) updateData.displayName = displayName;
    if (bio) updateData.bio = bio;
    if (profileImage) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true },
    ).select('-password -auditLog');

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id.toString()) {
      throw new AppError('Cannot follow yourself', 400);
    }

    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    // Check if already following
    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      currentUser.following.pull(userId);
      targetUser.followers.pull(req.user.id);
    } else {
      currentUser.following.push(userId);
      targetUser.followers.push(req.user.id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? 'User unfollowed' : 'User followed',
      isFollowing: !isFollowing,
      followerCount: targetUser.followers.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate('followers', 'username displayName profileImage')
      .select('followers')
      .lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const followers = user.followers.slice(skip, skip + parseInt(limit, 10));
    const total = user.followers.length;

    res.json({
      data: followers,
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

export const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate('following', 'username displayName profileImage')
      .select('following')
      .lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const following = user.following.slice(skip, skip + parseInt(limit, 10));
    const total = user.following.length;

    res.json({
      data: following,
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

export const searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('username displayName profileImage bio')
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    });

    res.json({
      data: users,
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
