<template>
  <div class="w-full bg-white dark:bg-[#404040] dark:shadow-gray-950 shadow-xl border rounded-lg mb-3 p-5 border-transparent">
    <!-- Título -->
    <div class="inline-flex items-center px-4 py-2 rounded-md bg-[#536DFE] text-white font-bold text-lg mb-4">
      Consultar Alumnos
    </div>

    <!-- Botonera -->
    <div class="flex flex-wrap gap-3 mb-4">
      <button class="bg-green-500 text-white font-semibold px-3 py-1 rounded hover:brightness-110 transition" @click="downloadCSV">Excel</button>
      <button class="bg-red-500 text-white font-semibold px-3 py-1 rounded hover:brightness-110 transition" @click="printTable">PDF</button>
      <button class="bg-gray-700 text-white font-semibold px-3 py-1 rounded hover:brightness-110 transition" @click="printTable">Imprimir</button>
      <button class="bg-gray-500 text-white font-semibold px-3 py-1 rounded hover:brightness-110 transition" @click="copyTable">Copiar Texto</button>
      <button class="bg-sky-500 text-white font-semibold px-3 py-1 rounded hover:brightness-110 transition" @click="showReportHint">Reportes</button>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap items-end gap-4 mb-4">
      <div>
        <label class="block text-sm font-semibold mb-1">Buscar</label>
        <input
          v-model="q"
          type="text"
          placeholder="Nombre, apellidos, matrícula…"
          class="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-SecundaryGold focus:border-transparent transition duration-300 ease-in-out w-64"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold mb-1">Carrera</label>
        <select v-model="filtroCarrera" class="p-2 border rounded-md bg-white dark:bg-[#2a2a2a]">
          <option value="TODAS">Todas</option>
          <option value="LCP">Contaduría</option>
          <option value="LIDTS">Ingeniería en Software</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-semibold mb-1">Periodo</label>
        <select v-model="filtroPeriodo" class="p-2 border rounded-md bg-white dark:bg-[#2a2a2a]">
          <option value="TODOS">Todos</option>
          <option value="ENE-MAY">ENE-MAY</option>
          <option value="AGO-NOV">AGO-NOV</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-semibold mb-1">Año</label>
        <select v-model.number="filtroAnio" class="p-2 border rounded-md bg-white dark:bg-[#2a2a2a]">
          <option :value="0">Todos</option>
          <option v-for="y in anios" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-semibold mb-1">Práctica</label>
        <select v-model="filtroPractica" class="p-2 border rounded-md bg-white dark:bg-[#2a2a2a]">
          <option value="TODAS">Todas</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div id="print-area" class="w-full bg-white dark:bg-[#303030] shadow-xl border rounded-lg border-gray-200 dark:border-gray-700">
      <div class="w-full overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-[#2a2a2a]">
            <tr class="text-left">
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Matrícula</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Nombre</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Apellidos</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Género</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Semestre/Grupo</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Carrera</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="a in filtered"
              :key="a.matricula"
              class="hover:bg-gray-50 dark:hover:bg-[#383838] transition cursor-pointer"
              @click="abrirModal(a)"
            >
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ a.matricula }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ a.nombre }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ a.apellidos }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ a.genero }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ a.semestre }}° {{ a.grupo }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ a.carreraLabel }}</td>
              <td class="px-4 py-3 text-sm text-right">
                <button class="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md hover:bg-blue-700 transition" @click.stop="abrirModal(a)">Ver</button>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300">
                No se encontraron resultados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de detalle -->
    <AlumnoModal
      :visible="showModal"
      :alumno="selAlumno"
      @close="showModal = false"
      @update-doc="onUpdateDoc"
    />
  </div>
</template>

<script>
import AlumnoModal from '../admin/Modals/AlumnoModal.vue';

const PERIODO_OPTS = ['ENE-MAY', 'AGO-NOV'];

// MOCK de alumnos con inscripciones y documentos
const MOCK = [
  {
    matricula: '20260001',
    nombre: 'Laura',
    apellidos: 'Sánchez Díaz',
    genero: 'F',
    semestre: 11,
    grupo: 'C',
    carrera: 'LIDTS',
    carreraLabel: 'Ingeniería en Software',
    correo: 'laura@unach.mx',
    telefono: null,
    inscripciones: [
      { practica: 'P1', periodo: 'AGO-NOV', anio: 2025 },
      { practica: 'P2', periodo: 'ENE-MAY', anio: 2026 },
    ],
    documentos: {
      P1: [
        { id: 1, tipo: 'CARTA_PRESENTACION', nombre_archivo: 'cartaP1.pdf', estado: 'APROBADO', url: '#' },
        { id: 2, tipo: 'REPORTE_FINAL', nombre_archivo: 'reporteP1.pdf', estado: 'APROBADO', url: '#' },
      ],
      P2: [
        { id: 3, tipo: 'CARTA_PRESENTACION', nombre_archivo: 'cartaP2.pdf', estado: 'PENDIENTE', url: '#' },
        { id: 4, tipo: 'CARTA_ACEPTACION', nombre_archivo: 'aceptacionP2.pdf', estado: 'PENDIENTE', url: '#' },
      ],
    },
  },
  {
    matricula: '20250077',
    nombre: 'Javier',
    apellidos: 'Gutiérrez Rodríguez',
    genero: 'M',
    semestre: 11,
    grupo: 'B',
    carrera: 'LIDTS',
    carreraLabel: 'Ingeniería en Software',
    correo: 'javier@unach.mx',
    telefono: null,
    inscripciones: [
      { practica: 'P1', periodo: 'AGO-NOV', anio: 2025 },
    ],
    documentos: {
      P1: [{ id: 5, tipo: 'REPORTE_FINAL', nombre_archivo: 'repP1.pdf', estado: 'PENDIENTE', url: '#' }],
      P2: [],
    },
  },
  {
    matricula: '20240123',
    nombre: 'Ana',
    apellidos: 'Martínez Pérez',
    genero: 'F',
    semestre: 9,
    grupo: 'B',
    carrera: 'LIDTS',
    carreraLabel: 'Ingeniería en Software',
    correo: 'ana@unach.mx',
    telefono: null,
    inscripciones: [
      { practica: 'P1', periodo: 'ENE-MAY', anio: 2024 },
    ],
    documentos: {
      P1: [{ id: 6, tipo: 'CARTA_LIBERACION', nombre_archivo: 'libP1.pdf', estado: 'APROBADO', url: '#' }],
      P2: [],
    },
  },
  {
    matricula: '20251234',
    nombre: 'Carlos',
    apellidos: 'Ramírez López',
    genero: 'M',
    semestre: 7,
    grupo: 'A',
    carrera: 'LCP',
    carreraLabel: 'Contaduría',
    correo: 'carlos@unach.mx',
    telefono: null,
    inscripciones: [
      { practica: 'P1', periodo: 'ENE-MAY', anio: 2025 },
      { practica: 'P2', periodo: 'AGO-NOV', anio: 2025 },
    ],
    documentos: {
      P1: [{ id: 7, tipo: 'CARTA_PRESENTACION', nombre_archivo: 'cartacP1.pdf', estado: 'APROBADO', url: '#' }],
      P2: [{ id: 8, tipo: 'REPORTE_FINAL', nombre_archivo: 'repP2.pdf', estado: 'PENDIENTE', url: '#' }],
    },
  },
];

export default {
  name: 'PracticasAlumnos',
  components: { AlumnoModal },
  data() {
    const currentYear = new Date().getFullYear();
    const anios = [];
    for (let y = 2025; y <= currentYear + 1; y++) anios.push(y);
    return {
      q: '',
      filtroCarrera: 'TODAS',
      filtroPeriodo: 'TODOS',
      filtroAnio: 0,
      filtroPractica: 'TODAS',
      anios,
      alumnos: JSON.parse(JSON.stringify(MOCK)),
      selAlumno: null,
      showModal: false,
      PERIODO_OPTS,
    };
  },
  computed: {
    filtered() {
      const q = this.q.trim().toLowerCase();
      return this.alumnos.filter((a) => {
        // Texto
        const textOk = !q || [
          a.matricula, a.nombre, a.apellidos, a.genero, `${a.semestre} ${a.grupo}`, a.carreraLabel,
        ].join(' ').toLowerCase().includes(q);

        if (!textOk) return false;

        // Carrera
        if (this.filtroCarrera !== 'TODAS' && a.carrera !== this.filtroCarrera) return false;

        // Filtro por periodo/año/práctica (si están en "Todos", no restringe)
        const perOk = (this.filtroPeriodo === 'TODOS');
        const anioOk = (this.filtroAnio === 0);
        const pracOk = (this.filtroPractica === 'TODAS');

        if (perOk && anioOk && pracOk) return true;

        // Requiere al menos una inscripción que cumpla
        const match = a.inscripciones.some((i) => {
          const okPer = perOk || i.periodo === this.filtroPeriodo;
          const okAnio = anioOk || i.anio === this.filtroAnio;
          const okPrac = pracOk || i.practica === this.filtroPractica;
          return okPer && okAnio && okPrac;
        });
        return match;
      });
    },
  },
  methods: {
    abrirModal(a) {
      this.selAlumno = a;
      this.showModal = true;
    },
    onUpdateDoc({ matricula, practica, docId, estado }) {
      // Actualiza el mock local (luego lo cambias por llamada a backend)
      const idx = this.alumnos.findIndex(x => x.matricula === matricula);
      if (idx === -1) return;
      const arr = this.alumnos[idx]?.documentos?.[practica] || [];
      const di = arr.findIndex(d => d.id === docId);
      if (di !== -1) arr[di].estado = estado;
    },

    copyTable() {
      const lines = [
        ['Matrícula', 'Nombre', 'Apellidos', 'Género', 'Semestre/Grupo', 'Carrera'],
        ...this.filtered.map((a) => [a.matricula, a.nombre, a.apellidos, a.genero, `${a.semestre}° ${a.grupo}`, a.carreraLabel]),
      ].map((row) => row.join('\t')).join('\n');

      navigator.clipboard.writeText(lines).then(
        () => alert('Tabla copiada al portapapeles.'),
        () => alert('No se pudo copiar. Revisa permisos del navegador.')
      );
    },
    downloadCSV() {
      const rows = [
        ['Matrícula', 'Nombre', 'Apellidos', 'Género', 'Semestre/Grupo', 'Carrera'],
        ...this.filtered.map((a) => [a.matricula, a.nombre, a.apellidos, a.genero, `${a.semestre}° ${a.grupo}`, a.carreraLabel]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'alumnos.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
    printTable() {
      const win = window.open('', '_blank');
      const html = `
        <html>
          <head>
            <title>Consultar Alumnos</title>
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
    showReportHint() {
      alert('Reportes: aquí puedes abrir pantallas de filtros avanzados o descargas predefinidas 😄');
    },
  },
};
</script>

<style scoped>
/* ajustes finos opcionales */
</style>
