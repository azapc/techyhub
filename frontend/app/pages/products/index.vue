<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-end justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Products</h1>
        <p class="text-gray-500 mt-1">{{ total }} items available</p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar filters -->
      <aside class="lg:w-56 shrink-0 space-y-6">
        <!-- Search -->
        <div>
          <label class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2 block">Search</label>
          <div class="relative">
            <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              v-model="search"
              type="text"
              placeholder="Search..."
              class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
              @keyup.enter="fetchProducts"
            >
          </div>
        </div>

        <!-- Categories -->
        <div>
          <label class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3 block">Category</label>
          <div class="space-y-0.5">
            <button
              class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
              :class="!selectedCategory ? 'bg-green-500/10 text-green-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'"
              @click="selectCategory(undefined)"
            >
              All Categories
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
              :class="selectedCategory === cat.id ? 'bg-green-500/10 text-green-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'"
              @click="selectCategory(cat.id)"
            >
              {{ cat.name }}
              <span class="text-gray-600 text-xs ml-1">({{ cat._count.products }})</span>
            </button>
          </div>
        </div>

        <!-- Price Range -->
        <div>
          <label class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2 block">Price Range</label>
          <div class="flex gap-2">
            <input
              v-model="minPrice"
              type="number"
              placeholder="Min"
              class="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all"
            >
            <input
              v-model="maxPrice"
              type="number"
              placeholder="Max"
              class="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all"
            >
          </div>
        </div>
      </aside>

      <!-- Products grid -->
      <div class="flex-1">
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="rounded-2xl overflow-hidden">
            <div class="aspect-square bg-white/[0.03] shimmer" />
            <div class="p-4 space-y-2">
              <div class="h-3 w-16 rounded bg-white/[0.03] shimmer" />
              <div class="h-4 w-3/4 rounded bg-white/[0.03] shimmer" />
              <div class="h-5 w-20 rounded bg-white/[0.03] shimmer" />
            </div>
          </div>
        </div>

        <div v-else-if="filteredProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="product in filteredProducts"
            :key="product.id"
            :to="`/products/${product.slug}`"
            class="group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all hover-lift"
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
              <div class="flex items-center justify-between mt-2">
                <p class="text-lg font-bold text-white">${{ Number(product.price).toFixed(2) }}</p>
                <span v-if="product.stock <= 5 && product.stock > 0" class="text-[11px] text-amber-400 font-medium">
                  {{ product.stock }} left
                </span>
                <span v-else-if="product.stock === 0" class="text-[11px] text-red-400 font-medium">
                  Sold out
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="text-center py-20">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
            <UIcon name="i-lucide-search-x" class="w-8 h-8 text-gray-600" />
          </div>
          <p class="text-gray-400 font-medium">No products found</p>
          <p class="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-10">
          <UPagination v-model="page" :total="total" :items-per-page="limit" @update:model-value="fetchProducts" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'store' })

const api = useApi()
const route = useRoute()

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
  stock: number
  category?: { name: string }
  images?: { url: string }[]
}

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const loading = ref(true)
const search = ref((route.query.search as string) || '')
const selectedCategory = ref<string | undefined>(route.query.category as string || undefined)
const page = ref(1)
const limit = 12
const total = ref(0)
const totalPages = ref(0)
const minPrice = ref('')
const maxPrice = ref('')

const filteredProducts = computed(() => {
  let result = products.value
  const min = minPrice.value ? Number(minPrice.value) : null
  const max = maxPrice.value ? Number(maxPrice.value) : null
  if (min !== null) result = result.filter((p) => Number(p.price) >= min)
  if (max !== null) result = result.filter((p) => Number(p.price) <= max)
  return result
})

function selectCategory(id?: string) {
  selectedCategory.value = id
  page.value = 1
  fetchProducts()
}

async function fetchProducts() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: String(limit) })
    if (search.value.trim()) params.set('search', search.value.trim())
    if (selectedCategory.value) params.set('categoryId', selectedCategory.value)
    const res = await api.get<{ data: Product[]; total: number; totalPages: number }>(`/products?${params}`)
    products.value = res.data
    total.value = res.total
    totalPages.value = res.totalPages
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  const catRes = api.get<Category[]>('/categories')
  const prodRes = fetchProducts()
  categories.value = await catRes
  await prodRes
})
</script>
