<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

    <!-- Empty state -->
    <div v-if="cartStore.isEmpty" class="text-center py-20">
      <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.03] flex items-center justify-center">
        <UIcon name="i-lucide-shopping-bag" class="w-10 h-10 text-gray-600" />
      </div>
      <h2 class="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
      <p class="text-gray-500 mb-8">Looks like you haven't added any products yet.</p>
      <NuxtLink to="/products">
        <button class="px-6 py-3 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25">
          Continue Shopping
        </button>
      </NuxtLink>
    </div>

    <!-- Cart content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart items -->
      <div class="lg:col-span-2 space-y-3">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
        >
          <div class="w-20 h-20 bg-gray-900 rounded-xl overflow-hidden shrink-0">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-image" class="w-6 h-6 text-gray-700" />
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <NuxtLink :to="`/products/${item.slug}`" class="font-semibold text-white hover:text-green-400 transition-colors truncate block text-sm">
              {{ item.name }}
            </NuxtLink>
            <p class="text-green-400 font-bold mt-1 text-sm">${{ item.price.toFixed(2) }}</p>

            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <button
                  class="px-2.5 py-1.5 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-30"
                  :disabled="item.quantity <= 1"
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                >
                  <UIcon name="i-lucide-minus" class="w-3 h-3" />
                </button>
                <span class="px-3 py-1.5 text-xs font-semibold min-w-[2rem] text-center">{{ item.quantity }}</span>
                <button
                  class="px-2.5 py-1.5 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-30"
                  :disabled="item.quantity >= item.stock"
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                >
                  <UIcon name="i-lucide-plus" class="w-3 h-3" />
                </button>
              </div>
              <button
                class="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                @click="cartStore.removeItem(item.id)"
              >
                <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order summary -->
      <div>
        <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <h2 class="font-semibold text-white mb-4">Order Summary</h2>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Items ({{ cartStore.totalItems }})</span>
              <span class="text-white">${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Shipping</span>
              <span class="text-green-400 font-medium">Free</span>
            </div>
            <div class="border-t border-white/[0.06] pt-3 flex justify-between font-bold text-base">
              <span class="text-white">Total</span>
              <span class="text-white">${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
          </div>

          <NuxtLink to="/checkout" class="block mt-6">
            <button class="w-full px-6 py-3 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25">
              Proceed to Checkout
            </button>
          </NuxtLink>
        </div>

        <NuxtLink to="/products" class="flex items-center justify-center gap-1 text-sm text-gray-500 mt-4 hover:text-green-400 transition-colors">
          <UIcon name="i-lucide-arrow-left" class="w-3 h-3" />
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
