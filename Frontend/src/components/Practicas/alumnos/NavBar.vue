<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const open = ref(false)
const onKey = (e) => { if (e.key === 'Escape') open.value = false }
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

// Usa NOMBRES de ruta que ya definiste en el router
const links = [
  { name: 'AlumnoHome',  label: 'Inicio' },
  { name: 'AlumnoFechas', label: 'Fechas' },
  { name: 'AlumnoEmpresas', label: 'Empresas' },
  { name: 'AlumnoCarta',  label: 'Formulario Carta de Presentación' },
  { name: 'AlumnoSubir',  label: 'Subir Archivos' },
]

// Atajo por si quieres navegar por código (no imprescindible)
function go (name) {
  open.value = false
  router.push({ name })
}

function logout () {
  open.value = false
  // limpia sesión
  localStorage.removeItem('auth')
  localStorage.removeItem('alumno_email')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('roles')
  localStorage.removeItem('permisos')
  // al login, sin dejar volver
  router.replace({ name: 'Login' })
}
</script>

<template>
  <div class="nav-wrap">
    <header class="bluebar" data-navbar>
      <nav class="navbar" aria-label="Barra superior">
        <button
          class="hamburger"
          :aria-expanded="open ? 'true' : 'false'"
          aria-label="Abrir menú de navegación"
          @click="open = true"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
          </svg>
        </button>

        <!-- Clic al título te lleva al inicio del alumno -->
        <button class="brand" type="button" @click="go('AlumnoHome')">
          Menú principal
        </button>

        <button class="logout" type="button" @click="logout">CERRAR SESIÓN</button>
      </nav>
    </header>

    <div v-if="open" class="overlay" @click="open = false"></div>

    <nav class="drawer" :class="{ open }" aria-label="Navegación principal">
      <div class="drawer-header">
        <strong>Menú</strong>
        <button class="close" aria-label="Cerrar menú" type="button" @click="open = false">&times;</button>
      </div>

      <ul class="menu">
        <li v-for="link in links" :key="link.name">
          <!-- RouterLink por NOMBRE -->
          <RouterLink
            :to="{ name: link.name }"
            class="item"
            :class="{ active: route.name === link.name }"
            @click="open = false"
          >
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style src="../../../assets/styles/NavBar.css"></style>
