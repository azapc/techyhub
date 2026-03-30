<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            The Best Tech at the Best Price
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Discover our curated selection of laptops, smartphones, monitors, and accessories.
          </p>
          <NuxtLink to="/products">
            <UButton size="xl" trailing-icon="i-lucide-arrow-right">
              Shop Now
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-2xl font-bold mb-8">Shop by Category</h2>
      <div v-if="categories.length" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="{ path: '/products', query: { category: cat.id } }"
          class="group relative bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border border-gray-200 dark:border-gray-700"
        >
          <UIcon name="i-lucide-tag" class="w-8 h-8 mx-auto mb-3 text-primary-600" />
          <h3 class="font-semibold text-gray-900 dark:text-white">{{ cat.name }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ cat._count.products }} products</p>
        </NuxtLink>
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <USkeleton v-for="i in 4" :key="i" class="h-32 rounded-xl" />
      </div>
    </section>

    <!-- Featured Products -->
    <section class="bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold">Featured Products</h2>
          <NuxtLink to="/products" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all &rarr;
          </NuxtLink>
        </div>
        <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="product in products"
            :key="product.id"
            :to="`/products/${product.slug}`"
            class="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div class="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              <img
                v-if="product.images?.[0]"
                :src="product.images[0].url"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform"
              >
              <UIcon v-else name="i-lucide-image" class="w-16 h-16 text-gray-300" />
            </div>
            <div class="p-4">
              <p class="text-xs text-primary-600 font-medium mb-1">{{ product.category?.name }}</p>
              <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ product.name }}</h3>
              <p class="text-lg font-bold text-primary-600 mt-2">${{ Number(product.price).toFixed(2) }}</p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <USkeleton v-for="i in 4" :key="i" class="h-72 rounded-xl" />
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h2 class="text-2xl font-bold mb-4">Ready to upgrade your setup?</h2>
      <p class="text-gray-500 mb-6">Browse our full catalog and find the perfect tech for you.</p>
      <NuxtLink to="/products">
        <UButton size="lg" variant="outline">
          Browse All Products
        </UButton>
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'store' })

const api = useApi()

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  category?: { name: string }
  images?: { url: string }[]
}

const categories = ref<Category[]>([])
const products = ref<Product[]>([])

onMounted(async () => {
  const [catRes, prodRes] = await Promise.all([
    api.get<Category[]>('/categories'),
    api.get<{ data: Product[] }>('/products?limit=8')
  ])
  categories.value = catRes
  products.value = prodRes.data
})
</script>
