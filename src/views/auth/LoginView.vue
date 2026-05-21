<script setup>
import { computed, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, LogIn } from 'lucide-vue-next'

const { login, isLoading, error } = useAuth()

const form = reactive({
  username: '',
  password: '',
})

const isFormValid = computed(() => {
  return form.username.trim() !== '' && form.password.trim() !== ''
})

async function handleSubmit() {
  await login(form)
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo / Title -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold tracking-tight">TaskFlow</h1>
        <p class="text-muted-foreground mt-2">Task Management System</p>
      </div>

      <!-- Login Card -->
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription> Enter your credentials to access your tasks </CardDescription>
        </CardHeader>

        <CardContent>
          <!-- Error Alert -->
          <Alert v-if="error" class="mb-4" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- Username -->
            <div class="space-y-2">
              <Label for="username">Username</Label>
              <Input
                id="username"
                v-model="form.username"
                :disabled="isLoading"
                autocomplete="username"
                placeholder="Enter your username"
                type="text"
              />
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                v-model="form.password"
                :disabled="isLoading"
                autocomplete="current-password"
                placeholder="Enter your password"
                type="password"
              />
            </div>

            <!-- Submit -->
            <Button :disabled="isLoading || !isFormValid" class="w-full" type="submit">
              <LogIn v-if="!isLoading" class="h-4 w-4 mr-2" />
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
