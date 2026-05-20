<script setup>
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const { logout, isLoading: isLoggingOut } = useAuth()
</script>

<template>
  <header class="border-b shrink-0">
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <h1 class="text-lg font-semibold">TaskFlow</h1>
      <div class="flex items-center gap-3">
        <span class="text-sm text-muted-foreground">{{ authStore.user?.name }}</span>
        <Button :disabled="isLoggingOut" size="sm" variant="outline" @click="logout">
          <LogOut class="h-4 w-4 mr-2" />
          {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
        </Button>
      </div>
    </div>
  </header>
</template>
