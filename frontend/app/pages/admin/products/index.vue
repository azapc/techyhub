<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Products</h1>
        <p class="text-gray-500 text-sm mt-1">{{ total }} products in your store</p>
      </div>
      <NuxtLink to="/admin/products/create">
        <button class="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25">
          <UIcon name="i-lucide-plus" class="w-4 h-4" />
          New product
        </button>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-6">
      <div class="relative flex-1 max-w-xs">
        <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          v-model="search"
          type="text"
          placeholder="Search products..."
          class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
          @input="debouncedFetch"
        >
      </div>
      <USelect v-model="categoryId" :items="categoryOptions" placeholder="Category" class="max-w-xs" @update:model-value="fetchProducts" />
    </div>

    <!-- Table -->
    <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <UTable :data="products" :columns="columns" :loading="pending">
        <template #name-cell="{ row }">
          <span class="font-medium text-white">{{ (row.original as Product).name }}</span>
        </template>
        <template #category-cell="{ row }">
          <span class="text-gray-400">{{ (row.original as Product).category?.name }}</span>
        </template>
        <template #price-cell="{ row }">
          <span class="font-medium text-white">${{ Number((row.original as Product).price).toFixed(2) }}</span>
        </template>
        <template #stock-cell="{ row }">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            :class="(row.original as Product).stock <= 5
              ? 'bg-red-500/10 text-red-400'
              : 'bg-green-500/10 text-green-400'"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="(row.original as Product).stock <= 5 ? 'bg-red-400' : 'bg-green-400'"
            />
            {{ (row.original as Product).stock }}
          </span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <NuxtLink :to="`/admin/products/${(row.original as Product).id}/edit`">
              <button class="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                <UIcon name="i-lucide-pencil" class="w-4 h-4" />
              </button>
            </NuxtLink>
            <button class="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all" @click="confirmDelete(row.original as Product)">
              <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
            </button>
          </div>
        </template>
        <template #empty>
          <div class="text-center py-12 text-gray-500">
            <UIcon name="i-lucide-package" class="w-8 h-8 mx-auto mb-3 text-gray-600" />
            <p>{{ search || categoryId !== 'all' ? 'No products match your filters.' : 'No products yet. Create your first one.' }}</p>
          </div>
        </template>
      </UTable>

      <div v-if="total > limit" class="flex justify-end p-4 border-t border-white/[0.06]">
        <UPagination v-model="page" :total="total" :items-per-page="limit" @update:model-value="fetchProducts" />
      </div>
    </div>

    <!-- Delete modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <div class="rounded-2xl bg-gray-900 border border-white/[0.06] p-6">
          <h3 class="font-semibold text-white mb-2">Delete product</h3>
          <p class="text-gray-400 text-sm mb-6">Delete <strong class="text-white">{{ deleteTarget?.name }}</strong>? This action cannot be undone.</p>
          <div class="flex gap-2 justify-end">
            <button class="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all" @click="showDeleteModal = false">Cancel</button>
            <button
              :disabled="deleting"
              class="px-4 py-2 text-sm bg-red-500 hover:bg-red-400 text-white font-medium rounded-lg transition-all disabled:opacity-50"
              @click="doDelete"
            >
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category?: { name: string }
}

const api = useApi()
const toast = useToast()

const columns: TableColumn<Product>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'stock', header: 'Stock' },
  { id: 'actions', header: '' },
]

const search = ref('')
const categoryId = ref('all')
const page = ref(1)
const limit = 20
const products = ref<Product[]>([])
const total = ref(0)
const pending = ref(false)
const showDeleteModal = ref(false)
const deleteTarget = ref<Product | null>(null)
const deleting = ref(false)

const { data: categories } = useAsyncData('categories', () => api.get<{ id: string; name: string }[]>('/categories'))
const categoryOptions = computed(() => [
  { label: 'All', value: 'all' },
  ...(categories.value || []).map(c => ({ label: c.name, value: c.id })),
])

async function fetchProducts() {
  pending.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: String(limit) })
    if (search.value) params.set('search', search.value)
    if (categoryId.value && categoryId.value !== 'all') params.set('categoryId', categoryId.value)
    const res = await api.get<{ data: Product[]; total: number }>(`/products?${params}`)
    products.value = res.data
    total.value = res.total
  }
  finally { pending.value = false }
}

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchProducts, 400)
}

function confirmDelete(row: Product) {
  deleteTarget.value = row
  showDeleteModal.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.del(`/products/${deleteTarget.value.id}`)
    toast.add({ title: 'Product deleted', color: 'success' })
    showDeleteModal.value = false
    fetchProducts()
  }
  catch (e: any) { toast.add({ title: e.message, color: 'error' }) }
  finally { deleting.value = false }
}

onMounted(fetchProducts)
</script>
