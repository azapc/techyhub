<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold mb-6">Products</h1>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar filters -->
      <aside class="lg:w-64 shrink-0 space-y-6">
        <div>
          <h3 class="font-semibold mb-3">Category</h3>
          <ul class="space-y-1">
            <li>
              <button
                class="text-sm w-full text-left px-2 py-1 rounded"
                :class="!selectedCategory ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'"
                @click="selectCategory(undefined)"
              >
                All Categories
              </button>
            </li>
            <li v-for="cat in categories" :key="cat.id">
              <button
                class="text-sm w-full text-left px-2 py-1 rounded"
                :class="selectedCategory === cat.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'"
                @click="selectCategory(cat.id)"
              >
                {{ cat.name }} ({{ cat._count.products }})
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold mb-3">Price Range</h3>
          <div class="flex gap-2">
            <UInput v-model="minPrice" type="number" placeholder="Min" size="sm" class="w-1/2" />
            <UInput v-model="maxPrice" type="number" placeholder="Max" size="sm" class="w-1/2" />
          </div>
          <UButton size="xs" variant="soft" class="mt-2" @click="applyPriceFilter">
            Apply
          </UButton>
        </div>
      </aside>

      <!-- Products grid -->
      <div class="flex-1">
        <!-- Search bar -->
        <div class="mb-6">
          <UInput
            v-model="search"
            placeholder="Search products..."
            icon="i-lucide-search"
            class="w-full max-w-md"
            @keyup.enter="fetchProducts"
          />
        </div>

        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <USkeleton v-for="i in 6" :key="i" class="h-72 rounded-xl" />
        </div>

        <div v-else-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="product in filteredProducts"
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
              <div class="flex items-center justify-between mt-2">
                <p class="text-lg font-bold text-primary-600">${{ Number(product.price).toFixed(2) }}</p>
                <span v-if="product.stock <= 5 && product.stock > 0" class="text-xs text-amber-600">Only {{ product.stock }} left</span>
                <span v-else-if="product.stock === 0" class="text-xs text-red-600">Out of stock</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          <UIcon name="i-lucide-search-x" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No products found. Try adjusting your filters.</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
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

function applyPriceFilter() {
  // Price filter is client-side via computed
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
