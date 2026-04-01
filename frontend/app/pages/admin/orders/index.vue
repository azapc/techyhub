<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Orders</h1>
        <p class="text-gray-500 text-sm mt-1">{{ total }} orders total</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex gap-3 mb-6">
      <USelect v-model="statusFilter" :items="statusOptions" placeholder="All statuses" class="max-w-xs" @update:model-value="fetchOrders" />
    </div>

    <!-- Table -->
    <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <UTable :data="orders" :columns="columns" :loading="pending">
        <template #id-cell="{ row }">
          <NuxtLink
            :to="`/admin/orders/${(row.original as Order).id}`"
            class="font-mono text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            {{ (row.original as Order).id.slice(0, 8) }}...
          </NuxtLink>
        </template>
        <template #customer-cell="{ row }">
          <div>
            <p class="font-medium text-white text-sm">{{ (row.original as Order).customerName }}</p>
            <p class="text-[11px] text-gray-500">{{ (row.original as Order).customerEmail }}</p>
          </div>
        </template>
        <template #total-cell="{ row }">
          <span class="font-medium text-white">${{ Number((row.original as Order).total).toFixed(2) }}</span>
        </template>
        <template #status-cell="{ row }">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            :class="statusClasses((row.original as Order).status)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="statusDot((row.original as Order).status)" />
            {{ (row.original as Order).status }}
          </span>
        </template>
        <template #createdAt-cell="{ row }">
          <span class="text-gray-400 text-sm">{{ new Date((row.original as Order).createdAt).toLocaleDateString('en') }}</span>
        </template>
        <template #actions-cell="{ row }">
          <USelect
            :model-value="(row.original as Order).status"
            :items="statusOptions.slice(1)"
            size="xs"
            @update:model-value="(s: string) => updateStatus((row.original as Order).id, s)"
          />
        </template>
        <template #empty>
          <div class="text-center py-12 text-gray-500">
            <UIcon name="i-lucide-shopping-cart" class="w-8 h-8 mx-auto mb-3 text-gray-600" />
            <p class="text-sm">{{ statusFilter !== 'all' ? 'No orders with this status.' : 'No orders yet.' }}</p>
          </div>
        </template>
      </UTable>

      <div v-if="total > limit" class="flex justify-end p-4 border-t border-white/[0.06]">
        <UPagination v-model="page" :total="total" :items-per-page="limit" @update:model-value="fetchOrders" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  customerName: string
  customerEmail: string
  user?: { name: string | null; email: string }
}

const api = useApi()
const toast = useToast()

const columns: TableColumn<Order>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'total', header: 'Total' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'createdAt', header: 'Date' },
  { id: 'actions', header: 'Update status' },
]

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const statusFilter = ref('all')
const page = ref(1)
const limit = 20
const orders = ref<Order[]>([])
const total = ref(0)
const pending = ref(false)

function statusClasses(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-400',
    PAID: 'bg-blue-500/10 text-blue-400',
    PROCESSING: 'bg-blue-500/10 text-blue-400',
    SHIPPED: 'bg-cyan-500/10 text-cyan-400',
    DELIVERED: 'bg-green-500/10 text-green-400',
    CANCELLED: 'bg-red-500/10 text-red-400',
  }
  return map[status] || 'bg-white/5 text-gray-400'
}

function statusDot(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-400',
    PAID: 'bg-blue-400',
    PROCESSING: 'bg-blue-400',
    SHIPPED: 'bg-cyan-400',
    DELIVERED: 'bg-green-400',
    CANCELLED: 'bg-red-400',
  }
  return map[status] || 'bg-gray-400'
}

async function fetchOrders() {
  pending.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: String(limit) })
    if (statusFilter.value && statusFilter.value !== 'all') params.set('status', statusFilter.value)
    const res = await api.get<{ data: Order[]; total: number }>(`/orders?${params}`)
    orders.value = res.data
    total.value = res.total
  }
  finally { pending.value = false }
}

async function updateStatus(id: string, status: string) {
  try {
    await api.patch(`/orders/${id}/status`, { status })
    toast.add({ title: 'Status updated', color: 'success' })
    fetchOrders()
  }
  catch (e: any) { toast.add({ title: e.message, color: 'error' }) }
}

onMounted(fetchOrders)
</script>
