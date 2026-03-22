export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    const response = await fetch(`${config.public.apiBase}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        authStore.logout()
        navigateTo('/login')
        throw new Error('Session expired')
      }
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || 'Request failed')
    }

    if (response.status === 204) return undefined as T

    return response.json()
  }

  return {
    get: <T>(path: string) => apiFetch<T>(path),
    post: <T>(path: string, body: unknown) =>
      apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
      apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
      apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    del: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
  }
}
