# Store Rating Web Application

Full-stack store rating application built with React.js, Express.js, JWT authentication, role-based authorization, and PostgreSQL.

## Roles

- System Administrator
- Normal User
- Store Owner

## Project Structure

store-rating-app/
  backend/
    src/
      config/
      controllers/
      middleware/
      routes/
      utils/
      validators/
    database/
      schema.sql
      seed.sql
    package.json
    .env
  frontend/
    src/
      api/
      components/
      context/
      pages/
      utils/
    package.json
    .env

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Database Setup

The included `backend/.env` uses this development URL:

```text
postgresql://postgres:postgres@localhost:5432/store_rating_app
```

If your local PostgreSQL password is different, update `backend/.env` before logging in.

You can also start a matching PostgreSQL database with Docker:

```bash
docker compose up -d postgres
```

Then run:

```bash
psql -U postgres -d store_rating_app -f backend/database/schema.sql
psql -U postgres -d store_rating_app -f backend/database/seed.sql
```

The seed script creates:

- Admin: `admin@example.com` / `Admin@123`
- Store owner: `owner@example.com` / `Owner@123`
- Normal user: `normal@example.com` / `User@1234`

## Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000` by default.

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Key Features

- Single login system for all roles
- JWT authentication
- Role-based route protection
- Secure password hashing with bcrypt
- Normal user signup
- User password update
- Admin dashboard totals
- Admin user and store management
- Store listing, searching, sorting, and rating
- Store owner rating dashboard
- Database uniqueness constraint allowing one user rating per store
- Server-side validation and centralized error handling
