# GlobeTrotter — Server

Express + PostgreSQL backend API for the GlobeTrotter platform.

## Tech Stack

| Layer        | Technology             |
| ------------ | ---------------------- |
| Runtime      | Node.js                |
| Framework    | Express 4              |
| Database     | PostgreSQL + `pg`      |
| Auth         | JWT + bcrypt           |
| Validation   | express-validator      |
| Config       | dotenv                 |

## Quick Start

```bash
# 1 — Install dependencies
cd server
npm install

# 2 — Configure environment
cp .env.example .env
#    → edit .env with your PostgreSQL credentials

# 3 — Create database & seed
createdb globetrotter
npm run db:schema
npm run db:seed

# 4 — Start development server
npm run dev
```

The server starts on **http://localhost:5000** by default.

## NPM Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm start`        | Start the production server          |
| `npm run dev`      | Start with nodemon (auto-reload)     |
| `npm run db:schema`| Apply `database/schema.sql`          |
| `npm run db:seed`  | Apply `database/seed.sql`            |
| `npm run db:reset` | Schema + seed in one command         |

## API Endpoints

### Health

| Method | Path           | Auth | Description          |
| ------ | -------------- | ---- | -------------------- |
| GET    | `/api/health`  | No   | Server & DB health   |

### Authentication

| Method | Path             | Auth | Description              |
| ------ | ---------------- | ---- | ------------------------ |
| POST   | `/api/auth/signup` | No   | Register a new account |
| POST   | `/api/auth/login`  | No   | Log in, receive JWT    |
| POST   | `/api/auth/logout` | Yes  | Logout (client-side)   |
| GET    | `/api/auth/me`     | Yes  | Get authenticated user |

### Users

| Method | Path             | Auth | Description              |
| ------ | ---------------- | ---- | ------------------------ |
| GET    | `/api/users/me`  | Yes  | Get own profile          |
| PATCH  | `/api/users/me`  | Yes  | Update own profile       |
| DELETE | `/api/users/me`  | Yes  | Delete own account       |

### Cities (Public)

| Method | Path                              | Auth | Description                   |
| ------ | --------------------------------- | ---- | ----------------------------- |
| GET    | `/api/cities`                     | No   | List cities (filter/sort/page)|
| GET    | `/api/cities/search?q=`           | No   | Search cities by name         |
| GET    | `/api/cities/popular`             | No   | Top cities by popularity      |
| GET    | `/api/cities/:id`                 | No   | Single city by UUID           |
| GET    | `/api/cities/:cityId/activities`  | No   | List activities for a city    |

### Trips

| Method | Path                                    | Auth | Description                     |
| ------ | --------------------------------------- | ---- | ------------------------------- |
| POST   | `/api/trips`                            | Yes  | Create a trip                   |
| GET    | `/api/trips`                            | Yes  | List own trips                  |
| GET    | `/api/trips/:id`                        | Yes  | Get trip (own or public)        |
| PATCH  | `/api/trips/:id`                        | Yes  | Update a trip                   |
| DELETE | `/api/trips/:id`                        | Yes  | Delete a trip                   |
| GET    | `/api/trips/:tripId/itinerary`          | Yes  | Full itinerary view             |
| PATCH  | `/api/trips/:tripId/stops/reorder`      | Yes  | Reorder trip stops              |
| GET    | `/api/trips/:tripId/timeline`           | Yes  | Scheduling timeline             |
| PATCH  | `/api/trips/:tripId/activities/reorder` | Yes  | Reorder activities              |

### Trip Stops

| Method | Path                                             | Auth | Description             |
| ------ | ------------------------------------------------ | ---- | ----------------------- |
| POST   | `/api/trips/:tripId/stops`                       | Yes  | Add a stop              |
| GET    | `/api/trips/:tripId/stops`                       | Yes  | List stops              |
| PATCH  | `/api/trips/:tripId/stops/:stopId`               | Yes  | Update a stop           |
| DELETE | `/api/trips/:tripId/stops/:stopId`               | Yes  | Delete a stop           |

### Trip Activities

| Method | Path                                                             | Auth | Description                |
| ------ | ---------------------------------------------------------------- | ---- | -------------------------- |
| POST   | `/api/trips/:tripId/stops/:stopId/activities`                    | Yes  | Add activity to stop       |
| GET    | `/api/trips/:tripId/stops/:stopId/activities`                    | Yes  | List stop activities       |
| PATCH  | `/api/trips/:tripId/stops/:stopId/activities/:id`                | Yes  | Update a trip activity     |
| DELETE | `/api/trips/:tripId/stops/:stopId/activities/:id`                | Yes  | Delete a trip activity     |

### Activities (Catalog)

| Method | Path                  | Auth | Description                  |
| ------ | --------------------- | ---- | ---------------------------- |
| GET    | `/api/activities`     | No   | List activities (filter/page)|

### Expenses

| Method | Path                                       | Auth | Description             |
| ------ | ------------------------------------------ | ---- | ----------------------- |
| POST   | `/api/trips/:tripId/expenses`              | Yes  | Add an expense          |
| GET    | `/api/trips/:tripId/expenses`              | Yes  | List expenses           |
| PATCH  | `/api/trips/:tripId/expenses/:expenseId`   | Yes  | Update an expense       |
| DELETE | `/api/trips/:tripId/expenses/:expenseId`   | Yes  | Delete an expense       |

### Budget

| Method | Path                                    | Auth | Description                      |
| ------ | --------------------------------------- | ---- | -------------------------------- |
| GET    | `/api/trips/:tripId/budget`             | Yes  | Basic budget summary             |
| GET    | `/api/trips/:tripId/budget/analysis`    | Yes  | Full budget analysis & insights  |

## Database Schema

```
users  ──────┐
             │ 1:N
             ▼
trips  ──────┤
             │ 1:N
             ▼
trip_stops ──┤──── N:1 ──── cities
             │ 1:N                │ 1:N
             ▼                    ▼
trip_activities ── N:1 ─── activities
             
expenses ──── N:1 ──── trips
```

**Tables:** `users`, `trips`, `cities`, `trip_stops`, `activities`, `trip_activities`, `expenses`

## Project Structure

```
server/
├── src/
│   ├── config/          # Environment config & DB pool
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, error handler, rate limiter, validation
│   ├── routes/          # Express routers
│   ├── services/        # Business logic & database queries
│   ├── utils/           # Helpers (API response, JWT, password hashing)
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── database/
│   ├── schema.sql       # Table definitions
│   └── seed.sql         # Dev seed data
├── .env.example
├── package.json
└── README.md
```

## API Response Format

Every endpoint returns:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "error": null
}
```

Validation errors return `422`:

```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "error": [
    { "field": "email", "message": "Please provide a valid email address.", "value": "not-an-email" }
  ]
}
```

## Security

### Authentication
- JWT-based authentication via `Authorization: Bearer <token>` header.
- Passwords are hashed with **bcrypt** (12 salt rounds).
- Tokens expire after the `JWT_EXPIRES_IN` interval (default: 7 days).
- The `authenticate` middleware verifies the token AND checks the user still exists in the database.

### Authorisation
- Role-based access control via `requireRole()` / `requireAdmin` middleware.
- Users table has a `role` column constrained to `'user'` or `'admin'`.
- Place `requireAdmin` after `authenticate` on any admin-only route:
  ```js
  router.get('/admin/stats', authenticate, requireAdmin, handler);
  ```

### Rate Limiting
- **Auth endpoints** (`/api/auth/*`): 15 requests per 15-minute window per IP.
- **General API** (`/api/*`): 100 requests per 15-minute window per IP.
- Standard `X-RateLimit-*` and `Retry-After` headers are sent.
- Configurable via environment variables (see below).

### Error Handling
- SQL errors, stack traces, and internal details are **never leaked** in production.
- PostgreSQL error codes (unique violation, foreign key, etc.) are mapped to safe HTTP responses.
- JWT errors return appropriate 401 messages.
- Malformed JSON returns 400.
- All unclassified errors return a generic `"Internal server error."` in production.

### Security Headers
- `X-Powered-By` is disabled.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` is set in production.

### Validation
- All request bodies are validated using **express-validator** middleware.
- Validation runs in the middleware chain before the controller — invalid requests never reach business logic.
- Emails are normalised to lowercase.

## Environment Variables

See [`.env.example`](.env.example) for the full list.
