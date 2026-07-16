import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    // Original file (private, encrypted)
    originalKey: {
      type: String,
      required: true,
    },
    // Preview image (public)
    previewKey: String,
    previewUrl: String,
    // Thumbnail (public)
    thumbnailKey: String,
    thumbnailUrl: String,
    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    // Access control
    accessType: {
      type: String,
      enum: ['free', 'paid', 'subscribers_only'],
      default: 'paid',
    },
    // Metadata
    width: Number,
    height: Number,
    duration: Number, // For videos, in seconds
    // Engagement
    views: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Number,
      default: 0,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // Status
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    // Audit fields
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    deletedAt: Date,
    // Immutable transaction record (blockchain-inspired)
    transactionHash: {
      type: String,
      unique: true,
      sparse: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
mediaSchema.index({ creator: 1, status: 1 });
mediaSchema.index({ status: 1, price: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ tags: 1 });

export default mongoose.model('Media', mediaSchema);
