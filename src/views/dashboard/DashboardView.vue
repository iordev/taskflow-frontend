<script setup>
import { onMounted, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTasks } from '@/composables/useTasks'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { Button } from '@/components/ui/button'
import { Archive, CalendarDays, LogOut, Pencil, Plus, RefreshCw, RotateCcw } from 'lucide-vue-next'
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
const perPage = ref(10)

async function fetchTasks(page = 1) {
  currentPage.value = page
  await fetchTasksComposable({ status: activeFilter.value, page, per_page: perPage.value })
}

async function switchFilter(filter) {
  activeFilter.value = filter
  activeFilter.value = filter
  currentPage.value = 1
  await fetchTasksComposable({ status: filter, page: 1 })
}

function getStatusClass(status) {
  return {
    'bg-yellow-100 text-yellow-800 border border-yellow-200': status === 'Pending',
    'bg-blue-100 text-blue-800 border border-blue-200': status === 'In Progress',
    'bg-green-100 text-green-800 border border-green-200': status === 'Completed',
  }
}

function getPriorityClass(priority) {
  return {
    'bg-red-100 text-red-800 border border-red-200': priority === 'High',
    'bg-orange-100 text-orange-800 border border-orange-200': priority === 'Medium',
    'bg-gray-100 text-gray-800 border border-gray-200': priority === 'Low',
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
  <div class="h-screen flex flex-col bg-background">
    <!-- Navbar -->
    <header class="border-b shrink-0">
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
    <main class="flex-1 overflow-hidden max-w-5xl w-full mx-auto px-4 py-8 flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 shrink-0">
        <h2 class="text-2xl font-bold">My Tasks</h2>
        <Button @click="openCreateForm">
          <Plus class="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-6 shrink-0">
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

      <!-- Scrollable Task List -->
      <div v-else class="flex-1 overflow-y-auto space-y-3 pr-1">
        <div
          v-for="task in tasksStore.tasks"
          :key="task.id"
          class="border rounded-lg px-4 py-3 bg-card hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-center justify-between gap-4">
            <!-- Left: Task Info -->
            <div class="flex-1 min-w-0 space-y-0.5">
              <!-- Title -->
              <p class="font-semibold text-sm truncate">{{ task.title }}</p>
              <!-- Description -->
              <p class="text-xs text-muted-foreground truncate">
                {{ task.description ?? 'No description provided.' }}
              </p>
              <!-- Due Date -->
              <div
                v-if="task.due_date"
                class="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <CalendarDays class="h-3 w-3" />
                <span>Due: {{ task.due_date }}</span>
              </div>
            </div>

            <!-- Right: Badges + Actions -->
            <div class="flex items-center gap-3 shrink-0">
              <!-- Badges -->
              <div class="flex items-center gap-2">
                <span
                  :class="getStatusClass(task.status)"
                  class="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                >
                  {{ task.status }}
                </span>
                <span
                  :class="getPriorityClass(task.priority)"
                  class="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                >
                  {{ task.priority }}
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-1">
                <template v-if="activeFilter === 'Active'">
                  <Button
                    size="sm"
                    variant="outline"
                    class="h-7 w-7 p-0"
                    @click="openEditForm(task)"
                  >
                    <Pencil class="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    class="h-7 w-7 p-0"
                    @click="openArchiveDialog(task)"
                  >
                    <Archive class="h-3 w-3" />
                  </Button>
                </template>
                <template v-else>
                  <Button
                    size="sm"
                    variant="outline"
                    class="h-7 w-7 p-0"
                    @click="handleRestore(task.id)"
                  >
                    <RotateCcw class="h-3 w-3" />
                  </Button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="tasksStore.pagination && tasksStore.pagination.lastPage > 1"
        class="flex items-center justify-between mt-4 pt-4 border-t shrink-0"
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
