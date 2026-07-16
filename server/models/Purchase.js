import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    // Wallet deduction record
    walletTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WalletTransaction',
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Access expiry
    accessExpiresAt: {
      type: Date,
      default: null, // Null means permanent access
    },
    // Immutable transaction record (blockchain-inspired)
    transactionHash: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Audit trail
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    refundedAt: Date,
    // Security: prevent duplicate purchases
    ipAddress: String,
    userAgent: String,
    // Metadata
    notes: String,
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
purchaseSchema.index({ buyer: 1, status: 1 });
purchaseSchema.index({ seller: 1, status: 1 });
purchaseSchema.index({ media: 1 });
purchaseSchema.index({ purchasedAt: -1 });
purchaseSchema.index({ transactionHash: 1 });

// Method to generate transaction hash (blockchain-inspired immutable record)
purchaseSchema.methods.generateTransactionHash = function generateHash() {
  const data = `${this.purchaseId}:${this.buyer}:${this.media}:${this.amount}:${this.purchasedAt}`;
  const hash = require('crypto')
    .createHash('sha256')
    .update(data)
    .digest('hex');
  this.transactionHash = hash;
  return hash;
};

export default mongoose.model('Purchase', purchaseSchema);
