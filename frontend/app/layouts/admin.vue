<template>
  <div class="flex h-screen bg-gray-950 text-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-gray-950 border-r border-white/[0.06] flex flex-col">
      <!-- Logo -->
      <div class="p-5 border-b border-white/[0.06]">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <div>
            <span class="text-sm font-bold tracking-tight">TechyHub</span>
            <span class="text-[10px] text-gray-500 ml-1.5 uppercase tracking-widest">Admin</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-3 flex flex-col gap-0.5">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
          :class="isActive(link.to)
            ? 'bg-green-500/10 text-green-400 nav-active'
            : 'text-gray-400 hover:text-white hover:bg-white/5'"
        >
          <UIcon :name="link.icon" class="w-[18px] h-[18px] shrink-0" />
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- User -->
      <div class="p-4 border-t border-white/[0.06]">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-green-400">
            {{ (authStore.user?.name || authStore.user?.email || 'A').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium truncate">{{ authStore.user?.name || 'Admin' }}</p>
            <p class="text-[11px] text-gray-500 truncate">{{ authStore.user?.email }}</p>
          </div>
        </div>
        <button
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white border border-white/[0.06] hover:border-white/10 rounded-lg transition-all hover:bg-white/5"
          @click="logout"
        >
          <UIcon name="i-lucide-log-out" class="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <div class="p-8">
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
