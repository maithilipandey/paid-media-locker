# Paid Media Locker - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register
**POST** `/auth/register`

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201)**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "walletBalance": 0,
    "role": "user"
  }
}
```

---

### Login
**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

---

### Verify Token
**GET** `/auth/verify`
*Requires authentication*

**Response (200)**
```json
{
  "valid": true,
  "user": { ... }
}
```

---

### Refresh Token
**POST** `/auth/refresh`
*Requires authentication*

**Response (200)**
```json
{
  "message": "Token refreshed",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Change Password
**POST** `/auth/change-password`
*Requires authentication*

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200)**
```json
{
  "message": "Password changed successfully"
}
```

---

## Media Endpoints

### Upload Media
**POST** `/media/upload`
*Requires authentication*

**Form Data:**
- `file` (multipart/form-data) - Media file
- `title` (string) - Media title
- `description` (string, optional) - Media description
- `price` (number) - Price in USD
- `tags` (string, optional) - Comma-separated tags

**Response (201)**
```json
{
  "message": "Media uploaded successfully",
  "media": {
    "_id": "media_id",
    "title": "My Awesome Photo",
    "creator": "user_id",
    "mediaType": "image",
    "price": 9.99,
    "views": 0,
    "purchases": 0
  }
}
```

---

### Get Media
**GET** `/media/:id`
*Requires authentication*

**Response (200)**
```json
{
  "_id": "media_id",
  "title": "My Awesome Photo",
  "description": "...",
  "creator": {
    "_id": "creator_id",
    "username": "creator",
    "displayName": "Creator Name"
  },
  "price": 9.99,
  "views": 42,
  "likes": 15
}
```

---

### Get Creator Media
**GET** `/media/creator/:creatorId?page=1&limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### Search Media
**GET** `/media/search?q=keyword&page=1&limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Delete Media
**DELETE** `/media/:id`
*Requires authentication*

**Response (200)**
```json
{
  "message": "Media deleted successfully"
}
```

---

### Like Media
**POST** `/media/:id/like`
*Requires authentication*

**Response (200)**
```json
{
  "message": "Media liked",
  "likes": 16
}
```

---

## Wallet Endpoints

### Get Wallet Balance
**GET** `/wallet/balance`
*Requires authentication*

**Response (200)**
```json
{
  "balance": 150.50,
  "currency": "USD"
}
```

---

### Get Transaction History
**GET** `/wallet/transactions?page=1&limit=20&type=purchase`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Add Funds (Deposit)
**POST** `/wallet/deposit`
*Requires authentication*

```json
{
  "amount": 50.00,
  "paymentMethod": "credit_card"
}
```

**Response (200)**
```json
{
  "message": "Funds added successfully",
  "newBalance": 200.50,
  "transaction": { ... }
}
```

---

### Withdraw Funds
**POST** `/wallet/withdraw`
*Requires authentication*

```json
{
  "amount": 25.00,
  "paymentMethod": "bank_transfer"
}
```

**Response (200)**
```json
{
  "message": "Withdrawal successful",
  "newBalance": 175.50,
  "transaction": { ... }
}
```

---

### Get Wallet Stats
**GET** `/wallet/stats`
*Requires authentication*

**Response (200)**
```json
{
  "balance": 175.50,
  "totalSpent": 50.00,
  "totalEarned": 100.00,
  "currency": "USD"
}
```

---

## Purchase Endpoints

### Buy Media
**POST** `/purchases/buy`
*Requires authentication*

```json
{
  "mediaId": "media_id"
}
```

**Response (200)**
```json
{
  "message": "Purchase successful",
  "purchase": {
    "purchaseId": "unique_purchase_id",
    "buyer": "buyer_id",
    "media": "media_id",
    "amount": 9.99,
    "status": "completed",
    "transactionHash": "sha256_hash"
  }
}
```

---

### Get Purchase History
**GET** `/purchases/history?page=1&limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Get Purchased Media
**GET** `/purchases/purchased?page=1&limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Get Sales History
**GET** `/purchases/sales?page=1&limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "totalEarnings": 500.00,
  "pagination": { ... }
}
```

---

### Get Download URL
**GET** `/purchases/download/:mediaId`
*Requires authentication*

**Response (200)**
```json
{
  "url": "https://s3.amazonaws.com/...",
  "expiresAt": "2025-07-16T17:30:00Z",
  "mediaTitle": "My Awesome Photo"
}
```

---

## Feed Endpoints

### Discover Feed
**GET** `/feed/discover?page=1&limit=20&sort=recent`
*Requires authentication*

`sort` options: `recent`, `trending`, `popular`, `price_low`, `price_high`

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Following Feed
**GET** `/feed/following?page=1&limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Trending Media
**GET** `/feed/trending?limit=10`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ]
}
```

---

### Recommendations
**GET** `/feed/recommendations?limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ]
}
```

---

## User Endpoints

### Get Current User
**GET** `/users/me`
*Requires authentication*

**Response (200)**
```json
{
  "_id": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "walletBalance": 150.50,
  "followers": [...],
  "following": [...]
}
```

---

### Update Profile
**PUT** `/users/me`
*Requires authentication*

```json
{
  "displayName": "John Doe",
  "bio": "Photography enthusiast",
  "profileImage": "https://..."
}
```

**Response (200)**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### Get User Profile
**GET** `/users/:userId`
*Requires authentication*

**Response (200)**
```json
{
  "_id": "user_id",
  "username": "johndoe",
  "displayName": "John Doe",
  "profileImage": "https://...",
  "bio": "Photography enthusiast",
  "mediaCount": 15,
  "followerCount": 125
}
```

---

### Follow User
**POST** `/users/:userId/follow`
*Requires authentication*

**Response (200)**
```json
{
  "message": "User followed",
  "isFollowing": true,
  "followerCount": 126
}
```

---

### Get Followers
**GET** `/users/:userId/followers?page=1&limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Get Following
**GET** `/users/:userId/following?page=1&limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Search Users
**GET** `/users/search?q=keyword&page=1&limit=20`
*Requires authentication*

**Response (200)**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

## Error Responses

All errors follow this format:

**400 Bad Request**
```json
{
  "error": "Validation error",
  "details": ["Field is required", "Invalid format"]
}
```

**401 Unauthorized**
```json
{
  "error": "Invalid or expired token"
}
```

**403 Forbidden**
```json
{
  "error": "Not authorized to perform this action"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**429 Too Many Requests**
```json
{
  "error": "Too many requests, please try again later"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limits

- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Uploads: 50 per hour
- Purchases: 10 per minute

---

## Testing Demo Credentials

```
Username: demo_user
Email: demo@example.com
Password: demo123456
```

Initial wallet balance: $100.00
