## Tech Stack

- [NestJS](https://nestjs.com/) v11
- [nestjs-i18n](https://nestjs-i18n.com/) v10 — internationalization
- [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) v11 — API documentation
- Jest — unit & e2e testing

## Prerequisites

- Node.js >= 18
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

## Environment Variables

| Variable         | Default | Description                                   |
| ---------------- | ------- | --------------------------------------------- |
| `PORT`           | `3000`  | Port the server listens on                    |
| `NODE_ENV`       | —       | Set to `production` to disable Swagger        |
| `ENABLE_SWAGGER` | —       | Set to `true` to force-enable Swagger in prod |
