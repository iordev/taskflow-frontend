<script setup>
import { Button } from '@/components/ui/button'
import { Archive, CalendarDays, Pencil, RotateCcw } from 'lucide-vue-next'

defineProps({
  task: {
    type: Object,
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'archive', 'restore'])

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
</script>

<template>
  <div class="border rounded-lg px-4 py-3 bg-card hover:shadow-md transition-all duration-200">
    <div class="flex items-center justify-between gap-4">
      <!-- Left: Task Info -->
      <div class="flex-1 min-w-0 space-y-0.5">
        <p class="font-semibold text-sm truncate">{{ task.title }}</p>
        <p class="text-xs text-muted-foreground truncate">
          {{ task.description ?? 'No description provided.' }}
        </p>
        <div v-if="task.due_date" class="flex items-center gap-1 text-xs text-muted-foreground">
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
          <template v-if="!isArchived">
            <Button size="sm" variant="outline" class="h-7 w-7 p-0" @click="emit('edit', task)">
              <Pencil class="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              class="h-7 w-7 p-0"
              @click="emit('archive', task)"
            >
              <Archive class="h-3 w-3" />
            </Button>
          </template>
          <template v-else>
            <Button size="sm" variant="outline" class="h-7 w-7 p-0" @click="emit('restore', task)">
              <RotateCcw class="h-3 w-3" />
            </Button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
