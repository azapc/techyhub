<template>
  <div class="min-h-screen flex flex-col bg-gray-950 text-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 glass border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg group-hover:shadow-green-500/20 transition-shadow">
              T
            </div>
            <span class="text-lg font-bold tracking-tight">TechyHub</span>
          </NuxtLink>

          <!-- Search (desktop) -->
          <div class="hidden md:flex flex-1 max-w-md mx-8">
            <div class="relative w-full">
              <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                @keyup.enter="goSearch"
              >
            </div>
          </div>

          <!-- Right actions -->
          <div class="flex items-center gap-1">
            <NuxtLink to="/products" class="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              Shop
            </NuxtLink>

            <NuxtLink to="/cart" class="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <UIcon name="i-lucide-shopping-bag" class="w-5 h-5" />
              <span
                v-if="cartStore.totalItems > 0"
                class="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold ring-2 ring-gray-950"
              >
                {{ cartStore.totalItems }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Search (mobile) -->
        <div class="md:hidden pb-3">
          <div class="relative w-full">
            <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
              @keyup.enter="goSearch"
            >
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/5 bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs">
                T
              </div>
              <span class="text-lg font-bold tracking-tight">TechyHub</span>
            </div>
            <p class="text-sm text-gray-500 leading-relaxed">Your destination for premium tech products at competitive prices.</p>
          </div>
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Navigation</h4>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/products" class="text-gray-500 hover:text-green-400 transition-colors">All Products</NuxtLink></li>
              <li><NuxtLink to="/cart" class="text-gray-500 hover:text-green-400 transition-colors">Shopping Cart</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Contact</h4>
            <p class="text-sm text-gray-500">support@techyhub.com</p>
          </div>
        </div>
        <div class="mt-10 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
          &copy; {{ new Date().getFullYear() }} TechyHub. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const router = useRouter()
const searchQuery = ref('')

onMounted(() => {
  cartStore.restore()
})

function goSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/products', query: { search: searchQuery.value.trim() } })
    searchQuery.value = ''
  }
}
</script>
