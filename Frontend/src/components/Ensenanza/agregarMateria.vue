<template>
  <div class="container mx-auto">
    <div
      class="w-full bg-white dark:bg-[#404040] dark:shadow-gray-950 border-transparent shadow-xl border rounded-lg border-gray-300 mb-3"
    >
      <div class="m-3">
        <form @submit.prevent="submitForm" class="w-full mt-5">
          <input type="hidden" v-model="form.idMateria" />
          <div class="flex flex-wrap -mx-3 mb-6">
            <div class="w-full lg:w-1/3 px-3">
              <label
                class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                for="nombreMateria"
              >
                Nombre de la Materia:
              </label>
              <input
                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="nombreMateria"
                v-model="form.nombreMateria"
                type="text"
                placeholder="Ej. Taller de elaboración del informe de investigación"
              />
            </div>

            <div class="w-full lg:w-1/3 px-3">
              <label
                class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Semestre:
              </label>
              <vue-multiselect
                id="semestre"
                v-model="form.semestre"
                :options="semestre"
                label="nombresemestre"
                track-by="is_SG"
                placeholder="Selecciona un semestre"
                class="flex-grow"
              ></vue-multiselect>
            </div>
            <div class="w-full lg:w-1/3 px-3">
              <label
                class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Programa academico:
              </label>
              <Multiselect
                id="programa_academico"
                v-model="form.prog_academicos"
                :options="prog_academicos"
                label="nombreProg"
                track-by="idprog_academicos"
                placeholder="Selecciona un programa academico"
                class="flex-grow"
              />
            </div>
          </div>

          <!-- Botón de envío del formulario -->
          <div class="text-center mt-4">
            <button
              type="submit"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
    <div class="w-full bg-white dark:bg-[#404040] dark:shadow-gray-950 border-transparent shadow-xl border rounded-lg border-gray-300">
      <div class="w-full p-4">
        <DataTableComponent
          :data="dataMaterias"
          :columns="columns"
          :dtoptions="dtoptions"
        >
          <template #headers>
            <th>ID</th>
            <th>Nombre</th>
            <th>Semestre</th>
            <th>Grupo</th>
            <th>Programa Academico</th>
            <th>Acciones</th>
          </template>
        </DataTableComponent>
      </div>
    </div>
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import HeaderModule from "../HeaderModuleComponent.vue";
import apiEnsenanza from "../../services/apiEnsenanza";
import DataTableComponent from "../Plantillas/DataTableComponent.vue";
import Swal from "sweetalert2";

export default {
  components: {
    VueMultiselect,
    HeaderModule,
    DataTableComponent,
  },
  data() {
    return {
      dataMaterias: [],
      semestre: [],
      prog_academicos: [],
      form: {
        idMateria: "",
        nombreMateria: "",
        semestre: "",
        prog_academicos: "",
      },
      columns: [
        { data: "idMateria" },
        { data: "nombreMateria" },
        { data: "nombresemestre" },
        { data: "grupo" },
        { data: "nombreProg" },
        {
          title: "Acciones",
          data: null,
          render: (data, type, row) => {
            return `
                          <button class="btn-editar bg-yellow-500 text-white p-2 pt-3 rounded" data-id="${data.idMateria}"><i class="pi pi-pencil pointer-events-none"></i></button>
                          <button class="btn-eliminar bg-red-500 text-white  p-2 pt-3  rounded" data-id="${data.idMateria}"><i class="pi pi-trash pointer-events-none"></i></button>
                        `;
          },
        },
      ],
      dtoptions: {
        dom: "Bfrtip",
        language: {
          search: "Buscar",
          zeroRecords: "No hay registros para mostrar",
          info: "Mostrando del _START_ al _END_ de _TOTAL_ registros",
          infoFiltered: "(Filtrados de _MAX_ registros)",
          paginate: {
            first: "Primero",
            previous: "Anterior",
            next: "Siguiente",
            last: "Ultimo",
          },
        },
        buttons: [
          {
            tittle: "Reporte de actividades PAT",
            extend: "excelHtml5",
            text: "Excel",
            className: "bg-green-500 btn btn-success border-0",
          },
          {
            tittle: "Reporte de actividades PAT",
            extend: "pdfHtml5",
            text: "PDF",
            className: "bg-red-500 btn btn-danger border-0",
            customize: function (doc) {
              // Personalizar el documento PDF aquí
              // Añadir margen superior al título
              if (doc.content[0].text) {
                // Verifica si hay un título
                doc.content[0].margin = [0, 10, 0, 0]; // 50 es el margen superior
              }

              // Añadir margen superior a la tabla para moverla hacia abajo
              if (doc.content[1].table) {
                // Verifica si hay una tabla
                doc.content[1].margin = [0, 10, 0, 0]; // 70 es el margen superior
              }
              doc["header"] = function (currentPage, pageCount, pageSize) {
                return {
                  image: logoSuperior,
                  width: 550,
                  alignment: "center",
                  margin: [0, 28, 0, 25], // Ajusta según necesites
                };
              };

              doc["footer"] = function (currentPage, pageCount, pageSize) {
                return {
                  image: logoInferior,
                  width: 450,
                  alignment: "center",
                  margin: [0, 10, 0, 10], // Ajusta según necesites
                };
              };
            },
          },

          {
            tittle: "Reporte de actividades PAT",
            extend: "print",
            text: "Imprimir",
            className: "bg-gray-500 btn btn-dark border-0",
          },
          {
            tittle: "Reporte de actividades PAT",
            extend: "copy",
            text: "Copiar Texto",
            className: "bg-slate-300 btn btn-light border-0",
          },
        ],
      },
    };
  },
  created() {
    this.fetchSemestre();
    this.fetchProg();
  },
  mounted() {
    this.$store.dispatch("setSelectedOption", "Enseñanza - Agregar Materia");
    this.obtenerData();
    this.$nextTick(() => {
      document.addEventListener("click", (event) => {
        // Verificar si se hizo clic en el botón de editar
        if (event.target.matches(".btn-editar")) {
          const id = event.target.getAttribute("data-id");
          this.cargarParaEditar(id);
        }

        // Verificar si se hizo clic en el botón de eliminar
        if (event.target.matches(".btn-eliminar")) {
          const id = event.target.getAttribute("data-id");
          this.eliminarMateria(id);
        }
      });
    });
  },
  methods: {
    obtenerData() {
      apiEnsenanza
        .obtenerMaterias()
        .then((response) => {
          this.dataMaterias = response.data;
        })
        .catch((error) => {
          console.error("Error al obtener las actividades:", error);
        });
    },
    async fetchSemestre() {
      try {
        const response = await apiEnsenanza.getSemestre();
        this.semestre = response.data.map((semestre) => ({
          ...semestre,
          nombresemestre: `${semestre.semestre} - ${semestre.grupo}`,
        }));
      } catch (error) {
        console.error("Erro al conseguir la data", error);
      }
    },

    async fetchProg() {
      try {
        const response = await apiEnsenanza.getProg();
        this.prog_academicos = response.data;
      } catch (error) {
        console.error("Erro al conseguir la data", error);
      }
    },
    cargarParaEditar(id) {
      const materias = this.dataMaterias.find((item) => item.idMateria == id);
      if (materias) {
        this.form.idMateria = materias.idMateria;
        this.form.nombreMateria = materias.nombreMateria;

        const semestreSelected = this.semestre.find(
          (semestre) => semestre.is_SG == materias.semestre
        );
        this.form.semestre = semestreSelected ? semestreSelected : null;

        const progAcademicoSelected = this.prog_academicos.find(
          (prog_academico) =>
            prog_academico.idprog_academicos == materias.prog_academico
        );
        this.form.prog_academicos = progAcademicoSelected
          ? progAcademicoSelected
          : null;
      }
    },
    eliminarMateria(id) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          apiEnsenanza
            .eliminarMateria(id) // Asumiendo que tienes un método así en tu API
            .then((res) => {
              Swal.fire(
                "Eliminado",
                "El detalle ha sido eliminado.",
                "success"
              );
              this.obtenerData(); // Actualizar los datos
            })
            .catch((err) => {
              Swal.fire({
                title: "Error",
                text: "Hubo un error al eliminar el detalle",
                icon: "error",
              });
            });
        }
      });
    },
    submitForm() {
      if (
        !this.form.nombreMateria ||
        !this.form.semestre ||
        !this.form.prog_academicos
      ) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Debes seleccionar los datos",
          icon: "warning",
        });
        return;
      }
      const data = {
        idMateria: this.form.idMateria,
        nombreMateria: this.form.nombreMateria,
        semestre: this.form.semestre.is_SG,
        prog_academicos: this.form.prog_academicos.idprog_academicos,
      };

      let promise;

      if (this.form.idMateria) {
        promise = apiEnsenanza.actualizarMateria(this.form.idMateria, data);
      } else {
        promise = apiEnsenanza.insertarMateria(data);
      }

      promise
        .then((res) => {
          Swal.fire({
            title: "Operación exitosa",
            text: this.form.idMateria
              ? "La materia ha sido editado correctamente"
              : "La materia ha sido asignado correctamente",
            icon: "success",
          });
          this.form.idMateria = "";
          this.form.nombreMateria = "";
          this.form.semestre = null;
          this.form.prog_academicos = null;
          this.obtenerData();
        })
        .catch((err) => {
          Swal.fire({
            title: "Error",
            text: "Hubo un error al realizar la operación",
            icon: "error",
          });
          this.form.idMateria = "";
          this.form.nombreMateria = "";
          this.form.semestre = null;
          this.form.prog_academicos = null;
        });
    },
  },
};
</script>
