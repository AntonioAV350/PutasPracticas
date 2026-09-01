<template>
  <section class="page" aria-labelledby="alumno-title">
    <h1 id="alumno-title" class="page-title">Alumno</h1>

    <div class="layout">
      <div class="col">
        <article class="card student" aria-labelledby="alumno-nombre">
          <header class="card-header">
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20a8 8 0 0 1 16 0" />
              </svg>
            </div>
            <div class="titles">
              <h2 id="alumno-nombre" class="card-title">{{ alumno.nombre }}</h2>
              <p class="subtitle">{{ alumno.carrera }}</p>
            </div>
          </header>

          <dl class="grid2">
            <div class="field">
              <dt><label>Matrícula</label></dt>
              <dd class="val">{{ alumno.matricula }}</dd>
            </div>
            <div class="field">
              <dt><label>Semestre</label></dt>
              <dd class="val">{{ alumno.semestre }}</dd>
            </div>
            <div class="field">
              <dt><label>Grupo</label></dt>
              <dd class="val">{{ alumno.grupo }}</dd>
            </div>
            <div class="field">
              <dt><label>Práctica Actual</label></dt>
              <dd class="val">{{ alumno.tipo_practica }}</dd>
            </div>
          </dl>
        </article>

        <!-- SECCIÓN DE PROGRESO DE DOCUMENTOS DINÁMICA -->
        <article class="card progress" aria-labelledby="progreso-title">
          <h3 id="progreso-title" class="section-title">Progreso de documentos</h3>
          
          <nav class="tabs">
            <button
              v-for="tab in visibleTabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="{ 'active': activeTab === tab.key }"
              :disabled="tab.key !== currentPractica"
              :aria-pressed="activeTab === tab.key"
            >
              {{ tab.label }}
            </button>
          </nav>

          <div class="tab-content">
            <ul class="steps">
              <li v-for="doc in documentos[activeTab]" :key="doc.key">
                <span class="dot" :class="statusClass(doc.estado_revision)" aria-hidden="true"></span>
                <div class="step-main">
                  <div class="step-title">{{ doc.title }}</div>
                  <div class="step-meta">
                    <!-- El status_label ya viene del backend con el texto descriptivo y en español -->
                    <span class="status-label">{{ doc.status_label }}</span>
                  </div>
                </div>
                <RouterLink v-if="!doc.is_locked" :to="'/subir-documentos'" class="link">Subir</RouterLink>
              </li>
            </ul>
             <p v-if="!documentos[activeTab] || documentos[activeTab].length === 0" class="hint">
              No hay documentos para mostrar en esta sección.
            </p>
          </div>
        </article>
      </div>

      <aside class="col" aria-labelledby="acciones-title agenda-title">
        <article class="card quick" aria-labelledby="acciones-title">
          <h3 id="acciones-title" class="section-title">Acciones rápidas</h3>
          <div class="actions">
            <RouterLink to="/empresas" class="btn btn-outline">Ver empresas</RouterLink>
            <RouterLink to="/subir-documentos" class="btn btn-outline">Subir archivos</RouterLink>
            <RouterLink to="/fechas" class="btn btn-outline">Calendario</RouterLink>
            <RouterLink to="/carta-presentacion" class="btn btn-outline">Ver hoja de presentación</RouterLink>
          </div>
        </article>

        <article class="card agenda" aria-labelledby="agenda-title">
          <h3 id="agenda-title" class="section-title">Próximas fechas</h3>
          <ul class="events">
            <li v-for="ev in proximas" :key="ev.id">
              <div class="e-date" aria-hidden="true">
                <div class="d">{{ ev.dia }}</div>
                <div class="m">{{ ev.mes }}</div>
              </div>
              <div class="e-body">
                <div class="e-title">{{ ev.titulo }}</div>
                <div class="e-sub">{{ ev.detalle }}</div>
              </div>
            </li>
          </ul>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import perfilService from '../../../services/practicas/alumnos/perfilService';

const alumno = reactive({
  nombre: 'Cargando...',
  matricula: '',
  carrera: '',
  semestre: '',
  grupo: '',
  correo: '',
  tipo_practica: '',
});

const documentos = reactive({ P1: [], P2: [], RES: [] });
const activeTab = ref('P1');

// --- Computed Properties ---
const isSoftware = computed(() => alumno.carrera === 'Ingeniería en Desarrollo y Tecnologías de Software');
const currentPractica = computed(() => alumno.tipo_practica);

const visibleTabs = computed(() => {
  const tabs = [
    { key: 'P1', label: 'Prácticas I' },
    { key: 'P2', label: 'Prácticas II' },
  ];
  if (isSoftware.value) {
    tabs.push({ key: 'RES', label: 'Residencia' });
  }
  return tabs;
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  // 1. Cargar datos del usuario
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      alumno.nombre = `${userData.nombre || ''} ${userData.apellido_paterno || ''} ${userData.apellido_materno || ''}`.trim();
      alumno.matricula = userData.matricula;
      alumno.carrera = userData.carrera;
      alumno.semestre = userData.grado ? `${userData.grado}º` : '';
      alumno.grupo = userData.grupo;
      alumno.correo = userData.email;
      alumno.tipo_practica = userData.tipo_practica || 'P1'; // Asumir P1 si no está definido

      // Establecer la pestaña activa según la práctica actual del alumno
      activeTab.value = alumno.tipo_practica;

    } catch (error) {
      console.error("Error al parsear datos del usuario:", error);
      alumno.nombre = "Error al cargar datos";
    }
  } else {
    console.error("No se encontraron datos de usuario.");
    alumno.nombre = "Sin sesión";
  }

  // 2. Cargar estado de los documentos
  try {
    const docsData = await perfilService.getMisDocumentos();
    documentos.P1 = docsData.P1 || [];
    documentos.P2 = docsData.P2 || [];
    documentos.RES = docsData.RES || [];
  } catch (error) {
    console.error("Error al cargar documentos:", error);
  }
});

// --- Métodos ---
const statusClass = (estado) => {
  if (estado === 'APROBADO') return 'dot-completado'; // Verde
  if (estado === 'RECHAZADO') return 'dot-rechazado'; // Rojo
  if (estado === 'PENDIENTE') return 'dot-enproceso'; // Amarillo
  return 'dot-pendiente'; // Gris
};

// Datos estáticos de ejemplo para "Próximas fechas"
const proximas = reactive([
  { id: 1, dia: '02', mes: 'SEP', titulo: 'Inicio de validación', detalle: 'Revisar empresas' },
  { id: 2, dia: '12', mes: 'SEP', titulo: 'Firma de carta', detalle: 'Subir PDF firmado' },
  { id: 3, dia: '26', mes: 'SEP', titulo: 'Selección de empresas', detalle: 'Cierra a las 23:59' },
]);
</script>

<style scoped>
@import '../../../assets/styles/Alumno.css';

/* Estilos para las nuevas pestañas y estados */
.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}
.tabs button {
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.95rem;
  color: #4a5568;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tabs button.active {
  font-weight: 600;
  color: #2d3748;
  border-bottom-color: #4299e1;
}
.tabs button:disabled {
  color: #a0aec0;
  cursor: not-allowed;
  background: #f7fafc;
}

.dot-rechazado {
  background-color: #f56565; /* red-500 */
}
.badge.dot-rechazado {
  color: #9b2c2c; /* red-800 */
  background-color: #fed7d7; /* red-200 */
}
.status-label {
  font-size: 0.75rem;
  color: #718096;
}
</style>
