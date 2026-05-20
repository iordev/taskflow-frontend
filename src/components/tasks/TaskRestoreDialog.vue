<script setup>
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

defineProps({
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

const emit = defineEmits(['update:open', 'confirm'])

function handleConfirm() {
  emit('confirm')
}

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <AlertDialog :open="open" @update:open="handleClose">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Restore Task</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to restore
          <span class="font-semibold text-foreground">"{{ task?.title }}"</span>? It will be moved
          back to your active tasks.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isLoading" @click="handleClose"> Cancel </AlertDialogCancel>
        <AlertDialogAction as-child>
          <Button :disabled="isLoading" @click="handleConfirm">
            {{ isLoading ? 'Restoring...' : 'Restore' }}
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
