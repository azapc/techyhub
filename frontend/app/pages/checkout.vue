<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold mb-6">Checkout</h1>

    <div v-if="cartStore.isEmpty" class="text-center py-16">
      <p class="text-gray-500 mb-4">Your cart is empty.</p>
      <NuxtLink to="/products">
        <UButton>Continue Shopping</UButton>
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Checkout form -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <h2 class="font-semibold">Shipping Information</h2>
          </template>

          <form class="space-y-4" @submit.prevent="placeOrder">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Full Name" required>
                <UInput v-model="form.customerName" placeholder="John Doe" class="w-full" required />
              </UFormField>
              <UFormField label="Email" required>
                <UInput v-model="form.customerEmail" type="email" placeholder="john@example.com" class="w-full" required />
              </UFormField>
            </div>

            <UFormField label="Address" required>
              <UInput v-model="form.shippingAddress" placeholder="123 Main St, Apt 4" class="w-full" required />
            </UFormField>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <UFormField label="City" required class="col-span-2 sm:col-span-1">
                <UInput v-model="form.shippingCity" placeholder="New York" class="w-full" required />
              </UFormField>
              <UFormField label="State" required>
                <UInput v-model="form.shippingState" placeholder="NY" class="w-full" required />
              </UFormField>
              <UFormField label="ZIP Code" required>
                <UInput v-model="form.shippingZip" placeholder="10001" class="w-full" required />
              </UFormField>
              <UFormField label="Country" required>
                <UInput v-model="form.shippingCountry" placeholder="US" class="w-full" required />
              </UFormField>
            </div>

            <UAlert v-if="error" color="error" :title="error" class="mt-4" />

            <UButton type="submit" size="lg" block :loading="submitting" class="mt-6">
              Place Order
            </UButton>
          </form>
        </UCard>
      </div>

      <!-- Order summary -->
      <div>
        <UCard>
          <template #header>
            <h2 class="font-semibold">Order Summary</h2>
          </template>

          <div class="space-y-3">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex justify-between text-sm"
            >
              <span class="text-gray-600 dark:text-gray-300 truncate mr-2">
                {{ item.name }} x{{ item.quantity }}
              </span>
              <span class="shrink-0 font-medium">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-sm">
              <span class="text-gray-500">Shipping</span>
              <span class="text-primary-600">Free</span>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span class="text-primary-600">${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </UCard>
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
