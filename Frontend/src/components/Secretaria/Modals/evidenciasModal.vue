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
      class="relative bg-white rounded-xl w-2/4 shadow-xl max-h-screen overflow-y-auto"
    >
      <div
        class="modal-header bg-blue-500 flex justify-between items-center rounded-tl-lg rounded-tr-lg"
      >
        <h1 class="text-white font-bold py-3 px-4">Documentos</h1>
        <button @click="$emit('close')" class="mx-4">
          <span class="text-white font-bold text-lg">x</span>
        </button>
      </div>
      <div class="modal-body p-4 max-h-96 overflow-y-auto">
        <div class="w-full p-6 shadow-lg rounded-md border border-gray-300">
          <form class="w-full" @submit.prevent="submitForm">
            <input type="hidden" v-model="form.idDocumento" />
            <input type="hidden" v-model="form.idSecretaria" />
            <div class="flex flex-wrap -mx-3 my-4">
              <div class="w-full px-3">
                <label
                  class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  for="nombreDoc"
                >
                  Nombre del Documento:
                </label>
                <input
                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="nombreDoc"
                  v-model="form.nombreDoc"
                  type="text"
                  placeholder="Certificado de Maestria"
                />
              </div>
            </div>
            <div class="flex flex-wrap -mx-3">
              <div class="w-full px-3">
                <label
                  class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  for="nombre"
                >
                  Tipo de Documento:
                </label>
                <vue-multiselect
                  id="tipoDocumento"
                  v-model="form.tipoDocumento"
                  :options="dataTipoDocumento"
                  :multiple="false"
                  label="descripcion"
                  track-by="idTipoDocumento"
                  :searchable="true"
                  :clear-on-select="true"
                  :append-to-body="true"
                ></vue-multiselect>
              </div>
            </div>
            <div class="flex flex-wrap -mx-3 my-4">
              <div class="w-full px-3">
                <label
                  class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  for="fecha"
                >
                  Fecha:
                </label>
                <input
                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="fecha"
                  v-model="form.fecha"
                  type="date"
                  placeholder="Simposio de tutorías"
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
                  placeholder="Simposio de tutorías"
                  ref="evidenciasInput"
                  @change="handleFileUpload"
                />
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
            type="button"
            class="w-full bg-red-500 text-white p-2 rounded hover:bg-gray-700 mt-4"
            @click="clearForm"
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
              <th>Nombre Documento</th>
              <th>Tipo de Documento</th>
              <th>Fecha</th>
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
import apiSecretaria from "../../../services/apiSecretaria";
import Swal from "sweetalert2";
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

import dayjs from "dayjs";

export default {
  components: {
    DataTableComponent,
    VueMultiselect,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    idSecretaria: {
      type: [Number, String],
      default: "",
    },
  },
  data() {
    return {
      // Para el formulario
      form: {
        idDocumento: "",
        idSecretaria: "",
        nombreDoc: "",
        tipoDocumento: "",
        fecha: "",
      },
      archivo: null,
      dataTipoDocumento: [],
      evidencias: [],
      columns: [
        { data: "idDocumento" },
        { data: "nombreDoc" },
        { data: "descripcion" },
        {
          data: "fecha",
          render: function (data, type, row) {
            if (type === "display" || type === "filter") {
              return dayjs(data).format("YYYY-MM-DD"); // ajusta el formato como desees
            }
            return data;
          },
        },
        {
          title: "Acciones",
          data: null,
          render: (data, type, row) => {
            return `
                        <button class="btn-editar-evidencia bg-yellow-500 text-white p-2 pt-2 rounded" data-id="${data.idDocumento}"><i class="pi pi-pencil pointer-events-none"></i></button>
                        <button class="btn-eliminar-evidencia bg-red-500 text-white  p-2 pt-2  rounded" data-id="${data.idDocumento}"><i class="pi pi-trash pointer-events-none"></i></button>
                        <a href="http://localhost:3000${data.urlDocumento}" target="_blank" class="btn-ver-archivo bg-green-500 text-white p-2 pt-3 rounded"><i class="pi pi-eye pointer-events-none"></i></a>
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
          this.form.idSecretaria = this.idSecretaria;
          this.obtenerData();
        });
      }
    },
  },
  mounted() {
    this.buscarTipoDoc();
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
    async buscarTipoDoc() {
      try {
        const response = await apiSecretaria.getTipoDoc();
        this.dataTipoDocumento = response.data;
      } catch (error) {
        console.error("Error al encontrar tipo de documentos:", error);
      }
    },
    handleFileUpload() {
      this.archivo = this.$refs.evidenciasInput.files[0];
    },
    async obtenerData() {
      try {
        const response = await apiSecretaria.obtenerDocumentos(
          this.idSecretaria
        );
        this.evidencias = response.data;
      } catch (error) {
        console.error("Error al obtener data:", error);
      }
    },
    clearForm() {
      const currentIdSecretaria = this.form.idSecretaria;

      this.form = {
        idDocumento: "",
        idSecretaria: currentIdSecretaria,
        nombreDoc: "",
        tipoDocumento: "",
        fecha: "",
      };
      this.archivo = null;
      if (this.$refs.evidenciasInput && this.$refs.evidenciasInput.files) {
        this.$refs.evidenciasInput.value = null;
      }
    },
    submitForm() {
      const formData = new FormData(); 
      formData.append("idDocumento", this.form.idDocumento);
      formData.append("idSecretaria", this.form.idSecretaria);
      formData.append("nombreDoc", this.form.nombreDoc);
      formData.append("idTipoDocumento",this.form.tipoDocumento.idTipoDocumento)
      formData.append("fecha", this.form.fecha);
      formData.append("evidencias", this.archivo);

      if (!this.form.nombreDoc || !this.form.fecha) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Por favor rellena todos los campos",
          icon: "warning",
        });
        return;
      }

      let promise;
      if (!this.form.idDocumento) {
        promise = apiSecretaria.insertarDocumentos(formData);
      } else {
        promise = apiSecretaria.actualizarDocumentos(
          this.form.idDocumento,
          formData
        );
      }
      promise
        .then((res) => {
          const message = this.form.idDocumento
            ? "El Documento se ha actualizado correctamente"
            : "El Documento se ha insertado correctamente";

          Swal.fire({
            title: this.form.idDocumento
              ? "Documento actualizada"
              : "Documento insertada",
            text: message,
            icon: "success",
          });

          this.clearForm();
          this.obtenerData();
        })
        .catch((err) => {
          Swal.fire({
            title: "Error",
            text:
              "Hubo un error al " +
              (this.form.idDocumento ? "actualizar" : "insertar") +
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
          apiSecretaria
            .eliminarDocumentos(id)
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
      const evidencia = this.evidencias.find((ev) => ev.idDocumento == id);

      // Si no se encuentra la evidencia, manejar el error apropiadamente
      if (!evidencia) {
        Swal.fire(
          "Error",
          "No se pudo encontrar la evidencia para editar.",
          "error"
        );
        return;
      }

      // Asignar los datos de la evidencia al formulario
      this.form.idDocumento = evidencia.idDocumento;
      this.form.nombreDoc = evidencia.nombreDoc;
      // Formatear la fecha correctamente para el input de tipo fecha
      if (evidencia.fecha) {
        this.form.fecha = dayjs(evidencia.fecha).format("YYYY-MM-DD");
      } else {
        this.form.fecha = "";
      }

      this.form.tipoDocumento = this.dataTipoDocumento.find(
        (tipoDoc) => tipoDoc.descripcion === evidencia.descripcion
      );
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
