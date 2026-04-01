<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <!-- Success icon -->
    <div class="w-20 h-20 mx-auto mb-8 rounded-full bg-green-500/10 flex items-center justify-center glow-green animate-fade-in-up">
      <UIcon name="i-lucide-check" class="w-10 h-10 text-green-400" />
    </div>

    <h1 class="text-3xl font-bold text-white mb-3 animate-fade-in-up" style="animation-delay: 0.1s">Order Confirmed!</h1>
    <p class="text-gray-400 mb-2 animate-fade-in-up" style="animation-delay: 0.15s">Thank you for your purchase.</p>
    <p v-if="orderId" class="text-sm text-gray-600 mb-10 animate-fade-in-up" style="animation-delay: 0.2s">
      Order ID: <span class="font-mono text-gray-400">{{ orderId }}</span>
    </p>

    <!-- Order details -->
    <div v-if="order" class="text-left mb-10 animate-fade-in-up" style="animation-delay: 0.25s">
      <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div class="p-6 border-b border-white/[0.06]">
          <h2 class="font-semibold text-white">Order Details</h2>
        </div>

        <div class="p-6 space-y-6">
          <!-- Customer & Shipping -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="text-xs uppercase tracking-wider text-gray-500 mb-2">Customer</p>
              <p class="font-medium text-white text-sm">{{ order.customerName }}</p>
              <p class="text-gray-400 text-sm">{{ order.customerEmail }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wider text-gray-500 mb-2">Shipping Address</p>
              <p class="font-medium text-white text-sm">{{ order.shippingAddress }}</p>
              <p class="text-gray-400 text-sm">{{ order.shippingCity }}, {{ order.shippingState }} {{ order.shippingZip }}</p>
            </div>
          </div>

          <!-- Items -->
          <div class="border-t border-white/[0.06] pt-4 space-y-2">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex justify-between text-sm py-1"
            >
              <span class="text-gray-400">{{ item.product?.name }} <span class="text-gray-600">x{{ item.quantity }}</span></span>
              <span class="font-medium text-white">${{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Total -->
          <div class="border-t border-white/[0.06] pt-4 flex justify-between font-bold text-lg">
            <span class="text-white">Total</span>
            <span class="text-green-400">${{ Number(order.total).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="animate-fade-in-up" style="animation-delay: 0.3s">
      <NuxtLink to="/products">
        <button class="px-8 py-3 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25">
          Continue Shopping
        </button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'store' })

const route = useRoute()
const api = useApi()

const orderId = route.query.orderId as string

interface OrderDetail {
  id: string
  customerName: string
  customerEmail: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  total: number
  status: string
  items: { id: string; quantity: number; price: number; product?: { name: string } }[]
}

const order = ref<OrderDetail | null>(null)

onMounted(async () => {
  if (!orderId) return
  try {
    order.value = await api.get<OrderDetail>(`/orders/confirmation/${orderId}`)
  }
  catch {
    // Order detail is optional - page still works without it
  }
})
</script>
