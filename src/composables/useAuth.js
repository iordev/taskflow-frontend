import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref(null)

  async function login(credentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      const { user, token } = response.data.data

      authStore.setAuth(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      await router.push({ name: 'dashboard' })
    } catch (err) {
      error.value =
        err.response?.data?.errors?.[0]?.detail || 'Something went wrong. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true

    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      authStore.clearAuth()
      toast.success('Logged out successfully.')
      await router.push({ name: 'login' })
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    login,
    logout,
  }
}
