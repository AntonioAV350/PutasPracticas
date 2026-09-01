<template>
  <div class="container mx-auto">
    <div class="w-full bg-white shadow-xl border rounded-lg border-gray-300 mb-7">
      <button title="Registrar Docente" @click="showModal = true"
        class="bg-green-500  text-white font-bold p-2 rounded m-4">
        Registrar Documento
      </button>
      <secretariaDataTableVue ref="datatableComponent" />
    </div>
    <ModalFormComponent :visible="showModal" @update:visible="handleClose" @activityChanged="fetchActivities" />
  </div>
</template>

<script>
import HeaderComponent from "../components/HeaderModuleComponent.vue";
import secretariaDataTableVue from "../components/Secretaria/secretariaDatatableVue.vue";
import ModalFormComponent from "../components/Secretaria/Modals/FormActividades.vue";

export default {
  components: {
    HeaderComponent,
    secretariaDataTableVue,
    ModalFormComponent,
  },
  data() {
    return {
      showModal: false, // Controla si se muestra o no la ventana flotante
    };
  },
  mounted() {
    this.$store.dispatch("setSelectedOption", "SECRETARIA ACADEMICA");
  },
  methods: {
    handleClose(value) {
      this.showModal = value;
    },
    fetchActivities() {
      this.$refs.datatableComponent.updateData();
    },
  },
};
</script>
