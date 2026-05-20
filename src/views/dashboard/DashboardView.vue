<script setup>
import { onMounted, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTasks } from '@/composables/useTasks'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { Button } from '@/components/ui/button'
import { LogOut, Plus, RefreshCw } from 'lucide-vue-next'
import TaskForm from '@/components/tasks/TaskForm.vue'

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const { logout, isLoading: isLoggingOut } = useAuth()
const {
  fetchTasks: fetchTasksComposable,
  createTask,
  updateTask,
  archiveTask,
  restoreTask,
  isLoading,
} = useTasks()

const activeFilter = ref('Active')
const showForm = ref(false)
const selectedTask = ref(null)

const currentPage = ref(1)

async function fetchTasks(page = 1) {
  currentPage.value = page
  await fetchTasksComposable({ status: activeFilter.value, page })
}

async function switchFilter(filter) {
  activeFilter.value = filter
  currentPage.value = 1
  await fetchTasksComposable({ status: filter, page: 1 })
}

function getStatusClass(status) {
  return {
    'bg-yellow-100 text-yellow-700': status === 'Pending',
    'bg-blue-100 text-blue-700': status === 'In Progress',
    'bg-green-100 text-green-700': status === 'Completed',
  }
}

function getPriorityClass(priority) {
  return {
    'bg-red-100 text-red-700': priority === 'High',
    'bg-orange-100 text-orange-700': priority === 'Medium',
    'bg-gray-100 text-gray-700': priority === 'Low',
  }
}

function openCreateForm() {
  selectedTask.value = null
  showForm.value = true
}

function openEditForm(task) {
  selectedTask.value = task
  showForm.value = true
}

async function handleFormSubmit(data) {
  const success = selectedTask.value
    ? await updateTask(selectedTask.value.id, data)
    : await createTask(data)

  if (success) {
    showForm.value = false
    selectedTask.value = null
  }
}

async function handleArchive(id) {
  await archiveTask(id)
}

async function handleRestore(id) {
  await restoreTask(id)
  await fetchTasks({ status: activeFilter.value })
}

onMounted(() => {
  fetchTasks(1)
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Navbar -->
    <header class="border-b">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 class="text-lg font-semibold">TaskFlow</h1>
        <div class="flex items-center gap-3">
          <span class="text-sm text-muted-foreground">
            {{ authStore.user?.name }}
          </span>
          <Button :disabled="isLoggingOut" size="sm" variant="outline" @click="logout">
            <LogOut class="h-4 w-4 mr-2" />
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </Button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">My Tasks</h2>
        <Button @click="openCreateForm">
          <Plus class="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-6">
        <Button
          size="sm"
          :variant="activeFilter === 'Active' ? 'default' : 'outline'"
          @click="switchFilter('Active')"
        >
          Active
        </Button>
        <Button
          size="sm"
          :variant="activeFilter === 'Inactive' ? 'default' : 'outline'"
          @click="switchFilter('Inactive')"
        >
          Archived
        </Button>
      </div>

      <!-- Loading -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center py-12 gap-2 text-muted-foreground"
      >
        <RefreshCw class="h-4 w-4 animate-spin" />
        Loading tasks...
      </div>

      <!-- Empty -->
      <div
        v-else-if="tasksStore.tasks.length === 0"
        class="text-center py-12 text-muted-foreground border rounded-lg"
      >
        <p class="font-medium">No tasks found.</p>
        <p class="text-sm mt-1">
          {{ activeFilter === 'Active' ? 'Create your first task!' : 'No archived tasks.' }}
        </p>
      </div>

      <!-- Task List -->
      <div v-else class="space-y-3">
        <div
          v-for="task in tasksStore.tasks"
          :key="task.id"
          class="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow"
        >
          <div class="flex items-start justify-between gap-4">
            <!-- Task Info -->
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ task.title }}</p>
              <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
                {{ task.description ?? 'No description' }}
              </p>
              <p class="text-xs text-muted-foreground mt-2" v-if="task.due_date">
                Due: {{ task.due_date }}
              </p>
            </div>

            <!-- Badges -->
            <div class="flex flex-col items-end gap-2 shrink-0">
              <span
                :class="getStatusClass(task.status)"
                class="text-xs px-2 py-1 rounded-full font-medium"
              >
                {{ task.status }}
              </span>
              <span
                :class="getPriorityClass(task.priority)"
                class="text-xs px-2 py-1 rounded-full font-medium"
              >
                {{ task.priority }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-3 pt-3 border-t">
            <template v-if="activeFilter === 'Active'">
              <Button size="sm" variant="outline" @click="openEditForm(task)"> Edit </Button>
              <Button size="sm" variant="destructive" @click="handleArchive(task.id)">
                Archive
              </Button>
            </template>
            <template v-else>
              <Button size="sm" variant="outline" @click="handleRestore(task.id)"> Restore </Button>
            </template>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="tasksStore.pagination && tasksStore.pagination.lastPage > 1"
        class="flex items-center justify-between mt-6"
      >
        <p class="text-sm text-muted-foreground">
          Showing {{ tasksStore.tasks.length }} of {{ tasksStore.pagination.total }} tasks
        </p>

        <div class="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            :disabled="tasksStore.pagination.currentPage === 1 || isLoading"
            @click="fetchTasks(tasksStore.pagination.currentPage - 1)"
          >
            Previous
          </Button>

          <div class="flex items-center gap-1">
            <Button
              v-for="page in tasksStore.pagination.lastPage"
              :key="page"
              size="sm"
              :variant="page === tasksStore.pagination.currentPage ? 'default' : 'outline'"
              :disabled="isLoading"
              @click="fetchTasks(page)"
            >
              {{ page }}
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            :disabled="
              tasksStore.pagination.currentPage === tasksStore.pagination.lastPage || isLoading
            "
            @click="fetchTasks(tasksStore.pagination.currentPage + 1)"
          >
            Next
          </Button>
        </div>
      </div>
    </main>

    <!-- Task Form Dialog -->
    <TaskForm
      v-model:open="showForm"
      :task="selectedTask"
      :is-loading="isLoading"
      @submit="handleFormSubmit"
    />

    <!-- Archive Confirmation Dialog -->
    <!--    <TaskDeleteDialog-->
    <!--      v-model:open="showArchiveDialog"-->
    <!--      :task="taskToArchive"-->
    <!--      :is-loading="isLoading"-->
    <!--      @confirm="handleArchive"-->
    <!--    />-->
  </div>
</template>
