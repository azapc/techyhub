# Frontend Technical Guide

## Setup

### Prerequisites

- Node.js >= 22 (via [nvm](https://github.com/nvm-sh/nvm))
- pnpm
- Backend API running on port 3001

### Installation

```bash
cd frontend
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:3000`.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking (vue-tsc) |
| `pnpm postinstall` | Runs `nuxt prepare` (auto-generates types) |

## Configuration

### Nuxt Config (`nuxt.config.ts`)

| Setting | Value | Description |
|---------|-------|-------------|
| `compatibilityDate` | `2025-01-15` | Nuxt compatibility target |
| `modules` | `@nuxt/eslint`, `@nuxt/ui`, `@pinia/nuxt` | Registered Nuxt modules |
| `runtimeConfig.public.apiBase` | `http://localhost:3001` | Backend API URL |
| `routeRules./admin/**` | `{ ssr: false }` | Disable SSR for admin pages |
| `devtools` | `true` | Enable Nuxt DevTools |

### App Config (`app.config.ts`)

```typescript
ui: {
  colors: {
    primary: 'green',
    neutral: 'slate'
  }
}
```

### Runtime Config

The API base URL is configured via Nuxt's runtime config:

```typescript
// nuxt.config.ts
runtimeConfig: {
  public: {
    apiBase: 'http://localhost:3001'
  }
}
```

Override at runtime with environment variable:

```bash
NUXT_PUBLIC_API_BASE=https://api.example.com pnpm dev
```

## Styling

### Tailwind CSS 4

Styles are configured in `app/assets/css/main.css`:

- Imports: `@tailwindcss`, `@nuxt/ui`
- Custom green color palette (50-950 shades)
- Font: Public Sans

### Nuxt UI v4 Conventions

Key differences from Nuxt UI v2/v3:

| Component | Correct Prop | Incorrect |
|-----------|-------------|-----------|
| `UTable` | `:data` | ~~`:rows`~~ |
| `UTable` columns | `accessorKey` | ~~`key`~~ |
| `UTable` cell slots | `#xxx-cell` | ~~`#xxx`~~ |
| `USelect` | `:items` | ~~`:options`~~ |

### Page Transitions

Page and layout transitions are enabled with `out-in` mode for smooth navigation.

## Authentication

### Login Flow

1. User submits credentials on `/login`
2. `POST /auth/login` returns `{ access_token, user }`
3. Token and user stored in Pinia + `localStorage`
4. Redirect to `/admin`

### Token Management

- Stored in `localStorage` under keys managed by Pinia
- Attached to every API request via `useApi` composable
- On 401 response: auto-logout and redirect to `/login`
- On page refresh: `restore()` re-hydrates from `localStorage`

### Test Credentials

```
Email:    admin@ecommerce.com
Password: admin123
```

## Admin Pages

### Dashboard (`/admin`)

Displays four stat cards fetched from `GET /products/stats`:
- Total products
- Total orders
- Revenue
- Low stock items

### Products (`/admin/products`)

- List with search by name and category filter
- Pagination
- Create: `/admin/products/create`
- Edit: `/admin/products/:id/edit`
- Delete with confirmation

### Categories (`/admin/categories`)

- List with product count
- Inline create/edit via modal or form
- Delete with confirmation

### Orders (`/admin/orders`)

- List with status filter dropdown
- Inline status update via badge/dropdown
- Detail view with order items

## Coding Conventions

### Page Meta

All admin pages must declare:

```typescript
definePageMeta({
  layout: 'admin',
  middleware: ['admin']   // Array syntax, not string
})
```

### API Calls

Use the `useApi` composable for all backend communication:

```typescript
const api = useApi()

// GET
const products = await api.get<ProductResponse>('/products?page=1')

// POST
const product = await api.post<Product>('/products', { name: '...' })

// PUT
await api.put(`/products/${id}`, data)

// DELETE
await api.del(`/products/${id}`)
```

### Components

- Components in `app/components/` are auto-imported
- Admin-specific components go in `app/components/admin/`
- Nuxt UI components (`UButton`, `UTable`, etc.) are globally available

## Project Structure

```
frontend/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css              # Tailwind + custom theme
│   ├── components/
│   │   └── admin/
│   │       └── ProductForm.vue       # Reusable product form
│   ├── composables/
│   │   └── useApi.ts                 # HTTP client wrapper
│   ├── layouts/
│   │   ├── default.vue               # Public pages layout
│   │   └── admin.vue                 # Admin sidebar layout
│   ├── middleware/
│   │   └── admin.ts                  # Auth + role guard
│   ├── pages/
│   │   ├── index.vue                 # Landing page
│   │   ├── login.vue                 # Login form
│   │   └── admin/
│   │       ├── index.vue             # Dashboard
│   │       ├── products/
│   │       │   ├── index.vue         # Product list
│   │       │   ├── create.vue        # New product
│   │       │   └── [id]/
│   │       │       └── edit.vue      # Edit product
│   │       ├── categories/
│   │       │   └── index.vue         # Category management
│   │       └── orders/
│   │           └── index.vue         # Order management
│   ├── stores/
│   │   └── auth.ts                   # Pinia auth store
│   └── app.config.ts                 # UI theme config
├── public/
│   └── favicon.ico
├── nuxt.config.ts                    # Nuxt configuration
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `nuxt` | 4.4.2 | Core framework |
| `@nuxt/ui` | 4.5.1 | UI component library |
| `pinia` | 3.0.4 | State management |
| `@pinia/nuxt` | 0.11.3 | Pinia integration for Nuxt |
| `tailwindcss` | 4.2.1 | Utility-first CSS |
| `vee-validate` | 4.15.1 | Form validation |
| `zod` | 4.3.6 | Schema validation |
| `@iconify-json/lucide` | 1.2.98 | Lucide icon set |
| `@iconify-json/simple-icons` | 1.2.74 | Brand icon set |
| `typescript` | 5.9.3 | Type checking |
| `vue-tsc` | 3.2.5 | Vue TypeScript compiler |
