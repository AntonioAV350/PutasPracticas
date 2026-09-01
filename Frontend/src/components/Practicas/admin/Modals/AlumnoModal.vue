<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>

      <!-- Modal centrado -->
      <div
        class="relative w-[92%] sm:w-[720px] max-h-[88vh] overflow-hidden
               bg-white dark:bg-[#404040] dark:shadow-gray-950 border-transparent
               shadow-xl border rounded-lg"
        role="dialog" aria-modal="true"
      >
        <!-- Header (único botón de cerrar) -->
        <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div class="inline-flex items-center px-3 py-1 rounded-md bg-[#536DFE] text-white font-semibold">
            Detalle de Alumno
          </div>
          <button class="px-3 py-1 rounded bg-gray-200 dark:bg-[#424242]" @click="$emit('close')">Cerrar</button>
        </div>

        <!-- Nombre -->
        <div class="px-4 pt-3 text-lg font-bold text-gray-800 dark:text-gray-100">
          {{ alumno?.nombre }} {{ alumno?.apellidos }} · {{ alumno?.matricula }}
        </div>

        <!-- Tabs -->
        <div class="px-4 py-2 border-b dark:border-gray-700 flex gap-2">
          <button
            class="px-3 py-1 rounded"
            :class="tab==='datos' ? 'bg-[#536DFE] text-white' : 'bg-gray-200 dark:bg-[#424242] text-gray-800 dark:text-gray-100'"
            @click="tab='datos'"
          >
            Datos
          </button>
          <button
            class="px-3 py-1 rounded"
            :class="tab==='docs' ? 'bg-[#536DFE] text-white' : 'bg-gray-200 dark:bg-[#424242] text-gray-800 dark:text-gray-100'"
            @click="tab='docs'"
          >
            Documentos
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 overflow-y-auto max-h-[64vh]">
          <!-- DATOS -->
          <div v-if="tab==='datos'" class="space-y-3 text-sm text-gray-800 dark:text-gray-100">
            <div><span class="font-semibold">Carrera:</span> {{ alumno?.carreraLabel }} ({{ alumno?.carrera }})</div>
            <div><span class="font-semibold">Semestre/Grupo:</span> {{ alumno?.semestre }}° {{ alumno?.grupo }}</div>
            <div><span class="font-semibold">Género:</span> {{ alumno?.genero }}</div>
            <div><span class="font-semibold">Correo:</span> {{ alumno?.correo || '—' }}</div>
            <div><span class="font-semibold">Teléfono:</span> {{ alumno?.telefono || '—' }}</div>

            <div class="pt-2">
              <div class="font-semibold mb-1">Inscripciones</div>
              <ul class="list-disc ml-6">
                <li v-for="(i,ix) in alumno?.inscripciones || []" :key="ix">{{ i.practica }} · {{ i.periodo }} {{ i.anio }}</li>
              </ul>
            </div>
          </div>

          <!-- DOCUMENTOS -->
          <div v-else class="space-y-4">
            <!-- Filtro de práctica para documentos -->
            <div class="flex flex-wrap items-end gap-3 justify-between">
              <div>
                <label class="block text-xs font-semibold mb-1">Práctica</label>
                <select v-model="docPractica" class="p-2 border rounded-md bg-white dark:bg-[#2a2a2a]">
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-300 flex-1">
                (Si ya concluyó P1, se muestra P2 por defecto)
              </div>
            </div>

            <!-- Estado global -->
            <div v-if="esContaduria" class="rounded-md border px-3 py-2 text-sm flex items-center gap-2 dark:border-gray-700">
              <span class="font-semibold">Estado de documentos:</span>
              <span
                class="px-3 py-1 rounded-full font-semibold"
                :class="docsAprobados ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'"
              >
                {{ docsAprobados ? 'Aprobado' : 'No aprobado' }}
              </span>
            </div>

            <!-- Calificación Software -->
            <div v-if="esSoftware" class="rounded-md border px-3 py-3 text-sm space-y-2 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <span class="font-semibold">Calificación ({{ docPractica }})</span>
                <span
                  v-if="calificacion !== null"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="calificacion >= 6 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'"
                >
                  {{ calificacion }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  v-model.number="calificacion"
                  class="p-2 border rounded w-28 bg-white dark:bg-[#2a2a2a]"
                />
                <button
                  class="px-4 py-2 rounded text-white font-semibold bg-[#536DFE] hover:bg-[#4255c8] disabled:opacity-60"
                  :disabled="calificacionGuardando"
                  @click="guardarCalificacion"
                >
                  {{ calificacionGuardando ? 'Guardando…' : 'Guardar' }}
                </button>
              </div>
              <div v-if="califError" class="text-xs text-red-600">{{ califError }}</div>
            </div>

            <!-- Lista documentos -->
            <div class="space-y-2">
              <div
                v-for="d in docsFiltrados"
                :key="d.id"
                class="border rounded-md p-3 dark:border-gray-700 flex items-center justify-between"
              >
                <div>
                  <div class="font-semibold">{{ d.tipo }}</div>
                  <div class="text-xs text-gray-500">Archivo: {{ d.nombre_archivo }}</div>
                  <div class="text-xs mt-1">
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="estadoChipClass(d.estado)">
                      {{ estadoLabel(d.estado) }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <a class="px-3 py-1 rounded bg-slate-200 dark:bg-[#424242]" :href="d.url || '#'" target="_blank" rel="noopener">Ver</a>
                  <button
                    class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    :disabled="d.estado === 'APROBADO'"
                    @click="setDocEstado(d, 'APROBADO')"
                  >
                    Aceptar
                  </button>
                  <button
                    class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                    :disabled="d.estado === 'RECHAZADO'"
                    @click="setDocEstado(d, 'RECHAZADO')"
                  >
                    Rechazar
                  </button>
                </div>
              </div>

              <div v-if="docsFiltrados.length===0" class="text-sm text-gray-500 dark:text-gray-300">
                No hay documentos para {{ docPractica }}.
              </div>
            </div>
          </div>
        </div>

        <!-- (Footer eliminado para evitar botón duplicado) -->
      </div>
    </div>
  </transition>
</template>

<script>
import calificacionesApi from '../../../../services/practicas/admin/calificacionesService';

const ESTADO_COLORS = {
  APROBADO: 'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-700',
  PENDIENTE: 'bg-amber-100 text-amber-800',
};

export default {
  name: 'AlumnoModal',
  props: {
    visible: { type: Boolean, default: false },
    alumno:  { type: Object,  default: null },
  },
  data() {
    return {
      tab: 'datos',
      docPractica: 'P1',
      calificacion: null,
      calificacionGuardando: false,
      califError: '',
    };
  },
  computed: {
    esContaduria() {
      return (this.alumno?.carrera || '').toUpperCase() === 'LCP';
    },
    esSoftware() {
      return (this.alumno?.carrera || '').toUpperCase() === 'LIDTS';
    },
    docsFiltrados() {
      if (!this.alumno) return [];
      return this.alumno.documentos?.[this.docPractica] || [];
    },
    docsAprobados() {
      const docs = this.docsFiltrados;
      if (!docs.length) return false;
      return docs.every((d) => d.estado === 'APROBADO');
    },
  },
  watch: {
    alumno: {
      immediate: true,
      handler(val) {
        this.tab = 'datos';
        if (!val) return;
        const tieneP1 = (val.documentos?.P1 || []).length > 0;
        this.docPractica = tieneP1 ? 'P2' : 'P1';
        this.calificacion = null;
        if (this.esSoftware) this.fetchCalificacion();
      },
    },
    visible(v) {
      if (v) window.addEventListener('keydown', this.onKey);
      else window.removeEventListener('keydown', this.onKey);
    },
    docPractica() {
      if (this.esSoftware) {
        this.calificacion = null;
        this.fetchCalificacion();
      }
    },
  },
  methods: {
    onKey(e) {
      if (e.key === 'Escape') this.$emit('close');
    },
    estadoChipClass(estado) {
      return ESTADO_COLORS[estado] || ESTADO_COLORS.PENDIENTE;
    },
    estadoLabel(estado) {
      return estado === 'APROBADO'
        ? 'Aprobado'
        : estado === 'RECHAZADO'
          ? 'Rechazado'
          : 'Pendiente';
    },
    setDocEstado(doc, estado) {
      if (!doc) return;
      doc.estado = estado;
      this.$emit('update-doc', {
        matricula: this.alumno.matricula,
        practica: this.docPractica,
        docId: doc.id,
        estado,
      });
    },
    async fetchCalificacion() {
      this.califError = '';
      if (!this.alumno?.matricula) return;
      try {
        const resp = await calificacionesApi.obtenerCalificacion(this.alumno.matricula, this.docPractica);
        this.calificacion = resp?.calificacion ?? null;
      } catch (error) {
        this.calificacion = null;
        if (error?.response?.status !== 404) {
          this.califError = error.message || 'No se pudo obtener la calificación.';
        }
      }
    },
    async guardarCalificacion() {
      this.califError = '';
      if (!this.alumno?.matricula) return;
      const valor = Number(this.calificacion);
      if (!Number.isFinite(valor) || valor < 0 || valor > 10) {
        this.califError = 'Ingresa una calificación entre 0 y 10.';
        return;
      }
      this.calificacionGuardando = true;
      try {
        await calificacionesApi.guardarCalificacion({
          matricula: this.alumno.matricula,
          practica: this.docPractica,
          calificacion: valor,
        });
        this.calificacion = valor;
      } catch (error) {
        this.califError = error.message || 'No se pudo guardar la calificación.';
      } finally {
        this.calificacionGuardando = false;
      }
    },
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey);
  },
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
