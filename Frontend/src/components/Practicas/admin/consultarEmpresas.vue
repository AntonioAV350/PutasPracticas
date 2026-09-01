<template>
  <div
    class="w-full bg-white dark:bg-[#404040] dark:shadow-gray-950 shadow-xl border rounded-lg mb-3 p-5 border-transparent"
  >
    <!-- Encabezado -->
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-zinc-800 dark:text-gray-100">
        Empresas
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-300">
        Consulta rápida de empresas registradas.
      </p>
    </div>

    <!-- Filtros simples -->
    <div class="flex flex-col md:flex-row md:items-center gap-3 mb-4">
      <input
        v-model="q"
        type="text"
        placeholder="Buscar por empresa o responsable…"
        class="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-SecundaryGold focus:border-transparent transition duration-300 ease-in-out w-full md:w-1/2"
      />
      <div class="flex gap-2">
        <button
          class="bg-SecundaryGold text-white font-semibold px-3 py-2 rounded-md hover:bg-primaryBlue transition"
          @click="q = q.trim()"
        >
          Buscar
        </button>
        <button
          class="bg-transparent border border-gray-300 text-gray-700 dark:text-gray-200 font-semibold px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition"
          @click="q = ''"
        >
          Limpiar
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="w-full bg-white dark:bg-[#303030] shadow-xl border rounded-lg border-gray-200 dark:border-gray-700">
      <div class="w-full overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-[#2a2a2a]">
            <tr class="text-left">
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">#</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Empresa</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Encargado</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Dirección</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase">Estatus</th>
              <th class="px-4 py-3 text-xs font-bold tracking-wider text-gray-700 dark:text-gray-200 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(e, i) in filtered"
              :key="e.id"
              class="hover:bg-gray-50 dark:hover:bg-[#383838] transition"
            >
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 align-top">{{ i + 1 }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-semibold align-top">{{ e.empresa }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 align-top">
                {{ e.nombreEncargado }} {{ e.apellidosEncargado }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 align-top">{{ e.direccion }}</td>
              <td class="px-4 py-3 text-sm align-top">
                <span
                  :class="badgeClass(e.estatus)"
                  class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                >
                  {{ e.estatus }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-right align-top">
                <button
                  class="bg-transparent border border-blue-500 text-blue-500 font-semibold px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-[#2a3b5a] transition"
                  @click="placeholderEditar(e)"
                >
                  Editar
                </button>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="6" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300">
                No se encontraron resultados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "PracticasEmpresas",
  data() {
    return {
      q: "",
      // Datos mock para vista (reemplaza luego con datos reales)
      empresas: [
        {
          id: 1,
          empresa: "Tech SA de CV",
          nombreEncargado: "Ana",
          apellidosEncargado: "Ramírez",
          direccion: "Av. Central 123, Tapachula",
          estatus: "Activa",
        },
        {
          id: 2,
          empresa: "AgroSoluciones",
          nombreEncargado: "Luis",
          apellidosEncargado: "Gómez",
          direccion: "Calle 5 #45, Huixtla",
          estatus: "Pendiente",
        },
        {
          id: 3,
          empresa: "Cafe del Sur",
          nombreEncargado: "María",
          apellidosEncargado: "Luna",
          direccion: "2a Norte 10, Tuxtla",
          estatus: "Inactiva",
        },
      ],
    };
  },
  computed: {
    filtered() {
      const q = this.q.trim().toLowerCase();
      if (!q) return this.empresas;
      return this.empresas.filter((e) =>
        [e.empresa, e.nombreEncargado, e.apellidosEncargado]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    },
  },
  methods: {
    badgeClass(status) {
      switch (status) {
        case "Activa":
          return "bg-green-50 text-green-700 ring-green-600/20";
        case "Pendiente":
          return "bg-amber-50 text-amber-700 ring-amber-600/20";
        case "Inactiva":
          return "bg-red-50 text-red-700 ring-red-600/20";
        default:
          return "bg-gray-200 text-gray-700 ring-gray-400/30";
      }
    },
    placeholderEditar(row) {
      // Solo para demo visual
      console.log("Editar empresa:", row);
      alert(`(Demo) Editar: ${row.empresa}`);
    },
  },
};
</script>

<style scoped>
/* puedes agregar ajustes finos si quieres */
</style>
