<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-8">
      <NuxtLink to="/cart" class="hover:text-green-400 transition-colors">Cart</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
      <span class="text-white">Checkout</span>
    </nav>

    <div v-if="cartStore.isEmpty" class="text-center py-20">
      <p class="text-gray-400 mb-4">Your cart is empty.</p>
      <NuxtLink to="/products">
        <button class="px-6 py-3 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded-xl transition-all">
          Continue Shopping
        </button>
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Checkout form -->
      <div class="lg:col-span-2">
        <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <h2 class="font-semibold text-white mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-truck" class="w-5 h-5 text-green-400" />
            Shipping Information
          </h2>

          <form class="space-y-4" @submit.prevent="placeOrder">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-medium text-gray-400 mb-1.5 block">Full Name</label>
                <input
                  v-model="form.customerName"
                  type="text"
                  placeholder="John Doe"
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400 mb-1.5 block">Email</label>
                <input
                  v-model="form.customerEmail"
                  type="email"
                  placeholder="john@example.com"
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                >
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-400 mb-1.5 block">Address</label>
              <input
                v-model="form.shippingAddress"
                type="text"
                placeholder="123 Main St, Apt 4"
                required
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
              >
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="col-span-2 sm:col-span-1">
                <label class="text-xs font-medium text-gray-400 mb-1.5 block">City</label>
                <input
                  v-model="form.shippingCity"
                  type="text"
                  placeholder="New York"
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400 mb-1.5 block">State</label>
                <input
                  v-model="form.shippingState"
                  type="text"
                  placeholder="NY"
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400 mb-1.5 block">ZIP Code</label>
                <input
                  v-model="form.shippingZip"
                  type="text"
                  placeholder="10001"
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400 mb-1.5 block">Country</label>
                <input
                  v-model="form.shippingCountry"
                  type="text"
                  placeholder="US"
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                >
              </div>
            </div>

            <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full mt-4 px-6 py-3.5 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-gray-950 font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25 disabled:shadow-none flex items-center justify-center gap-2"
            >
              <UIcon v-if="submitting" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
              <UIcon v-else name="i-lucide-lock" class="w-4 h-4" />
              {{ submitting ? 'Processing...' : 'Place Order' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Order summary -->
      <div>
        <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 sticky top-24">
          <h2 class="font-semibold text-white mb-4">Order Summary</h2>

          <div class="space-y-3 mb-4">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex justify-between text-sm"
            >
              <span class="text-gray-400 truncate mr-2">
                {{ item.name }} <span class="text-gray-600">x{{ item.quantity }}</span>
              </span>
              <span class="shrink-0 text-white font-medium">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="border-t border-white/[0.06] pt-3 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Shipping</span>
              <span class="text-green-400 font-medium">Free</span>
            </div>
            <div class="border-t border-white/[0.06] pt-3 flex justify-between font-bold text-lg">
              <span class="text-white">Total</span>
              <span class="text-white">${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'store' })

const cartStore = useCartStore()
const api = useApi()
const router = useRouter()

const form = reactive({
  customerName: '',
  customerEmail: '',
  shippingAddress: '',
  shippingCity: '',
  shippingState: '',
  shippingZip: '',
  shippingCountry: 'US'
})

const submitting = ref(false)
const error = ref('')

onMounted(() => {
  cartStore.restore()
  if (cartStore.isEmpty) {
    navigateTo('/products')
  }
})

async function placeOrder() {
  submitting.value = true
  error.value = ''

  try {
    const payload = {
      ...form,
      items: cartStore.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity
      }))
    }

    const order = await api.post<{ id: string }>('/orders/checkout', payload)
    cartStore.clear()
    router.push(`/checkout/success?orderId=${order.id}`)
  }
  catch (e: any) {
    error.value = e.message || 'Something went wrong. Please try again.'
  }
  finally {
    submitting.value = false
  }
}
</script>
