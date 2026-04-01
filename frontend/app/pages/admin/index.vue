<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-gray-500 text-sm mt-1">Overview of your store performance</p>
    </div>

    <!-- Stats -->
    <div v-if="pending" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="i in 4" :key="i" class="h-28 rounded-2xl bg-white/[0.03] shimmer" />
    </div>

    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      <div
        v-for="stat in statCards"
        :key="stat.label"
        class="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-white/10 transition-all"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="stat.bgClass">
            <UIcon :name="stat.icon" class="w-5 h-5" :class="stat.iconClass" />
          </div>
        </div>
        <p class="text-2xl font-bold text-white">{{ stat.value }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
        <h2 class="font-semibold text-white mb-4">Quick Actions</h2>
        <div class="space-y-2">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-green-500/30 hover:bg-green-500/5 transition-all group"
          >
            <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
              <UIcon :name="action.icon" class="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
            </div>
            <span class="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{{ action.label }}</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-gray-600 ml-auto group-hover:text-green-400 transition-colors" />
          </NuxtLink>
        </div>
      </div>

      <!-- Store link -->
      <div class="rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-6 flex flex-col justify-between">
        <div>
          <h2 class="font-semibold text-white mb-2">View your store</h2>
          <p class="text-sm text-gray-400">See how your storefront looks to customers.</p>
        </div>
        <NuxtLink to="/" target="_blank" class="inline-flex items-center gap-2 mt-6 text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
          Open storefront
          <UIcon name="i-lucide-external-link" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

const api = useApi()
const { data: stats, pending } = useAsyncData('stats', () =>
  api.get<{ totalProducts: number; totalOrders: number; revenue: number; lowStock: number }>('/products/stats'),
)

const statCards = computed(() => [
  {
    label: 'Total Products',
    value: stats.value?.totalProducts ?? 0,
    icon: 'i-lucide-package',
    bgClass: 'bg-blue-500/10',
    iconClass: 'text-blue-400',
  },
  {
    label: 'Total Orders',
    value: stats.value?.totalOrders ?? 0,
    icon: 'i-lucide-shopping-cart',
    bgClass: 'bg-green-500/10',
    iconClass: 'text-green-400',
  },
  {
    label: 'Revenue',
    value: `$${Number(stats.value?.revenue ?? 0).toFixed(2)}`,
    icon: 'i-lucide-dollar-sign',
    bgClass: 'bg-amber-500/10',
    iconClass: 'text-amber-400',
  },
  {
    label: 'Low Stock',
    value: stats.value?.lowStock ?? 0,
    icon: 'i-lucide-alert-triangle',
    bgClass: 'bg-red-500/10',
    iconClass: 'text-red-400',
  },
])

const quickActions = [
  { label: 'Add new product', icon: 'i-lucide-plus', to: '/admin/products/create' },
  { label: 'Manage categories', icon: 'i-lucide-tag', to: '/admin/categories' },
  { label: 'View all orders', icon: 'i-lucide-list', to: '/admin/orders' },
]
</script>
