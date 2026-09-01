// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'primeicons/primeicons.css'
import './style.css'

// ✅ Hidrata el store y el localStorage ANTES de montar la app
store.dispatch('bootstrapSession');

// Dark mode inicial
document.documentElement.classList.toggle('dark', localStorage.getItem('darkMode') === 'true')

const app = createApp(App)
// ⚠️ registra primero el store y luego el router
app.use(store)
app.use(router)
app.mount('#app')
