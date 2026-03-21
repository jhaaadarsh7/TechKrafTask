# TechKraft Take-Home (Auth + Buyer Favourites)

This is my submission for the junior full-stack take-home.
It includes:

- user registration and login
- JWT auth
- buyer dashboard
- add/remove favourites
- favourites tied to the logged-in user only

## Stack I Used

- Backend: Node.js, Express, TypeScript, Prisma, SQLite
- Frontend: React, TypeScript, Vite
- Auth/Security: JWT, bcrypt
- Validation: Zod

## How to Run Locally

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Create a backend .env file in backend/.env:

```env
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="1d"
```

Backend runs on http://localhost:5000
API base: http://localhost:5000/api

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create frontend/.env:

```env
VITE_API_URL=http://localhost:5000/api
```

Frontend runs on http://localhost:5173

## Quick Demo Flow

1. Open http://localhost:5173/login
2. Create an account (name, email, password)
3. After signup/login you land on dashboard
4. Click Add to Favourites (or the heart) on any property
5. Check the Saved section to see your favourites
6. Remove any favourite using Remove Favourite

## Main API Routes

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/properties
- GET /api/favourites
- POST /api/favourites/:propertyId
- DELETE /api/favourites/:propertyId

Note: all routes except register/login require Bearer token auth.

## Run Tests

```bash
cd backend
npm test
```