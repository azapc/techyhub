<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Categories</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- List -->
      <UCard>
        <template #header><h2 class="font-semibold">Existing categories</h2></template>
        <div v-if="pending" class="space-y-2">
          <USkeleton v-for="i in 4" :key="i" class="h-10 rounded" />
        </div>
        <div v-else-if="!categories?.length" class="text-center py-6 text-gray-500">
          No categories yet. Create your first one.
        </div>
        <ul v-else class="divide-y divide-gray-100 dark:divide-gray-800">
          <li v-for="cat in categories" :key="cat.id" class="flex items-center justify-between py-3">
            <div>
              <p class="font-medium">{{ cat.name }}</p>
              <p class="text-xs text-gray-500">/{{ cat.slug }} · {{ cat._count?.products ?? 0 }} products</p>
            </div>
            <div class="flex gap-1">
              <UButton variant="ghost" icon="i-lucide-pencil" size="xs" @click="startEdit(cat)" />
              <UButton variant="ghost" color="error" icon="i-lucide-trash-2" size="xs" @click="confirmDelete(cat)" />
            </div>
          </li>
        </ul>
      </UCard>

      <!-- Form -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">{{ editing ? 'Edit category' : 'New category' }}</h2>
            <UButton v-if="editing" variant="ghost" size="xs" @click="cancelEdit">Cancel edit</UButton>
          </div>
        </template>
        <UForm :state="form" class="space-y-4" @submit="editing ? updateCategory() : createCategory()">
          <UFormField label="Name">
            <UInput v-model="form.name" placeholder="e.g. Monitors" class="w-full" />
          </UFormField>
          <UFormField label="Slug">
            <UInput v-model="form.slug" placeholder="monitors" class="w-full" />
          </UFormField>
          <UButton type="submit" :loading="saving">
            {{ editing ? 'Update category' : 'Create category' }}
          </UButton>
        </UForm>
      </UCard>
    </div>

    <UModal v-model:open="showDeleteModal">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold">Confirm deletion</h3></template>
          <p>Delete category <strong>{{ deleteTarget?.name }}</strong>?</p>
          <template #footer>
            <div class="flex gap-2 justify-end">
              <UButton variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
              <UButton color="error" :loading="deleting" @click="doDelete">Delete</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

const api = useApi()
const toast = useToast()

const { data: categories, pending, refresh } = useAsyncData('admin-categories', () => api.get<any[]>('/categories'))

const form = reactive({ name: '', slug: '' })
const saving = ref(false)
const editing = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)

watch(() => form.name, (name) => {
  if (!editing.value) {
    form.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
})

function startEdit(cat: any) {
  editing.value = cat.id
  form.name = cat.name
  form.slug = cat.slug
}

function cancelEdit() {
  editing.value = null
  form.name = ''
  form.slug = ''
}

async function createCategory() {
  saving.value = true
  try {
    await api.post('/categories', form)
    toast.add({ title: 'Category created', color: 'success' })
    form.name = ''
    form.slug = ''
    refresh()
  }
  catch (e: any) {
    toast.add({ title: e.message, color: 'error' })
  }
  finally {
    saving.value = false
  }
}

async function updateCategory() {
  if (!editing.value) return
  saving.value = true
  try {
    await api.put(`/categories/${editing.value}`, form)
    toast.add({ title: 'Category updated', color: 'success' })
    cancelEdit()
    refresh()
  }
  catch (e: any) {
    toast.add({ title: e.message, color: 'error' })
  }
  finally {
    saving.value = false
  }
}

function confirmDelete(cat: any) {
  deleteTarget.value = cat
  showDeleteModal.value = true
}

async function doDelete() {
  deleting.value = true
  try {
    await api.del(`/categories/${deleteTarget.value.id}`)
    toast.add({ title: 'Category deleted', color: 'success' })
    showDeleteModal.value = false
    refresh()
  }
  catch (e: any) {
    toast.add({ title: e.message, color: 'error' })
  }
  finally {
    deleting.value = false
  }
}
</script>
