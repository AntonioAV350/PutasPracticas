<template>
  <!-- Ventana flotante con formulario -->

  <div v-if="visible && dataLoaded"
    class="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-8 rounded-lg w-1/2">
      <h2 class="text-lg mb-4 text-center font-semibold">{{ modalTitle }}</h2>
      <form class="w-full" @submit.prevent="submitForm">
        <input type="hidden" id="id_act" v-model="form.id_act" />
        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="nombre">
              Nombre de la actividad:
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="nombre" v-model="form.nombre" type="text" placeholder="Simposio de tutorías" />
          </div>
        </div>
        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full md:w-1/2 px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="fecha">
              Fecha:
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="fecha" v-model="form.fecha" type="date" />
          </div>
          <div class="w-full md:w-1/2 px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="prog_academico">
              Programa Academico:
            </label>
            <vue-multiselect id="prog_academico" v-model="form.prog_academico" :options="options" label="nombre_carrera"
              value-prop="id_carrera" placeholder="Seleccione un programa" :searchable="true" :loading="isLoading"
              no-options-text="No se encontraron opciones" ></vue-multiselect>
          </div>
        </div>
        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="descripcion">
              Descripcion de la actividad:
            </label>
            <textarea id="descripcion" v-model="form.descripcion" rows="4"
              class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"></textarea>
          </div>
        </div>
        <button type="submit" class="w-full bg-blue-800 text-white p-2 rounded hover:bg-blue-900">
          Guardar
        </button>
      </form>
      <button @click="closeModal" class="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-4">
        Cerrar
      </button>
    </div>
  </div>
</template>

<script>
import apiTutorias from "../../../services/apiTutorias";
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import Swal from "sweetalert2";

export default {
  props: ["visible", "id_act"],
  components: { VueMultiselect },
  data() {
    return {
      form: {
        id_act: "",
        nombre: "",
        fecha: "",
        descripcion: "",
        prog_academico: "",
      },
      modalTitle: "Insertar",
      dataLoaded: false,
      selected: null,
      options: [],
      isLoading: false
    };
  },
  watch: {
    // Este watcher se mantendrá para reaccionar a cambios de `visible`
    async visible(newVal) {
      if (newVal) {
        if (this.id_act) {
          (this.modalTitle = "Editar"), await this.loadActivityData();
        } else {
          this.modalTitle = "Insertar";
          this.dataLoaded = true;
          this.resetForm();
        }
      } else {
        this.dataLoaded = false;
        this.resetForm();
      }
    },
  },
  methods: {
    buscarOpciones() {
      if (!this.options.length) {
        this.isLoading = true;
        // Solo realiza la búsqueda si las opciones están vacías
        apiTutorias
          .buscarProgAcademico()
          .then((res) => {
            this.options = res.data;
            this.isLoading = false;
          })
          .catch((err) => {
            console.log("Error al buscar opciones", err);
            this.isLoading = false;
          });
      }
    },
    async loadActivityData() {
      this.loading = true;
      try {
        const response = await apiTutorias.buscarActividad(this.id_act);
        const activityData = response.data; // Es más limpio guardar el objeto en una variable

        // Usar los nuevos nombres de propiedad
        const fecha = new Date(activityData.fecha);
        const formattedDate = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${fecha.getDate().toString().padStart(2, "0")}`;

        this.form.id_act = activityData.id_actividad;
        this.form.nombre = activityData.nombre_actividad;
        this.form.fecha = formattedDate;
        this.form.descripcion = activityData.descripcion;

        // ✅ DESPUÉS (Guarda solo el ID)
        this.form.prog_academico = activityData.id_carrera;

        this.dataLoaded = true;
      } catch (error) {
        // ...
      } finally {
        this.loading = false;
      }
    },
    closeModal() {
      this.$emit("update:visible", false);
      this.dataLoaded = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        id_act: "",
        nombre: "",
        fecha: "",
        descripcion: "",
        prog_academico: "",
        evidencias: null,
      };
    },

    // Función para manejar el envío del formulario
    submitForm() {
      const data = {
        id_actividad: this.form.id_act,
        nombre_actividad: this.form.nombre,
        descripcion: this.form.descripcion,
        fecha: this.form.fecha,
        id_carrera: this.form.prog_academico,
      };

      // Verifica si los campos del formulario están vacíos
      if (
        !this.form.nombre ||
        !this.form.fecha ||
        !this.form.descripcion ||
        !this.form.prog_academico
      ) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Por favor rellena todos los campos",
          icon: "warning",
        });
        return;
      }

      if (this.form.id_act === null || this.form.id_act === "") {
        apiTutorias
          .insertarActividad(data) // Envía el FormData con el archivo
          .then((response) => {
            Swal.fire({
              title: "Actividad registrada",
              text: "La actividad se ha registrado exitosamente",
              icon: "success",
            });
            //   this.obtenerActividades(); // Actualiza la lista de actividades
            this.closeModal();
            this.$emit("activityChanged");
          })
          .catch((error) => {
            Swal.fire({
              title: "Error",
              text: "Hubo un error enviando el formulario",
              icon: "error",
            });
          });
      } else if (this.form.id_act != null || this.form.id_act != "") {
        apiTutorias
          .editarActividad(this.form.id_act, data) // Envía el FormData con el archivo
          .then((response) => {
            Swal.fire({
              title: "Actividad editada",
              text: "La actividad se ha editado exitosamente",
              icon: "success",
            });
            this.closeModal();
            this.$emit("activityChanged");
          })
          .catch((error) => {
            Swal.fire({
              title: "Error",
              text: "Hubo un error editando la actividad",
              icon: "error",
            });
          });
      }
    },

  },
  mounted() {
    this.buscarOpciones();
  },
};
</script>
