<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
    <!-- Background effects -->
    <div class="absolute inset-0 grid-bg" />
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-[128px]" />

    <div class="relative w-full max-w-sm mx-4">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
          T
        </div>
        <h2 class="text-2xl font-bold text-white">Welcome back</h2>
        <p class="text-gray-500 text-sm mt-1">Sign in to your admin panel</p>
      </div>

      <!-- Form -->
      <div class="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div>
            <label class="text-xs font-medium text-gray-400 mb-1.5 block">Email</label>
            <input
              v-model="state.email"
              type="email"
              placeholder="admin@ecommerce.com"
              required
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
            >
          </div>

          <div>
            <label class="text-xs font-medium text-gray-400 mb-1.5 block">Password</label>
            <input
              v-model="state.password"
              type="password"
              placeholder="Enter your password"
              required
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
            >
          </div>

          <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-3 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-gray-950 font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25 disabled:shadow-none flex items-center justify-center gap-2"
          >
            <UIcon v-if="loading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const authStore = useAuthStore()
const router = useRouter()
const api = useApi()

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
