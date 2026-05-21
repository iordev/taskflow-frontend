import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'

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
      toast.success(`Welcome back, ${user.name}!`, {
        position: toast.POSITION.TOP_RIGHT,
      })
      await router.push({ name: 'dashboard' })
    } catch (err) {
      const status = err.response?.status
      const data = err.response?.data

      if (status === 429) {
        // Rate limit error
        error.value = data?.details?.wait_time_detailed || 'Too many requests. Please slow down.'
      } else if (status === 401) {
        // Wrong credentials
        error.value = data?.errors?.[0]?.detail || 'Invalid username or password.'
      } else {
        // Generic error
        error.value = 'Something went wrong. Please try again.'
      }
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
      toast.success('Logged out successfully.', {
        position: toast.POSITION.TOP_RIGHT,
      })
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
