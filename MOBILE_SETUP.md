# Paid Media Locker - React Native Mobile Setup

## Overview

This is a React Native (Expo) application for the Paid Media Locker platform, enabling users to discover, purchase, and manage media content on their mobile devices.

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Emulator or iOS Simulator (or physical device with Expo Go app)
- Backend API running on `http://localhost:5000`

## Installation

### 1. Navigate to mobile directory
```bash
cd mobile
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```

### 3. Start the development server
```bash
npm start
# or
expo start
```

### 4. Run on emulator/simulator

**Android:**
```bash
# Press 'a' in the terminal after running npm start
# Or manually:
expo start --android
```

**iOS:**
```bash
# Press 'i' in the terminal after running npm start
# Or manually:
expo start --ios
```

**Physical Device:**
1. Install Expo Go app from App Store or Google Play
2. Scan the QR code from terminal with your device camera (iOS) or Expo Go app (Android)

## Project Structure

```
mobile/
├── App.js                 # Entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── src/
│   ├── navigation/       # Navigation setup
│   │   └── Navigation.jsx
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.jsx
│   │   ├── RegisterScreen.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── WalletScreen.jsx
│   │   └── ProfileScreen.jsx
│   └── store/            # Zustand stores
│       ├── authStore.js
│       ├── mediaStore.js
│       └── walletStore.js
└── assets/               # Images and icons
```

## Features

### Authentication
- User registration with email and password
- Secure JWT token storage
- Auto-login on app launch if token is valid
- Logout functionality

### Home/Discovery
- Browse media from all creators
- Sort by recent, trending, popular, price
- View media details including price, views, and purchases
- Search media by keywords
- Like/unlike media
- Pull-to-refresh functionality

### Wallet
- View current balance
- View transaction history (deposits, withdrawals, purchases, sales)
- Add funds to wallet
- Withdraw funds
- View spending and earnings statistics

### Profile
- View user information
- Edit display name and bio
- View member since date
- Change password (UI ready, implement as needed)
- Privacy and notification settings (UI ready, implement as needed)
- Logout

### Navigation
- Bottom tab navigation (Home, Wallet, Profile)
- Stack navigation within each tab
- Authentication flow separation (Auth stack vs App stack)

## State Management

### AuthStore (Zustand)
Manages:
- User authentication state
- JWT token storage in Secure Store
- Login, register, logout
- Token refresh and restoration

### MediaStore (Zustand)
Manages:
- Discover feed
- Media search
- Trending media
- Media details
- Likes
- Purchases
- Download URLs for purchased media

### WalletStore (Zustand)
Manages:
- Wallet balance
- Transaction history
- Statistics (total spent, total earned)
- Deposits and withdrawals

## API Configuration

Update the API URL in store files if your backend is running on a different location:

```javascript
// In authStore.js, mediaStore.js, walletStore.js
const API_URL = 'http://your-api-url/api';
```

For local development, ensure your backend is accessible at:
```
http://localhost:5000/api
```

## Testing

### Demo Credentials
```
Email: demo@example.com
Password: demo123456
```

Demo account comes pre-loaded with:
- $100 wallet balance
- Access to sample media
- Purchase history

## Building for Production

### Android APK

1. **Using EAS Build (Recommended)**
   ```bash
   eas build --platform android
   ```

2. **Manual Build**
   ```bash
   expo build:android
   ```

3. **Using Android Studio**
   - Eject from Expo if needed
   - Configure Android SDK
   - Build using gradle

### iOS IPA

1. **Using EAS Build**
   ```bash
   eas build --platform ios
   ```

2. **Manual Build**
   ```bash
   expo build:ios
   ```

## Deployment to App Stores

### Android Play Store
```bash
eas submit --platform android
```

### Apple App Store
```bash
eas submit --platform ios
```

## Environment Variables

Create a `.env` file in the `mobile` directory (optional):

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

Note: Expo doesn't have built-in .env support. Use `app.json` for configuration:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:5000/api"
    }
  }
}
```

Access in code:
```javascript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig.extra.apiUrl;
```

## Debugging

### Expo DevTools
```bash
npm start
# Press 'd' to open DevTools
```

### Console Logs
View logs in terminal or DevTools console

### React Native Debugger
```bash
npm install -g react-native-debugger
# Run and connect from developer menu
```

### Network Inspection
- Use Expo DevTools
- Or use Charles Proxy/Fiddler for network inspection

## Troubleshooting

### "API Connection Failed"
- Check backend is running: `npm start` in server directory
- Verify API URL is correct
- Check device/emulator can reach localhost (may need to use 10.0.2.2 for Android)

### "Token Expired"
- Tokens auto-refresh on app launch
- If still expired, login again

### "Module Not Found"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start --clear
```

### Android Emulator Connection Issues
For Android emulator, use `10.0.2.2` instead of `localhost`:
```javascript
const API_URL = 'http://10.0.2.2:5000/api';
```

### iOS Simulator Issues
Update `app.json` with your machine's IP for testing on physical device:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_MACHINE_IP:5000/api"
    }
  }
}
```

## Performance Optimization

### Image Optimization
- Images are cached by default
- Lazy load images with `expo-image`
- Use thumbnails for thumbnails instead of full-resolution

### List Performance
- Use `FlatList` with `keyExtractor`
- Implement `getItemLayout` for better scrolling
- Use `removeClippedSubviews` for large lists

### State Management
- Zustand is lightweight and performant
- Avoid unnecessary re-renders with proper selector usage

## Security Considerations

### Token Storage
- JWT tokens stored in Secure Store (platform-native secure storage)
- Never store tokens in AsyncStorage

### API Calls
- All API calls include Bearer token in headers
- HTTPS recommended for production
- Validate all user inputs

### Permissions
- Camera and photo library permissions handled by expo-image-picker
- Request permissions only when needed
- Handle permission denials gracefully

## Future Enhancements

- [ ] Image/video upload from mobile
- [ ] Real-time notifications
- [ ] Offline support with sync
- [ ] Video streaming optimization
- [ ] Advanced search filters
- [ ] Creator dashboard
- [ ] Payment gateway integration
- [ ] Analytics tracking
- [ ] Push notifications
- [ ] Social features (comments, messages)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly on both Android and iOS
4. Submit a pull request

## Support

For issues or questions, refer to the main README.md or contact support.

## License

MIT License - See LICENSE file in root directory
