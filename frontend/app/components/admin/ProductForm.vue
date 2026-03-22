<template>
  <UCard>
    <form class="space-y-4" @submit.prevent="onSubmit">
      <UFormField label="Name">
        <UInput v-model="state.name" placeholder="e.g. MacBook Pro M3" class="w-full" />
      </UFormField>

      <UFormField label="Slug (URL)">
        <UInput v-model="state.slug" placeholder="macbook-pro-m3" class="w-full" />
      </UFormField>

      <UFormField label="Description">
        <UTextarea v-model="state.description" placeholder="Product description..." :rows="3" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Price (USD)">
          <UInput v-model.number="state.price" type="number" step="0.01" min="0" class="w-full" />
        </UFormField>

        <UFormField label="Stock">
          <UInput v-model.number="state.stock" type="number" min="0" class="w-full" />
        </UFormField>
      </div>

      <UFormField label="Category">
        <USelect
          v-if="categoryOptions.length"
          v-model="state.categoryId"
          :items="categoryOptions"
          placeholder="Select a category"
          class="w-full"
        />
        <USkeleton v-else class="h-9 w-full rounded" />
      </UFormField>

      <UFormField label="Images (URLs, one per line)">
        <UTextarea
          :model-value="imagesText"
          placeholder="https://example.com/image.jpg"
          :rows="3"
          class="w-full"
          @update:model-value="onImagesInput"
        />
      </UFormField>

      <div class="flex gap-3 pt-2">
        <UButton type="submit" :loading="loading">Save</UButton>
        <UButton to="/admin/products" variant="ghost">Cancel</UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  initial?: any
  loading?: boolean
}>()

const emit = defineEmits<{ submit: [data: any] }>()

const api = useApi()

const state = reactive({
  name: props.initial?.name || '',
  slug: props.initial?.slug || '',
  description: props.initial?.description || '',
  price: props.initial?.price ? Number(props.initial.price) : 0,
  stock: props.initial?.stock ?? 0,
  categoryId: props.initial?.categoryId || '',
  images: props.initial?.images?.map((i: any) => i.url) || [] as string[],
})

watch(() => props.initial, (val) => {
  if (val) {
    state.name = val.name || ''
    state.slug = val.slug || ''
    state.description = val.description || ''
    state.price = val.price ? Number(val.price) : 0
    state.stock = val.stock ?? 0
    state.categoryId = val.categoryId || ''
    state.images = val.images?.map((i: any) => i.url) || []
  }
}, { deep: true })

const imagesText = computed(() => state.images.join('\n'))

function onImagesInput(v: string) {
  state.images = v.split('\n').filter(Boolean)
}

watch(() => state.name, (name) => {
  if (!props.initial) {
    state.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
})

function onSubmit() {
  emit('submit', { ...state })
}

const categoryOptions = ref<{ label: string; value: string }[]>([])

onMounted(async () => {
  try {
    const cats = await api.get<any[]>('/categories')
    categoryOptions.value = cats.map((c: any) => ({ label: c.name, value: c.id }))
  } catch {
    categoryOptions.value = []
  }
})
</script>
