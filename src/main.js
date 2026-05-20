import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize auth from localStorage on page refresh
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
