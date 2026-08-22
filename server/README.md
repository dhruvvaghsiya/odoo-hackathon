# GlobeTrotter — Server

Express + PostgreSQL backend API for the GlobeTrotter platform.

## Tech Stack

| Layer        | Technology          |
| ------------ | ------------------- |
| Runtime      | Node.js             |
| Framework    | Express 4           |
| Database     | PostgreSQL + `pg`   |
| Auth         | JWT + bcrypt        |
| Validation   | express-validator   |
| Config       | dotenv              |

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

| Script         | Description                              |
| -------------- | ---------------------------------------- |
| `npm start`    | Start the production server              |
| `npm run dev`  | Start with nodemon (auto-reload)         |
| `npm run db:schema` | Apply `database/schema.sql`         |
| `npm run db:seed`   | Apply `database/seed.sql`           |
| `npm run db:reset`  | Schema + seed in one command        |

## API Endpoints

### Health

| Method | Path           | Auth | Description          |
| ------ | -------------- | ---- | -------------------- |
| GET    | `/api/health`  | No   | Server & DB health   |

### Authentication

| Method | Path                 | Auth | Description                    |
| ------ | -------------------- | ---- | ------------------------------ |
| POST   | `/api/auth/register` | No   | Create a new account           |
| POST   | `/api/auth/login`    | No   | Authenticate & receive a JWT   |
| POST   | `/api/auth/logout`   | Yes  | Logout (client-side discard)   |

### User Profile

| Method | Path             | Auth | Description                    |
| ------ | ---------------- | ---- | ------------------------------ |
| GET    | `/api/users/me`  | Yes  | Get authenticated user profile |
| PATCH  | `/api/users/me`  | Yes  | Update profile fields          |
| DELETE | `/api/users/me`  | Yes  | Permanently delete account     |

## Authentication

The API uses **JWT Bearer tokens**. After registering or logging in, the server returns a token in the response body. Include it in subsequent requests:

```
Authorization: Bearer <token>
```

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"secret123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'
```

### Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

> **Note:** JWT is stateless — the server cannot revoke tokens without a blacklist. The `/logout` endpoint returns a success response so the frontend has a canonical URL to call. **Token invalidation is handled client-side** (discard the stored token). If server-side revocation is needed later, implement a token blacklist (e.g. Redis set of revoked JTIs checked in auth middleware).

### Update Profile

Updatable fields: `name`, `email`, `profile_photo`, `language`. Only send the fields you want to change.

```bash
curl -X PATCH http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","language":"fr"}'
```

### Delete Account

```bash
curl -X DELETE http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <token>"
```

> **Warning:** This permanently deletes the user and all associated trips/stops (via DB cascade). This action cannot be undone.

## Project Structure

```
server/
├── src/
│   ├── config/          # Environment config & DB pool
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Error handler, 404, auth, validation
│   ├── routes/          # Express routers
│   ├── services/        # Business logic
│   ├── utils/           # Helpers (API response format)
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

## Environment Variables

See [`.env.example`](.env.example) for the full list.

