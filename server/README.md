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
