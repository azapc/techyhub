<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <div class="bg-primary-50 dark:bg-primary-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
      <UIcon name="i-lucide-check" class="w-10 h-10 text-primary-600" />
    </div>

    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Confirmed!</h1>
    <p class="text-gray-500 mb-2">Thank you for your purchase.</p>
    <p v-if="orderId" class="text-sm text-gray-400 mb-8">
      Order ID: <span class="font-mono">{{ orderId }}</span>
    </p>

    <div v-if="order" class="text-left mb-8">
      <UCard>
        <template #header>
          <h2 class="font-semibold">Order Details</h2>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Customer</p>
              <p class="font-medium">{{ order.customerName }}</p>
              <p class="text-gray-500">{{ order.customerEmail }}</p>
            </div>
            <div>
              <p class="text-gray-500">Shipping Address</p>
              <p class="font-medium">{{ order.shippingAddress }}</p>
              <p>{{ order.shippingCity }}, {{ order.shippingState }} {{ order.shippingZip }}</p>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex justify-between text-sm"
            >
              <span>{{ item.product?.name }} x{{ item.quantity }}</span>
              <span class="font-medium">${{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span class="text-primary-600">${{ Number(order.total).toFixed(2) }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <NuxtLink to="/products">
      <UButton size="lg">Continue Shopping</UButton>
    </NuxtLink>
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
