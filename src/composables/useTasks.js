import { ref } from 'vue'
import { tasksApi } from '@/api/tasks'
import { useTasksStore } from '@/stores/tasks'

export function useTasks() {
  const tasksStore = useTasksStore()
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchTasks(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await tasksApi.getAll(params)
      tasksStore.setTasks(response.data.data.data)
    } catch (err) {
      error.value = err.response?.data?.errors?.[0]?.detail || 'Failed to fetch tasks.'
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(data) {
    isLoading.value = true
    error.value = null
    try {
      const response = await tasksApi.create(data)
      tasksStore.addTask(response.data.data.data)
      return true
    } catch (err) {
      error.value = err.response?.data?.errors?.[0]?.detail || 'Failed to create task.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateTask(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const response = await tasksApi.update(id, data)
      tasksStore.updateTask(response.data.data.data)
      return true
    } catch (err) {
      error.value = err.response?.data?.errors?.[0]?.detail || 'Failed to update task.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function archiveTask(id) {
    isLoading.value = true
    error.value = null
    try {
      await tasksApi.archive(id)
      tasksStore.removeTask(id)
      return true
    } catch (err) {
      error.value = err.response?.data?.errors?.[0]?.detail || 'Failed to archive task.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function restoreTask(id) {
    isLoading.value = true
    error.value = null
    try {
      await tasksApi.restore(id)
      tasksStore.removeTask(id)
      return true
    } catch (err) {
      error.value = err.response?.data?.errors?.[0]?.detail || 'Failed to restore task.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    archiveTask,
    restoreTask,
  }
}
