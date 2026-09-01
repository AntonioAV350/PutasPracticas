<template>
  <div
    class="w-full bg-white dark:bg-[#404040] dark:shadow-gray-950 shadow-xl border rounded-lg mb-3 p-5 border-transparent"
  >
    <!-- Encabezado de la vista -->
    <div class="inline-flex items-center px-4 py-2 rounded-md bg-[#536DFE] text-white font-bold text-lg mb-6">
      Información General
    </div>

    <!-- Contenedor suave (como panel gris claro) -->
    <div class="bg-[#f7f9fb] dark:bg-[#2c2c2c] rounded-2xl p-6 md:p-8">
      <!-- Card: Resumen de fechas -->
      <div
        class="bg-white dark:bg-[#303030] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-5 md:p-6"
      >
        <div class="flex items-start gap-3 mb-2">
          <span class="text-2xl leading-[1]">≡</span>
          <h2 class="text-3xl font-extrabold text-slate-800 dark:text-gray-100">
            Resumen de fechas
          </h2>
        </div>

        <ul class="list-disc pl-6 space-y-2 text-slate-800 dark:text-gray-100">
          <li v-for="(n, i) in resumenFechas" :key="i">
            {{ n }}
          </li>
        </ul>
      </div>

      <!-- Card: Estadísticas clave -->
      <div
        class="bg-white dark:bg-[#303030] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 md:p-6"
      >
        <div class="flex items-start gap-3 mb-2">
          <span class="text-2xl leading-[1]">📊</span>
          <h2 class="text-3xl font-extrabold text-slate-800 dark:text-gray-100">
            Estadísticas clave
          </h2>
        </div>

        <ul class="list-disc pl-6 space-y-2 text-slate-800 dark:text-gray-100">
          <li> Total de prácticas: <strong>{{ stats.totalPracticas }}</strong> </li>
          <li> Proyectos en curso: <strong>{{ stats.proyectosEnCurso }}</strong> </li>
          <!-- agrega más KPIs si los necesitas -->
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PracticasResumen",
  data() {
    return {
      resumenFechas: [
        "Nueva práctica asignada a Estudiante A",
        "Nuevo proyecto creado: Proyecto X",
      ],
      stats: {
        totalPracticas: 100,
        proyectosEnCurso: 20,
      },
    };
  },
};
</script>

<style scoped>
/* Ajustes mínimos opcionales */
</style>
