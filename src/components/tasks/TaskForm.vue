<script setup>
import { computed, reactive, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:open', 'submit'])

const form = reactive({
  title: '',
  description: '',
  status: 'Pending',
  priority: 'Medium',
  due_date: '',
})

// If editing, populate form with task data
watch(
  () => props.task,
  (task) => {
    if (task) {
      form.title = task.title
      form.description = task.description ?? ''
      form.status = task.status
      form.priority = task.priority
      form.due_date = task.due_date ?? ''
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

function resetForm() {
  form.title = ''
  form.description = ''
  form.status = 'Pending'
  form.priority = 'Medium'
  form.due_date = ''
}

function handleSubmit() {
  emit('submit', { ...form })
}

function handleClose() {
  emit('update:open', false)
  resetForm()
}

const isEditing = computed(() => !!props.task)
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? 'Edit Task' : 'Create New Task' }}
        </DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Title -->
        <div class="space-y-2">
          <Label for="title">Title <span class="text-destructive">*</span></Label>
          <Input
            id="title"
            v-model="form.title"
            :disabled="isLoading"
            placeholder="Enter task title"
          />
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="form.description"
            :disabled="isLoading"
            placeholder="Enter task description (optional)"
            rows="3"
          />
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <Label>Status <span class="text-destructive">*</span></Label>
          <Select v-model="form.status" :disabled="isLoading">
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Priority -->
        <div class="space-y-2">
          <Label>Priority <span class="text-destructive">*</span></Label>
          <Select v-model="form.priority" :disabled="isLoading">
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Due Date -->
        <div class="space-y-2">
          <Label for="due_date">Due Date <span class="text-destructive">*</span></Label>
          <Input
            id="due_date"
            v-model="form.due_date"
            :disabled="isLoading"
            :min="new Date().toISOString().split('T')[0]"
            type="date"
          />
        </div>

        <DialogFooter class="gap-2">
          <Button :disabled="isLoading" type="button" variant="outline" @click="handleClose">
            Cancel
          </Button>
          <Button :disabled="isLoading" type="submit">
            {{ isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
