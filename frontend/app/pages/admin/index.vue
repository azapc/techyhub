<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    <div v-if="pending" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>

    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-package" class="text-blue-500 text-2xl" />
          <div>
            <p class="text-sm text-gray-500">Products</p>
            <p class="text-2xl font-bold">{{ stats?.totalProducts ?? 0 }}</p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-shopping-cart" class="text-green-500 text-2xl" />
          <div>
            <p class="text-sm text-gray-500">Orders</p>
            <p class="text-2xl font-bold">{{ stats?.totalOrders ?? 0 }}</p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-dollar-sign" class="text-yellow-500 text-2xl" />
          <div>
            <p class="text-sm text-gray-500">Revenue</p>
            <p class="text-2xl font-bold">${{ Number(stats?.revenue ?? 0).toFixed(2) }}</p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-alert-triangle" class="text-red-500 text-2xl" />
          <div>
            <p class="text-sm text-gray-500">Low stock</p>
            <p class="text-2xl font-bold">{{ stats?.lowStock ?? 0 }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header><h2 class="font-semibold">Quick actions</h2></template>
        <div class="space-y-2">
          <UButton to="/admin/products/create" block variant="outline" icon="i-lucide-plus">
            Add product
          </UButton>
          <UButton to="/admin/categories" block variant="outline" icon="i-lucide-tag">
            Manage categories
          </UButton>
          <UButton to="/admin/orders" block variant="outline" icon="i-lucide-list">
            View all orders
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

const api = useApi()
const { data: stats, pending } = useAsyncData('stats', () =>
  api.get<{ totalProducts: number; totalOrders: number; revenue: number; lowStock: number }>('/products/stats'),
)
</script>
