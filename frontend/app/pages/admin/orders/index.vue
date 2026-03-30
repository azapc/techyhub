<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Orders</h1>

    <div class="flex gap-3 mb-4">
      <USelect v-model="statusFilter" :items="statusOptions" placeholder="All statuses" class="max-w-xs" @update:model-value="fetchOrders" />
    </div>

    <UCard>
      <UTable :data="orders" :columns="columns" :loading="pending">
        <template #id-cell="{ row }">
          <NuxtLink
            :to="`/admin/orders/${(row.original as Order).id}`"
            class="text-primary-600 hover:underline font-mono text-xs"
          >
            {{ (row.original as Order).id.slice(0, 8) }}...
          </NuxtLink>
        </template>
        <template #customer-cell="{ row }">
          <div>
            <p class="font-medium">{{ (row.original as Order).customerName }}</p>
            <p class="text-xs text-gray-500">{{ (row.original as Order).customerEmail }}</p>
          </div>
        </template>
        <template #total-cell="{ row }">
          ${{ Number((row.original as Order).total).toFixed(2) }}
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="statusColor((row.original as Order).status)" variant="subtle">
            {{ (row.original as Order).status }}
          </UBadge>
        </template>
        <template #createdAt-cell="{ row }">
          {{ new Date((row.original as Order).createdAt).toLocaleDateString('en') }}
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
          <div class="text-center py-6 text-gray-500">
            {{ statusFilter !== 'all' ? 'No orders with this status.' : 'No orders yet.' }}
          </div>
        </template>
      </UTable>

      <div v-if="total > limit" class="flex justify-end mt-4">
        <UPagination v-model="page" :total="total" :items-per-page="limit" @update:model-value="fetchOrders" />
      </div>
    </UCard>
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

function statusColor(status: string): 'warning' | 'info' | 'primary' | 'success' | 'error' | 'neutral' {
  const map: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error' | 'neutral'> = {
    PENDING: 'warning', PAID: 'info', PROCESSING: 'info',
    SHIPPED: 'primary', DELIVERED: 'success', CANCELLED: 'error',
  }
  return map[status] || 'neutral'
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
