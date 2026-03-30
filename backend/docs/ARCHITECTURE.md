# Backend Architecture

## Module Overview

The backend follows the standard NestJS modular architecture. Each domain feature is encapsulated in its own module with a controller, service, and DTOs.

```
AppModule
├── PrismaModule        (GLOBAL) Database access
├── AuthModule          JWT authentication & authorization
├── ProductsModule      Product catalog CRUD + slug lookup
├── CategoriesModule    Category management CRUD
└── OrdersModule        Order management + public checkout
```

### Module Dependencies

```
AppModule
│
├── PrismaModule ──────── @Global(), provides PrismaService to all modules
│
├── AuthModule
│   ├── PassportModule
│   ├── JwtModule (async config via ConfigService)
│   ├── AuthService
│   └── JwtStrategy
│
├── ProductsModule ────── injects PrismaService
│
├── CategoriesModule ──── injects PrismaService
│
└── OrdersModule ──────── injects PrismaService
```

All modules follow the pattern: `Module → Controller → Service → PrismaService`.

## Authentication Flow

The authentication system uses **JWT + Passport.js** with role-based access control (RBAC).

### Login Flow

```
Client                  AuthController           AuthService            Database
  │                          │                       │                     │
  ├── POST /auth/login ─────>│                       │                     │
  │   { email, password }    ├── login() ───────────>│                     │
  │                          │                       ├── findUser() ──────>│
  │                          │                       │<── user ────────────┤
  │                          │                       ├── bcrypt.compare()  │
  │                          │                       ├── jwt.sign()        │
  │                          │<── { access_token } ──┤                     │
  │<── 200 { token, user } ──┤                       │                     │
```

### Protected Route Flow

```
Client                  Guard Chain              Controller          Service
  │                          │                       │                  │
  ├── GET /products/stats ──>│                       │                  │
  │   Authorization: Bearer  │                       │                  │
  │                          ├── JwtAuthGuard        │                  │
  │                          │   Validate token      │                  │
  │                          │   Extract user        │                  │
  │                          ├── RolesGuard          │                  │
  │                          │   Check @Roles()      │                  │
  │                          │   metadata            │                  │
  │                          ├──────────────────────>│                  │
  │                          │                       ├── stats() ──────>│
  │<── 200 { stats } ────────┤                       │                  │
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| JwtStrategy | `src/auth/jwt.strategy.ts` | Extracts and validates JWT from `Authorization: Bearer` header |
| JwtAuthGuard | `src/auth/jwt-auth.guard.ts` | Guard wrapper that triggers Passport JWT validation |
| RolesGuard | `src/auth/roles.guard.ts` | Reads `@Roles()` metadata and checks `user.role` |
| @Roles() | `src/auth/roles.decorator.ts` | Sets required roles metadata on route handlers |

### JWT Configuration

- **Secret:** `JWT_SECRET` env variable
- **Expiration:** 7 days
- **Payload:** `{ sub: userId, email, role }`

### Roles

| Role | Access |
|------|--------|
| `ADMIN` | Full CRUD on products, categories, orders + dashboard stats |
| `CUSTOMER` | Public endpoints only (product listing, category listing) |

## Database Schema

### Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│   User   │       │ Category │       │ ProductImage │
├──────────┤       ├──────────┤       ├──────────────┤
│ id       │       │ id       │       │ id           │
│ email    │       │ name     │       │ url          │
│ password │       │ slug     │       │ alt          │
│ name     │       └────┬─────┘       │ productId    │
│ role     │            │             └──────┬───────┘
└────┬─────┘            │                    │
     │              ┌───┴──────┐             │
     │              │ Product  │─────────────┘
     │              ├──────────┤
     │              │ id       │
     │              │ name     │
     │              │ slug     │
     │              │ description
     │              │ price    │
     │              │ stock    │
     │              │ categoryId
     │              └───┬──────┘
     │                  │
┌────┴─────────────┐  ┌────┴──────┐
│     Order        │──│ OrderItem │
├──────────────────┤  ├───────────┤
│ id               │  │ id        │
│ userId (nullable)│  │ orderId   │
│ customerName     │  │ productId │
│ customerEmail    │  │ quantity  │
│ shippingAddress  │  │ price     │
│ shippingCity     │  └───────────┘
│ shippingState    │
│ shippingZip      │
│ shippingCountry  │
│ status           │
│ total            │
└──────────────────┘
```

### Relationships

| Relation | Type | Cascade |
|----------|------|---------|
| User → Orders | One-to-Many (optional) | - |
| Category → Products | One-to-Many | - |
| Product → ProductImages | One-to-Many | Delete |
| Product → OrderItems | One-to-Many | - |
| Order → OrderItems | One-to-Many | Delete |

**Note:** `Order.userId` is nullable to support guest checkout. Orders always have `customerName` and `customerEmail`.

### Enums

**Role:** `ADMIN` | `CUSTOMER`

**OrderStatus:** `PENDING` | `PAID` | `PROCESSING` | `SHIPPED` | `DELIVERED` | `CANCELLED`

## Request Pipeline

Every incoming request passes through this pipeline:

```
Request
  │
  ├── 1. CORS (origin: http://localhost:3000)
  ├── 2. ThrottlerGuard (global rate limiting)
  │       ├── short:  3 req / 1s
  │       ├── medium: 20 req / 10s
  │       └── long:   100 req / 60s
  ├── 3. ValidationPipe (global)
  │       ├── whitelist: true (strip unknown)
  │       ├── forbidNonWhitelisted: true
  │       └── transform: true (auto-cast types)
  ├── 4. JwtAuthGuard (on protected routes)
  ├── 5. RolesGuard (on role-restricted routes)
  ├── 6. Controller → Service → Prisma
  └── 7. AllExceptionsFilter (standardized errors)
          ├── 4xx: { statusCode, message, timestamp, path }
          └── 5xx: logged with stack trace, generic message to client
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Prisma 7 with `@prisma/adapter-pg`** | Native `pg` pool provides better connection management than Prisma's built-in connection pool |
| **Global PrismaModule** | Single database connection shared across all modules, no need to import per-module |
| **Two-guard pattern (JWT + Roles)** | Decouples authentication from authorization; routes can be auth-only or auth+role |
| **Global exception filter** | Consistent error response format; prevents stack traces from leaking to clients |
| **Global ValidationPipe with transform** | Automatic DTO type coercion (query string → number) eliminates manual parsing |
| **Rate limiting profiles** | Three tiers prevent abuse while allowing normal usage; login has a stricter custom limit |
| **Idempotent seed script** | Uses `upsert` so seed can be safely re-run without duplicating data |
