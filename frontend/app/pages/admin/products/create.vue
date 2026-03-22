<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <UButton to="/admin/products" variant="ghost" icon="i-lucide-arrow-left" />
      <h1 class="text-2xl font-bold">New product</h1>
    </div>

    <AdminProductForm :loading="saving" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

const api = useApi()
const router = useRouter()
const toast = useToast()
const saving = ref(false)

async function onSubmit(data: any) {
  saving.value = true
  try {
    await api.post('/products', data)
    toast.add({ title: 'Product created', color: 'success' })
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
