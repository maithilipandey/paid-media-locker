import Purchase from '../models/Purchase.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Media from '../models/Media.js';
import User from '../models/User.js';
import S3Service from '../services/s3Service.js';
import { AppError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

// Prevent duplicate purchases - check recent transactions
const checkDuplicatePurchase = async (userId, mediaId) => {
  const existingPurchase = await Purchase.findOne({
    buyer: userId,
    media: mediaId,
    status: 'completed',
  });

  return !!existingPurchase;
};

export const purchaseMedia = async (req, res, next) => {
  const session = await Purchase.startSession();
  session.startTransaction();

  try {
    const { mediaId } = req.body;
    const buyerId = req.user.id;

    if (!mediaId) {
      throw new AppError('Media ID is required', 400);
    }

    // Fetch media with session
    const media = await Media.findById(mediaId).session(session);

    if (!media) {
      throw new AppError('Media not found', 404);
    }

    if (media.status !== 'active') {
      throw new AppError('Media is not available', 400);
    }

    // Check for duplicate purchase
    const isDuplicate = await checkDuplicatePurchase(buyerId, mediaId);
    if (isDuplicate) {
      throw new AppError('You have already purchased this media', 400);
    }

    // Fetch buyer
    const buyer = await User.findById(buyerId).session(session);

    if (!buyer) {
      throw new AppError('Buyer not found', 404);
    }

    // Check wallet balance
    if (buyer.walletBalance < media.price) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    // Create purchase record
    const purchase = new Purchase({
      buyer: buyerId,
      media: mediaId,
      seller: media.creator,
      amount: media.price,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'pending',
    });

    purchase.generateTransactionHash();
    await purchase.save({ session });

    // Create wallet transaction
    const walletTransaction = new WalletTransaction({
      user: buyerId,
      type: 'purchase',
      amount: -media.price,
      description: `Purchase of media: ${media.title}`,
      relatedPurchase: purchase._id,
      relatedMedia: mediaId,
      status: 'pending',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    walletTransaction.generateTransactionHash();
    await walletTransaction.save({ session });

    // Update buyer wallet
    await User.findByIdAndUpdate(
      buyerId,
      { $inc: { walletBalance: -media.price } },
      { session },
    );

    // Update seller wallet (commission: 90% to seller, 10% platform fee)
    const sellerAmount = media.price * 0.9;
    const sellerTransaction = new WalletTransaction({
      user: media.creator,
      type: 'commission',
      amount: sellerAmount,
      description: `Sale of media: ${media.title}`,
      relatedPurchase: purchase._id,
      relatedMedia: mediaId,
      status: 'completed',
    });

    sellerTransaction.generateTransactionHash();
    await sellerTransaction.save({ session });

    await User.findByIdAndUpdate(
      media.creator,
      { $inc: { walletBalance: sellerAmount } },
      { session },
    );

    // Update media purchase count
    await Media.findByIdAndUpdate(
      mediaId,
      { $inc: { purchases: 1 } },
      { session },
    );

    // Mark purchase as completed
    purchase.status = 'completed';
    purchase.completedAt = new Date();
    walletTransaction.status = 'completed';
    walletTransaction.completedAt = new Date();

    await purchase.save({ session });
    await walletTransaction.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.json({
      message: 'Purchase successful',
      purchase,
      transactionHash: purchase.transactionHash,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

export const getPurchaseHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const purchases = await Purchase.find({
      buyer: req.user.id,
      status: 'completed',
    })
      .populate('media', 'title thumbnail Creator')
      .populate('seller', 'username displayName')
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await Purchase.countDocuments({
      buyer: req.user.id,
      status: 'completed',
    });

    res.json({
      data: purchases,
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

export const getDownloadUrl = async (req, res, next) => {
  try {
    const { mediaId } = req.params;

    // Check if user has purchased this media
    const purchase = await Purchase.findOne({
      buyer: req.user.id,
      media: mediaId,
      status: 'completed',
    });

    if (!purchase) {
      throw new AppError('You have not purchased this media', 403);
    }

    // Check if access has expired (if applicable)
    if (purchase.accessExpiresAt && new Date() > purchase.accessExpiresAt) {
      throw new AppError('Access to this media has expired', 403);
    }

    // Fetch media
    const media = await Media.findById(mediaId);

    if (!media) {
      throw new AppError('Media not found', 404);
    }

    // Generate signed URL
    const signedUrl = await S3Service.getSignedUrl(media.originalKey, req.user.id);

    res.json({
      url: signedUrl.url,
      expiresAt: signedUrl.expiresAt,
      mediaTitle: media.title,
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchasedMedia = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const purchases = await Purchase.find({
      buyer: req.user.id,
      status: 'completed',
    })
      .populate({
        path: 'media',
        select: 'title thumbnailKey previewKey mediaType price',
      })
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await Purchase.countDocuments({
      buyer: req.user.id,
      status: 'completed',
    });

    res.json({
      data: purchases,
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

export const getSalesHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const sales = await Purchase.find({
      seller: req.user.id,
      status: 'completed',
    })
      .populate('buyer', 'username displayName')
      .populate('media', 'title price')
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await Purchase.countDocuments({
      seller: req.user.id,
      status: 'completed',
    });

    const totalEarnings = await Purchase.aggregate([
      { $match: { seller: req.user.id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      data: sales,
      totalEarnings: totalEarnings[0]?.total || 0,
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
