import { ref } from 'vue'
import { tasksApi } from '@/api/tasks'

export function useTasks() {
  const tasks = ref([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref(null)

  async function fetchTasks(params = {}) {
    isLoading.value = true
    try {
      const response = await tasksApi.getAll({ status: 'Active', ...params })
      tasks.value = response.data.data.data
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(data) {
    isSubmitting.value = true
    error.value = null
    try {
      await tasksApi.create(data)
      await fetchTasks()
      return true
    } catch (err) {
      error.value =
        err.response?.data?.errors?.[0]?.detail ||
        err.response?.data?.message ||
        'Something went wrong.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    tasks,
    isLoading,
    isSubmitting,
    error,
    fetchTasks,
    createTask,
  }
}
