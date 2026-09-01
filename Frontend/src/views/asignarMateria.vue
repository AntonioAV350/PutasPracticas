<template>
  <div class="container mx-auto">
    <div
      class="w-full bg-white shadow-xl border rounded-lg border-gray-300 mb-3"
    >
      <div class="m-3">
        <form @submit.prevent="submitForm" class="space-y-4">
          <input type="hidden" v-model="form.id_Det_d" />
          <div class="flex items-center justify-between space-x-4">
            <div class="flex items-center space-x-4 w-1/2">
              <label class="w-1/4">Docentes:</label>
              <multiselect
                id="usuarios"
                v-model="form.docente"
                :options="users"
                label="nameUser"
                track-by="rfc"
                placeholder="Selecciona un docente"
                class="flex-grow"
              ></multiselect>
              <a href="/agregarDocente" class="ml-2 px-3 py-2 bg-primaryBlue text-white rounded hover:bg-SecundaryGold"
              >
                +
              </a>
            </div>

            <div class="flex items-center space-x-4 w-1/2">
              <label class="w-1/4">Materias:</label>
              <vue-multiselect
                id="materias"
                v-model="form.materias"
                :options="materias"
                label="nombreMateria"
                track-by="idMateria"
                placeholder="Selecciona una materia"
                class="flex-grow"
              ></vue-multiselect>
              <a href="/agregarMateria" class="ml-2 px-3 py-2 bg-primaryBlue text-white rounded hover:bg-SecundaryGold"
              >
                +
              </a>
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
    <div class="w-full bg-white shadow-xl border rounded-lg border-gray-300">
      <div class="w-full p-4">
        <DataTableComponent
          :data="dataDetalleDocente"
          :columns="columns"
          :dtoptions="dtoptions"
        >
          <template #headers>
            <th>ID</th>
            <th>Docente</th>
            <th>Materia</th>
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
import apiEnsenanza from "../services/apiEnsenanza";
import DataTableComponent from "../components/Plantillas/DataTableComponent.vue";
import Swal from "sweetalert2";

export default {
  components: {
    VueMultiselect,
    DataTableComponent,
  },
  data() {
    return {
      dataDetalleDocente: [],
      dataDetalleM: [],
      users: [],
      selectedUser: null,
      materias: [],
      selectedMateria: null,
      form: {
        id_Det_d: "",
        docente: "",
        materias: "",
      },
      columns: [
        { data: "id_Det_d" },
        { data: "docente" },
        { data: "nombreMateria" },
        {
          title: "Acciones",
          data: null,
          render: (data, type, row) => {
            return `
                        <button class="btn-editar bg-yellow-500 text-white p-2 pt-3 rounded" data-id="${data.id_Det_d}"><i class="pi pi-pencil pointer-events-none"></i></button>
                        <button class="btn-eliminar bg-red-500 text-white  p-2 pt-3  rounded" data-id="${data.id_Det_d}"><i class="pi pi-trash pointer-events-none"></i></button>
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
    this.fetchUsers();
    this.fetchMaterias();
  },
  mounted() {
    this.$store.dispatch("setSelectedOption", "Enseñanza - Asignar Materia");
    this.obtenerData();
    this.$nextTick(() => {
      document.addEventListener("click", (event) => {
        // Verificar si se hizo clic en el botón de editar
        if (event.target.matches(".btn-editar")) {
          const id = event.target.getAttribute("data-id");
          this.cargarDetalleMParaEditar(id);
        }

        // Verificar si se hizo clic en el botón de eliminar
        if (event.target.matches(".btn-eliminar")) {
          const id = event.target.getAttribute("data-id");
          this.eliminarDetalleDocente(id);
        }
      });
    });
  },
  methods: {
    obtenerData() {
      apiEnsenanza
        .obtenerDetalleDocente()
        .then((response) => {
          this.dataDetalleDocente = response.data;
        })
        .catch((error) => {
          console.error("Error al obtener las actividades:", error);
        });
    },
    async fetchUsers() {
      try {
        const response = await apiEnsenanza.getUsuarios();
        this.users = response.data.map((user) => ({
          ...user,
          nameUser: `${user.n_plaza} - ${user.nombre_Doce}`,
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    async fetchMaterias() {
      try {
        const response = await apiEnsenanza.getMaterias();
        this.materias = response.data;
      } catch (error) {
        console.error("Error fetching materias:", error);
      }
    },
    cargarDetalleMParaEditar(id) {
      const detalle_m = this.dataDetalleDocente.find(
        (item) => item.id_Det_d == id
      );
      if (detalle_m) {
        this.form.id_Det_d = detalle_m.id_Det_d;
        this.form.docente = this.users.find(
          (user) => user.rfc == detalle_m.docente
        );
        this.form.materias = this.materias.find(
          (materia) => materia.idMateria == detalle_m.materia
        );
      }
    },
    eliminarDetalleDocente(id) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          apiEnsenanza.eliminarDetalleDocente(id)  // Asumiendo que tienes un método así en tu API
            .then(res => {
              Swal.fire(
                'Eliminado',
                'El detalle ha sido eliminado.',
                'success'
              );
              this.obtenerData(); // Actualizar los datos
            })
            .catch(err => {
              Swal.fire({
                title: 'Error',
                text: 'Hubo un error al eliminar el detalle',
                icon: 'error'
              });
            });
        }
      })
    },
    submitForm() {
      if (!this.form.docente || !this.form.materias) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Debes seleccionar tanto un docente como una materia",
          icon: "warning",
        });
        return;
      }
      const data = {
        id_Det_d: this.form.id_Det_d,
        docente: this.form.docente.rfc,
        materias: this.form.materias.idMateria,
      };

      let promise;

      if (this.form.id_Det_d) {
        promise = apiEnsenanza.editarMateriaDocente(this.form.id_Det_d, data);
      } else {

        promise = apiEnsenanza.asignarMateriaDocente(data);
      }

      promise
        .then((res) => {
          Swal.fire({
            title: "Operación exitosa",
            text: this.form.id_Det_d
              ? "La materia ha sido editado correctamente"
              : "La materia ha sido asignado correctamente",
            icon: "success",
          });
          this.form.id_Det_d = "";
          this.form.docente = null;
          this.form.materias = null;
          this.obtenerData();
        })
        .catch((err) => {
          Swal.fire({
            title: "Error",
            text: "Hubo un error al realizar la operación",
            icon: "error",
          });
          this.form.docente = null;
          this.form.materias = null;
        });
    },
  },
};
</script>
