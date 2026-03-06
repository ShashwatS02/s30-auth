# s30-auth API - Secure JWT Authentication

```{=html}
<p align="center">
```
`<img src="https://placehold.co/800x350/1a1a1a/FFFFFF?text=s30-auth+API&font=raleway" alt="Project Banner">`{=html}
```{=html}
</p>
```
A production-ready authentication API built with Express and TypeScript
implementing secure JWT authentication with refresh token rotation,
session management, and robust rate limiting. Designed for modern web
applications requiring scalable and secure user authentication.

------------------------------------------------------------------------

## 🚀 Live API

This API is designed to be deployed on **Render** or any Node.js hosting
environment.

Example base URL:

https://your-auth-api.onrender.com

Health check endpoint:

GET /health

Returns:

{ "ok": true }

------------------------------------------------------------------------

## 🎯 Features

### Core Authentication

-   JWT Access Tokens (15 minutes)
-   HttpOnly Refresh Cookies
-   Secure Session Management
-   Refresh Token Rotation
-   Refresh Token Reuse Detection
-   Logout Current Session
-   Logout All Sessions

### Security Features

-   Strong Password Policy
    -   Minimum 10 characters
    -   At least one number
    -   At least one special character
-   BCrypt Password Hashing
    -   12 rounds production
    -   4 rounds testing
-   HttpOnly Cookies
-   Secure Cookies in production
-   Trust Proxy Support
-   Disabled X-Powered-By header

------------------------------------------------------------------------

## 🛠️ Tech Stack

-   Node.js
-   Express
-   TypeScript
-   PostgreSQL (Neon)
-   JSON Web Tokens (JWT)
-   Jest
-   GitHub Actions

------------------------------------------------------------------------

## 📋 Installation & Setup

### Prerequisites

-   Node.js 20+
-   npm
-   Neon PostgreSQL database
-   GitHub account (for CI)

### Clone Repository

git clone `<repository-url>`{=html} cd api

### Install Dependencies

npm install

### Environment Variables

Create `.env` file

DATABASE_URL=postgresql://your-neon-db-url\
DATABASE_URL_TEST=postgresql://your-neon-test-db-url\
JWT_SECRET=your-64-character-secret\
NODE_ENV=development

### Build and Run

npm run build\
npm start

Server runs at:

http://localhost:3000

------------------------------------------------------------------------

## 🎮 API Usage

### Register

POST /auth/register

Body:

{ "email": "user@example.com", "password": "Passw0rd123!" }

Response:

{ "user": { "id": "...", "email": "...", "createdAt": "..." } }

### Login

POST /auth/login

Response:

{ "accessToken": "...", "sessionId": "..." }

Refresh token cookie is also set.

### Get Current User

GET /me

Header:

Authorization: Bearer `<accessToken>`{=html}

### Refresh Token

POST /auth/refresh

Returns new access token.

### Logout

POST /auth/logout

Revokes current session.

### Logout All Sessions

POST /auth/logout-all

Authorization: Bearer `<accessToken>`{=html}

------------------------------------------------------------------------

## 🔒 Rate Limiting

/auth/login (email + IP) → 5 attempts / 15 minutes\
/auth/login (IP only) → 20 attempts / 15 minutes\
/auth/refresh → 10 requests / 15 minutes

Headers returned:

RateLimit-Limit\
RateLimit-Remaining\
RateLimit-Reset

------------------------------------------------------------------------

## 🚀 Deployment

### Deploy on Render

Environment variables:

DATABASE_URL=postgresql://production-db\
JWT_SECRET=your-production-secret\
NODE_ENV=production

Build command:

npm install && npm run build

Start command:

node dist/index.js

------------------------------------------------------------------------

## 🛠️ Project Structure

api/ ├── src/ │ ├── app.ts │ ├── index.ts │ ├── db.ts │ ├── auth.ts │
└── middleware/ │ ├── authRequired.ts │ └── rateLimiters.ts │ ├── test/
├── .env ├── .env.test ├── package.json └── README.md

------------------------------------------------------------------------

## 🔧 Troubleshooting

DATABASE_URL missing → check `.env` configuration\
Tests failing in CI → verify DATABASE_URL_TEST secret\
Login blocked → wait for rate limiter reset\
Deployment error → check environment variables

------------------------------------------------------------------------

## 📈 Future Improvements

-   Helmet security headers
-   Email verification
-   Password reset flow
-   OAuth login (Google/GitHub)
-   Swagger API documentation
-   Postman collection

------------------------------------------------------------------------

## 📜 License

MIT License

------------------------------------------------------------------------

Built for secure authentication systems.
