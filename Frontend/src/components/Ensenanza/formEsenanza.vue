<template>
  <div class="m-4">
    <button
      v-if="!mostrarFormulario"
      @click="toggleFormulario"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Insertar
    </button>

    <!-- Div que contiene el formulario -->
    <div
      v-if="mostrarFormulario"
      class="bg-white dark:bg-[#404040] dark:shadow-gray-950 border-transparent px-4"
    >
      <h2
        class="text-lg mb-4 text-center font-semibold text-gray-800 dark:text-gray-200"
      >
        {{ formTitle }}
      </h2>
      <form class="w-full" @submit.prevent="submitForm">
        <input
          type="hidden"
          id="idActEnsenanza"
          v-model="form.idActEnsenanza"
        />
        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2"
              for="nombre"
            >
              Nombre de la actividad:
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-gray-500 dark:focus:border-gray-400"
              id="nombreAct"
              v-model="form.nombreAct"
              type="text"
              placeholder="Ej. Taller de ciencias"
            />
          </div>
        </div>
        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full md:w-1/3 px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 dark:text-gray-300  text-xs font-bold mb-2"
              for="materia"
            >
              Materia:
            </label>
            <Multiselect
              id="materia"
              v-model="form.materia"
              :options="materias"
              label="nombreMateria"
              track-by="materia"
              :searchable="true"
            />
          </div>
          <div class="w-full md:w-1/3 px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2"
              for="tipoActividad"
            >
              Tipo de Actividad:
            </label>
            <vue-multiselect
              id="tipoActividad"
              v-model="form.tipoAct"
              :options="options"
              label="nombretipoAct"
              track-by="idtipoActividad"
              :searchable="true"
            ></vue-multiselect>
          </div>
          <div class="w-full md:w-1/3 px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2"
              for="fecha"
            >
              Fecha:
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 dark:bg-gray-700
dark:border-gray-600
dark:focus:bg-gray-600
dark:focus:border-gray-400"
              id="fecha"
              v-model="form.fechaAct"
              type="date"
              placeholder="Ej. dd/mm/aaaa"
            />
          </div>
        </div>
        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2"
              for="descripcion"
            >
              Descripcion de la actividad:
            </label>
            <textarea
              id="descripcion"
              v-model="form.descripcionAct"
              rows="4"
              class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 dark:bg-gray-700
dark:border-gray-600
dark:focus:bg-gray-600
dark:focus:border-gray-400"
              placeholder="Ej. En este taller, los estudiantes aprenderán sobre los principios básicos de la física..."
            ></textarea>
          </div>
        </div>
        <button
          type="submit"
          class="w-full bg-blue-800 text-white p-2 rounded hover:bg-blue-900"
        >
          {{ nombreBtn }}
        </button>
      </form>
      <button
        @click="cerrarFormulario"
        class="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-4"
      >
        Cerrar
      </button>
    </div>
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import apiEnsenanza from "../../services/apiEnsenanza";
import Swal from "sweetalert2";
import { mapState } from "vuex";
import dayjs from "dayjs";

export default {
  components: { VueMultiselect},
  data() {
    return {
      // Opciones para el multiselect
      options: [],
      materias: [],
      selectedOption: null,
      isLoading: false,
      // Para el formulario y la ventana flotante
      mostrarFormulario: false,
      // Para el formulario
      form: {
        idActEnsenanza: "",
        nombreAct: "",
        fechaAct: "",
        descripcionAct: "",
        tipoAct: "",
        materia: "",
      },
    };
  },
  methods: {
    buscarOpciones() {
      if (!this.options.length) {
        // Solo realiza la búsqueda si las opciones están vacías
        this.isLoading = true;
        apiEnsenanza
          .buscarTipoActividad()
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
    buscarMaterias() {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!this.materias.length) {
        // Solo realiza la búsqueda si las materias están vacías
        this.isLoading = true;
        apiEnsenanza
          .buscarMaterias(userData.rfc) // Debes tener un método similar en tu servicio API
          .then((res) => {
            this.materias = res.data;
            this.isLoading = false;
          })
          .catch((err) => {
            console.log("Error al buscar materias", err);
            this.isLoading = false;
          });
      }
    },
    toggleFormulario() {
      this.mostrarFormulario = !this.mostrarFormulario;
    },
    cerrarFormulario() {
      this.mostrarFormulario = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        idActEnsenanza: "",
        nombreAct: "",
        fechaAct: "",
        descripcionAct: "",
        tipoAct: "",
        materia: "",
      };
    },
    submitForm() {
      // Lógica para enviar el formulario
      const data = {
        idActEnsenanza: this.form.idActEnsenanza,
        nombreAct: this.form.nombreAct,
        fecha: this.form.fechaAct,
        descripcionAct: this.form.descripcionAct,
        tipoAct: this.form.tipoAct.idtipoActividad,
        idMateria: this.form.materia.materia,
      };

      if (
        !this.form.nombreAct ||
        !this.form.fechaAct ||
        !this.form.descripcionAct ||
        !this.form.tipoAct ||
        !this.form.materia
      ) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Todos los campos son obligatorios",
          icon: "warning",
        });
        return;
      }

      let promise; // Almacenará la promesa del API, para insertar o actualizar
      if (!this.form.idActEnsenanza) {
        promise = apiEnsenanza.insertarActividad(data);
      } else {
        promise = apiEnsenanza.actualizarActividad(
          this.form.idActEnsenanza,
          data
        );
      }

      promise
        .then((res) => {
          const message = this.form.idActEnsenanza
            ? "La actividad se ha actualizado correctamente"
            : "La actividad se ha insertado correctamente";

          Swal.fire({
            title: this.form.idActEnsenanza
              ? "Actividad actualizada"
              : "Actividad insertada",
            text: message,
            icon: "success",
          });

          this.resetForm();
          this.cerrarFormulario();
          // Actualiza la tabla
          this.$store.dispatch("cambiarBanderaActualizarTabla");
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
    mapeoActividad(data) {
      return {
        idActEnsenanza: data.idActEnsenanza,
        nombreAct: data.nombreAct,
        fechaAct: data.fecha,
        descripcionAct: data.descripcionAct,
        tipoAct: this.options.find(
          (option) => option.idtipoActividad === data.idtipoActividad
        ),
        materia: this.materias.find(
          (materia) => materia.materia === data.idMateria
        ),
      };
    },
  },
  computed: {
    ...mapState(["actividadEditar"]),
    formTitle() {
      return this.form.idActEnsenanza
        ? "Editar Actividad"
        : "Insertar Nueva Actividad";
    },
    nombreBtn() {
      return this.form.idActEnsenanza ? "Actualizar" : "Guardar";
    },
  },
  watch: {
    actividadEditar: {
      handler(newValue) {
        if (newValue) {
          this.form = this.mapeoActividad(newValue); // Asigna las actividades al formulario
          //formato de fecha
          if (this.form.fechaAct) {
            this.form.fechaAct = dayjs(this.form.fechaAct).format("YYYY-MM-DD");
          }
          this.mostrarFormulario = true;
        } else {
          this.resetForm();
          this.mostrarFormulario = false;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.buscarOpciones();
    this.buscarMaterias();
  },
};
</script>
