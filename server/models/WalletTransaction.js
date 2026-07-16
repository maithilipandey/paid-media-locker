import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const walletTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'purchase', 'refund', 'commission'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    // Reference to related entity
    relatedPurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
    },
    relatedMedia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
    },
    // For deposits/withdrawals
    paymentMethod: String,
    externalTransactionId: String,
    // Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    // Reason/description
    description: String,
    // Immutable transaction record
    transactionHash: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Audit
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    failedAt: Date,
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
walletTransactionSchema.index({ user: 1, type: 1 });
walletTransactionSchema.index({ user: 1, status: 1 });
walletTransactionSchema.index({ initiatedAt: -1 });
walletTransactionSchema.index({ transactionHash: 1 });

// Method to generate transaction hash
walletTransactionSchema.methods.generateTransactionHash = function generateHash() {
  const data = `${this.transactionId}:${this.user}:${this.type}:${this.amount}:${this.initiatedAt}`;
  const hash = require('crypto')
    .createHash('sha256')
    .update(data)
    .digest('hex');
  this.transactionHash = hash;
  return hash;
};

export default mongoose.model('WalletTransaction', walletTransactionSchema);
