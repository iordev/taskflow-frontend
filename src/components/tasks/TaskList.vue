<script setup>
import { RefreshCw } from 'lucide-vue-next'
import TaskCard from '@/components/tasks/TaskCard.vue'

defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'archive', 'restore'])
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoading" class="flex items-center justify-center py-12 gap-2 text-muted-foreground">
    <RefreshCw class="h-4 w-4 animate-spin" />
    Loading tasks...
  </div>

  <!-- Empty -->
  <div
    v-else-if="tasks.length === 0"
    class="text-center py-12 text-muted-foreground border rounded-lg"
  >
    <p class="font-medium">No tasks found.</p>
    <p class="text-sm mt-1">
      {{ isArchived ? 'No archived tasks.' : 'Create your first task!' }}
    </p>
  </div>

  <!-- List -->
  <div v-else class="flex-1 overflow-y-auto space-y-3 pr-1">
    <TaskCard
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      :is-archived="isArchived"
      @edit="emit('edit', task)"
      @archive="emit('archive', task)"
      @restore="emit('restore', task)"
    />
  </div>
</template>
