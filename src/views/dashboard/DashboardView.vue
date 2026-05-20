<script setup>
import { onMounted, ref } from 'vue'
import { useTasks } from '@/composables/useTasks'
import { useTasksStore } from '@/stores/tasks'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import TaskDeleteDialog from '@/components/tasks/TaskDeleteDialog.vue'
import TaskRestoreDialog from '@/components/tasks/TaskRestoreDialog.vue'

const tasksStore = useTasksStore()
const {
  fetchTasks: fetchTasksComposable,
  createTask,
  updateTask,
  archiveTask,
  restoreTask,
  isLoading,
} = useTasks()

const activeFilter = ref('Active')
const currentPage = ref(1)

const showForm = ref(false)
const selectedTask = ref(null)
const showArchiveDialog = ref(false)
const taskToArchive = ref(null)
const showRestoreDialog = ref(false)
const taskToRestore = ref(null)

async function fetchTasks(page = 1) {
  currentPage.value = page
  await fetchTasksComposable({ status: activeFilter.value, page, per_page: 10 })
}

async function switchFilter(filter) {
  activeFilter.value = filter
  currentPage.value = 1
  await fetchTasksComposable({ status: filter, page: 1 })
}

function openCreateForm() {
  selectedTask.value = null
  showForm.value = true
}

function openEditForm(task) {
  selectedTask.value = task
  showForm.value = true
}

function openArchiveDialog(task) {
  taskToArchive.value = task
  showArchiveDialog.value = true
}

function openRestoreDialog(task) {
  taskToRestore.value = task
  showRestoreDialog.value = true
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

async function handleArchive() {
  await archiveTask(taskToArchive.value.id)
  showArchiveDialog.value = false
  taskToArchive.value = null
}

async function handleRestore() {
  const success = await restoreTask(taskToRestore.value.id)
  if (success) {
    showRestoreDialog.value = false
    taskToRestore.value = null
    await fetchTasks(currentPage.value)
  }
}

onMounted(() => fetchTasks(1))
</script>

<template>
  <AppLayout>
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

    <!-- Task List -->
    <TaskList
      :tasks="tasksStore.tasks"
      :is-loading="isLoading"
      :is-archived="activeFilter === 'Inactive'"
      @edit="openEditForm"
      @archive="openArchiveDialog"
      @restore="openRestoreDialog"
    />

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

    <!-- Dialogs -->
    <TaskForm
      v-model:open="showForm"
      :task="selectedTask"
      :is-loading="isLoading"
      @submit="handleFormSubmit"
    />
    <TaskDeleteDialog
      v-model:open="showArchiveDialog"
      :task="taskToArchive"
      :is-loading="isLoading"
      @confirm="handleArchive"
    />
    <TaskRestoreDialog
      v-model:open="showRestoreDialog"
      :task="taskToRestore"
      :is-loading="isLoading"
      @confirm="handleRestore"
    />
  </AppLayout>
</template>
