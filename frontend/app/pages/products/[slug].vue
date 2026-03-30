<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Breadcrumbs -->
    <nav class="text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-primary-600">Home</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/products" class="hover:text-primary-600">Products</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-900 dark:text-white">{{ product?.name }}</span>
    </nav>

    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <USkeleton class="aspect-square rounded-xl" />
      <div class="space-y-4">
        <USkeleton class="h-8 w-3/4" />
        <USkeleton class="h-6 w-1/4" />
        <USkeleton class="h-24 w-full" />
        <USkeleton class="h-12 w-48" />
      </div>
    </div>

    <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Image gallery -->
      <div>
        <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4">
          <img
            v-if="selectedImage"
            :src="selectedImage"
            :alt="product.name"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-image" class="w-24 h-24 text-gray-300" />
          </div>
        </div>
        <div v-if="product.images && product.images.length > 1" class="grid grid-cols-4 gap-2">
          <button
            v-for="(img, i) in product.images"
            :key="i"
            class="aspect-square rounded-lg overflow-hidden border-2 transition-colors"
            :class="selectedImage === img.url ? 'border-primary-600' : 'border-transparent hover:border-gray-300'"
            @click="selectedImage = img.url"
          >
            <img :src="img.url" :alt="`${product.name} ${i + 1}`" class="w-full h-full object-cover">
          </button>
        </div>
      </div>

      <!-- Product info -->
      <div>
        <p class="text-sm text-primary-600 font-medium mb-2">{{ product.category?.name }}</p>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">{{ product.name }}</h1>
        <p class="text-3xl font-bold text-primary-600 mb-6">${{ Number(product.price).toFixed(2) }}</p>

        <!-- Stock status -->
        <div class="mb-6">
          <UBadge v-if="product.stock > 5" color="success" variant="subtle">
            In Stock ({{ product.stock }} available)
          </UBadge>
          <UBadge v-else-if="product.stock > 0" color="warning" variant="subtle">
            Low Stock ({{ product.stock }} left)
          </UBadge>
          <UBadge v-else color="error" variant="subtle">
            Out of Stock
          </UBadge>
        </div>

        <!-- Description -->
        <p v-if="product.description" class="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          {{ product.description }}
        </p>

        <!-- Add to cart -->
        <div class="flex items-center gap-4 mb-8">
          <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              class="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              :disabled="quantity <= 1"
              @click="quantity--"
            >
              -
            </button>
            <span class="px-4 py-2 font-medium min-w-[3rem] text-center">{{ quantity }}</span>
            <button
              class="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              :disabled="quantity >= product.stock"
              @click="quantity++"
            >
              +
            </button>
          </div>
          <UButton
            size="lg"
            :disabled="product.stock === 0"
            icon="i-lucide-shopping-cart"
            @click="addToCart"
          >
            Add to Cart
          </UButton>
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
