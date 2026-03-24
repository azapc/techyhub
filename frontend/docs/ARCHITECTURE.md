# Frontend Architecture

## Overview

The frontend is a **Nuxt 4** application serving as an admin dashboard for the TechStore ecommerce platform. It follows the Nuxt 4 directory convention where all application code lives inside the `app/` directory.

## Pages & Routing

Nuxt uses file-based routing. Each `.vue` file in `pages/` becomes a route.

```
app/pages/
├── index.vue                    → /              (landing page)
├── login.vue                    → /login         (admin login)
└── admin/
    ├── index.vue                → /admin          (dashboard)
    ├── products/
    │   ├── index.vue            → /admin/products  (product list)
    │   ├── create.vue           → /admin/products/create
    │   └── [id]/
    │       └── edit.vue         → /admin/products/:id/edit
    ├── categories/
    │   └── index.vue            → /admin/categories
    └── orders/
        └── index.vue            → /admin/orders
```

### Route Protection

All `/admin/**` routes are protected by the `admin` middleware and rendered client-side only (SSR disabled via route rules).

```
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
```

## Layouts

### Default Layout (`app/layouts/default.vue`)

Minimal full-height wrapper used by public pages.

### Admin Layout (`app/layouts/admin.vue`)

Two-column layout for all admin pages:

```
┌──────────────────────────────────────────┐
│  Sidebar (264px)  │   Main Content       │
│                   │                      │
│  TechStore Admin  │   <slot />           │
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

Features:
- Navigation links with active state highlighting
- User info display (name, email, avatar)
- Sign out button
- Dark mode support

## State Management (Pinia)

### Auth Store (`app/stores/auth.ts`)

Manages authentication state for the entire application.

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

**Persistence:** Token and user are stored in `localStorage` and restored on page load via `restore()`.

**User interface:**
```typescript
interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'CUSTOMER'
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

### Authentication

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

### Admin Page Load

```
Admin Page               Middleware             Auth Store          useApi
    │                        │                     │                  │
    ├── definePageMeta ─────>│                     │                  │
    │   middleware: ['admin'] │                     │                  │
    │                        ├── restore() ───────>│                  │
    │                        │   (from localStorage)                  │
    │                        ├── check isAdmin ────┤                  │
    │                        │                     │                  │
    ├── onMounted ──────────────────────────────────────── get() ────>│
    │   fetch data           │                     │                  │
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Nuxt 4 `app/` directory** | Future-proof structure, separates app code from config files |
| **SSR disabled for `/admin/**`** | Admin pages rely on `localStorage` for auth; SSR would cause hydration mismatches |
| **Pinia with localStorage** | Simple token persistence without cookies; `restore()` re-hydrates on client |
| **Single `useApi` composable** | Centralizes auth headers, base URL, and 401 handling in one place |
| **Named middleware (not global)** | Only admin pages need auth checks; public pages remain unrestricted |
| **Nuxt UI v4 components** | Pre-built accessible components (UTable, USelect, UButton) reduce custom UI code |
| **Green primary color theme** | Custom Tailwind theme defined in `app/assets/css/main.css` |
