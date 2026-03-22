export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.restore()

  if (to.path.startsWith('/admin')) {
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
    if (!authStore.isAdmin) {
      return navigateTo('/')
    }
  }
})
