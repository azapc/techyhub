<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/orders">
        <UButton variant="ghost" icon="i-lucide-arrow-left" size="sm" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Order Detail</h1>
    </div>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-40 rounded-xl" />
      <USkeleton class="h-60 rounded-xl" />
    </div>

    <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Order items -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">Items ({{ order.items.length }})</h2>
          </template>
          <div class="space-y-3">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center gap-4"
            >
              <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                <img
                  v-if="item.product?.images?.[0]"
                  :src="item.product.images[0].url"
                  :alt="item.product.name"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-lucide-image" class="w-5 h-5 text-gray-300" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ item.product?.name }}</p>
                <p class="text-sm text-gray-500">Qty: {{ item.quantity }} x ${{ Number(item.price).toFixed(2) }}</p>
              </div>
              <p class="font-medium shrink-0">${{ (Number(item.price) * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
          <template #footer>
            <div class="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span class="text-primary-600">${{ Number(order.total).toFixed(2) }}</span>
            </div>
          </template>
        </UCard>

        <!-- Shipping address -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">Shipping Address</h2>
          </template>
          <p>{{ order.shippingAddress }}</p>
          <p>{{ order.shippingCity }}, {{ order.shippingState }} {{ order.shippingZip }}</p>
          <p>{{ order.shippingCountry }}</p>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Status -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">Status</h2>
          </template>
          <div class="space-y-4">
            <UBadge :color="statusColor(order.status)" variant="subtle" size="lg">
              {{ order.status }}
            </UBadge>
            <USelect
              :model-value="order.status"
              :items="statusOptions"
              @update:model-value="updateStatus"
            />
          </div>
        </UCard>

        <!-- Customer -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">Customer</h2>
          </template>
          <p class="font-medium">{{ order.customerName }}</p>
          <p class="text-sm text-gray-500">{{ order.customerEmail }}</p>
          <p v-if="order.user" class="text-xs text-gray-400 mt-2">
            Registered user: {{ order.user.name || order.user.email }}
          </p>
          <p v-else class="text-xs text-gray-400 mt-2">Guest order</p>
        </UCard>

        <!-- Dates -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">Dates</h2>
          </template>
          <div class="text-sm space-y-1">
            <p><span class="text-gray-500">Created:</span> {{ new Date(order.createdAt).toLocaleString() }}</p>
            <p><span class="text-gray-500">Updated:</span> {{ new Date(order.updatedAt).toLocaleString() }}</p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

const route = useRoute()
const api = useApi()
const toast = useToast()

interface OrderDetail {
  id: string
  customerName: string
  customerEmail: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
  total: number
  status: string
  createdAt: string
  updatedAt: string
  user?: { id: string; name: string | null; email: string }
  items: {
    id: string
    quantity: number
    price: number
    product?: { name: string; images?: { url: string }[] }
  }[]
}

const order = ref<OrderDetail | null>(null)
const loading = ref(true)

const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

function statusColor(status: string): 'warning' | 'info' | 'primary' | 'success' | 'error' | 'neutral' {
  const map: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error' | 'neutral'> = {
    PENDING: 'warning', PAID: 'info', PROCESSING: 'info',
    SHIPPED: 'primary', DELIVERED: 'success', CANCELLED: 'error'
  }
  return map[status] || 'neutral'
}

async function updateStatus(status: string) {
  try {
    await api.patch(`/orders/${route.params.id}/status`, { status })
    if (order.value) order.value.status = status
    toast.add({ title: 'Status updated', color: 'success' })
  }
  catch (e: any) {
    toast.add({ title: e.message, color: 'error' })
  }
}

onMounted(async () => {
  try {
    order.value = await api.get<OrderDetail>(`/orders/${route.params.id}`)
  }
  catch {
    navigateTo('/admin/orders')
  }
  finally {
    loading.value = false
  }
})
</script>
