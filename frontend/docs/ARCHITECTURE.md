# Frontend Architecture

## Overview

The frontend is a **Nuxt 4** application with a **public storefront** and an **admin dashboard** for the TechyHub ecommerce platform. It follows the Nuxt 4 directory convention where all application code lives inside the `app/` directory.

## Pages & Routing

Nuxt uses file-based routing. Each `.vue` file in `pages/` becomes a route.

### Public Storefront

```
app/pages/
├── index.vue                    → /                    (homepage: hero, categories, featured products)
├── login.vue                    → /login               (admin login)
├── cart.vue                     → /cart                 (shopping cart)
├── checkout.vue                 → /checkout             (guest checkout form)
├── checkout/
│   └── success.vue              → /checkout/success     (order confirmation)
└── products/
    ├── index.vue                → /products             (product catalog with filters)
    └── [slug].vue               → /products/:slug       (product detail page)
```

### Admin Panel

```
app/pages/admin/
├── index.vue                    → /admin                (dashboard with stats)
├── products/
│   ├── index.vue                → /admin/products       (product list)
│   ├── create.vue               → /admin/products/create
│   └── [id]/
│       └── edit.vue             → /admin/products/:id/edit
├── categories/
│   └── index.vue                → /admin/categories
└── orders/
    ├── index.vue                → /admin/orders         (order list)
    └── [id].vue                 → /admin/orders/:id     (order detail)
```

### Route Protection

All `/admin/**` routes are protected by the `admin` middleware and rendered client-side only (SSR disabled via route rules).

Cart, checkout, and checkout/success pages also have SSR disabled since they depend on `localStorage` for cart data.

```
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
```

## Layouts

### Store Layout (`app/layouts/store.vue`)

Public storefront layout used by all customer-facing pages:

```
┌──────────────────────────────────────────────┐
│  Header                                      │
│  ┌────────┐  ┌──────────────┐  ┌────┐ ┌──┐  │
│  │ Logo   │  │ Search...    │  │Shop│ │🛒│  │
│  └────────┘  └──────────────┘  └────┘ └──┘  │
├──────────────────────────────────────────────┤
│                                              │
│  <slot /> (page content)                     │
│                                              │
├──────────────────────────────────────────────┤
│  Footer                                      │
│  TechyHub  │  Quick Links  │  Contact        │
└──────────────────────────────────────────────┘
```

Features:
- Sticky header with logo, search bar, shop link, and cart icon with badge
- Responsive search (hidden on mobile, shown below on small screens)
- Cart badge shows total item count from cart store
- Footer with links and copyright

### Admin Layout (`app/layouts/admin.vue`)

Two-column layout for all admin pages:

```
┌──────────────────────────────────────────┐
│  Sidebar (264px)  │   Main Content       │
│                   │                      │
│  TechyHub Admin   │   <slot />           │
│                   │   (page content)     │
│  Dashboard        │                      │
│  Products         │                      │
│  Categories       │                      │
│  Orders           │                      │
│                   │                      │
│  ───────────────  │                      │
│  User info        │                      │
│  Sign out         │                      │
└──────────────────────────────────────────┘
```

### Default Layout (`app/layouts/default.vue`)

Minimal full-height wrapper, used only by the login page.

## State Management (Pinia)

### Auth Store (`app/stores/auth.ts`)

Manages authentication state for admin access.

```
┌─────────────────────────────┐
│         Auth Store          │
├─────────────────────────────┤
│ State:                      │
│   token: string | null      │
│   user: User | null         │
├─────────────────────────────┤
│ Getters:                    │
│   isAuthenticated → boolean │
│   isAdmin → boolean         │
├─────────────────────────────┤
│ Actions:                    │
│   setAuth(token, user)      │
│   logout()                  │
│   restore()                 │
└─────────────────────────────┘
```

### Cart Store (`app/stores/cart.ts`)

Manages shopping cart state for the public storefront. Persisted to `localStorage`.

```
┌─────────────────────────────────┐
│          Cart Store             │
├─────────────────────────────────┤
│ State:                          │
│   items: CartItem[]             │
├─────────────────────────────────┤
│ Getters:                        │
│   totalItems → number           │
│   totalPrice → number           │
│   isEmpty → boolean             │
├─────────────────────────────────┤
│ Actions:                        │
│   addItem(product, quantity)    │
│   updateQuantity(id, quantity)  │
│   removeItem(id)                │
│   clear()                       │
│   restore()                     │
└─────────────────────────────────┘
```

**CartItem interface:**
```typescript
interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  quantity: number
  stock: number
}
```

## Composables

### useApi (`app/composables/useApi.ts`)

Centralized HTTP client for all API communication.

```
┌──────────────────────────────────────┐
│              useApi()                │
├──────────────────────────────────────┤
│ Methods:                             │
│   get<T>(path)                       │
│   post<T>(path, body)                │
│   put<T>(path, body)                 │
│   patch<T>(path, body)               │
│   del<T>(path)                       │
├──────────────────────────────────────┤
│ Behavior:                            │
│   - Prepends apiBase from config     │
│   - Adds Authorization: Bearer       │
│   - 401 → logout + redirect /login   │
│   - 204 → returns undefined          │
│   - Errors → throws with message     │
└──────────────────────────────────────┘
```

Auto-imported by Nuxt — available in any component, page, or composable without explicit import.

## Middleware

### Admin Middleware (`app/middleware/admin.ts`)

Named middleware applied to all admin pages.

```
Route Change
    │
    ├── authStore.restore()       ← Hydrate from localStorage
    │
    ├── Is path /admin/*?
    │   ├── Not authenticated? ──→ Redirect to /login
    │   └── Not admin role? ─────→ Redirect to /
    │
    └── Continue to page
```

## Components

### ProductForm (`app/components/admin/ProductForm.vue`)

Reusable form component used by both the create and edit product pages.

**Props:**
- `initial?: object` — Pre-filled values for edit mode
- `loading?: boolean` — Submit button loading state

**Emits:**
- `submit(data)` — Form data on valid submission

**Features:**
- Auto-generates slug from product name
- Fetches categories from API for the dropdown
- Image URLs entered as one-per-line in a textarea

## Data Flow

### Shopping Flow (Guest Checkout)

```
Homepage/Catalog        Product Detail        Cart Store         Cart Page
    │                       │                    │                   │
    ├── browse/search ─────>│                    │                   │
    │                       ├── addItem() ──────>│                   │
    │                       │                    ├── persist to      │
    │                       │                    │   localStorage    │
    │                       │                    │                   │
    │                       │                    │<── restore() ─────┤
    │                       │                    │                   ├── show items
    │                       │                    │                   ├── update qty
    │                       │                    │                   ├── remove items

Checkout Page           useApi              Backend              Success Page
    │                    │                    │                      │
    ├── POST /orders/ ──>│                    │                      │
    │   checkout         ├── POST ───────────>│                      │
    │                    │                    ├── validate stock     │
    │                    │                    ├── decrement stock    │
    │                    │                    ├── create order       │
    │                    │<── { order } ──────┤                      │
    ├── cartStore.clear()│                    │                      │
    ├── navigateTo ──────────────────────────────────────────────── >│
    │   /checkout/success│                    │                      ├── show confirmation
```

### Authentication (Admin)

```
Login Page                Auth Store              useApi              Backend
    │                         │                     │                   │
    ├── submit ──────────────>│                     │                   │
    │                         ├── post('/auth/login')                   │
    │                         │                     ├── POST ──────────>│
    │                         │                     │<── { token, user }┤
    │                         ├── setAuth(token, user)                  │
    │                         ├── localStorage.set()│                   │
    │                         ├── navigateTo('/admin')                  │
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Nuxt 4 `app/` directory** | Future-proof structure, separates app code from config files |
| **Store layout for public pages** | Consistent header (search, cart badge) and footer across all customer pages |
| **SSR disabled for `/admin/**`, `/cart`, `/checkout`** | These pages rely on `localStorage`; SSR would cause hydration mismatches |
| **Cart in localStorage (not server)** | No auth required for shopping; simple guest experience without backend cart management |
| **Guest checkout** | Customers can buy without creating an account; reduces friction |
| **Product pages use slug URLs** | SEO-friendly URLs (`/products/macbook-pro-m3` instead of `/products/clxx...`) |
| **Pinia with localStorage** | Simple persistence without cookies; `restore()` re-hydrates on client |
| **Single `useApi` composable** | Centralizes auth headers, base URL, and 401 handling in one place |
| **Named middleware (not global)** | Only admin pages need auth checks; public pages remain unrestricted |
| **Nuxt UI v4 components** | Pre-built accessible components (UTable, USelect, UButton) reduce custom UI code |
| **Green primary color theme** | Custom Tailwind theme defined in `app/assets/css/main.css` |
