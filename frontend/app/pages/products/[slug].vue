<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-8">
      <NuxtLink to="/" class="hover:text-green-400 transition-colors">Home</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
      <NuxtLink to="/products" class="hover:text-green-400 transition-colors">Products</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
      <span class="text-white">{{ product?.name }}</span>
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div class="aspect-square rounded-2xl bg-white/[0.03] shimmer" />
      <div class="space-y-4 pt-4">
        <div class="h-4 w-24 rounded bg-white/[0.03] shimmer" />
        <div class="h-8 w-3/4 rounded bg-white/[0.03] shimmer" />
        <div class="h-8 w-1/4 rounded bg-white/[0.03] shimmer" />
        <div class="h-24 w-full rounded bg-white/[0.03] shimmer" />
        <div class="h-12 w-48 rounded bg-white/[0.03] shimmer" />
      </div>
    </div>

    <!-- Product -->
    <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Image gallery -->
      <div class="space-y-3">
        <div class="aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-white/[0.06]">
          <img
            v-if="selectedImage"
            :src="selectedImage"
            :alt="product.name"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-image" class="w-20 h-20 text-gray-700" />
          </div>
        </div>
        <div v-if="product.images && product.images.length > 1" class="grid grid-cols-4 gap-2">
          <button
            v-for="(img, i) in product.images"
            :key="i"
            class="aspect-square rounded-xl overflow-hidden border-2 transition-all"
            :class="selectedImage === img.url ? 'border-green-500 ring-1 ring-green-500/30' : 'border-white/[0.06] hover:border-white/20'"
            @click="selectedImage = img.url"
          >
            <img :src="img.url" :alt="`${product.name} ${i + 1}`" class="w-full h-full object-cover">
          </button>
        </div>
      </div>

      <!-- Product info -->
      <div class="pt-2">
        <p class="text-xs uppercase tracking-wider text-green-400 font-medium mb-3">{{ product.category?.name }}</p>
        <h1 class="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">{{ product.name }}</h1>
        <p class="text-3xl font-bold text-white mb-6">${{ Number(product.price).toFixed(2) }}</p>

        <!-- Stock status -->
        <div class="mb-6">
          <span v-if="product.stock > 5" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400" />
            In Stock ({{ product.stock }} available)
          </span>
          <span v-else-if="product.stock > 0" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Low Stock ({{ product.stock }} left)
          </span>
          <span v-else class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-red-400" />
            Out of Stock
          </span>
        </div>

        <!-- Description -->
        <p v-if="product.description" class="text-gray-400 mb-8 leading-relaxed">
          {{ product.description }}
        </p>

        <!-- Divider -->
        <div class="border-t border-white/[0.06] pt-6 mb-6" />

        <!-- Add to cart -->
        <div class="flex items-center gap-4">
          <div class="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
              class="px-4 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              :disabled="quantity <= 1"
              @click="quantity--"
            >
              <UIcon name="i-lucide-minus" class="w-4 h-4" />
            </button>
            <span class="px-4 py-3 font-semibold text-sm min-w-[3rem] text-center">{{ quantity }}</span>
            <button
              class="px-4 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              :disabled="quantity >= product.stock"
              @click="quantity++"
            >
              <UIcon name="i-lucide-plus" class="w-4 h-4" />
            </button>
          </div>
          <button
            :disabled="product.stock === 0"
            class="flex-1 sm:flex-none px-8 py-3 bg-green-500 hover:bg-green-400 disabled:bg-gray-800 disabled:text-gray-600 text-gray-950 font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25 disabled:shadow-none flex items-center justify-center gap-2"
            @click="addToCart"
          >
            <UIcon name="i-lucide-shopping-bag" class="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'store' })

const route = useRoute()
const api = useApi()
const cartStore = useCartStore()
const toast = useToast()

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  category?: { name: string }
  images?: { url: string; alt: string | null }[]
}

const product = ref<Product | null>(null)
const loading = ref(true)
const selectedImage = ref<string | null>(null)
const quantity = ref(1)

onMounted(async () => {
  try {
    product.value = await api.get<Product>(`/products/slug/${route.params.slug}`)
    selectedImage.value = product.value.images?.[0]?.url || null
  }
  catch {
    navigateTo('/products')
  }
  finally {
    loading.value = false
  }
})

function addToCart() {
  if (!product.value) return
  cartStore.addItem({
    id: product.value.id,
    name: product.value.name,
    slug: product.value.slug,
    price: Number(product.value.price),
    image: product.value.images?.[0]?.url || null,
    stock: product.value.stock
  }, quantity.value)
  toast.add({ title: `${product.value.name} added to cart`, color: 'success' })
}
</script>
