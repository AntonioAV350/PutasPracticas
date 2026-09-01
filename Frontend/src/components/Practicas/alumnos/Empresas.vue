<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="page" aria-labelledby="emp-title">
    <h1 id="emp-title" class="page-title">Empresas</h1>

    <!-- Carrusel -->
    <div class="company-strip" ref="stripRef">
      <button class="nav prev" @click="scrollStrip(-1)" aria-label="Anterior">‹</button>

      <div class="strip-inner" role="listbox" aria-label="Ofertas de empresa">
        <article
          v-for="e in empresas"
          :key="e.id"
          class="card"
          role="option"
          :aria-selected="e.id === selectedId"
          :class="{ active: e.id === selectedId }"
          tabindex="0"
          @click="select(e.id)"
          @keydown.enter.prevent="select(e.id)"
          @keydown.space.prevent="select(e.id)"
        >
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                d="M4 20h16M6 20V6h8v14M10 10h2M10 13h2M10 16h2M15 9h3v11"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <div class="meta">
            <div class="tag">{{ e.nombre }}</div>
            <div class="role">{{ e.puesto }}</div>
          </div>

          <span v-if="estadoDe(e.id)" class="status-chip" :data-status="estadoDe(e.id)">
            {{ textoEstado(estadoDe(e.id)) }}
          </span>
        </article>
      </div>

      <button class="nav next" @click="scrollStrip(1)" aria-label="Siguiente">›</button>
    </div>

    <!-- Panel inferior -->
    <div class="grid">
      <div class="detail" v-if="selected">
        <div class="detail-header">
          <div class="detail-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                d="M4 20h16M6 20V6h8v14M10 10h2M10 13h2M10 16h2M15 9h3v11"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div>
            <h2 class="company-name">{{ selected.nombre }}</h2>
            <div class="role-strong">{{ selected.puesto }}</div>
          </div>
        </div>

        <ul class="bullets">
          <li><strong>Actividades:</strong> {{ selected.actividades }}</li>
          <li><strong>Horas:</strong> {{ selected.horas }}</li>
          <li><strong>Disponibilidad:</strong> {{ selected.disponibilidad }}</li>
        </ul>

        <div v-if="estadoActual" class="status-row">
          <span class="status-badge" :data-status="estadoActual">
            {{ textoEstado(estadoActual) }}
          </span>
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary" :disabled="yaHaySeleccion" @click="elegirActual">
            {{
              !yaHaySeleccion
                ? 'Seleccionar empresa'
                : selectedId === seleccionFinalId
                  ? textoEstado(estadoActual)
                  : `Ya elegiste ${nombreSeleccionado}`
            }}
          </button>
        </div>
      </div>

      <aside class="side">
        <div class="section-title">Modalidad de prácticas</div>
        <div class="modality">
          <span class="icon-badge">🏢</span>
          <span class="chip">{{ selected.modalidad }}</span>
        </div>

        <div class="section-title mt">Oportunidades</div>
        <div class="actions">
          <button v-for="op in selected.oportunidades" :key="op" class="pill" type="button">
            {{ op }}
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'

/* Datos mock locales (frontend only) */
const empresas = reactive([
  {
    id: 1,
    nombre: 'Empresa 1',
    puesto: 'Auxiliar Docente',
    actividades: 'Apoyo en clases, preparación de materiales y acompañamiento a estudiantes.',
    horas: '20 horas semanales.',
    disponibilidad: '2 plazas para estudiantes.',
    modalidad: 'Presencial',
    oportunidades: ['Contratación', 'Apoyo económico', 'Pedagogía', 'Certificaciones'],
  },
  {
    id: 2,
    nombre: 'Empresa 2',
    puesto: 'Programador Junior',
    actividades: 'Soporte a desarrollo front-end y corrección de bugs.',
    horas: '25 horas semanales.',
    disponibilidad: '1 plaza.',
    modalidad: 'Híbrida',
    oportunidades: ['Mentoría', 'Capacitación', 'Bonos'],
  },
  {
    id: 3,
    nombre: 'Empresa 3',
    puesto: 'Relaciones Exteriores',
    actividades: 'Gestión de convenios y comunicación institucional.',
    horas: '20 horas semanales.',
    disponibilidad: '3 plazas.',
    modalidad: 'Presencial',
    oportunidades: ['Contratación', 'Certificaciones'],
  },
  {
    id: 4,
    nombre: 'Empresa 4',
    puesto: 'Ayudante de Médico',
    actividades: 'Apoyo en toma de signos y registro de expedientes.',
    horas: '15 horas semanales.',
    disponibilidad: '2 plazas.',
    modalidad: 'Presencial',
    oportunidades: ['Capacitación', 'Servicio social'],
  },
  {
    id: 5,
    nombre: 'Empresa 5',
    puesto: 'Ayudante de Médico',
    actividades: 'Apoyo en toma de signos y registro de expedientes.',
    horas: '15 horas semanales.',
    disponibilidad: '2 plazas.',
    modalidad: 'Presencial',
    oportunidades: ['Capacitación', 'Servicio social'],
  },
  {
    id: 6,
    nombre: 'Empresa 6',
    puesto: 'Ayudante de Médico',
    actividades: 'Apoyo en toma de signos y registro de expedientes.',
    horas: '15 horas semanales.',
    disponibilidad: '2 plazas.',
    modalidad: 'Presencial',
    oportunidades: ['Capacitación', 'Servicio social'],
  },
  {
    id: 7,
    nombre: 'Empresa 7',
    puesto: 'Ayudante de Médico',
    actividades: 'Apoyo en toma de signos y registro de expedientes.',
    horas: '15 horas semanales.',
    disponibilidad: '2 plazas.',
    modalidad: 'Presencial',
    oportunidades: ['Capacitación', 'Servicio social'],
  },
  {
    id: 8,
    nombre: 'Empresa 8',
    puesto: 'Ayudante de Médico',
    actividades: 'Apoyo en toma de signos y registro de expedientes.',
    horas: '15 horas semanales.',
    disponibilidad: '2 plazas.',
    modalidad: 'Presencial',
    oportunidades: ['Capacitación', 'Servicio social'],
  },
  {
    id: 9,
    nombre: 'Empresa 9',
    puesto: 'Ayudante de Médico',
    actividades: 'Apoyo en toma de signos y registro de expedientes.',
    horas: '15 horas semanales.',
    disponibilidad: '2 plazas.',
    modalidad: 'Presencial',
    oportunidades: ['Capacitación', 'Servicio social'],
  },
  {
    id: 10,
    nombre: 'Empresa 10',
    puesto: 'Ayudante de Médico',
    actividades: 'Apoyo en toma de signos y registro de expedientes.',
    horas: '15 horas semanales.',
    disponibilidad: '2 plazas.',
    modalidad: 'Presencial',
    oportunidades: ['Capacitación', 'Servicio social'],
  },
])

/* Selección y estados (solo front) */
const selectedId = ref(empresas[0].id)
const selected = computed(() => empresas.find((e) => e.id === selectedId.value))

function select(id) {
  selectedId.value = id
}

const seleccionFinalId = ref(null) // selección única
const yaHaySeleccion = computed(() => seleccionFinalId.value !== null)
const nombreSeleccionado = computed(
  () => empresas.find((e) => e.id === seleccionFinalId.value)?.nombre ?? '',
)

const estados = reactive(new Map()) // Map<number,'pendiente'|'aceptada'|'rechazada'>
const estadoDe = (id) => estados.get(id)
const estadoActual = computed(() => estados.get(selectedId.value) ?? null)

const textoEstado = (s) =>
  s === 'pendiente'
    ? 'En proceso de aceptación'
    : s === 'aceptada'
      ? 'Aceptada'
      : s === 'rechazada'
        ? 'Rechazada'
        : ''

function elegir(id) {
  if (seleccionFinalId.value !== null) return
  seleccionFinalId.value = id
  estados.set(id, 'pendiente')
}
const elegirActual = () => elegir(selectedId.value)

/* Carrusel */
const stripRef = ref(null)
function scrollStrip(dir) {
  const el = stripRef.value?.querySelector('.strip-inner')
  if (!el) return
  const card = el.querySelector('.card')
  const step = card ? card.getBoundingClientRect().width + 12 : 300
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}

onMounted(() => {
  // asegura posición inicial y que scroll-snap se aplique
  requestAnimationFrame(() => scrollStrip(0))
})
</script>

<style scoped src="../../../assets/styles/Empresas.css"></style>
