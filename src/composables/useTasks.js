import { ref } from 'vue'
import { tasksApi } from '@/api/tasks'
import { useTasksStore } from '@/stores/tasks'
import { toast } from 'vue3-toastify'

export function useTasks() {
  const tasksStore = useTasksStore()
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchTasks(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await tasksApi.getAll(params)
      const result = response.data.data

      // Check if paginated or not
      if (result.data) {
        // Paginated response
        tasksStore.setTasks(result.data)
        tasksStore.setPagination({
          currentPage: result.current_page,
          lastPage: result.last_page,
          perPage: result.per_page,
          total: result.total,
        })
      } else {
        // Non-paginated response
        tasksStore.setTasks(result)
        tasksStore.setPagination(null)
      }
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
      tasksStore.addTask(response.data.data)
      toast.success('Task created successfully.', {
        position: toast.POSITION.TOP_RIGHT,
      })
      return true
    } catch (err) {
      error.value = err.response?.data?.errors?.[0]?.detail || 'Failed to create task.'
      toast.error(error.value, {
        position: toast.POSITION.TOP_RIGHT,
      })
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
      tasksStore.updateTask(response.data.data)
      toast.success('Task updated successfully.', {
        position: toast.POSITION.TOP_RIGHT,
      })
      return true
    } catch (err) {
      error.value = err.response?.data?.errors?.[0]?.detail || 'Failed to update task.'
      toast.error(error.value, {
        position: toast.POSITION.TOP_RIGHT,
      })
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
      toast.success('Task archived successfully.', {
        position: toast.POSITION.TOP_RIGHT,
      })
      return true
    } catch (err) {
      error.value = err.response?.data?.errors?.[0]?.detail || 'Failed to archive task.'
      toast.error(error.value, {
        position: toast.POSITION.TOP_RIGHT,
      })
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
      toast.success('Task restored successfully.', {
        position: toast.POSITION.TOP_RIGHT,
      })
      return true
    } catch (err) {
      error.value = err.response?.data?.errors?.[0]?.detail || 'Failed to restore task.'
      toast.error(error.value, {
        position: toast.POSITION.TOP_RIGHT,
      })
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
