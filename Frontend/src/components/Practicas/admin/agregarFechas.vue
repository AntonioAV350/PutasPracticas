<template>
  <div class="container mx-auto">
    <!-- Card: Formulario -->
    <div class="w-full bg-white dark:bg-[#404040] dark:shadow-gray-950 border-transparent shadow-xl border rounded-lg mb-3">
      <div class="m-3">
        <div class="inline-flex items-center px-4 py-2 rounded-md bg-[#536DFE] text-white font-bold text-lg">
          Fechas
        </div>
        <div
          v-if="flashMsg"
          :class="[
            'mt-4 rounded-md px-4 py-3 text-sm font-medium',
            flashType === 'error' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800',
          ]"
          role="status"
        >
          {{ flashMsg }}
        </div>

        <form @submit.prevent="submitFecha" class="w-full mt-5">
          <div class="flex flex-wrap -mx-3 mb-4">
            <!-- Nombre -->
            <div class="w-full lg:w-1/2 px-3 mb-4 lg:mb-0">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Nombre del Documento</label>
              <select
                v-model="form.nombre_documento"
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              >
                <option disabled value="">Seleccione un documento</option>
                <option v-for="doc in documentosDisponibles" :key="doc" :value="doc">{{ doc }}</option>
              </select>
            </div>

            <!-- Periodo (auto-sugerido al iniciar; editable siempre) -->
            <div class="w-full lg:w-1/2 px-3">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Periodo
              </label>
              <select
                v-model="form.periodo"
                class="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 focus:outline-none focus:bg-white focus:border-gray-500"
              >
                <option v-for="p in opcionesPeriodo" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap -mx-3 mb-4">
            <!-- Fecha de apertura (manual) -->
            <div class="w-full lg:w-1/2 px-3 mb-4 lg:mb-0">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Fecha de apertura
              </label>
              <input
                type="date"
                v-model="form.fecha_apertura"
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              />
            </div>

            <!-- Fecha de cierre (manual) -->
            <div class="w-full lg:w-1/2 px-3">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Fecha de cierre
              </label>
              <input
                type="date"
                v-model="form.fecha_cierre"
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              />
            </div>
          </div>

          <!-- Botón de envío -->
          <div class="text-center mt-2">
            <button
              type="submit"
              class="px-6 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
              :disabled="saving"
            >
              <span v-if="!saving">{{ form.id ? 'Actualizar' : 'Guardar' }}</span>
              <span v-else>{{ form.id ? 'Actualizando…' : 'Guardando…' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Card: Tabla / acciones -->
    <div class="w-full bg-white dark:bg-[#404040] dark:shadow-gray-950 border-transparent shadow-xl border rounded-lg">
      <div class="w-full p-4">
        <!-- Botonera -->
        <div class="flex flex-wrap gap-3 mb-4">
          <button class="bg-red-500 text-white font-semibold px-3 py-1 rounded hover:brightness-110 transition" @click="printTable">
            PDF
          </button>
        </div>

        <!-- Buscador -->
        <div class="mb-3">
          <label class="block text-sm font-semibold mb-1">Buscar</label>
          <input
            v-model="q"
            type="text"
            placeholder="Filtra por nombre, periodo, apertura o cierre…"
            class="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-SecundaryGold focus:border-transparent transition duration-300 ease-in-out w-80"
          />
        </div>

        <!-- Tabla -->
        <div id="print-area" class="w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-[#2a2a2a]">
              <tr class="text-left">
                <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">#</th>
                <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Nombre</th>
                <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Periodo</th>
                <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Apertura</th>
                <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Cierre</th>
                <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Estado</th>
                <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="listLoading">
                <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300">
                  Cargando fechas...
                </td>
              </tr>
              <tr
                v-for="(f, i) in filtered"
                :key="f.id"
                :class="['hover:bg-gray-50 dark:hover:bg-[#383838] transition', rowStatusClass(f)]"
              >
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ i + 1 }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ f.nombre_documento }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ f.periodo }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ f.fecha_apertura }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ f.fecha_cierre }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="statusPillClass(f)"
                  >
                    {{ statusLabel(f) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <button class="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md hover:bg-blue-700 transition" @click="editar(f)">
                    Editar
                  </button>
                  <button class="ml-2 bg-red-500 text-white font-semibold px-3 py-1 rounded-md hover:bg-red-600 transition" @click="eliminar(f.id)">
                    Eliminar
                  </button>
                </td>
              </tr>

              <tr v-if="!listLoading && filtered.length === 0">
                <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300">
                  No hay registros para mostrar
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación simple (estética) -->
        <div class="flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-300">
          <button class="px-3 py-1 bg-gray-200 rounded text-gray-700 cursor-not-allowed">Anterior</button>
          <button class="px-3 py-1 bg-gray-200 rounded text-gray-700 cursor-not-allowed">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fechasApi from '../../../services/practicas/admin/fechasService';

const opcionesDocumento = [
  "Hoja de presentación",
  "Carta de presentación",
  "Carta de aceptación",
  "Carta de liberación",
  "Reporte final",
];
const opcionesPeriodo = ["ENE-JUN", "JUN-DIC"];
const STATUS_STYLES = {
  active: {
    label: 'Activa',
    pill: 'bg-green-100 text-green-900',
    row: 'border-l-4 border-green-500 bg-green-50',
  },
  upcoming: {
    label: 'Próxima',
    pill: 'bg-amber-100 text-amber-900',
    row: 'border-l-4 border-amber-500 bg-amber-50',
  },
  scheduled: {
    label: 'Programada',
    pill: 'bg-slate-100 text-slate-800',
    row: 'border-l-4 border-slate-400 bg-slate-50',
  },
  closed: {
    label: 'Cerrada',
    pill: 'bg-red-100 text-red-800',
    row: 'border-l-4 border-red-500 bg-red-50',
  },
  unknown: {
    label: 'Sin fecha',
    pill: 'bg-gray-100 text-gray-800',
    row: 'border-l-4 border-gray-400 bg-gray-50',
  },
};

export default {
  name: 'PracticasFechas',
  data() {
    return {
      opcionesDocumento,
      opcionesPeriodo,
      q: '',
      fechas: [],
      listLoading: false,
      saving: false,
      flashMsg: '',
      flashType: 'success',
      flashTimer: null,
      form: {
        id: null,
        nombre_documento: '',
        periodo: 'ENE-JUN',
        fecha_apertura: '',
        fecha_cierre: '',
      },
    };
  },
  created() {
    this.fetchFechas();
  },
  beforeUnmount() {
    if (this.flashTimer) clearTimeout(this.flashTimer);
  },
  computed: {
    filtered() {
      const q = this.q.trim().toLowerCase();
      if (!q) return this.fechas;
      return this.fechas.filter((f) =>
        [f.nombre_documento, f.periodo, f.fecha_apertura, f.fecha_cierre].join(' ').toLowerCase().includes(q)
      );
    },
    documentosDisponibles() {
      const documentosUsados = this.fechas.map(f => f.nombre_documento);
      return this.opcionesDocumento.filter(doc => !documentosUsados.includes(doc));
    },
  },
  methods: {
    statusInfo(row) {
      if (!row) return { state: 'unknown', ...STATUS_STYLES.unknown };
      const now = new Date();
      const apertura = new Date(row.fecha_apertura);
      const cierre = new Date(row.fecha_cierre);
      cierre.setHours(23, 59, 59, 999);
      let state = 'unknown';
      if (!Number.isNaN(apertura.getTime()) && !Number.isNaN(cierre.getTime())) {
        if (apertura <= now && cierre >= now) state = 'active';
        else if (apertura > now) {
          const diffDays = Math.ceil((apertura - now) / (1000 * 60 * 60 * 24));
          state = diffDays <= 2 ? 'upcoming' : 'scheduled';
        } else {
          state = 'closed';
        }
      }
      return { state, ...(STATUS_STYLES[state] || STATUS_STYLES.unknown) };
    },
    statusLabel(row) {
      return this.statusInfo(row).label;
    },
    statusPillClass(row) {
      return this.statusInfo(row).pill;
    },
    rowStatusClass(row) {
      return this.statusInfo(row).row;
    },
    setFlash(type, msg) {
      if (this.flashTimer) clearTimeout(this.flashTimer);
      this.flashType = type;
      this.flashMsg = msg;
      this.flashTimer = setTimeout(() => {
        this.flashMsg = '';
      }, 4000);
    },
    async fetchFechas() {
      this.listLoading = true;
      try {
        this.fechas = await fechasApi.listar();
      } catch (error) {
        this.setFlash('error', error.message || 'No se pudieron cargar las fechas.');
      } finally {
        this.listLoading = false;
      }
    },
    async submitFecha() {
      const { nombre_documento, periodo, fecha_apertura, fecha_cierre } = this.form;
      if (!nombre_documento || !periodo || !fecha_apertura || !fecha_cierre) {
        this.setFlash('error', 'Completa nombre, periodo y ambas fechas.');
        return;
      }
      if (new Date(fecha_cierre) < new Date(fecha_apertura)) {
        this.setFlash('error', 'La fecha de cierre debe ser posterior a la de apertura.');
        return;
      }

      const payload = { nombre_documento, periodo, fecha_apertura, fecha_cierre };

      this.saving = true;
      try {
        if (this.form.id) {
          await fechasApi.actualizar(this.form.id, payload);
          this.setFlash('success', 'Fecha actualizada correctamente.');
        } else {
          await fechasApi.crear(payload);
          this.setFlash('success', 'Fecha creada correctamente.');
        }
        this.resetForm();
        await this.fetchFechas();
      } catch (error) {
        this.setFlash('error', error.message || 'No se pudo guardar la fecha.');
      } finally {
        this.saving = false;
      }
    },
    editar(row) {
      this.form = { ...row };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    async eliminar(id) {
      const confirmDelete = window.confirm('¿Eliminar esta fecha? Esta acción no se puede deshacer.');
      if (!confirmDelete) return;
      try {
        await fechasApi.eliminar(id);
        this.setFlash('success', 'Fecha eliminada.');
        if (this.form.id === id) this.resetForm();
        await this.fetchFechas();
      } catch (error) {
        this.setFlash('error', error.message || 'No se pudo eliminar la fecha.');
      }
    },
    resetForm() {
      this.form = {
        id: null,
        nombre_documento: '',
        periodo: 'ENE-JUN',
        fecha_apertura: '',
        fecha_cierre: '',
      };
    },
    printTable() {
      const win = window.open('', '_blank');
      const html = `
        <html>
          <head>
            <title>Fechas</title>
            <style>
              body{font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans'; padding:16px;}
              table{border-collapse:collapse; width:100%;}
              th,td{border:1px solid #ddd; padding:8px; font-size:13px;}
              th{background:#f5f5f5; text-transform:uppercase; letter-spacing:.03em;}
            </style>
          </head>
          <body>
            ${document.getElementById('print-area').innerHTML}
            <script>window.onload = () => window.print();<\/script>
          </body>
        </html>`;
      win.document.write(html);
      win.document.close();
    },
  },
};
</script>

<style scoped>
/* ajustes finos opcionales */
</style>
