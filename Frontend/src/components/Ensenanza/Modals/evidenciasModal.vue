<template>
  <div
    v-if="show"
    class="fixed top-0 left-0 flex justify-center items-center h-screen w-screen z-50"
  >
    <button
      class="absolute inset-0 w-screen h-screen bg-black opacity-50 cursor-default"
      @click="$emit('close')"
    ></button>
    <div
      class="relative bg-white dark:bg-[#404040] dark:shadow-gray-950 rounded-xl w-2/4 shadow-xl max-h-screen overflow-y-auto"
    >
      <div
        class="modal-header bg-blue-900 flex justify-between items-center rounded-tl-lg rounded-tr-lg"
      >
        <h1 class="text-white font-bold py-3 px-4">Evidencias</h1>
        <button @click="$emit('close')" class="mx-4">
          <span class="text-white font-bold text-lg">x</span>
        </button>
      </div>
      <div class="modal-body p-4 max-h-96 overflow-y-auto">
        <div class="w-full p-6 shadow-lg rounded-md border border-gray-300">
          <form class="w-full" @submit.prevent="submitForm">
            <input type="hidden" v-model="form.idEvidenciasE" />
            <input type="hidden" v-model="form.idActEnsenanza" />
            <div class="flex flex-wrap -mx-3 mb-6">
              <div class="w-full px-3">
                <label
                  class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  for="nombre"
                >
                  Nombre de la Evidencia:
                </label>
                <input
                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="nombreEvi"
                  v-model="form.nombreEvi"
                  type="text"
                  placeholder="Ingreso de Estudiantes 2023"
                />
              </div>
            </div>
            <div class="flex flex-wrap -mx-3 mb-6">
              <div class="w-full px-3">
                <label
                  class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  for="evidencias"
                >
                  Evidencia:
                </label>
                <input
                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  id="evidencias"
                  name="evidencias"
                  type="file"
                  ref="evidenciasInput"
                  @change="handleFileUpload"
                />
              </div>
            </div>
            <div class="flex flex-wrap -mx-3 mb-6">
              <div class="w-full px-3">
                <label
                  class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  for="descripcion"
                >
                  Descripcion de la evidencia:
                </label>
                <textarea
                  id="descripcion"
                  v-model="form.descripcionEvi"
                  rows="4"
                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  placeholder="Describa brevemente la evidencia, incluyendo los objetivos, participantes y cualquier detalle relevante."
                ></textarea>
              </div>
            </div>
            <button
              type="submit"
              class="w-full bg-blue-800 text-white p-2 rounded hover:bg-blue-900"
            >
              Guardar
            </button>
          </form>
          <button
            @click="resetForm"
            class="w-full mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Limpiar
          </button>
        </div>

        <div
          class="w-full mt-4 p-2 shadow-xl rounded-md border border-gray-300"
        >
          <DataTableComponent :data="evidencias" :columns="columns">
            <template #headers>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Actividad</th>
              <th>Acciones</th>
            </template>
          </DataTableComponent>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DataTableComponent from "../../Plantillas/DataTableComponent.vue";
import apiEnsenanza from "../../../services/apiEnsenanza";
import Swal from "sweetalert2";
export default {
  components: {
    DataTableComponent,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    actividadId: {
      type: [Number, String],
      default: "",
    },
  },
  data() {
    return {
      // Para el formulario
      form: {
        idEvidenciasE: "",
        idActEnsenanza: "",
        nombreEvi: "",
        descripcionEvi: "",
      },
      archivo: null,
      evidencias: [],
      columns: [
        { data: "idevidenciasE" },
        { data: "nombreEvi" },
        { data: "descripcionEvi" },
        { data: "nombreAct" },
        {
          title: "Acciones",
          data: null,
          render: (data, type, row) => {
            return `
                        <button class="btn-editar-evidencia bg-yellow-500 text-white p-2 pt-2 rounded" data-id="${data.idevidenciasE}"><i class="pi pi-pencil pointer-events-none"></i></button>
                        <button class="btn-eliminar-evidencia bg-red-500 text-white  p-2 pt-2  rounded" data-id="${data.idevidenciasE}"><i class="pi pi-trash pointer-events-none"></i></button>
                        <a href="http://localhost:3000${data.urlEvi}" target="_blank" class="btn-ver-archivo bg-green-500 text-white p-2 pt-3 rounded"><i class="pi pi-eye pointer-events-none"></i></a>
                      `;
          },
        },
      ],
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.obtenerData();
          this.form.idActEnsenanza = this.actividadId;
        });
      } else {
        this.resetForm();
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      document.addEventListener("click", (event) => {
        // Verificar si se hizo clic en el botón de editar
        if (event.target.matches(".btn-editar-evidencia")) {
          const id = event.target.getAttribute("data-id");
          this.cargarEvidenciaParaEditar(id);
        }

        // Verificar si se hizo clic en el botón de eliminar
        if (event.target.matches(".btn-eliminar-evidencia")) {
          const id = event.target.getAttribute("data-id");
          this.eliminarEvidencia(id);
        }
      });
    });
  },

  methods: {
    handleFileUpload() {
      this.archivo = this.$refs.evidenciasInput.files[0];
    },
    async obtenerData() {
      try {
        const response = await apiEnsenanza.obtenerEvidencias(this.actividadId);
        this.evidencias = response.data;
      } catch (error) {
        console.error("Error al obtener las actividades:", error);
      }
    },
    resetForm() {
      this.form = {
        ...this.form,
        idEvidenciasE: "",
        nombreEvi: "",
        descripcionEvi: "",
        evidencias: "",
      };
      this.archivo = null;
      if (this.$refs.evidenciasInput && this.$refs.evidenciasInput.files) {
        this.$refs.evidenciasInput.value = null; // <-- Reinicia el input del archivo
      }
    },
    submitForm() {
      const formData = new FormData();
      formData.append("idEvidenciasE", this.form.idEvidenciasE);
      formData.append("idActEnsenanza", this.form.idActEnsenanza);
      formData.append("nombreEvi", this.form.nombreEvi);
      formData.append("descripcionEvi", this.form.descripcionEvi);
      if (this.archivo) {
        formData.append("evidencias", this.archivo);
      }

      if (!this.form.nombreEvi || !this.form.descripcionEvi) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Por favor rellena todos los campos",
          icon: "warning",
        });
        return;
      }

      let promise;
      if (!this.form.idEvidenciasE) {
        promise = apiEnsenanza.insertarEvidencias(formData);
      } else {
        promise = apiEnsenanza.actualizarEvidencias(
          this.form.idEvidenciasE,
          formData
        );
      }
      promise
        .then((res) => {
          const message = this.form.idEvidenciasE
            ? "La actividad se ha actualizado correctamente"
            : "La actividad se ha insertado correctamente";

          Swal.fire({
            title: this.form.idEvidenciasE
              ? "Actividad actualizada"
              : "Actividad insertada",
            text: message,
            icon: "success",
          });

          this.resetForm();
          this.obtenerData();
        })
        .catch((err) => {
          Swal.fire({
            title: "Error",
            text:
              "Hubo un error al " +
              (this.form.idActEnsenanza ? "actualizar" : "insertar") +
              " la actividad",
            icon: "error",
          });
        });
    },
    eliminarEvidencia(id) {
      Swal.fire({
        title: "¿Estás seguro de eliminar la evidencia?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, borrar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          apiEnsenanza
            .eliminarEvidencia(id)
            .then(() => {
              Swal.fire(
                "Eliminado",
                "La evidencia ha sido eliminada.",
                "success"
              );
              this.obtenerData();
            })
            .catch((err) => {
              console.error(err);
              Swal.fire("Error", "Error al eliminar la evidencia.", "error");
            });
        }
      });
    },
    cargarEvidenciaParaEditar(id) {
      // Buscar la evidencia con el id dado
      const evidencia = this.evidencias.find((ev) => ev.idevidenciasE == id);

      if (!evidencia) {
        console.error("No se pudo encontrar la evidencia para editar");
        Swal.fire(
          "Error",
          "No se pudo encontrar la evidencia para editar.",
          "error"
        );
        return;
      }

      // Asignar los datos de la evidencia al formulario
      this.form.idEvidenciasE = evidencia.idevidenciasE;
      this.form.nombreEvi = evidencia.nombreEvi;
      this.form.descripcionEvi = evidencia.descripcionEvi;
      // (y cualquier otro campo que necesites)
    },
  },
};
</script>

<style scoped>
.modal-body {
  max-height: calc(100vh - 200px); /* Ajustar según tus necesidades */
  overflow-y: auto;
}
</style>
