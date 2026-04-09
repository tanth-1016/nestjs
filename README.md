## Tech Stack

- [NestJS](https://nestjs.com/) v11
- [nestjs-i18n](https://nestjs-i18n.com/) v10 — internationalization
- [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) v11 — API documentation
- Jest — unit & e2e testing

## Prerequisites

- Node.js >= 22
- npm >= 9

## Installation

```bash
npm install
```

## Running the App

```bash
# development (watch mode)
npm run start:dev

# production
npm run build
npm run start:prod
```

The server starts at `http://localhost:3000` by default. Set the `PORT` environment variable to change it.

#### Example requests

```bash
# English (default)
curl http://localhost:3000/api/hello/hello-world
# → Hello World

# Vietnamese via header
curl -H "x-lang: vi" http://localhost:3000/api/hello/hello-world
# → Xin chào thế giới

# Vietnamese via query param
curl "http://localhost:3000/api/hello/hello-world?lang=vi"
# → Xin chào thế giới
```

## Testing

```bash
# unit tests
npm run test

# unit tests (watch)
npm run test:watch

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## Database Migrations

```bash
# add: generate a new migration from entity changes
npm run db:migration:generate -- src/database/migrations/AddUsersTable

# apply: run all pending migrations
npm run db:migration:run

# revert: rollback the last executed migration
npm run db:migration:revert

# show: list applied/pending migrations
npm run db:migration:show
```

## Auth Quick Test

```bash
# register (success)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"b@example.com","password":"12345678"}'

# login (success)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"b@example.com","password":"12345678"}'

# me (protected) - replace YOUR_ACCESS_TOKEN
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# register duplicate email (expect 409)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"b@example.com","password":"12345678"}'

# login wrong password (expect 401)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"b@example.com","password":"wrong-password"}'
```

## Project Structure

```
src/
├── app.controller.ts   # HTTP layer — route handlers
├── app.service.ts      # Business logic — translation
├── app.module.ts       # Root module
├── main.ts             # Bootstrap (Swagger, global prefix)
└── i18n/
    ├── en/
    │   └── common.json
    └── vi/
        └── common.json
test/
└── app.e2e-spec.ts     # End-to-end tests
```
