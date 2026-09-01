<template>
  <!-- Ventana flotante con formulario -->

  <div v-if="visible && dataLoaded" class="fixed top-0 left-0 flex justify-center items-center h-screen w-screen z-50">
    <button class="absolute inset-0 w-screen h-screen bg-black opacity-50 cursor-default" @click="closeModal"></button>

    <div class="relative bg-white rounded-xl w-2/4 shadow-xl max-h-screen overflow-y-auto">
      <div class="modal-header bg-green-500 flex justify-between items-center rounded-tl-lg rounded-tr-lg">
        <h2 class="text-lg text-white font-bold py-3 px-4">{{ modalTitle }}</h2>
        <button @click="closeModal" class="mx-4">
          <span class="text-white font-bold text-lg">x</span>
        </button>
      </div>

      <div class="modal-body p-4 max-h-96 overflow-y-auto">
        <form class="w-full" @submit.prevent="submitForm">
          <input type="hidden" id="idSecretaria" v-model="form.idSecretaria" />
          <div class="flex flex-wrap -mx-3 mb-6">
            <div class="w-full px-3">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Docente:
              </label>
              <vue-multiselect id="docente" v-model="form.rfc" :options="userOptions" label="rfc" track-by="rfc"
                :searchable="false" :allow-empty="false" placeholder="Cargando usuario..." :disabled="true">
              </vue-multiselect>
            </div>
          </div>
          <div class="flex flex-wrap -mx-3 mb-6">
            <div class="w-full md:w-1/3 px-3">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="fecha">
                Nivel de Estudio:
              </label>
              <vue-multiselect id="prog_academico" v-model="form.nivelEstudio" :options="options" :multiple="false"
                placeholder="Seleccione un nivel de estudio" :clear-on-select="true" :append-to-body="true"
                :max-height="120"></vue-multiselect>
            </div>
            <div class="w-full md:w-1/3 px-3">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="nombreInstitucion">
                Institución:
              </label>
              <input
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="nombreInstitucion" v-model="form.nombreInstitucion" type="text"
                placeholder="Ej. Universidad Autónoma de Chiapas" />
            </div>
            <div class="w-full md:w-1/3 px-3">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                for="areaEspecializacion">
                Area de Especialidad:
              </label>
              <input
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="areaEspecializacion" v-model="form.areaEspecializacion" type="text"
                placeholder="Ej. Ingeniería de Sistemas" />
            </div>
          </div>
          <button type="submit" class="w-full bg-primaryBlue text-white p-2 rounded hover:bg-blue-900">
            Guardar
          </button>
        </form>
        <button @click="closeModal" class="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-4">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import Swal from "sweetalert2";
import apiSecretaria from "../../../services/apiSecretaria";

export default {
  props: ["visible", "data"],
  components: { VueMultiselect },
  data() {
    return {
      userOptions: [], // <-- NUEVA: para las opciones del multiselect
      form: {
        idSecretaria: "",
        rfc: null,
        nivelEstudio: "",
        nombreInstitucion: "",
        areaEspecializacion: "",
      },
      modalTitle: "Registrar",
      dataLoaded: false,
      selected: null,
      options: [
        "Licenciatura",
        "Título Profesional",
        "Maestría",
        "Doctorado"
      ],

      users: [],
      isLoading: false,
    };
  },
  watch: {
    // async visible(newVal) {
    //   if (newVal) {
    //     if (this.data) {
    //       (this.modalTitle = "Editar"), await this.loadActivityData();
    //     } else {
    //       this.modalTitle = "Registrar";
    //       this.dataLoaded = true;
    //       this.resetForm();
    //     }
    //   } else {
    //     this.dataLoaded = false;
    //     this.resetForm();
    //   }
    // },
    async visible(newVal) {
    if (newVal) {
      if (this.data) { // MODO EDITAR
        (this.modalTitle = "Editar"), await this.loadActivityData();
      } else { // MODO REGISTRAR
        this.modalTitle = "Registrar";
        this.resetForm(); // 1. Primero limpiamos...
        this.cargarUsuarioLogueado(); // 2. ...y LUEGO cargamos el usuario.
      }
      this.dataLoaded = true;
    } else {
      this.dataLoaded = false;
      // Ya no es necesario llamar a resetForm() aquí, se llama al abrir.
    }
  },
  },
  methods: {
    cargarUsuarioLogueado() {
      
      const storedUser = localStorage.getItem('user');
      

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          

          // Verificamos que los datos necesarios existan
          if (!userData.rfc || !userData.nombre || !userData.apellido_paterno) {
            console.error("FALLO: El objeto en localStorage no tiene rfc, nombre o apellido_paterno.");
            return; // Detenemos la función aquí
          }

          const usuarioConEtiqueta = {
            ...userData,
            nameUser: `${userData.rfc} - ${userData.nombre} ${userData.apellido_paterno}`
          };
          

          this.userOptions = [usuarioConEtiqueta];
          this.form.rfc = usuarioConEtiqueta;

          

        } catch (error) {
          console.error("FALLO en el 'try'. El dato en localStorage no es un JSON válido:", error);
        }
      } else {
        console.error("FALLO: No se encontró la llave 'user' en localStorage.");
      }
    },


    async loadActivityData() {
      if (this.data) {
        this.form.idSecretaria = this.data.idSecretaria || "";
        this.form.nivelEstudio = this.data.nivelEstudio || "";
        this.form.nombreInstitucion = this.data.nombreInstitucion || "";
        this.form.areaEspecializacion = this.data.areaEspecializacion || "";

        // Busca el usuario por RFC en el arreglo users
        const usuarioEncontrado = this.users.find(
          (user) => user.rfc === this.data.rfc
        );
        if (usuarioEncontrado) {
          this.form.rfc = {
            rfc: usuarioEncontrado.rfc,
            nameUser: `${usuarioEncontrado.nameUser}`,
          };
        } else {
          this.form.rfc = "";
        }
      }
      this.dataLoaded = true;
    },

    closeModal() {
      this.$emit("update:visible", false);
      this.dataLoaded = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        idSecretaria: "",
        rfc: "",
        nivelEstudio: "",
        nombreInstitucion: "",
        areaEspecializacion: "",
      };
    },

    // Función para manejar el envío del formulario
    submitForm() {

      

      const data = {
        idSecretaria: this.form.idSecretaria,
        rfc: this.form.rfc.rfc,
        nivelEstudio: this.form.nivelEstudio,
        nombreInstitucion: this.form.nombreInstitucion,
        areaEspecializacion: this.form.areaEspecializacion,
      };

      // Verifica si los campos del formulario están vacíos
      if (
        !this.form.rfc ||
        !this.form.nivelEstudio ||
        !this.form.nombreInstitucion ||
        !this.form.areaEspecializacion
      ) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Por favor rellena todos los campos",
          icon: "warning",
        });
        return;
      }

      if (this.form.idSecretaria === null || this.form.idSecretaria === "") {
        apiSecretaria
          .insertarDocente(data)
          .then((response) => {
            Swal.fire({
              title: "Documento insertado",
              text: "El Documento se ha insertado exitosamente",
              icon: "success",
            });
            this.closeModal();
            this.$emit("activityChanged");
          })
          .catch((error) => {
            console.error("Error detallado de Axios al intentar insertar:", error);
            Swal.fire({
              
              title: "Error",
              text: "Hubo un error insertado la Documento",
              icon: "error",
            });
          });
      } else if (
        this.form.idSecretaria != null ||
        this.form.idSecretaria != ""
      ) {
        apiSecretaria
          .editarDocente(this.form.idSecretaria, data) // Envía el FormData con el archivo
          .then((response) => {
            Swal.fire({
              title: "Documento editada",
              text: "El Documento se ha editado exitosamente",
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
    
  },
};
</script>
