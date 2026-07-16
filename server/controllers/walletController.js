import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { AppError } from '../middleware/errorHandler.js';

export const getWalletBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance email');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      balance: user.walletBalance,
      currency: 'USD',
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (type) {
      query.type = type;
    }

    const transactions = await WalletTransaction.find(query)
      .populate('relatedPurchase', 'purchaseId amount')
      .populate('relatedMedia', 'title')
      .sort({ initiatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await WalletTransaction.countDocuments(query);

    res.json({
      data: transactions,
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

export const addFunds = async (req, res, next) => {
  const session = await WalletTransaction.startSession();
  session.startTransaction();

  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    if (!paymentMethod) {
      throw new AppError('Payment method is required', 400);
    }

    const user = await User.findById(req.user.id).session(session);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create wallet transaction
    const transaction = new WalletTransaction({
      user: req.user.id,
      type: 'deposit',
      amount: parseFloat(amount),
      status: 'pending',
      paymentMethod,
      description: `Deposit via ${paymentMethod}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    transaction.generateTransactionHash();
    await transaction.save({ session });

    // In production, this would integrate with a payment gateway
    // For now, we'll auto-complete after validation
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save({ session });

    // Update user wallet
    user.walletBalance += parseFloat(amount);
    await user.save({ session });

    await session.commitTransaction();

    res.json({
      message: 'Funds added successfully',
      newBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

export const withdrawFunds = async (req, res, next) => {
  const session = await WalletTransaction.startSession();
  session.startTransaction();

  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    if (!paymentMethod) {
      throw new AppError('Payment method is required', 400);
    }

    const user = await User.findById(req.user.id).session(session);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.walletBalance < parseFloat(amount)) {
      throw new AppError('Insufficient balance', 400);
    }

    // Create wallet transaction
    const transaction = new WalletTransaction({
      user: req.user.id,
      type: 'withdrawal',
      amount: -parseFloat(amount),
      status: 'completed',
      paymentMethod,
      description: `Withdrawal via ${paymentMethod}`,
      completedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    transaction.generateTransactionHash();
    await transaction.save({ session });

    // Update user wallet
    user.walletBalance -= parseFloat(amount);
    await user.save({ session });

    await session.commitTransaction();

    res.json({
      message: 'Withdrawal successful',
      newBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

export const getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const totalSpent = await WalletTransaction.aggregate([
      {
        $match: {
          user: user._id,
          type: 'purchase',
          status: 'completed',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalEarned = await WalletTransaction.aggregate([
      {
        $match: {
          user: user._id,
          type: 'commission',
          status: 'completed',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      balance: user.walletBalance,
      totalSpent: Math.abs(totalSpent[0]?.total || 0),
      totalEarned: totalEarned[0]?.total || 0,
      currency: 'USD',
    });
  } catch (error) {
    next(error);
  }
};
