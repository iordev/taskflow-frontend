<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="h-screen flex flex-col bg-background">
    <AppHeader />
    <main class="flex-1 overflow-hidden max-w-5xl w-full mx-auto px-4 py-8 flex flex-col">
      <slot />
    </main>
  </div>
</template>
