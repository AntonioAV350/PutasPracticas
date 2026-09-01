<!-- ProyectoDetallesModal.vue -->
<template>
  <div
    v-if="show"
    class="modal z-50"
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    "
  >
    <div
      class="modal-content"
      style="
        background-color: #fff;
        padding: 20px;
        border-radius: 5px;
        width: 70%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        max-height: 80%;
        overflow-y: auto;
      "
    >
      <span
        @click="closeModal"
        class="close"
        style="
          position: absolute;
          top: 10px;
          right: 10px;
          cursor: pointer;
          font-size: 24px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          text-align: center;
          line-height: 30px;
        "
        >&times;</span
      >
      <h2 class="h2">Detalles del Proyecto</h2>
      <div class="project-info">
        <div class="form-group">
          <label>ID:</label>
          <span>{{ projectData.id }}</span>
        </div>
        <div class="flex-container">
          <div class="form-group">
            <label>Nombre:</label>
            <span>{{ projectData.nombre }}</span>
          </div>
          <div class="form-group">
            <label>Ciclo Escolar:</label>
            <span>{{ projectData.ciclo_escolar }}</span>
          </div>
        </div>
        <div class="flex-container">
          <div class="form-group">
            <label>Fecha de Inicio:</label>
            <span>{{ formatDate(projectData.fecha_inicio) }}</span>
          </div>
          <div class="form-group">
            <label>Fecha de Finalizacion:</label>
            <span>{{ formatDate(projectData.fecha_final) }}</span>
          </div>
        </div>
        <div class="form-group">
          <label>Linea de Investigacion:</label>
          <span>{{ projectData.linea_investigacion }}</span>
        </div>
        <div class="form-group">
          <label>Lider del proyecto:</label>
          <span>{{ projectData.lider_de_proyecto }}</span>
        </div>
        <div class="form-group">
          <label>Status:</label>
          <span
            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
            :class="{
              'bg-red-50 text-red-700 ring-red-600/10':
                projectData.estatus === 0,
              'bg-green-50 text-green-700 ring-green-600/20':
                projectData.estatus === 1,
              'bg-amber-50 text-amber-700 ring-amber-600/10':
                projectData.estatus === 2,
              'bg-blue-50 text-blue-700 ring-blue-600/10':
                projectData.estatus === 3,
              'bg-gray-500 text-white': !projectData.estatus,
            }"
          >
            {{
              projectData.estatus === 0
                ? "Rechazado"
                : projectData.estatus === 1
                ? "Activo"
                : projectData.estatus === 2
                ? "En proceso"
                : projectData.estatus === 3
                ? "Finalizado"
                : "Desconocido"
            }}
          </span>
        </div>
        <div class="form-group">
          <label>Recursos Utilizados:</label>
          <span>{{ projectData.recursos_utilizados }}</span>
        </div>
        <div class="form-group">
          <label>Tipo de Recurso:</label>
          <span>{{ projectData.tipo_de_recurso }}</span>
        </div>
      </div>
      <!-- Agrega aquí todos los campos que desees mostrar -->
      <div class="project-info">
        <h3 class="mb-4 text-xl font-bold">Colaboradores</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="collaborator in collaboratorsData"
            :key="collaborator.id"
            class="p-4 border border-gray-200 rounded-md bg-white"
          >
            <div class="mb-2"> 
              <label class="font-semibold">Nombre:</label>
              <span class="ml-2">{{ collaborator.nombre }}</span>
            </div>
            <div class="mb-2">
              <label class="font-semibold">Tipo:</label>
              <span class="ml-2">{{ collaborator.tipo }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";

export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    projectData: {
      type: Object,
      default: () => ({}),
    },
    collaboratorsData: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    formatDate(date) {
      return dayjs(date).format("YYYY-MM-DD");
    },
  },
};
</script>
<style scoped>
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.h2 {
  text-align: center;
  color: #004d99; /* Color azul */
  border-bottom: 3px solid #ffcc00; /* Linea dorada debajo del título */
  padding-bottom: 10px;
  margin: 0;
}
.modal-content {
  position: relative;
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 70%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 80%;
  overflow-y: auto;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 24px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
}

.project-info {
  border: 1px solid #e0e0e0;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
  margin-top: 20px;
}

.flex-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #fff;
  margin-right: 10px;
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: 5px;
}

span {
  font-size: 16px;
}
</style>
