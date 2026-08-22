# GlobeTrotter Backend API

A comprehensive travel planning REST API built with **Node.js**, **Express.js**, and **PostgreSQL** (raw SQL via `pg`).

---

## Quick Start

```bash
# 1. Install dependencies
cd server
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret

# 3. Create the database
psql -U postgres -c "CREATE DATABASE globetrotter;"

# 4. Run schema
psql -U postgres -d globetrotter -f database/schema.sql

# 5. (Optional) Optimize search indexes
psql -U postgres -d globetrotter -f database/search_indexes.sql

# 6. Seed demo data
psql -U postgres -d globetrotter -f database/seed.sql

# 7. Start the server
npm run dev     # development (with hot reload)
npm start       # production
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | `development` or `production` |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | — | PostgreSQL password |
| `DB_NAME` | `globetrotter` | Database name |
| `JWT_SECRET` | — | **Required in production.** Secret for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token expiry (e.g. `1h`, `7d`) |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `RATE_LIMIT_AUTH_WINDOW_MS` | `900000` | Auth rate limit window (15 min) |
| `RATE_LIMIT_AUTH_MAX` | `15` | Max auth requests per window |
| `RATE_LIMIT_API_WINDOW_MS` | `900000` | API rate limit window (15 min) |
| `RATE_LIMIT_API_MAX` | `100` | Max API requests per window |

---

## Database Setup

### Schema

```bash
psql -U postgres -d globetrotter -f database/schema.sql
```

Creates 9 tables: `users`, `cities`, `trips`, `trip_stops`, `activities`, `trip_activities`, `expenses`, `notifications`, `trip_shares`.

### Search Indexes (Optional)

```bash
psql -U postgres -d globetrotter -f database/search_indexes.sql
```

Adds `pg_trgm` GIN indexes for fast ILIKE search on cities and activities.

### Seed Data

```bash
psql -U postgres -d globetrotter -f database/seed.sql
```

Seeds: 3 users, 25 cities, 6 trips, 20+ stops, 50+ activities, trip activities, expenses, notifications, and share links.

**Demo accounts** (password: `password123`):

| Email | Role |
|-------|------|
| `alice@example.com` | user |
| `bob@example.com` | user |
| `charlie@example.com` | admin |

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Get a token via `POST /api/auth/login` or `POST /api/auth/signup`.

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start in production mode |
| `npm run dev` | Start with nodemon (hot reload) |
| `npm run db:schema` | Run schema migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Schema + seed |

---

## API Endpoints

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | No | Server health check |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/signup` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login and get JWT |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users/me` | Yes | Get current user profile |
| `PATCH` | `/api/users/me` | Yes | Update profile |
| `DELETE` | `/api/users/me` | Yes | Delete account |

### Cities (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/cities` | No | List cities (with filters, pagination) |
| `GET` | `/api/cities/search?q=` | No | Search cities by name |
| `GET` | `/api/cities/popular` | No | Top cities by popularity |
| `GET` | `/api/cities/:id` | No | Get single city |
| `GET` | `/api/cities/:cityId/activities` | No | List activities for a city |

**City filters:** `?country=`, `?region=`, `?cost_min=`, `?cost_max=`, `?sort=`, `?order=`, `?page=`, `?limit=`

### Activities (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/activities` | No | List activities (with filters) |
| `GET` | `/api/activities/search?q=` | No | Search activities |
| `GET` | `/api/activities/popular` | No | Top activities by popularity |
| `GET` | `/api/activities/:id` | No | Get single activity |

**Activity filters:** `?type=`, `?cost_min=`, `?cost_max=`, `?duration_min=`, `?duration_max=`, `?sort=`, `?order=`, `?page=`, `?limit=`

### Unified Search (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/search?q=` | No | Search across cities + activities |

**Filters:** `?country=`, `?region=`, `?type=`, `?cost_min=`, `?cost_max=`, `?duration=`, `?sort=`, `?order=`, `?page=`, `?limit=`

### Trips (Authenticated)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/trips` | Yes | Create trip |
| `GET` | `/api/trips` | Yes | List own trips |
| `GET` | `/api/trips/:id` | Yes | Get trip by ID |
| `PATCH` | `/api/trips/:id` | Yes | Update trip |
| `DELETE` | `/api/trips/:id` | Yes | Delete trip |

### Trip Stops

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/trips/:tripId/stops` | Yes | Add stop to trip |
| `GET` | `/api/trips/:tripId/stops` | Yes | List stops |
| `PATCH` | `/api/trips/:tripId/stops/:stopId` | Yes | Update stop |
| `DELETE` | `/api/trips/:tripId/stops/:stopId` | Yes | Remove stop |
| `PATCH` | `/api/trips/:tripId/stops/reorder` | Yes | Reorder all stops |

### Trip Activities

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/trips/:tripId/stops/:stopId/activities` | Yes | Add activity to stop |
| `GET` | `/api/trips/:tripId/stops/:stopId/activities` | Yes | List stop activities |
| `PATCH` | `/api/trips/:tripId/stops/:stopId/activities/:id` | Yes | Update activity |
| `DELETE` | `/api/trips/:tripId/stops/:stopId/activities/:id` | Yes | Remove activity |

### Itinerary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/trips/:tripId/itinerary` | Yes | Full itinerary (stops, cities, summary) |

### Scheduling & Timeline

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/trips/:tripId/timeline` | Yes | Day-by-day timeline with activities |
| `PATCH` | `/api/trips/:tripId/activities/reorder` | Yes | Reorder activities (with overlap check) |

### Expenses

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/trips/:tripId/expenses` | Yes | Add expense |
| `GET` | `/api/trips/:tripId/expenses` | Yes | List expenses |
| `PATCH` | `/api/trips/:tripId/expenses/:expenseId` | Yes | Update expense |
| `DELETE` | `/api/trips/:tripId/expenses/:expenseId` | Yes | Delete expense |

### Budget

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/trips/:tripId/budget` | Yes | Budget summary (spent vs. budget) |
| `GET` | `/api/trips/:tripId/budget/analysis` | Yes | Detailed budget analysis by category |

### Sharing & Public

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/trips/:tripId/share` | Yes | Create public share link |
| `GET` | `/api/trips/:tripId/share` | Yes | Get share info |
| `PATCH` | `/api/trips/:tripId/share` | Yes | Toggle share active/inactive |
| `DELETE` | `/api/trips/:tripId/share` | Yes | Delete share permanently |
| `GET` | `/api/public/trips/:token` | No | View shared trip (public) |
| `POST` | `/api/public/trips/:token/copy` | Yes | Copy shared trip to own account |

### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/notifications` | Yes | List notifications |
| `PATCH` | `/api/notifications/:id/read` | Yes | Mark as read |
| `PATCH` | `/api/notifications/read-all` | Yes | Mark all as read |

### Admin (Admin Role Required)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/admin/analytics` | Admin | Platform-wide analytics |
| `GET` | `/api/admin/users` | Admin | List all users |
| `GET` | `/api/admin/trips` | Admin | List all trips |

---

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── index.js           # Environment configuration
│   │   └── db.js              # PostgreSQL connection pool (pg)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── city.controller.js
│   │   ├── trip.controller.js
│   │   ├── stop.controller.js
│   │   ├── activity.controller.js
│   │   ├── tripActivity.controller.js
│   │   ├── itinerary.controller.js
│   │   ├── scheduling.controller.js
│   │   ├── expense.controller.js
│   │   ├── budget.controller.js
│   │   ├── share.controller.js
│   │   ├── search.controller.js
│   │   ├── notification.controller.js
│   │   ├── admin.controller.js
│   │   └── healthController.js
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   ├── role.middleware.js  # requireAdmin
│   │   ├── errorHandler.js    # Central error handler
│   │   ├── notFound.js        # 404 catch-all
│   │   ├── rateLimiter.js     # Auth + API rate limiting
│   │   └── validate.js        # express-validator helpers
│   ├── routes/
│   │   ├── index.js           # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── city.routes.js
│   │   ├── trip.routes.js
│   │   ├── stop.routes.js
│   │   ├── activity.routes.js
│   │   ├── tripActivity.routes.js
│   │   ├── expense.routes.js
│   │   ├── search.routes.js
│   │   ├── public.routes.js
│   │   ├── notification.routes.js
│   │   ├── admin.routes.js
│   │   └── health.js
│   ├── services/
│   │   ├── user.service.js
│   │   ├── city.service.js
│   │   ├── trip.service.js
│   │   ├── stop.service.js
│   │   ├── activity.service.js
│   │   ├── tripActivity.service.js
│   │   ├── itinerary.service.js
│   │   ├── scheduling.service.js
│   │   ├── expense.service.js
│   │   ├── budget.service.js
│   │   ├── share.service.js
│   │   ├── search.service.js
│   │   ├── notification.service.js
│   │   └── admin.service.js
│   ├── utils/
│   │   ├── apiResponse.js     # Standard { success, message, data, error }
│   │   ├── jwt.js             # JWT sign/verify helpers
│   │   └── password.js        # bcrypt hash/compare
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── database/
│   ├── schema.sql             # Full database schema (9 tables)
│   ├── seed.sql               # Demo data
│   ├── search_indexes.sql     # pg_trgm GIN indexes (optional)
│   └── migration_trip_shares.sql  # (Legacy — now in schema.sql)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Security

- **JWT authentication** with configurable expiry
- **bcrypt** password hashing (12 rounds)
- **Parameterized SQL** throughout (no string interpolation)
- **Rate limiting** on auth (15/15min) and API (100/15min)
- **Role-based access** — `requireAdmin` middleware for admin routes
- **Ownership checks** — users can only access their own trips/expenses
- **Safe error responses** — no SQL errors, stack traces, or internals leaked in production
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, HSTS in production
- **`.env` is gitignored** — secrets never committed

---

## API Response Format

All endpoints return a consistent JSON shape:

```json
{
  "success": true,
  "message": "OK",
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "error": ["amount is required."]
}
```

---

## Complete User Flow

```
POST /api/auth/signup          → Create account
POST /api/auth/login           → Get JWT token
POST /api/trips                → Create a trip
GET  /api/search?q=paris       → Search for a city
POST /api/trips/:id/stops      → Add city as a stop
POST /api/trips/:id/stops      → Add second city
POST /api/trips/:id/stops/:stopId/activities → Add activity
PATCH /api/trips/:id/activities/reorder      → Schedule activities
POST /api/trips/:id/expenses   → Add expense
GET  /api/trips/:id/budget     → View budget summary
GET  /api/trips/:id/timeline   → View day-by-day timeline
POST /api/trips/:id/share      → Create share link
GET  /api/public/trips/:token  → Open public URL
POST /api/public/trips/:token/copy → Copy trip to own account
```

---

## License

MIT
