# Authentication API Documentation

This document provides information on how to use the authentication API endpoints and test them with Postman.

## Prerequisites

- Node.js (v14+)
- PostgreSQL
- Postman (for testing)

## Setup

1. Make sure your environment variables are set:
   ```
   DIRECT_DB_CONNECTION=postgresql://username:password@localhost:5432/your_db
   JWT_SECRET=your_jwt_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ```

2. Install dependencies and generate Prisma client:
   ```
   npm install
   npx prisma generate
   ```

3. Run database migrations:
   ```
   npx prisma migrate dev
   ```

4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/auth/register` | POST | Register a new user |
| `/v1/auth/login` | POST | Log in and get tokens |
| `/v1/auth/refresh-token` | POST | Refresh access token |
| `/v1/auth/forgot-password` | POST | Request password reset |
| `/v1/auth/reset-password` | POST | Reset password with token |
| `/v1/auth/logout` | POST | Logout (invalidate refresh token) |
| `/v1/auth/me` | GET | Get current user profile (protected) |

## Testing with Postman

### Setup Postman Collection

1. Create a new collection in Postman called "Auth API"
2. Set up Collection Variables:
   - `baseUrl`: `http://localhost:8001/v1`
   - `accessToken`: (empty initially)
   - `refreshToken`: (empty initially)

### Test Data

Here are the test payloads for each endpoint:

#### 1. Register User

**Endpoint**: `{{baseUrl}}/auth/register`  
**Method**: POST  
**Body (JSON)**:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### 2. Login

**Endpoint**: `{{baseUrl}}/auth/login`  
**Method**: POST  
**Body (JSON)**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**After Login**: Save the received tokens to your collection variables.

#### 3. Get User Profile

**Endpoint**: `{{baseUrl}}/auth/me`  
**Method**: GET  
**Headers**:
```
Authorization: Bearer {{accessToken}}
```

#### 4. Refresh Token

**Endpoint**: `{{baseUrl}}/auth/refresh-token`  
**Method**: POST  
**Body (JSON)**:
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**After Refresh**: Update the access token in your collection variables.

#### 5. Forgot Password

**Endpoint**: `{{baseUrl}}/auth/forgot-password`  
**Method**: POST  
**Body (JSON)**:
```json
{
  "email": "test@example.com"
}
```

#### 6. Reset Password

**Endpoint**: `{{baseUrl}}/auth/reset-password`  
**Method**: POST  
**Body (JSON)**:
```json
{
  "token": "TOKEN_FROM_FORGOT_PASSWORD_RESPONSE",
  "newPassword": "newpassword123"
}
```

#### 7. Logout

**Endpoint**: `{{baseUrl}}/auth/logout`  
**Method**: POST  
**Body (JSON)**:
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

## Testing Workflow

1. Register a new user
2. Login with the registered credentials 
3. Use the received tokens to access protected endpoints
4. Test token refresh when needed
5. Test password reset flow
6. Logout when done

## Status Codes

- 200: Success
- 201: Created
- 400: Bad request (validation errors)
- 401: Unauthorized (missing token)
- 403: Forbidden (invalid token)
- 404: Not found

## Error Handling

All endpoints return a consistent JSON response format:

```json
{
  "success": true/false,
  "message": "Message description",
  "data": {
    // data object if applicable
  }
}
```

For validation errors, the response will include error details:

```json
{
  "success": false,
  "message": "Validation error",
  "data": {
    "errors": [
      {
        "path": ["field_name"],
        "message": "Error message"
      }
    ]
  }
}
``` 