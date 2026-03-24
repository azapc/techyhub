<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 class="text-xl font-bold text-primary-600">TechyHub Admin</h1>
      </div>

      <nav class="flex-1 p-4 flex flex-col gap-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          :class="isActive(link.to) ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'"
        >
          <UIcon :name="link.icon" class="w-5 h-5 shrink-0" />
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3 mb-3">
          <UAvatar :alt="authStore.user?.name || authStore.user?.email" size="sm" />
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">{{ authStore.user?.name || 'Admin' }}</p>
            <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
          </div>
        </div>
        <UButton block variant="outline" size="sm" @click="logout">
          Sign out
        </UButton>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const route = useRoute()

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const navLinks = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin' },
  { label: 'Products', icon: 'i-lucide-package', to: '/admin/products' },
  { label: 'Categories', icon: 'i-lucide-tag', to: '/admin/categories' },
  { label: 'Orders', icon: 'i-lucide-shopping-cart', to: '/admin/orders' },
]

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
