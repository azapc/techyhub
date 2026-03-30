<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold mb-6">Shopping Cart</h1>

    <div v-if="cartStore.isEmpty" class="text-center py-16">
      <UIcon name="i-lucide-shopping-cart" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h2>
      <p class="text-gray-500 mb-6">Looks like you haven't added any products yet.</p>
      <NuxtLink to="/products">
        <UButton>Continue Shopping</UButton>
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart items -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="flex gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
        >
          <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-image" class="w-8 h-8 text-gray-300" />
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <NuxtLink :to="`/products/${item.slug}`" class="font-semibold text-gray-900 dark:text-white hover:text-primary-600 truncate block">
              {{ item.name }}
            </NuxtLink>
            <p class="text-primary-600 font-bold mt-1">${{ item.price.toFixed(2) }}</p>

            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  class="px-2 py-1 text-gray-600 hover:text-gray-900 text-sm disabled:opacity-50"
                  :disabled="item.quantity <= 1"
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                >
                  -
                </button>
                <span class="px-3 py-1 text-sm font-medium">{{ item.quantity }}</span>
                <button
                  class="px-2 py-1 text-gray-600 hover:text-gray-900 text-sm disabled:opacity-50"
                  :disabled="item.quantity >= item.stock"
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                >
                  +
                </button>
              </div>
              <UButton
                variant="ghost"
                color="error"
                icon="i-lucide-trash-2"
                size="xs"
                @click="cartStore.removeItem(item.id)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Order summary -->
      <div>
        <UCard>
          <template #header>
            <h2 class="font-semibold">Order Summary</h2>
          </template>

          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Items ({{ cartStore.totalItems }})</span>
              <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Shipping</span>
              <span class="text-primary-600">Free</span>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span class="text-primary-600">${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
          </div>

          <template #footer>
            <NuxtLink to="/checkout">
              <UButton block size="lg">
                Proceed to Checkout
              </UButton>
            </NuxtLink>
          </template>
        </UCard>

        <NuxtLink to="/products" class="block text-center text-sm text-primary-600 mt-4 hover:underline">
          Continue Shopping
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'store' })

const cartStore = useCartStore()

onMounted(() => {
  cartStore.restore()
})
</script>
