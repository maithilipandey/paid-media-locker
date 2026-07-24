# Paid Media Locker

A secure, decentralized media marketplace with blockchain-inspired immutable transaction records, enabling creators to sell exclusive content and manage a digital wallet economy.

## Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with password hashing
- **Media Upload**: Support for images and videos with automatic processing
- **Wallet System**: Virtual wallet with deposit/withdrawal capabilities
- **Purchase System**: Atomic transactions with immutable records
- **Feed Discovery**: Algorithm-driven content discovery and recommendations
- **Social Features**: Follow creators and interact with their content
- **User Profiles**: Customizable creator profiles with media galleries

### Security Features
- **Immutable Transaction Records**: Blockchain-inspired SHA-256 hashing for transactions
- **Secure File Storage**: AES-256 encryption for media files in S3
- **Signed URLs**: Time-limited (15 minutes) S3 download links bound to user IDs
- **Duplicate Purchase Prevention**: Prevents re-purchasing the same media
- **Rate Limiting**: Progressive rate limiting on sensitive endpoints
- **SQL Injection Protection**: Parameterized queries and input validation
- **Audit Logging**: Complete audit trail for sensitive operations
- **CORS Protection**: Configurable cross-origin resource sharing
- 
### Advanced Features
- **Image Processing**: Automatic thumbnail and preview generation
- **Pagination**: Efficient data fetching with configurable page sizes
- **Search**: Full-text search across media and users
- **Caching**: Redis integration for performance optimization
- **Docker Support**: Production-ready Docker and docker-compose configuration
- **CI/CD Ready**: GitHub Actions workflow templates included

## Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs password hashing
- **File Storage**: AWS S3 with local s3rver for development
- **Image Processing**: Sharp
- **Caching**: Redis
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet.js, CORS

### DevOps
- **Containerization**: Docker & Docker Compose
- **Logging**: Morgan HTTP logger
- **Testing**: Jest with Supertest
- **Linting**: ESLint with Airbnb config

## Installation

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Redis 6.0+
- AWS S3 credentials (or local s3rver for development)

### Local Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd paid-media-locker
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB locally** (if not using Docker)
```bash
mongod
```

5. **Start Redis locally** (if not using Docker)
```bash
redis-server
```

6. **Start S3 Local** (if using s3rver)
```bash
s3rver --port 9000 --directory ./s3_data
```

7. **Seed database with demo data** (optional)
```bash
pnpm run seed
```

8. **Start development server**
```bash
pnpm run dev
```

The API will be available at `http://localhost:5000`

---

### Docker Setup

1. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- S3rver (local S3) on port 9000
- Express API on port 5000

2. **Seed database** (inside container)
```bash
docker-compose exec app pnpm run seed
```

3. **View logs**
```bash
docker-compose logs -f app
```

4. **Stop services**
```bash
docker-compose down
```

---

## Environment Variables

Create a `.env` file based on `.env.example`:

```
# Database
MONGODB_URI=mongodb://localhost:27017/paid-media-locker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=paid-media-locker
S3_USE_LOCAL=false

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=5000
NODE_ENV=development

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# File Upload
MAX_FILE_SIZE=50000000
ALLOWED_MEDIA_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime

# URLs
SIGNED_URL_EXPIRY=900

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## API Endpoints

Full API documentation available in `API_DOCUMENTATION.md`

### Quick Reference

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/change-password` - Change password

**Media**
- `POST /api/media/upload` - Upload media
- `GET /api/media/:id` - Get media details
- `GET /api/media/creator/:creatorId` - Get creator's media
- `GET /api/media/search?q=query` - Search media
- `DELETE /api/media/:id` - Delete media
- `POST /api/media/:id/like` - Like media

**Wallet**
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/deposit` - Add funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/stats` - Get wallet statistics

**Purchases**
- `POST /api/purchases/buy` - Purchase media
- `GET /api/purchases/history` - Get purchase history
- `GET /api/purchases/purchased` - Get purchased media
- `GET /api/purchases/sales` - Get sales history
- `GET /api/purchases/download/:mediaId` - Get download URL

**Feed**
- `GET /api/feed/discover` - Discover media
- `GET /api/feed/following` - Following feed
- `GET /api/feed/trending` - Trending media
- `GET /api/feed/recommendations` - Recommendations

**Users**
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/:userId` - Get user profile
- `POST /api/users/:userId/follow` - Follow user
- `GET /api/users/:userId/followers` - Get followers
- `GET /api/users/:userId/following` - Get following
- `GET /api/users/search?q=query` - Search users

---

## Database Schema

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  displayName: String,
  bio: String,
  profileImage: String,
  walletBalance: Number,
  role: String (user, creator, admin),
  followers: [ObjectId],
  following: [ObjectId],
  auditLog: [...],
  lastLogin: Date,
  createdAt: Date
}
```

### Media
```javascript
{
  title: String,
  description: String,
  creator: ObjectId,
  mediaType: String (image, video),
  contentType: String,
  originalKey: String (S3),
  previewKey: String (S3),
  thumbnailKey: String (S3),
  price: Number,
  views: Number,
  purchases: Number,
  likes: [ObjectId],
  transactionHash: String (SHA-256),
  tags: [String],
  status: String,
  createdAt: Date
}
```

### Purchase
```javascript
{
  purchaseId: String (UUID),
  buyer: ObjectId,
  media: ObjectId,
  seller: ObjectId,
  amount: Number,
  status: String (pending, completed, failed, refunded),
  transactionHash: String (SHA-256),
  purchasedAt: Date,
  createdAt: Date
}
```

### WalletTransaction
```javascript
{
  transactionId: String (UUID),
  user: ObjectId,
  type: String (deposit, withdrawal, purchase, refund, commission),
  amount: Number,
  status: String (pending, completed, failed, cancelled),
  description: String,
  transactionHash: String (SHA-256),
  initiatedAt: Date,
  completedAt: Date,
  createdAt: Date
}
```

---

## Security Considerations

### File Storage Security
- Original media files are encrypted at rest using AES-256 in S3
- Only authenticated users can request signed download URLs
- Signed URLs expire after 15 minutes and are bound to user IDs
- Duplicate purchase checks prevent unauthorized access

### Transaction Security
- All transactions generate immutable SHA-256 hashes (blockchain-inspired)
- Atomic database transactions ensure consistency
- Wallet balance changes are atomic with purchase records
- 90/10 commission split is enforced at transaction time

### Authentication Security
- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens expire after 7 days
- Token refresh mechanism for extended sessions
- Audit logging tracks all sensitive operations

### API Security
- Rate limiting prevents brute force and DoS attacks
- CORS is configured for specific origins
- Helmet.js enables security headers (CSP, X-Frame-Options, etc.)
- Input validation using Joi before processing
- Parameterized queries prevent SQL injection

### Development Security
- Environment variables are never committed to git
- Separate configs for development, staging, production
- HTTPS recommended for production
- MongoDB authentication enabled

---

## Testing

### Run Tests
```bash
pnpm test
```

### Run Tests with Coverage
```bash
pnpm test:coverage
```

### Watch Mode
```bash
pnpm test:watch
```

---

## Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Production
pnpm start           # Start production server

# Database
pnpm seed            # Seed database with demo data

# Quality
pnpm lint            # Run ESLint
pnpm test            # Run Jest tests
pnpm test:watch     # Run Jest in watch mode

# Docker
pnpm docker:build    # Build Docker image
pnpm docker:run      # Run with Docker Compose

# Documentation
pnpm docs            # Generate API docs
```

---

## Demo Credentials

Pre-seeded demo account:
```
Username: demo_user
Email: demo@example.com
Password: demo123456
Initial Balance: $100.00
```

Create additional accounts via the registration endpoint.

---

## Deployment

### Production Checklist
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Use managed MongoDB (Atlas, DocumentDB)
- [ ] Use managed Redis (ElastiCache, Upstash)
- [ ] Use real AWS S3 bucket with proper IAM
- [ ] Enable HTTPS/TLS
- [ ] Set up proper logging and monitoring
- [ ] Configure backups and disaster recovery
- [ ] Set up CI/CD pipeline
- [ ] Run security audit
- [ ] Load test the API

### Deployment Options
- AWS EC2 + RDS + ElastiCache + S3
- Heroku with add-ons
- DigitalOcean App Platform
- Self-hosted Kubernetes cluster

---

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh --version
# Start MongoDB
mongod
```

### S3 Upload Failures
```bash
# Check AWS credentials
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
# Check S3 bucket exists and is accessible
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Docker Issues
```bash
# Rebuild containers
docker-compose down --volumes
docker-compose up --build
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## License

MIT License - see LICENSE file for details

---

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

## Roadmap

- [ ] React Native mobile app
- [ ] Advanced analytics dashboard
- [ ] Subscription tiers for creators
- [ ] Payment gateway integration (Stripe)
- [ ] Content moderation system
- [ ] Two-factor authentication
- [ ] Blockchain settlement layer
- [ ] Real-time notifications
- [ ] Video streaming optimization
- [ ] Geographic distribution (CDN)
