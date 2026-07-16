# Paid Media Locker - Quick Start Guide

Get up and running in 5 minutes!

## Option 1: Docker (Easiest)

### Prerequisites
- Docker and Docker Compose installed
- 5GB disk space for containers

### Steps

1. **Clone and navigate**
   ```bash
   cd paid-media-locker
   ```

2. **Start everything**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - MongoDB on port 27017
   - Redis on port 6379
   - S3rver on port 9000
   - Express API on port 5000

3. **Seed database** (optional, but recommended)
   ```bash
   docker-compose exec app pnpm run seed
   ```

4. **API is ready**
   ```
   http://localhost:5000
   Health check: http://localhost:5000/health
   ```

5. **Test with credentials**
   - Email: `demo@example.com`
   - Password: `demo123456`

---

## Option 2: Local Development

### Prerequisites
- Node.js 18+
- MongoDB 6.0+ (running locally or Atlas)
- Redis 6.0+ (optional, for development)
- AWS S3 credentials (or use s3rver)

### Backend Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start MongoDB** (if local)
   ```bash
   mongod
   ```

4. **Start server**
   ```bash
   pnpm run dev
   ```

   Server runs on `http://localhost:5000`

5. **Seed database** (optional)
   ```bash
   pnpm run seed
   ```

### Mobile Setup (in separate terminal)

1. **Navigate to mobile**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Expo**
   ```bash
   npm start
   ```

4. **Run on device**
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Scan QR code for physical device

---

## First Steps

### 1. Login to API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123456"
  }'
```

Response includes `token` - use in Authorization header for other requests.

### 2. Get Wallet Balance
```bash
curl -X GET http://localhost:5000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Browse Media
```bash
curl -X GET "http://localhost:5000/api/feed/discover?page=1&limit=20&sort=recent" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Open Mobile App
- Login with same credentials
- Browse discover feed
- Check wallet balance
- View profile

---

## Key Endpoints to Test

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Media
- `GET /api/feed/discover` - Browse media
- `GET /api/feed/trending` - Trending media
- `GET /api/media/search?q=keyword` - Search

### Wallet
- `GET /api/wallet/balance` - Current balance
- `POST /api/wallet/deposit` - Add funds
- `GET /api/wallet/stats` - Spending stats

### Purchases
- `POST /api/purchases/buy` - Purchase media
- `GET /api/purchases/purchased` - Your purchases
- `GET /api/purchases/download/:mediaId` - Download link

---

## Useful Commands

### Backend
```bash
pnpm start            # Production
pnpm dev              # Development
pnpm test             # Run tests
pnpm lint             # Check code quality
pnpm seed             # Seed database
```

### Docker
```bash
docker-compose up     # Start all services
docker-compose down   # Stop all services
docker-compose logs app  # View app logs
docker-compose exec app pnpm test  # Run tests in container
```

### Mobile
```bash
npm start             # Start Expo
npm run android       # Run on Android
npm run ios           # Run on iOS
npm run lint          # Lint code
```

---

## Demo Content

### Demo User
```
Email: demo@example.com
Password: demo123456
Balance: $100
```

### Demo Creators
1. **Alice Creator** (@creator_alice)
   - Photos: "Sunset Over Mountains", "Urban Architecture"
   - Prices: $9.99 - $14.99

2. **Bob Designer** (@creator_bob)
   - Digital Art: "Abstract Digital Art", "Minimalist Design"
   - Prices: $7.99 - $19.99

### Try These Actions
- Browse discover feed
- Search for "sunset" or "abstract"
- Purchase "Abstract Digital Art" ($19.99)
- Check purchase history
- Add funds to wallet
- Follow creators

---

## Troubleshooting

### "Connection Refused"
- Ensure all services are running
- Check ports: MongoDB (27017), Redis (6379), App (5000)
- For Docker: `docker-compose ps`

### "Invalid Token"
- Token may have expired
- Re-login to get new token
- Include Bearer token in Authorization header

### "Android Emulator Can't Reach Localhost"
- Use `10.0.2.2` instead of `localhost`
- Update `mobile/src/store/authStore.js` API URL

### "Database Connection Error"
- Check MongoDB is running
- Verify MONGODB_URI in .env
- For Docker: wait 10 seconds for MongoDB to start

### "Image Upload Fails"
- Check file size < 50MB
- Verify S3 credentials or s3rver is running
- Check file format is allowed (JPEG, PNG, MP4, etc.)

---

## Next Steps

1. **Explore API**
   - Read `API_DOCUMENTATION.md`
   - Test all endpoints with Postman
   - Try different sort/filter options

2. **Customize Mobile App**
   - Modify colors in screen styles
   - Add more screens
   - Implement video upload

3. **Production Deployment**
   - Set up AWS S3 bucket
   - Connect MongoDB Atlas
   - Deploy to Heroku/AWS/DigitalOcean
   - Build APK/IPA for app stores

4. **Add Features**
   - Payment gateway integration (Stripe)
   - Real-time notifications
   - Comments/reviews
   - Creator analytics
   - Admin dashboard

---

## Important Files

- **README.md** - Full documentation
- **API_DOCUMENTATION.md** - All endpoints with examples
- **MOBILE_SETUP.md** - Detailed mobile setup
- **PROJECT_SUMMARY.md** - Architecture and implementation details
- **.env.example** - Environment variable template
- **docker-compose.yml** - Container orchestration

---

## Support

For issues:
1. Check TROUBLESHOOTING section above
2. Review relevant documentation file
3. Check console logs: `docker-compose logs app`
4. Check mobile DevTools: Press `d` in terminal

---

## Success Checklist

- [ ] API running on http://localhost:5000/health
- [ ] Login successful with demo credentials
- [ ] Can see media feed
- [ ] Mobile app connects to API
- [ ] Can view wallet balance
- [ ] Database seeded with sample data
- [ ] Tests passing: `pnpm test`

---

**Everything ready? Start building! 🚀**

Next: Read `API_DOCUMENTATION.md` for complete endpoint reference
