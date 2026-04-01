<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/admin/orders">
        <button class="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        </button>
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Order Detail</h1>
        <p v-if="order" class="text-xs text-gray-500 font-mono mt-0.5">{{ order.id }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="h-40 rounded-2xl bg-white/[0.03] shimmer" />
      <div class="h-60 rounded-2xl bg-white/[0.03] shimmer" />
    </div>

    <!-- Content -->
    <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Order items -->
        <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div class="p-5 border-b border-white/[0.06]">
            <h2 class="font-semibold text-white text-sm">Items ({{ order.items.length }})</h2>
          </div>
          <div class="p-5 space-y-3">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center gap-4"
            >
              <div class="w-12 h-12 bg-gray-900 rounded-xl overflow-hidden shrink-0 border border-white/[0.06]">
                <img
                  v-if="item.product?.images?.[0]"
                  :src="item.product.images[0].url"
                  :alt="item.product.name"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-lucide-image" class="w-5 h-5 text-gray-700" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-white text-sm truncate">{{ item.product?.name }}</p>
                <p class="text-xs text-gray-500">Qty: {{ item.quantity }} x ${{ Number(item.price).toFixed(2) }}</p>
              </div>
              <p class="font-medium text-white text-sm shrink-0">${{ (Number(item.price) * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
          <div class="p-5 border-t border-white/[0.06] flex justify-between items-center">
            <span class="font-semibold text-white">Total</span>
            <span class="text-xl font-bold text-green-400">${{ Number(order.total).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Shipping address -->
        <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div class="p-5 border-b border-white/[0.06]">
            <h2 class="font-semibold text-white text-sm flex items-center gap-2">
              <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-gray-500" />
              Shipping Address
            </h2>
          </div>
          <div class="p-5 text-sm text-gray-300">
            <p>{{ order.shippingAddress }}</p>
            <p>{{ order.shippingCity }}, {{ order.shippingState }} {{ order.shippingZip }}</p>
            <p class="text-gray-500">{{ order.shippingCountry }}</p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Status -->
        <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div class="p-5 border-b border-white/[0.06]">
            <h2 class="font-semibold text-white text-sm">Status</h2>
          </div>
          <div class="p-5 space-y-4">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              :class="statusClasses(order.status)"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(order.status)" />
              {{ order.status }}
            </span>
            <USelect
              :model-value="order.status"
              :items="statusOptions"
              @update:model-value="updateStatus"
            />
          </div>
        </div>

        <!-- Customer -->
        <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div class="p-5 border-b border-white/[0.06]">
            <h2 class="font-semibold text-white text-sm flex items-center gap-2">
              <UIcon name="i-lucide-user" class="w-4 h-4 text-gray-500" />
              Customer
            </h2>
          </div>
          <div class="p-5">
            <p class="font-medium text-white text-sm">{{ order.customerName }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ order.customerEmail }}</p>
            <span
              class="inline-flex items-center mt-3 px-2 py-0.5 rounded-full text-[10px] font-medium"
              :class="order.user ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-400'"
            >
              {{ order.user ? 'Registered user' : 'Guest order' }}
            </span>
          </div>
        </div>

        <!-- Dates -->
        <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div class="p-5 border-b border-white/[0.06]">
            <h2 class="font-semibold text-white text-sm">Timeline</h2>
          </div>
          <div class="p-5 text-sm space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-500">Created</span>
              <span class="text-gray-300">{{ new Date(order.createdAt).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Updated</span>
              <span class="text-gray-300">{{ new Date(order.updatedAt).toLocaleString() }}</span>
            </div>
          </div>
        </div>
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
