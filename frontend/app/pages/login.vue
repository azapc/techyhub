<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2 class="text-2xl font-bold text-center">TechyHub</h2>
        <p class="text-center text-gray-500 mt-1">Admin Panel</p>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" placeholder="admin@ecommerce.com" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" placeholder="••••••" class="w-full" />
        </UFormField>

        <UAlert v-if="error" color="error" :title="error" />

        <UButton type="submit" block :loading="loading">
          Sign in
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: false })

const authStore = useAuthStore()
const router = useRouter()
const api = useApi()

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

const state = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.post<{ access_token: string; user: any }>('/auth/login', state)
    authStore.setAuth(res.access_token, res.user)
    router.push('/admin')
  }
  catch (e: any) {
    error.value = e.message || 'Invalid credentials'
  }
  finally {
    loading.value = false
  }
}
</script>
