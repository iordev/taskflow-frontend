import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const currentTask = ref(null)
  const isLoading = ref(false)
  const pagination = ref(null)

  function setTasks(data) {
    tasks.value = data
  }

  function setPagination(data) {
    pagination.value = data
  }

  function setCurrentTask(task) {
    currentTask.value = task
  }

  function addTask(task) {
    tasks.value.unshift(task)
  }

  function updateTask(updatedTask) {
    const index = tasks.value.findIndex((t) => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
  }

  function removeTask(taskId) {
    tasks.value = tasks.value.filter((t) => t.id !== taskId)
  }

  function setLoading(value) {
    isLoading.value = value
  }

  function clearTasks() {
    tasks.value = []
    currentTask.value = null
    pagination.value = null
  }

  return {
    tasks,
    currentTask,
    isLoading,
    pagination,
    setTasks,
    setPagination,
    setCurrentTask,
    addTask,
    updateTask,
    removeTask,
    setLoading,
    clearTasks,
  }
})
