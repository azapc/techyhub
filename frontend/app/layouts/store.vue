<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-950">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="text-xl font-bold text-primary-600">
            TechyHub
          </NuxtLink>

          <!-- Search (desktop) -->
          <div class="hidden md:flex flex-1 max-w-lg mx-8">
            <UInput
              v-model="searchQuery"
              placeholder="Search products..."
              icon="i-lucide-search"
              class="w-full"
              @keyup.enter="goSearch"
            />
          </div>

          <!-- Right actions -->
          <div class="flex items-center gap-3">
            <NuxtLink to="/products" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600">
              Shop
            </NuxtLink>

            <NuxtLink to="/cart" class="relative">
              <UButton variant="ghost" icon="i-lucide-shopping-cart" color="neutral" />
              <span
                v-if="cartStore.totalItems > 0"
                class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
              >
                {{ cartStore.totalItems }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Search (mobile) -->
        <div class="md:hidden pb-3">
          <UInput
            v-model="searchQuery"
            placeholder="Search products..."
            icon="i-lucide-search"
            class="w-full"
            @keyup.enter="goSearch"
          />
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-bold text-primary-600 mb-3">TechyHub</h3>
            <p class="text-sm text-gray-500">Your destination for the best tech products at competitive prices.</p>
          </div>
          <div>
            <h4 class="font-semibold mb-3">Quick Links</h4>
            <ul class="space-y-2 text-sm text-gray-500">
              <li><NuxtLink to="/products" class="hover:text-primary-600">All Products</NuxtLink></li>
              <li><NuxtLink to="/cart" class="hover:text-primary-600">Cart</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3">Contact</h4>
            <p class="text-sm text-gray-500">support@techyhub.com</p>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-400">
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
