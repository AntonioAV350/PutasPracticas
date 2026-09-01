<template>
  <header class="goldbar" data-topbar ref="topbarEl">
    <div class="goldbar__inner">
      <div class="left">
        <div class="logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="7" x2="12" y2="7" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="11" x2="18" y2="11" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="15" x2="18" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="title">
          <div class="uni">UNIVERSIDAD AUTÓNOMA DE CHIAPAS</div>
          <div class="sys">SISTEMAS DE CONTROL DE PRACTICAS</div>
        </div>
      </div>

      <div class="right">
        <div class="info">
          <div class="name">{{ userName || 'Cargando…' }}</div>
          <div class="fac">{{ facultyInfo || '' }}</div>
        </div>
        <div class="avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20a8 8 0 0 1 16 0"/>
          </svg>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

const userName = ref('');
const facultyInfo = ref('');
const topbarEl = ref(null);

function setGoldbarHeight() {
  const el = topbarEl.value;
  if (!el) return;
  const h = Math.round(el.getBoundingClientRect().height || 0);
  document.documentElement.style.setProperty('--goldbar-height', `${h}px`);
}

const onResize = () => setGoldbarHeight();

onMounted(async () => {
  // Cargar datos del usuario desde localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      
      // Construir el nombre completo
      const fullName = [userData.nombre, userData.apellido_paterno, userData.apellido_materno]
        .filter(Boolean) // Filtra nombres o apellidos nulos/vacíos
        .join(' ');
      userName.value = fullName.trim();

      // Construir la información de la facultad y campus
      if (userData.nombre_facultad) {
        // Asumiendo que el campus es estático para este contexto
        facultyInfo.value = `${userData.nombre_facultad.toUpperCase()} CAMPUS IV`;
      }

    } catch (error) {
      console.error("Error al parsear datos del usuario desde localStorage:", error);
      userName.value = 'Error al cargar';
    }
  }

  // Lógica para ajustar la altura de la barra
  await nextTick();
  setGoldbarHeight();
  window.addEventListener('resize', onResize);
  document.fonts?.ready?.then(setGoldbarHeight).catch(() => {});
});

onBeforeUnmount(() => window.removeEventListener('resize', onResize));
</script>

<!-- Ruta relativa desde alumnos/components -> assets/styles -->
<style scoped src="../../../assets/styles/TopBar.css"></style>
