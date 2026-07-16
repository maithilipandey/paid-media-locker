import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../server/models/User.js';
import Media from '../server/models/Media.js';
import Purchase from '../server/models/Purchase.js';
import WalletTransaction from '../server/models/WalletTransaction.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/paid-media-locker';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Media.deleteMany({});
    await Purchase.deleteMany({});
    await WalletTransaction.deleteMany({});

    // Create demo users
    console.log('Creating users...');
    const users = [
      {
        username: 'demo_user',
        email: 'demo@example.com',
        password: 'demo123456',
        displayName: 'Demo User',
        bio: 'A demo user exploring the platform',
        walletBalance: 100,
        role: 'user',
        isVerified: true,
      },
      {
        username: 'creator_alice',
        email: 'alice@example.com',
        password: 'alice123456',
        displayName: 'Alice Creator',
        bio: 'Professional photographer and videographer',
        walletBalance: 500,
        role: 'creator',
        isVerified: true,
      },
      {
        username: 'creator_bob',
        email: 'bob@example.com',
        password: 'bob123456',
        displayName: 'Bob Designer',
        bio: 'Digital designer and artist',
        walletBalance: 300,
        role: 'creator',
        isVerified: true,
      },
      {
        username: 'collector_charlie',
        email: 'charlie@example.com',
        password: 'charlie123456',
        displayName: 'Charlie Collector',
        bio: 'Art collector and curator',
        walletBalance: 250,
        role: 'user',
        isVerified: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create demo media
    console.log('Creating media...');
    const mediaItems = [
      {
        title: 'Sunset Over Mountains',
        description: 'Beautiful sunset photography taken at high altitude',
        creator: createdUsers[1]._id, // alice
        mediaType: 'image',
        contentType: 'image/jpeg',
        fileSize: 2500000,
        originalKey: 'media/sunset/original.jpg',
        previewKey: 'media/sunset/preview.jpg',
        thumbnailKey: 'media/sunset/thumb.jpg',
        price: 9.99,
        views: 142,
        purchases: 5,
        likes: [createdUsers[0]._id, createdUsers[3]._id],
        tags: ['landscape', 'photography', 'nature'],
        width: 4000,
        height: 3000,
        status: 'active',
      },
      {
        title: 'Urban Architecture',
        description: 'Modern building design and architectural photography',
        creator: createdUsers[1]._id, // alice
        mediaType: 'image',
        contentType: 'image/jpeg',
        fileSize: 3100000,
        originalKey: 'media/architecture/original.jpg',
        previewKey: 'media/architecture/preview.jpg',
        thumbnailKey: 'media/architecture/thumb.jpg',
        price: 14.99,
        views: 89,
        purchases: 2,
        likes: [createdUsers[0]._id],
        tags: ['architecture', 'urban', 'photography'],
        width: 3840,
        height: 2160,
        status: 'active',
      },
      {
        title: 'Abstract Digital Art',
        description: 'Stunning abstract digital artwork with unique colors and patterns',
        creator: createdUsers[2]._id, // bob
        mediaType: 'image',
        contentType: 'image/png',
        fileSize: 1800000,
        originalKey: 'media/abstract/original.png',
        previewKey: 'media/abstract/preview.png',
        thumbnailKey: 'media/abstract/thumb.png',
        price: 19.99,
        views: 234,
        purchases: 8,
        likes: [createdUsers[0]._id, createdUsers[3]._id, createdUsers[1]._id],
        tags: ['art', 'digital', 'abstract'],
        width: 2560,
        height: 1440,
        status: 'active',
      },
      {
        title: 'Minimalist Design',
        description: 'Clean and minimalist design elements for your projects',
        creator: createdUsers[2]._id, // bob
        mediaType: 'image',
        contentType: 'image/png',
        fileSize: 950000,
        originalKey: 'media/minimalist/original.png',
        previewKey: 'media/minimalist/preview.png',
        thumbnailKey: 'media/minimalist/thumb.png',
        price: 7.99,
        views: 567,
        purchases: 15,
        likes: [createdUsers[0]._id, createdUsers[3]._id],
        tags: ['design', 'minimalist', 'modern'],
        width: 1920,
        height: 1080,
        status: 'active',
      },
    ];

    const createdMedia = await Media.insertMany(mediaItems);
    console.log(`Created ${createdMedia.length} media items`);

    // Create sample purchases
    console.log('Creating purchases...');
    const purchases = [
      {
        buyer: createdUsers[0]._id, // demo_user
        media: createdMedia[0]._id, // sunset
        seller: createdUsers[1]._id, // alice
        amount: 9.99,
        status: 'completed',
        purchasedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        buyer: createdUsers[0]._id, // demo_user
        media: createdMedia[2]._id, // abstract art
        seller: createdUsers[2]._id, // bob
        amount: 19.99,
        status: 'completed',
        purchasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        buyer: createdUsers[3]._id, // charlie
        media: createdMedia[1]._id, // architecture
        seller: createdUsers[1]._id, // alice
        amount: 14.99,
        status: 'completed',
        purchasedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdPurchases = await Purchase.insertMany(purchases);
    console.log(`Created ${createdPurchases.length} purchases`);

    // Create wallet transactions
    console.log('Creating wallet transactions...');
    const transactions = [
      {
        user: createdUsers[0]._id, // demo_user
        type: 'purchase',
        amount: -9.99,
        status: 'completed',
        description: 'Purchase of media: Sunset Over Mountains',
        relatedPurchase: createdPurchases[0]._id,
        relatedMedia: createdMedia[0]._id,
        initiatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        user: createdUsers[0]._id, // demo_user
        type: 'purchase',
        amount: -19.99,
        status: 'completed',
        description: 'Purchase of media: Abstract Digital Art',
        relatedPurchase: createdPurchases[1]._id,
        relatedMedia: createdMedia[2]._id,
        initiatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        user: createdUsers[1]._id, // alice
        type: 'commission',
        amount: 8.99, // 90% of 9.99
        status: 'completed',
        description: 'Sale of media: Sunset Over Mountains',
        relatedPurchase: createdPurchases[0]._id,
        relatedMedia: createdMedia[0]._id,
        initiatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        user: createdUsers[2]._id, // bob
        type: 'commission',
        amount: 17.99, // 90% of 19.99
        status: 'completed',
        description: 'Sale of media: Abstract Digital Art',
        relatedPurchase: createdPurchases[1]._id,
        relatedMedia: createdMedia[2]._id,
        initiatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdTransactions = await WalletTransaction.insertMany(transactions);
    console.log(`Created ${createdTransactions.length} wallet transactions`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo Credentials:');
    console.log('  Username: demo_user');
    console.log('  Email: demo@example.com');
    console.log('  Password: demo123456');
    console.log('  Initial Balance: $100.00\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
