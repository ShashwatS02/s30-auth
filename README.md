# s30-auth - Secure Authentication System

<p align="center">
  <img src="https://placehold.co/1000x320/0f172a/FFFFFF?text=s30-auth+-+Secure+Authentication+System&font=raleway" alt="s30-auth banner">
</p>

A production-style full-stack authentication system built as Project 1 of my 3-project backend/full-stack journey. It focuses on secure session management, token rotation, HttpOnly cookie-based refresh flows, production deployment, and clean developer experience.

---

## 🚀 Live Demo

Frontend: https://s30-auth.vercel.app  
Backend Health: https://s30-auth.onrender.com/health

---

## 🎯 Features

### Core Authentication

- User registration and login flow
- Secure logout flow
- Session restoration after page refresh
- Access token + refresh token architecture
- Case-insensitive email authentication

### Security Features

- Short-lived JWT access tokens
- Opaque refresh tokens stored server-side
- Refresh tokens stored in HttpOnly cookies
- Secure cookie setup for production
- SameSite protections for cross-site deployment
- Password validation with strong rules
- Rate limiting by IP and by IP + email combination

### Production Readiness

- Frontend deployed on Vercel
- Backend deployed on Render
- PostgreSQL database hosted on Neon
- Cross-origin frontend/backend integration
- Environment-variable-based configuration
- Health endpoint for deployment verification

---

## 🛠️ Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-111111?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E699?style=for-the-badge&logo=postgresql&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-4E4FEB?style=for-the-badge&logo=render&logoColor=white)

---

## 📌 Why This Project

This project was built to go beyond basic login/signup and implement the parts that matter in real-world authentication systems:

- token expiry
- refresh token handling
- cookie security
- CORS across deployed frontend/backend apps
- revocation-friendly token design
- password and rate-limit policies

It is also the first project in my 3-project build journey:
1. Authentication System
2. Background Job Queue
3. Real-Time Collaborative Editor

---

## 🔐 Authentication Design

### Token Model

- Access tokens are short-lived JWTs
- Refresh tokens are opaque and stored server-side
- Refresh tokens are sent via HttpOnly cookies
- This design supports stronger control and future revocation/rotation

### Cookie Strategy

- HttpOnly cookies help reduce direct token exposure in client-side JavaScript
- Secure cookies are used for production
- SameSite settings are configured to support deployed frontend/backend communication

### Identity Rules

- Email matching is case-insensitive
- Passwords require:
  - minimum 10 characters
  - at least 1 number
  - at least 1 special character

### Abuse Protection

- Rate limiting is applied by:
  - IP address
  - IP + email combination

This helps reduce brute-force attempts while keeping the login flow practical.

---

## 👤 User Flow

### Register

- User creates an account
- Credentials are validated
- User record is stored securely
- Auth session is initialized

### Login

- User signs in with email and password
- Server verifies credentials
- Access token is issued
- Refresh token is stored in a secure HttpOnly cookie

### Refresh / Restore Session

- On reload or session restore, the app can request a new access token using the refresh token cookie
- User stays logged in without manually signing in again

### Logout

- Refresh token/session is invalidated
- Cookie is cleared
- User is fully logged out

---

## 🗂️ Project Structure

```bash
s30-auth/
├── api/                  # Backend service
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── db/
│   │   └── utils/
│   └── package.json
├── web/                  # Frontend app
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── hooks/
│   ├── index.html
│   └── package.json
└── README.md
```

> Folder names may vary slightly as the project evolves, but the repo follows a frontend + backend split deployment model.

---

## ⚙️ Environment Variables

### Backend

```env
DATABASE_URL=your_neon_postgres_url
JWT_ACCESS_SECRET=your_access_secret
FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,https://s30-auth.vercel.app
NODE_ENV=production
```

### Frontend

```env
VITE_API_BASE_URL=https://s30-auth.onrender.com
```

---

## 📋 Local Setup

### Prerequisites

- Node.js
- npm
- PostgreSQL connection string (Neon or local Postgres)

### Installation

1. Clone the repository

```bash
git clone https://github.com/<your-username>/s30-auth.git
cd s30-auth
```

2. Install backend dependencies

```bash
cd api
npm install
```

3. Add backend environment variables

```bash
cp .env.example .env
```

4. Install frontend dependencies

```bash
cd ../web
npm install
```

5. Add frontend environment variables

```bash
cp .env.example .env
```

---

## ▶️ Run Locally

### Start backend

```bash
cd api
npm run dev
```

### Start frontend

```bash
cd web
npm run dev
```

### Open app

```txt
http://localhost:5173
```

---

## 🌍 Production Deployment

### Frontend

- Hosted on Vercel
- Built from the `web` directory
- Production API base URL is injected through `VITE_API_BASE_URL`

### Backend

- Hosted on Render
- Uses environment-based CORS configuration
- Health route confirms deployment readiness

### Cross-Origin Setup

For production, the backend must allow the deployed frontend origin, and cookie settings must be configured correctly for secure cross-site requests.

---

## 🔌 API Overview

Example auth routes:

```txt
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
GET    /health
```

> Actual route names may differ slightly depending on the current backend implementation.

---

## 🖼️ Screenshots

- [Login page](./screenshots/Login_image.png)
  
- [Signup page](./screenshots/Signup_image.png)
  
- [Authenticated dashboard](./screenshots/Dashboard.png)
  
---

## 📚 What I Learned

This project helped me practice:

- secure auth system design
- cookie-based session restoration
- deployment across separate frontend and backend platforms
- environment variable management
- CORS debugging
- production-focused backend thinking

It also helped me understand why authentication is more than just generating a token after login.

---

## 📈 Future Improvements

- Email verification flow
- Forgot-password / reset-password flow
- Refresh token rotation tracking UI
- Role-based access control
- Account lockout policy after repeated failures
- Audit logs
- OAuth providers
- Automated tests and CI pipeline

---

## 🗺️ Roadmap Position

This is **Project 1/3** in my full-stack systems journey:

- Project 1: Secure Authentication System
- Project 2: Background Job Queue
- Project 3: Real-Time Collaborative Editor

The goal is to build progressively stronger backend and full-stack systems with real deployment experience.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a pull request

---

## 📬 Contact

If you want to discuss the project, suggest improvements, or connect about backend/full-stack development, feel free to open an issue or reach out through GitHub.

---

Built with a security-first mindset and shipped as part of a practical full-stack project journey.
