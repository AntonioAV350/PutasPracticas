<template>
  <!-- Ventana flotante con formulario -->
  <div v-if="visible && dataLoaded"
    class="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-8 rounded-lg w-3/4">
      <h1 class="text-xl mt-5 font-bold text-center py-4 bg-slate-500 text-white rounded">
        {{ modalTitle }} Proyecto de Investigacion
      </h1>
      <!-- Formulario de registro de proyectos -->
      <form class="w-full" @submit.prevent="submitForm">
        <input type="text" id="idProyecto" v-model="form.idProyecto" />

        <div class="flex flex-wrap -mx-3 mb-6">
          <!-- Columna Izquierda -->
          <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <!-- 2. Nombre del Proyecto -->
            <div class="mb-6">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="nombreProyecto">
                Nombre del Proyecto:
              </label>
              <input
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="nombreProyecto" v-model="form.nombreProyecto" type="text" placeholder="" />
            </div>
            <!-- 1. Ciclo Escolar -->
            <div class="mb-6">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="cicloEscolar">
                Ciclo Escolar:
              </label>
              <select id="cicloEscolar" v-model="form.cicloEscolar"
                class="w-full p-2 rounded border focus:border-blue-400">
                <option value="Agosto - Diciembre">Agosto - Diciembre</option>
                <option value="Enero - Junio">Enero - Junio</option>
              </select>
            </div>
            <!-- 3. Fecha de Inicio -->
            <div class="mb-6">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="fechaInicio">
                Fecha de Inicio:
              </label>
              <input type="date" id="fechaInicio" v-model="form.fechaInicio"
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" />
            </div>

            <!-- 4. Fecha Final -->
            <div class="mb-6">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="fechaFin">
                Fecha de Finalización:
              </label>
              <input type="date" id="fechaFin" v-model="form.fechaFin"
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" />
            </div>

            <!-- 5. Linea de Investigacion -->
            <div class="mb-6">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="lineaInvestigacion">
                Línea de Investigación:
              </label>
              <input type="text" id="lineaInvestigacion" v-model="form.lineaInvestigacion"
                class="w-full p-2 rounded border focus:border-blue-400" placeholder="Ingrese la línea de investigación" />
            </div>
          </div>


          <!-- Columna Derecha -->
          <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <!-- 6. Lider del Proyecto -->
            <div class="flex flex-wrap -mx-3 mb-6">
              <div class="w-full px-3">
                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="liderProyecto">
                  Lider del Proyecto:
                </label>
                <input
                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="liderProyecto" v-model="form.liderProyecto" type="text" placeholder="" />
              </div>
            </div>
            <!-- 9. Recursos Utilizados -->
            <div class="mb-6">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="recursosUtilizados">
                Recursos Utilizados:
              </label>
              <textarea id="recursosUtilizados" v-model="form.recursosUtilizados"
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder="Describe los recursos utilizados en el proyecto" rows="4">
              </textarea>
            </div>
            <!-- 10. Tipo de recursos -->
            <div class="mb-6">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="tipoRecurso">
                Tipo de Recurso:
              </label>
              <select id="tipoRecurso" v-model="form.tipoRecurso" class="w-full p-2 rounded border focus:border-blue-400">
                <option value="Propio">Propio</option>
                <option value="Financiado">Financiado</option>
              </select>
            </div>
          </div>
        </div>
        <!-- Contenedor para los botones, alineados a la derecha -->
        <div class="mt-4 flex justify-end space-x-4">
          <button @click="closeModal" class="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 text-lg">
            Cerrar
          </button>
          <button type="submit" class="bg-blue-800 text-white p-3 rounded-lg hover:bg-blue-900 text-lg">
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import apiInvestigacion from "../../../services/apiInvestigacion";
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import Swal from "sweetalert2";

export default {
  props: ["visible", "idProyecto"],
  components: { VueMultiselect },
  data() {
    return {
      form: {
        idProyecto: "",
        nombreProyecto: "",
        cicloEscolar: "",
        fechaInicio: "",
        fechaFin: "",
        lineaInvestigacion: "",
        liderProyecto: "",
        recursosUtilizados: "",
        tipoRecurso: "",
      },
      modalTitle: "Registrar",
      dataLoaded: false,
    };
  },

  watch: {
    // Este watcher se mantendrá para reaccionar a cambios de `visible`
    async visible(newVal) {
      if (newVal) {
        if (this.idProyecto) {
          (this.modalTitle = "Editar"), await this.loadActivityData();
        } else {
          this.modalTitle = "Registrar";
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
    async loadActivityData() {
      try {
        const response = await apiInvestigacion.obtenerProyectoPorId(
          this.idProyecto
        );

        const fechaInicio = new Date(response.data[0].fecha_inicio);
        const formattedDateInicio = `${fechaInicio.getFullYear()}-${(
          fechaInicio.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${fechaInicio
            .getDate()
            .toString()
            .padStart(2, "0")}`;

        const fechaFin = new Date(response.data[0].fecha_final);
        const formattedDateFinal = `${fechaFin.getFullYear()}-${(
          fechaFin.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${fechaFin.getDate().toString().padStart(2, "0")}`;

        this.form.idProyecto = response.data[0].id;
        this.form.nombreProyecto = response.data[0].nombre;
        this.form.cicloEscolar = response.data[0].ciclo_escolar;
        this.form.fechaInicio = formattedDateInicio;
        this.form.fechaFin = formattedDateFinal;
        this.form.lineaInvestigacion = response.data[0].linea_investigacion;
        this.form.liderProyecto = response.data[0].lider_de_proyecto;
        this.form.recursosUtilizados = response.data[0].recursos_utilizados;
        this.form.tipoRecurso = response.data[0].tipo_de_recurso;

        this.dataLoaded = true;
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Hubo un error obteniendo los datos del proyecto",
          icon: "error",
        });
      }
    },

    closeModal() {
      this.$emit("update:visible", false);
      this.dataLoaded = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        idProyecto: "",
        nombreProyecto: "",
        cicloEscolar: "",
        fechaInicio: "",
        fechaFin: "",
        lineaInvestigacion: "",
        liderProyecto: "",
        recursosUtilizados: "",
        tipoRecurso: "",
      };
    },

    // Función para manejar el envío del formulario
    submitForm() {
      const data = {
        idProyecto: this.form.idProyecto,
        nombreProyecto: this.form.nombreProyecto,
        cicloEscolar: this.form.cicloEscolar,
        fechaInicio: this.form.fechaInicio,
        fechaFin: this.form.fechaFin,
        lineaInvestigacion: this.form.lineaInvestigacion,
        liderProyecto: this.form.liderProyecto,
        recursosUtilizados: this.form.recursosUtilizados,
        tipoRecurso: this.form.tipoRecurso,
      };

      // Verifica si los campos del formulario están vacíos
      if (
        !this.form.nombreProyecto ||
        !this.form.cicloEscolar ||
        !this.form.fechaInicio ||
        !this.form.fechaFin ||
        !this.form.lineaInvestigacion ||
        !this.form.liderProyecto ||
        !this.form.recursosUtilizados ||
        !this.form.tipoRecurso
      ) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Por favor rellena todos los campos",
          icon: "warning",
        });
        return;
      }

      if (this.form.idProyecto === null || this.form.idProyecto === "") {
        apiInvestigacion
          .insertarProyecto(data)
          .then((response) => {
            Swal.fire({
              title: "Proyecto Registrado",
              text: "El proyecto se ha registrado exitosamente",
              icon: "success",
            });

            this.closeModal();
            this.$emit("projectsChanged");
          })
          .catch((error) => {
            Swal.fire({
              title: "Error",
              text: "Hubo un error enviando el formulario",
              icon: "error",
            });
          });
      } else if (this.form.idProyecto != null || this.form.idProyecto != "") {
        apiInvestigacion
          .editarProyecto(this.form.idProyecto, data) // Envía el FormData con el archivo
          .then((response) => {
            Swal.fire({
              title: "Proyecto actualizado",
              text: "Los datos del proyecto se han editado exitosamente",
              icon: "success",
            });
            this.closeModal();
            this.$emit("projectsChanged");
          })
          .catch((error) => {
            Swal.fire({
              title: "Error",
              text: "Hubo un error editando los datos del proyecto",
              icon: "error",
            });
          });
      }
    },
  },
  mounted() { },
};
</script>
