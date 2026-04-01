<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <!-- Grid background -->
      <div class="absolute inset-0 grid-bg" />
      <!-- Glow orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[128px]" />
      <div class="absolute bottom-0 right-1/4 w-64 h-64 bg-green-400/5 rounded-full blur-[96px]" />

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-6 animate-fade-in-up">
            <UIcon name="i-lucide-zap" class="w-3 h-3" />
            Premium Tech, Honest Prices
          </div>
          <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up" style="animation-delay: 0.1s">
            The Best Tech<br>
            <span class="gradient-text">at the Best Price</span>
          </h1>
          <p class="text-lg md:text-xl text-gray-400 mb-10 animate-fade-in-up max-w-xl mx-auto" style="animation-delay: 0.2s">
            Discover our curated selection of laptops, smartphones, monitors, and accessories.
          </p>
          <div class="animate-fade-in-up" style="animation-delay: 0.3s">
            <NuxtLink to="/products">
              <button class="group relative px-8 py-3.5 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25">
                Browse Products
                <UIcon name="i-lucide-arrow-right" class="inline w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="flex items-end justify-between mb-10">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Shop by Category</h2>
          <p class="text-gray-500 mt-2">Find exactly what you need</p>
        </div>
      </div>
      <div v-if="categories.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <NuxtLink
          v-for="(cat, i) in categories"
          :key="cat.id"
          :to="{ path: '/products', query: { category: cat.id } }"
          class="group relative rounded-2xl p-6 text-center hover-lift bg-white/[0.03] border border-white/[0.06] hover:border-green-500/30 transition-all animate-fade-in-up"
          :style="{ animationDelay: `${i * 0.05}s` }"
        >
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
            <UIcon name="i-lucide-tag" class="w-5 h-5 text-green-400" />
          </div>
          <h3 class="font-semibold text-sm text-white">{{ cat.name }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ cat._count.products }} {{ cat._count.products === 1 ? 'product' : 'products' }}</p>
        </NuxtLink>
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div v-for="i in 5" :key="i" class="h-32 rounded-2xl bg-white/[0.03] shimmer" />
      </div>
    </section>

    <!-- Featured Products -->
    <section class="border-t border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Featured Products</h2>
            <p class="text-gray-500 mt-2">Our latest and most popular items</p>
          </div>
          <NuxtLink to="/products" class="hidden sm:flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
            View all
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
        <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="(product, i) in products"
            :key="product.id"
            :to="`/products/${product.slug}`"
            class="group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all hover-lift animate-fade-in-up"
            :style="{ animationDelay: `${i * 0.05}s` }"
          >
            <div class="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
              <img
                v-if="product.images?.[0]"
                :src="product.images[0].url"
                :alt="product.name"
                class="w-full h-full object-cover img-zoom"
              >
              <UIcon v-else name="i-lucide-image" class="w-12 h-12 text-gray-700" />
            </div>
            <div class="p-4">
              <p class="text-[11px] uppercase tracking-wider text-green-400 font-medium mb-1">{{ product.category?.name }}</p>
              <h3 class="font-semibold text-white truncate text-sm">{{ product.name }}</h3>
              <p class="text-lg font-bold text-white mt-2">${{ Number(product.price).toFixed(2) }}</p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="rounded-2xl overflow-hidden">
            <div class="aspect-square bg-white/[0.03] shimmer" />
            <div class="p-4 space-y-2">
              <div class="h-3 w-16 rounded bg-white/[0.03] shimmer" />
              <div class="h-4 w-3/4 rounded bg-white/[0.03] shimmer" />
              <div class="h-5 w-20 rounded bg-white/[0.03] shimmer" />
            </div>
          </div>
        </div>
        <div class="sm:hidden text-center mt-8">
          <NuxtLink to="/products" class="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
            View all products &rarr;
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-green-500/5 via-green-500/10 to-green-500/5" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 class="text-3xl font-bold tracking-tight mb-4">Ready to upgrade your setup?</h2>
        <p class="text-gray-400 mb-8 max-w-md mx-auto">Browse our full catalog and find the perfect tech for you.</p>
        <NuxtLink to="/products">
          <button class="px-6 py-3 border border-white/10 hover:border-green-500/50 rounded-xl font-medium text-sm hover:bg-green-500/5 transition-all">
            Browse All Products
          </button>
        </NuxtLink>
      </div>
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
