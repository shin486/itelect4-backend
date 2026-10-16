# ITELECT4 Backend

ITELECT4 Graded Task 4 (GT4) — Backend REST API built with Node.js, Express, TypeScript, and MongoDB Atlas. Deployed on Vercel.

## 🔗 Live Backend URL

**https://itelect4-backend-tau.vercel.app**

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check — returns DB connection status |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Get current user (requires auth) |

### Health Check
```bash
curl https://itelect4-backend-tau.vercel.app/api/health
# → {"ok":true,"db":"connected"}
```

### Login
```bash
curl -X POST https://itelect4-backend-tau.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
# → {"success":true,"data":{"token":"...","user":{...}}}
```

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT (jsonwebtoken)
- **Deployment:** Vercel (`@vercel/node`)

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET

# Run in development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌍 Deployment (Vercel)

1. Connect this repo to Vercel
2. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — Secret key for JWT signing
3. Deploy — Vercel auto-detects `@vercel/node` functions in `api/`

## 📁 Project Structure

```
itelect4-backend/
├── api/
│   └── index.ts          # Vercel serverless handler
├── src/
│   ├── app.ts            # Express app setup
│   ├── config/db.js      # MongoDB connection
│   ├── controllers/authController.ts
│   ├── middleware/auth.js
│   ├── models/User.js
│   ├── routes/authRoutes.ts
│   ├── routes/submissionRoutes.ts
│   ├── routes/courses.ts
│   └── types/index.ts
├── vercel.json           # Vercel configuration
├── tsconfig.json
└── package.json
```

## 🔗 Frontend Repo

[ITELECT4 Frontend](https://github.com/shin486/itelect4-project)