<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Products</h1>
      <UButton to="/admin/products/create" icon="i-lucide-plus">New product</UButton>
    </div>

    <div class="flex gap-3 mb-4">
      <UInput v-model="search" placeholder="Search products..." icon="i-lucide-search" class="max-w-xs" @input="debouncedFetch" />
      <USelect v-model="categoryId" :items="categoryOptions" placeholder="Category" class="max-w-xs" @update:model-value="fetchProducts" />
    </div>

    <UCard>
      <UTable :data="products" :columns="columns" :loading="pending">
        <template #price-cell="{ row }">
          ${{ Number((row.original as Product).price).toFixed(2) }}
        </template>
        <template #stock-cell="{ row }">
          <UBadge :color="(row.original as Product).stock <= 5 ? 'error' : 'success'" variant="subtle">
            {{ (row.original as Product).stock }}
          </UBadge>
        </template>
        <template #category-cell="{ row }">
          {{ (row.original as Product).category?.name }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton :to="`/admin/products/${(row.original as Product).id}/edit`" variant="ghost" icon="i-lucide-pencil" size="xs" />
            <UButton variant="ghost" color="error" icon="i-lucide-trash-2" size="xs" @click="confirmDelete(row.original as Product)" />
          </div>
        </template>
        <template #empty>
          <div class="text-center py-6 text-gray-500">
            {{ search || categoryId !== 'all' ? 'No products match your filters.' : 'No products yet. Create your first one.' }}
          </div>
        </template>
      </UTable>

      <div v-if="total > limit" class="flex justify-end mt-4">
        <UPagination v-model="page" :total="total" :items-per-page="limit" @update:model-value="fetchProducts" />
      </div>
    </UCard>

    <UModal v-model:open="showDeleteModal">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold">Confirm deletion</h3></template>
          <p>Delete <strong>{{ deleteTarget?.name }}</strong>? This action cannot be undone.</p>
          <template #footer>
            <div class="flex gap-2 justify-end">
              <UButton variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
              <UButton color="error" :loading="deleting" @click="doDelete">Delete</UButton>
            </div>
          </template>
        </UCard>
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
