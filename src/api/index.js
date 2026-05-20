import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor — attach token to every request
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore()

    // If 401 — token expired or invalid, force logout
    if (error.response?.status === 401) {
      authStore.clearAuth()
      router.push({ name: 'login' }).then((r) => console.log('Redirected to login:', r))
    }

    return Promise.reject(error)
  },
)

export default api
