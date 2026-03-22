<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <UButton to="/admin/products" variant="ghost" icon="i-lucide-arrow-left" />
      <h1 class="text-2xl font-bold">Edit product</h1>
    </div>

    <USkeleton v-if="pending" class="h-96 rounded-xl" />
    <AdminProductForm v-else :initial="product" :loading="saving" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

const route = useRoute()
const api = useApi()
const router = useRouter()
const toast = useToast()
const saving = ref(false)

const { data: product, pending } = useAsyncData(`product-${route.params.id}`, () =>
  api.get<any>(`/products/${route.params.id}`),
)

async function onSubmit(data: any) {
  saving.value = true
  try {
    await api.put(`/products/${route.params.id}`, data)
    toast.add({ title: 'Product updated', color: 'success' })
    router.push('/admin/products')
  }
  catch (e: any) {
    toast.add({ title: e.message, color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>
