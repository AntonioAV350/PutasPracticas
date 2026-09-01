<template>
  <div>
    <!-- Pestañas -->
    <div
      class="flex space-x-4 p-2 bg-white dark:bg-[#404040] dark:shadow-gray-950 border-transparent"
    >
      <button
        v-for="tipoActividad in tiposActividades"
        :key="tipoActividad.id"
        @click="activeTab = tipoActividad.id"
        :class="[
          'px-4 py-2 text-base font-bold',
          activeTab === tipoActividad.id
            ? 'bg-SecundaryGold text-white border rounded-lg'
            : 'text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 hover:duration-500 hover:ease-in-out',
        ]"
      >
        {{ tipoActividad.nombre }}
      </button>
    </div>
    <hr class="h-px bg-gray-300 dark:bg-gray-600 border-0 m-0" />
    <!-- Contenido de la pestaña activa -->
    <ActividadTab :actividades="actividadesTotales" :id-actividad="activeTab" />
  </div>
</template>

<script>
import ActividadTab from "./TabTipoAct.vue";
import apiEnsenanza from "../../services/apiEnsenanza";
import { mapGetters } from "vuex";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    ActividadTab,
  },
  data() {
    return {
      activeTab: 0,
      tiposActividades: [],
      actividadesTotales: [],
    };
  },
  created() {
    this.cargarTiposActividades();
    this.cargarActividadesTotales();
  },
  computed: {
    ...mapGetters(["getSelectedMateria"]),
    ...mapState(["actualizarTabla"]),
  },
  watch: {
    actualizarTabla(newValue) {
      if (newValue) {
        this.cargarActividadesTotales();
        this.cambiarBanderaActualizarTabla();
      }
    },
  },
  methods: {
    ...mapActions(["cambiarBanderaActualizarTabla"]),
    cargarActividadesTotales() {
      // Simula la carga de datos, reemplaza con tu llamada a la API
      apiEnsenanza.obtenerActividades().then((response) => {
        if (this.getSelectedMateria) {
          this.actividadesTotales = response.data.filter(
            (act) => act.idMateria === this.getSelectedMateria,
            console.log("selected",this.getSelectedMateria),
            console.log("data back",response.data)
          );
        } else {
          this.actEjercicios = [];
        }
      });
    },
    async cargarTiposActividades() {
      try {
        const response = await apiEnsenanza.buscarTipoActividad();
        this.tiposActividades = response.data.map((tipo) => ({
          id: tipo.idtipoActividad,
          nombre: tipo.nombretipoAct,
        }));
        if (this.tiposActividades.length > 0) {
          this.activeTab = this.tiposActividades[0].id;
        }
      } catch (error) {
        console.error("Error al cargar tipos de actividad:", error);
      }
    },
  },
};
</script>
