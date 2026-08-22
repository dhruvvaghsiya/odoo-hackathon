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

| Method | Path           | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/api/health`  | Server & DB health   |

## Project Structure

```
server/
├── src/
│   ├── config/          # Environment config & DB pool
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Error handler, 404, auth (future)
│   ├── routes/          # Express routers
│   ├── services/        # Business logic (future)
│   ├── utils/           # Helpers (API response format)
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── database/
│   ├── schema.sql         # Table definitions
│   └── seed.sql           # Dev seed data
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
