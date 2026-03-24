# Backend Technical Guide

## Setup

### Prerequisites

- Node.js >= 22 (via [nvm](https://github.com/nvm-sh/nvm))
- pnpm
- PostgreSQL 16 (via Podman/Docker or local)

### Installation

```bash
cd backend
pnpm install
```

### Database

Start PostgreSQL with Podman:

```bash
podman run -d --name ecommerce-postgres \
  -e POSTGRES_USER=ecommerce \
  -e POSTGRES_PASSWORD=ecommerce123 \
  -e POSTGRES_DB=ecommerce \
  -p 5432:5432 \
  docker.io/library/postgres:16
```

Run migrations and seed:

```bash
npx prisma migrate deploy
pnpm seed
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://ecommerce:ecommerce123@localhost:5432/ecommerce` |
| `JWT_SECRET` | Secret key for JWT signing | `super-secret-jwt-key-change-in-production` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `3001` |

Variables are loaded globally via `@nestjs/config` (`ConfigModule.forRoot({ isGlobal: true })`).

## Commands

| Command | Description |
|---------|-------------|
| `pnpm start:dev` | Start dev server with hot-reload |
| `pnpm start:debug` | Start with debug mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm start:prod` | Run compiled build |
| `pnpm seed` | Seed database with initial data |
| `pnpm lint` | Run ESLint with auto-fix |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:cov` | Run tests with coverage |
| `pnpm test:e2e` | Run end-to-end tests |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma migrate deploy` | Apply pending migrations |
| `npx prisma studio` | Open Prisma Studio GUI |
| `npx prisma generate` | Regenerate Prisma Client |

## API Reference

Base URL: `http://localhost:3001`

Swagger UI: `http://localhost:3001/api/docs`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login, returns JWT. Rate limited: 5 req/60s |
| GET | `/auth/profile` | JWT | Get authenticated user profile |

**POST /auth/login**

```json
// Request
{ "email": "admin@ecommerce.com", "password": "admin123" }

// Response 200
{
  "access_token": "eyJhbG...",
  "user": { "id": "...", "email": "admin@ecommerce.com", "name": "Admin", "role": "ADMIN" }
}
```

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | Public | List products (paginated) |
| GET | `/products/stats` | Admin | Dashboard statistics |
| GET | `/products/:id` | Public | Get single product |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

**GET /products** query parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number (min: 1) |
| `limit` | int | 20 | Items per page (min: 1, max: 100) |
| `search` | string | - | Search by product name |
| `categoryId` | string | - | Filter by category |

**GET /products/stats** response:

```json
{ "totalProducts": 4, "totalOrders": 0, "revenue": 0, "lowStock": 1 }
```

**POST /products** body:

```json
{
  "name": "MacBook Pro 16",
  "slug": "macbook-pro-16",
  "description": "Laptop with M4 chip",
  "price": 2499.99,
  "stock": 10,
  "categoryId": "clxx...",
  "images": ["https://example.com/image.jpg"]
}
```

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | Public | List all categories (with product count) |
| GET | `/categories/:id` | Public | Get single category |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

**POST /categories** body:

```json
{ "name": "Laptops", "slug": "laptops" }
```

### Orders

All order endpoints require Admin authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders` | Admin | List orders (paginated, filterable by status) |
| GET | `/orders/:id` | Admin | Get order with items |
| PATCH | `/orders/:id/status` | Admin | Update order status |

**GET /orders** query parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max: 100) |
| `status` | string | - | Filter by status |

**PATCH /orders/:id/status** body:

```json
{ "status": "SHIPPED" }
```

Valid statuses: `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

## Validation

All incoming requests are validated globally with `class-validator`:

- **whitelist:** Properties not in the DTO are silently stripped
- **forbidNonWhitelisted:** Extra properties cause a `400 Bad Request`
- **transform:** Query strings and params are auto-cast to their DTO types

Slugs must match the pattern `/^[a-z0-9-]+$/`.

## Error Response Format

All errors follow a consistent structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed" | "Unauthorized" | "Forbidden",
  "timestamp": "2026-03-23T12:00:00.000Z",
  "path": "/products"
}
```

5xx errors are logged server-side with the full stack trace but return a generic message to the client.

## Prisma 7 Notes

Prisma 7 introduced breaking changes from previous versions:

- **Connection URL** is configured in `prisma.config.ts`, NOT in `schema.prisma`
- **Adapter pattern:** Uses `@prisma/adapter-pg` with a native `pg` Pool instance
- **PrismaService** extends `PrismaClient` and creates the adapter in its constructor
- **Migrations:** Run `npx prisma migrate dev` (creates and applies) or `npx prisma migrate deploy` (applies only)

## Project Structure

```
backend/
├── src/
│   ├── main.ts                         # Bootstrap, CORS, Swagger, global pipes/filters
│   ├── app.module.ts                   # Root module with imports and throttler config
│   ├── auth/
│   │   ├── auth.module.ts              # PassportModule + JwtModule config
│   │   ├── auth.controller.ts          # POST /login, GET /profile
│   │   ├── auth.service.ts             # Login logic, bcrypt, JWT signing
│   │   ├── jwt.strategy.ts             # Passport JWT extraction & validation
│   │   ├── jwt-auth.guard.ts           # Guard wrapping JWT strategy
│   │   ├── roles.guard.ts              # Role-checking guard
│   │   ├── roles.decorator.ts          # @Roles() decorator
│   │   └── dto/
│   │       └── login.dto.ts
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts      # CRUD + stats endpoints
│   │   ├── products.service.ts         # Business logic, pagination, search
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       ├── update-product.dto.ts
│   │       └── find-products-query.dto.ts
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts        # All endpoints require ADMIN role
│   │   ├── orders.service.ts
│   │   └── dto/
│   │       ├── update-status.dto.ts
│   │       └── find-orders-query.dto.ts
│   ├── prisma/
│   │   ├── prisma.module.ts            # @Global() module
│   │   └── prisma.service.ts           # PrismaClient + pg adapter
│   └── common/
│       └── filters/
│           └── all-exceptions.filter.ts
├── prisma/
│   ├── schema.prisma                   # Database schema
│   ├── seed.ts                         # Initial data (admin user, categories, products)
│   └── migrations/
├── prisma.config.ts                    # Prisma 7 configuration
├── .env                                # Environment variables
├── package.json
└── tsconfig.json
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/core` | 11.0.1 | NestJS framework |
| `@nestjs/jwt` | 11.0.2 | JWT token generation |
| `@nestjs/passport` | 11.0.5 | Passport.js integration |
| `@nestjs/swagger` | 11.2.6 | OpenAPI/Swagger docs |
| `@nestjs/throttler` | 6.5.0 | Rate limiting |
| `@nestjs/config` | 4.0.3 | Environment variable management |
| `@prisma/client` | 7.5.0 | Database ORM |
| `@prisma/adapter-pg` | 7.5.0 | PostgreSQL adapter for Prisma 7 |
| `bcrypt` | 6.0.0 | Password hashing |
| `class-validator` | 0.15.1 | DTO validation |
| `class-transformer` | 0.5.1 | DTO transformation |
