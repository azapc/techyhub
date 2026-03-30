# TechyHub Ecommerce

Full-stack ecommerce platform with a public storefront and an admin dashboard for managing products, categories, and orders.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 4 (Vue 3) + Nuxt UI v4 + Pinia |
| Backend | NestJS 11 + TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |
| Auth | JWT + Passport.js |
| Container | Podman / Docker |

## Prerequisites

- Node.js >= 22 (recommended via [nvm](https://github.com/nvm-sh/nvm))
- pnpm
- PostgreSQL 16 (or Podman/Docker)

## Project Structure

```
ecommerce/
├── backend/             # NestJS REST API (port 3001)
│   ├── src/
│   │   ├── auth/        # JWT authentication & role guards
│   │   ├── products/    # Products CRUD
│   │   ├── categories/  # Categories CRUD
│   │   ├── orders/      # Orders management
│   │   ├── prisma/      # PrismaService (global)
│   │   └── common/      # Exception filters
│   └── prisma/          # Schema, migrations & seed
└── frontend/            # Nuxt.js app (port 3000)
    └── app/
        ├── pages/       # File-based routing (store + admin)
        ├── components/  # Vue components
        ├── composables/ # useApi
        ├── stores/      # Pinia (auth + cart)
        ├── layouts/     # Store, admin & default layouts
        └── middleware/  # Auth middleware
```

## Getting Started

### 1. Database

Using Podman:

```bash
podman run -d --name ecommerce-postgres \
  -e POSTGRES_USER=ecommerce \
  -e POSTGRES_PASSWORD=ecommerce123 \
  -e POSTGRES_DB=ecommerce \
  -p 5432:5432 \
  docker.io/library/postgres:16
```

Or Docker:

```bash
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

## URLs

| Service | URL |
|---------|-----|
| Storefront | http://localhost:3000 |
| Product Catalog | http://localhost:3000/products |
| Shopping Cart | http://localhost:3000/cart |
| Checkout | http://localhost:3000/checkout |
| Admin Dashboard | http://localhost:3000/admin |
| Backend API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/api/docs |

## Default Admin Credentials

```
Email:    admin@ecommerce.com
Password: admin123
```

> Change these credentials in production.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login (returns JWT) |
| GET | `/auth/profile` | Get current user profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (paginated, filterable) |
| GET | `/products/slug/:slug` | Get product by slug |
| GET | `/products/stats` | Dashboard stats (admin) |
| GET | `/products/:id` | Get product by ID |
| POST | `/products` | Create product (admin) |
| PUT | `/products/:id` | Update product (admin) |
| DELETE | `/products/:id` | Delete product (admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories |
| GET | `/categories/:id` | Get category by ID |
| POST | `/categories` | Create category (admin) |
| PUT | `/categories/:id` | Update category (admin) |
| DELETE | `/categories/:id` | Delete category (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/checkout` | Place an order (public, no auth) |
| GET | `/orders/confirmation/:id` | Order confirmation (public, limited data) |
| GET | `/orders` | List orders (admin) |
| GET | `/orders/:id` | Get order by ID (admin) |
| PATCH | `/orders/:id/status` | Update order status (admin) |

## Database Schema

```
User ──< Order ──< OrderItem >── Product >── Category
                                  Product ──< ProductImage
```

**Models:** User, Category, Product, ProductImage, Order, OrderItem

## Security

- JWT authentication with Passport.js
- Role-based access control (ADMIN / CUSTOMER)
- Global rate limiting (3/s, 20/10s, 100/min)
- Stricter rate limit on login (5 attempts/min)
- Input validation with class-validator on all endpoints
- Unknown properties rejected (`forbidNonWhitelisted`)
- Global exception filter (no stack traces exposed)

## Documentation

Each subproject has its own detailed documentation:

| Project | Architecture | Technical Guide |
|---------|-------------|-----------------|
| Backend | [backend/docs/ARCHITECTURE.md](backend/docs/ARCHITECTURE.md) | [backend/docs/TECHNICAL.md](backend/docs/TECHNICAL.md) |
| Frontend | [frontend/docs/ARCHITECTURE.md](frontend/docs/ARCHITECTURE.md) | [frontend/docs/TECHNICAL.md](frontend/docs/TECHNICAL.md) |

## License

MIT
