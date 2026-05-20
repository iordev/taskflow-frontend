<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { AlignLeft, CalendarDays, CircleDot, ClipboardList, Flag } from 'lucide-vue-next'
import { CalendarDate, DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover/index.js'
import { Calendar } from '@/components/ui/calendar/index.js'
import { DialogDescription } from '@/components/ui/dialog/index.js'

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

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const calendarOpen = ref(false)
const calendarValue = ref(null)

// ✅ Merged both task watchers into one
watch(
  () => props.task,
  (task) => {
    if (task) {
      form.title = task.title
      form.description = task.description ?? ''
      form.status = task.status
      form.priority = task.priority
      form.due_date = task.due_date ?? ''

      // Sync calendar value when editing
      if (task.due_date) {
        const [year, month, day] = task.due_date.split('-').map(Number)
        calendarValue.value = new CalendarDate(year, month, day)
      } else {
        calendarValue.value = null
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// ✅ Merged both open watchers into one
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && !props.task) {
      resetForm()
    }
  },
)

// Sync calendar selection to form.due_date
watch(calendarValue, (val) => {
  if (val) {
    form.due_date = `${val.year}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`
  } else {
    form.due_date = ''
  }
})

const isFormValid = computed(() => {
  return (
    form.title.trim() !== '' && form.status !== '' && form.priority !== '' && form.due_date !== ''
  )
})

const isEditing = computed(() => !!props.task)

function resetForm() {
  form.title = ''
  form.description = ''
  form.status = 'Pending'
  form.priority = 'Medium'
  form.due_date = ''
  calendarValue.value = null
}

function handleSubmit() {
  emit('submit', { ...form })
}

function handleClose() {
  emit('update:open', false)
  resetForm()
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-lg p-0 gap-0 overflow-hidden">
      <!-- Header -->
      <DialogHeader class="px-6 py-4 border-b bg-muted/40">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
            <ClipboardList class="h-4 w-4 text-primary" />
          </div>
          <div>
            <DialogTitle class="text-base font-semibold">
              {{ isEditing ? 'Edit Task' : 'Create New Task' }}
            </DialogTitle>
            <DialogDescription class="text-xs">
              {{
                isEditing ? 'Update task details below' : 'Fill in the details for your new task'
              }}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit">
        <div class="px-6 py-4 space-y-4">
          <!-- Title -->
          <div class="space-y-1.5">
            <Label for="title" class="flex items-center gap-1.5 text-xs font-medium">
              <ClipboardList class="h-3 w-3 text-muted-foreground" />
              Title <span class="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              v-model="form.title"
              placeholder="Enter task title"
              :disabled="isLoading"
              class="h-9"
            />
          </div>

          <!-- Description -->
          <div class="space-y-1.5">
            <Label for="description" class="flex items-center gap-1.5 text-xs font-medium">
              <AlignLeft class="h-3 w-3 text-muted-foreground" />
              Description
            </Label>
            <Textarea
              id="description"
              v-model="form.description"
              placeholder="Enter task description (optional)"
              :disabled="isLoading"
              rows="2"
              class="resize-none text-sm"
            />
          </div>

          <!-- Status + Priority side by side -->
          <div class="grid grid-cols-2 gap-3">
            <!-- Status -->
            <div class="space-y-1.5">
              <Label class="flex items-center gap-1.5 text-xs font-medium">
                <CircleDot class="h-3 w-3 text-muted-foreground" />
                Status <span class="text-destructive">*</span>
              </Label>
              <Select v-model="form.status" :disabled="isLoading">
                <SelectTrigger class="h-9 w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">
                    <div class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-yellow-400" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="In Progress">
                    <div class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-blue-400" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="Completed">
                    <div class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-green-400" />
                      Completed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Priority -->
            <div class="space-y-1.5">
              <Label class="flex items-center gap-1.5 text-xs font-medium">
                <Flag class="h-3 w-3 text-muted-foreground" />
                Priority <span class="text-destructive">*</span>
              </Label>
              <Select v-model="form.priority" :disabled="isLoading">
                <SelectTrigger class="h-9 w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">
                    <div class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-gray-400" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <div class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-orange-400" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="High">
                    <div class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-red-400" />
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Due Date -->
          <div class="space-y-1.5">
            <Label class="flex items-center gap-1.5 text-xs font-medium">
              <CalendarDays class="h-3 w-3 text-muted-foreground" />
              Due Date <span class="text-destructive">*</span>
            </Label>
            <Popover v-model:open="calendarOpen">
              <PopoverTrigger as-child>
                <Button
                  type="button"
                  variant="outline"
                  class="w-full h-9 justify-start text-left font-normal"
                  :class="!calendarValue && 'text-muted-foreground'"
                  :disabled="isLoading"
                >
                  <CalendarDays class="h-4 w-4 mr-2 text-muted-foreground" />
                  {{
                    calendarValue
                      ? df.format(calendarValue.toDate(getLocalTimeZone()))
                      : 'Pick a date'
                  }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" align="start">
                <Calendar
                  v-model="calendarValue"
                  :min-value="today(getLocalTimeZone())"
                  initial-focus
                  @update:model-value="calendarOpen = false"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-muted/40 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            :disabled="isLoading"
            @click="handleClose"
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" :disabled="isLoading || !isFormValid">
            {{ isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
