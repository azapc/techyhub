<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Categories</h1>
      <p class="text-gray-500 text-sm mt-1">Organize your product catalog</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- List -->
      <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div class="p-5 border-b border-white/[0.06]">
          <h2 class="font-semibold text-white text-sm">Existing categories</h2>
        </div>
        <div class="p-4">
          <div v-if="pending" class="space-y-2">
            <div v-for="i in 4" :key="i" class="h-12 rounded-xl bg-white/[0.02] shimmer" />
          </div>
          <div v-else-if="!categories?.length" class="text-center py-10 text-gray-500">
            <UIcon name="i-lucide-tag" class="w-8 h-8 mx-auto mb-3 text-gray-600" />
            <p class="text-sm">No categories yet. Create your first one.</p>
          </div>
          <ul v-else class="space-y-1">
            <li
              v-for="cat in categories"
              :key="cat.id"
              class="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-all group"
            >
              <div>
                <p class="font-medium text-white text-sm">{{ cat.name }}</p>
                <p class="text-[11px] text-gray-500">/{{ cat.slug }} · {{ cat._count?.products ?? 0 }} products</p>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all" @click="startEdit(cat)">
                  <UIcon name="i-lucide-pencil" class="w-3.5 h-3.5" />
                </button>
                <button class="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all" @click="confirmDelete(cat)">
                  <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Form -->
      <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden h-fit">
        <div class="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 class="font-semibold text-white text-sm">{{ editing ? 'Edit category' : 'New category' }}</h2>
          <button v-if="editing" class="text-xs text-gray-500 hover:text-white transition-colors" @click="cancelEdit">Cancel</button>
        </div>
        <div class="p-5">
          <form class="space-y-4" @submit.prevent="editing ? updateCategory() : createCategory()">
            <div>
              <label class="text-xs font-medium text-gray-400 mb-1.5 block">Name</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Monitors"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
              >
            </div>
            <div>
              <label class="text-xs font-medium text-gray-400 mb-1.5 block">Slug</label>
              <input
                v-model="form.slug"
                type="text"
                placeholder="monitors"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
              >
            </div>
            <button
              type="submit"
              :disabled="saving"
              class="w-full px-4 py-2.5 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-gray-950 font-semibold text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25 disabled:shadow-none"
            >
              {{ saving ? 'Saving...' : (editing ? 'Update category' : 'Create category') }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <div class="rounded-2xl bg-gray-900 border border-white/[0.06] p-6">
          <h3 class="font-semibold text-white mb-2">Delete category</h3>
          <p class="text-gray-400 text-sm mb-6">Delete <strong class="text-white">{{ deleteTarget?.name }}</strong>?</p>
          <div class="flex gap-2 justify-end">
            <button class="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all" @click="showDeleteModal = false">Cancel</button>
            <button
              :disabled="deleting"
              class="px-4 py-2 text-sm bg-red-500 hover:bg-red-400 text-white font-medium rounded-lg transition-all disabled:opacity-50"
              @click="doDelete"
            >
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
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
