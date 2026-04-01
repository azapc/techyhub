<p align="center">
  <h1 align="center">TechyHub</h1>
</p>
<h4 align="center">
    <a href="backend/docs/ARCHITECTURE.md">Architecture</a> |
    <a href="backend/docs/TECHNICAL.md">Backend Docs</a> |
    <a href="frontend/docs/TECHNICAL.md">Frontend Docs</a>
</h4>

<p align="center">
  <a href="https://opensource.org/licenses/GPL-3.0"><img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License"></a>
</p>

<p align="center">
<img alt="TechyHub Storefront" width="950" src=".github/images/storefront.png"/>
</p>

## Introduction

TechyHub is a full-stack eCommerce platform built with Nuxt.js and NestJS. It features a public storefront with guest checkout and an admin dashboard for managing products, categories, and orders — all powered by a PostgreSQL database and Prisma ORM.

## Features

- **Public storefront** — Browse products, filter by category, search, and view product details
- **Guest checkout** — Place orders without creating an account
- **Shopping cart** — Client-side cart with quantity management and stock validation
- **Order confirmation** — Track your order after checkout
- **Admin dashboard** — Manage products, categories, and orders with role-based access
- **SEO-friendly URLs** — Slug-based product routes
- **REST API** — Fully documented with Swagger
- **Security** — JWT auth, rate limiting, input validation, role guards

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 4 (Vue 3) + Nuxt UI + Pinia |
| Backend | NestJS 11 + TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |
| Auth | JWT + Passport.js |
| Container | Podman / Docker |

## Getting Started

### 1. Database

```bash
# Using Podman
podman run -d --name ecommerce-postgres \
  -e POSTGRES_USER=ecommerce \
  -e POSTGRES_PASSWORD=ecommerce123 \
  -e POSTGRES_DB=ecommerce \
  -p 5432:5432 \
  docker.io/library/postgres:16

# Or Docker
docker run -d --name ecommerce-postgres \
  -e POSTGRES_USER=ecommerce \
  -e POSTGRES_PASSWORD=ecommerce123 \
  -e POSTGRES_DB=ecommerce \
  -p 5432:5432 \
  postgres:16
```

### 2. Backend

```bash
cd backend
pnpm install

# Create .env file
cat <<EOF > .env
DATABASE_URL="postgresql://ecommerce:ecommerce123@localhost:5432/ecommerce"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
EOF

# Run migrations and seed
npx prisma migrate deploy
pnpm seed

# Start dev server
pnpm start:dev
```

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The storefront will be available at `http://localhost:3000` and the API at `http://localhost:3001`.

## Demo

<table>
  <tr>
    <td><strong>Storefront</strong></td>
    <td><a href="http://localhost:3000">http://localhost:3000</a></td>
  </tr>
  <tr>
    <td><strong>Product Catalog</strong></td>
    <td><a href="http://localhost:3000/products">http://localhost:3000/products</a></td>
  </tr>
  <tr>
    <td><strong>Admin Dashboard</strong></td>
    <td><a href="http://localhost:3000/admin">http://localhost:3000/admin</a></td>
  </tr>
  <tr>
    <td><strong>API Docs (Swagger)</strong></td>
    <td><a href="http://localhost:3001/api/docs">http://localhost:3001/api/docs</a></td>
  </tr>
</table>

**Admin credentials:**

```
Email:    admin@ecommerce.com
Password: admin123
```

## Documentation

Each subproject has detailed architecture and technical documentation:

- [Backend Architecture](backend/docs/ARCHITECTURE.md)
- [Backend Technical Guide](backend/docs/TECHNICAL.md)
- [Frontend Architecture](frontend/docs/ARCHITECTURE.md)
- [Frontend Technical Guide](frontend/docs/TECHNICAL.md)

## License

[GPL-3.0 License](LICENSE)
