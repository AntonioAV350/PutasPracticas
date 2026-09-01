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
        <h1 class="text-white font-bold py-3 px-4">Colaboradores</h1>
        <button @click="$emit('close')" class="mx-4">
          <span class="text-white font-bold text-lg">x</span>
        </button>
      </div>
      <div
        class="relative bg-white rounded-xl w-3/4 shadow-xl max-h-4/5-screen overflow-y-auto"
      ></div>
      <div class="modal-body p-4 overflow-y-auto">
        <h1
          class="text-xl mt-3 mb-5 font-bold text-center py-4 bg-slate-500 text-white rounded"
        >
          Añadir un Colaborador
        </h1>
        <div class="w-full p-6 shadow-lg rounded-md border border-gray-300">
          <form class="w-full" @submit.prevent="submitForm">
            <input type="hidden" v-model="form.idColaborador" />
            <input type="hidden" v-model="form.idProyecto" />

            <!-- Nombre del colaborador -->
            <div class="flex flex-wrap -mx-3 mb-6">
              <div class="w-full px-3">
                <label
                  class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  for="nombreColaborador"
                >
                  Nombre del Colaborador:
                </label>
                <input
                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="nombreColaborador"
                  v-model="form.nombreColaborador"
                  type="text"
                  placeholder="Nombre completo del colaborador"
                />
              </div>
            </div>

            <!-- Tipo de colaborador -->
            <div class="mb-6">
              <label
                class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                for="nombreColaborador"
              >
                Tipo de Colaborador:
              </label>
              <select
                id="tipoColaborador"
                v-model="form.tipoColaborador"
                class="w-full p-2 rounded border focus:border-blue-400"
              >
                <option value="Docente">Docente</option>
                <option value="Alumno">Alumno</option>
              </select>
            </div>

            <button
              type="submit"
              class="w-full bg-blue-800 text-white p-2 rounded hover:bg-blue-900"
            >
              Guardar
            </button>
          </form>
        </div>
        <h1
          class="text-xl mt-5 font-bold text-center py-4 bg-slate-500 text-white rounded"
        >
          Lista de Colaboradores
        </h1>
        <div
          class="w-full mt-4 p-2 shadow-xl rounded-md border border-gray-300"
        >
          <DataTableComponent :data="colaboradores" :columns="columns">
            <template #headers>
              <th>ID</th>
              <th>Nombre del Colaborador</th>
              <th>Tipo de Colaborador</th>
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
import apiInvestigacion from "../../../services/apiInvestigacion";
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
    projectId: {
      type: [Number, String],
      default: "",
    },
  },

  data() {
    return {
      colaboradores: [],
      maxColaboradores: 5,
      form: {
        idColaborador: "",
        idProyecto: "",
        nombreColaborador: "",
        tipoColaborador: "",
      },

      columns: [
        { data: "id_colaborador" },
        { data: "nombre" },
        { data: "tipo" },
        {
          title: "Acciones",
          data: null,
          render: (data, type, row) => {
            return `
                        <button class="btn-editar-colaborador bg-yellow-500 text-white p-2 pt-2 rounded" data-id="${data.id_colaborador}"><i class="pi pi-pencil pointer-events-none"></i></button>
                        <button class="btn-eliminar-colaborador bg-red-500 text-white  p-2 pt-2  rounded" data-id="${data.id_colaborador}"><i class="pi pi-trash pointer-events-none"></i></button>
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
          this.obtenerColaboradores();
          this.form.idProyecto = this.projectId;
        });
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      document.addEventListener("click", (event) => {
        // Verificar si se hizo clic en el botón de editar
        if (event.target.matches(".btn-editar-colaborador")) {
          const id = event.target.getAttribute("data-id");
          this.cargarColaboradorParaEditar(id);
        }

        // Verificar si se hizo clic en el botón de eliminar
        if (event.target.matches(".btn-eliminar-colaborador")) {
          const id = event.target.getAttribute("data-id");
          this.eliminarColaborador(id);
        }
      });
    });
  },

  methods: {
    resetForm() {
      this.form = {
        ...this.form,
        idColaborador: "",
        nombreColaborador: "",
        tipoColaborador: "",
      };
    },
    async obtenerColaboradores() {
      try {
        const response = await apiInvestigacion.obtenerColaboradores(
          this.projectId
        );
        this.colaboradores = response.data;
        // Ahora puedes buscar en this.colaboradores después de esta línea
      } catch (error) {
        console.error("Error al obtener los colaboradores:", error);
      }
    },
    cargarColaboradorParaEditar(id) {
      const colaborador = this.colaboradores.find( 
        (col) => col.id_colaborador == id
      );

      if (!colaborador) {
        console.error("No se pudo encontrar al colaborador para editar");
        Swal.fire(
          "Error",
          "No se pudo encontrar al colaborador para editar.",
          "error"
        );
        return;
      }

      // Asignar los datos del colaborador al formulario
      this.form.idColaborador = colaborador.id_colaborador;
      this.form.nombreColaborador = colaborador.nombre;
      this.form.tipoColaborador = colaborador.tipo;
    },
    eliminarColaborador(id) {
      Swal.fire({
        title:
          "¿Estás seguro de que deseas quitar este colaborador del proyecto?",
        text: "Si quitas este colaborador, no podrás recuperarlo.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, eliminar!",
      }).then((result) => {
        if (result.isConfirmed) {
          apiInvestigacion
            .eliminarColaborador(id)
            .then((response) => {
              Swal.fire(
                "Eliminado!",
                "El registro fue eliminado correctamente",
                "success"
              );
              this.obtenerColaboradores();
            })
            .catch((error) => {
              Swal.fire(
                "Error!",
                "Hubo un error eliminando el registro",
                "error"
              );
            });
        }
      });
    },
    submitForm() {
      const data = {
        idColaborador: this.form.idColaborador,
        idProyecto: this.form.idProyecto,
        nombreColaborador: this.form.nombreColaborador,
        tipoColaborador: this.form.tipoColaborador,
      };

      // Verifica si los campos del formulario están vacíos
      if (
        !this.form.nombreColaborador ||
        !this.form.tipoColaborador ||
        !this.form.idProyecto
      ) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Por favor rellena todos los campos",
          icon: "warning",
        });
        return;
      }

      if (this.form.idColaborador === null || this.form.idColaborador === "") {
        // Verifica si ya se alcanzó el límite de colaboradores
        if (this.colaboradores.length >= this.maxColaboradores) {
          Swal.fire({
            title: "Límite alcanzado",
            text: `No puedes agregar más de ${this.maxColaboradores} colaboradores.`,
            icon: "warning",
          });
          return;
        }

        apiInvestigacion
          .insertarColaborador(data)
          .then((response) => {
            Swal.fire({
              title: "Colaborador agregado",
              text: "El colaborador se ha agregado exitosamente",
              icon: "success",
            });
            this.resetForm();
            this.obtenerColaboradores();
          })
          .catch((error) => {
            Swal.fire({
              title: "Error",
              text: "Hubo un error enviando el formulario",
              icon: "error",
            });
          });
      } else if (
        this.form.idColaborador != null ||
        this.form.idColaborador != ""
      ) {
        apiInvestigacion
          .editarColaborador(this.form.idColaborador, data)
          .then((response) => {
            Swal.fire({
              title: "Colaborador actualizado",
              text: "El colaborador se ha actualizado exitosamente",
              icon: "success",
            });
            this.resetForm();
            this.obtenerColaboradores();
          })
          .catch((error) => {
            Swal.fire({
              title: "Error",
              text: "Hubo en error al actualizar al colaborador ",
              icon: "error",
            });
          });
      }
    },
  },
};
</script>
