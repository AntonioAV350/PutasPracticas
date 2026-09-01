<template>
  <div
    class="w-full bg-white dark:bg-[#404040] dark:shadow-gray-950 border-transparent p-4"
  >
    <div class="w-full">
      <div
        v-if="mostrarSelectorFechas"
        class="fixed z-50 inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
      >
        <div class="p-5 border w-96 shadow-lg rounded-md bg-white">
          <!-- Aquí tu interfaz de selección de fechas -->
          <div class="flex flex-col items-center">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              Seleccionar Rango de Fechas
            </h2>
            <div class="mb-3 w-full">
              <label
                class="block text-gray-700 text-sm font-bold mb-2"
                for="fechaInicio"
              >
                Fecha Inicio
              </label>
              <input
                type="date"
                v-model="fechaInicio"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div class="mb-6 w-full">
              <label
                class="block text-gray-700 text-sm font-bold mb-2"
                for="fechaFin"
              >
                Fecha Fin
              </label>
              <input
                type="date"
                v-model="fechaFin"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div class="flex items-center justify-between space-x-4">
              <button
                @click="generarReporte"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Generar Reporte
              </button>
              <button
                @click="mostrarSelectorFechas = false"
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
      <DataTableComponent
        :data="actividadesFiltradas"
        :columns="columns"
        :dtoptions="dtoptions"
        class="data-table-custom dark:text-gray-200 dark:border-gray-600"
      >
        <template #headers>
          <th class="bg-gray-100 dark:bg-gray-700">ID</th>
          <th class="bg-gray-100 dark:bg-gray-700">Nombre</th>
          <th class="bg-gray-100 dark:bg-gray-700">Descripción</th>
          <th class="bg-gray-100 dark:bg-gray-700">Tipo</th>
          <th class="bg-gray-100 dark:bg-gray-700">Materia</th>
          <th class="bg-gray-100 dark:bg-gray-700">Ciclo Escolar</th>
          <th class="bg-gray-100 dark:bg-gray-700">Fecha</th>
          <th class="bg-gray-100 dark:bg-gray-700">Acciones</th>
        </template>
      </DataTableComponent>
      <!-- Modal Component -->
      <evidenciasModal
        :show="isModalVisible"
        :actividadId="modalData"
        @close="isModalVisible = false"
        class="dark:bg-gray-800 dark:text-gray-200"
      ></evidenciasModal>
    </div>
  </div>
</template>

<script>
import apiEnsenanza from "../../services/apiEnsenanza";
import DataTableComponent from "../Plantillas/DataTableComponent.vue";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import evidenciasModal from "./Modals/evidenciasModal.vue";

import logoSuperior from "../../assets/LogoSuperior";
import logoInferior from "../../assets/LogoInferior";

export default {
  components: {
    DataTableComponent,
    evidenciasModal,
  },
  props: {
    actividades: Array,
    idActividad: Number,
  },
  data() {
    return {
      fechaInicio: null,
      fechaFin: null,
      mostrarSelectorFechas: false,
      isModalVisible: false,
      modalData: "",
      columns: [
        { data: "idActEnsenanza" },
        { data: "nombreAct" },
        { data: "descripcionAct" },
        { data: "nombretipoAct" },
        { data: "nombreMateria" },
        { data: "cicloEscolar" },
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
                          <button class="btn-editar-actividad bg-yellow-500 text-white p-2 pt-3 rounded" data-id="${data.idActEnsenanza}"><i class="pi pi-pencil pointer-events-none"></i></button>
                          <button class="btn-eliminar-actividad bg-red-500 text-white  p-2 pt-3  rounded" data-id="${data.idActEnsenanza}"><i class="pi pi-trash pointer-events-none"></i></button>
                          <button class="btn-detalle-actividad bg-blue-500 text-white p-2 pt-3 rounded" data-id="${data.idActEnsenanza}"><i class="pi pi-info-circle pointer-events-none"></i></button>
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
            className:
              "bg-green-500 btn btn-success border-0 hover:bg-green-600 text-white dark:bg-green-700 dark:text-gray-200 dark:hover:bg-green-800",
          },
          {
            tittle: "Reporte de actividades PAT",
            extend: "pdfHtml5",
            text: "PDF",
            className:
              "bg-red-500 btn btn-danger border-0 hover:bg-red-600 text-white dark:bg-red-700 dark:text-gray-200 dark:hover:bg-red-800",
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
            className:
              "bg-gray-500 btn btn-dark border-0 hover:bg-gray-600 text-white dark:bg-blue-700 dark:text-gray-200 dark:hover:bg-gray-800",
          },
          {
            tittle: "Reporte de actividades PAT",
            extend: "copy",
            text: "Copiar Texto",
            className:
              "bg-slate-300 btn btn-light border-0 hover:bg-slate-400 text-gray-700 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-700 ",
          },
          {
            title: "Generar Reporte",
            text: "Reportes",
            className:
              "bg-cyan-500 text-white btn hover:bg-cyan-600 hover:text-white",
            action: function (e, dt, node, config) {
              this.abrirSelectorFechas(); // Llamada al método para generar el reporte
            }.bind(this),
          },
        ],
      },
    };
  },
  computed: {
    actividadesFiltradas() {
      if (this.idActividad) {
        console.log(this.idActividad);
        return this.actividades.filter(
          (actividad) => actividad.idtipoActividad === this.idActividad,
          console.log("actividades filtradas", this.actividades)
        );
      }
      return this.actividades;
    },
  },

  mounted() {
    this.$nextTick(() => {
      document.addEventListener("click", (event) => {
        // Verificar si se hizo clic en el botón de editar
        if (event.target.matches(".btn-editar-actividad")) {
          const id = event.target.getAttribute("data-id");
          this.cargarActividadParaEditar(id);
        }
        // Verificar si se hizo clic en el botón de eliminar
        if (event.target.matches(".btn-eliminar-actividad")) {
          const id = event.target.getAttribute("data-id");
          this.eliminarActividad(id);
        }
        // Verificar si se hizo clic en el botón de detalle
        if (event.target.matches(".btn-detalle-actividad")) {
          const id = event.target.getAttribute("data-id");
          this.mostrarDetalleActividad(id);
        }
      });
    });
  },
  methods: {
    abrirSelectorFechas() {
      this.mostrarSelectorFechas = true;
    },
    generarReporte() {
      if (this.fechaInicio && this.fechaFin) {
        // Resta un día a la fecha de inicio para incluir el día completo desde el principio
        const fechaInicio = dayjs(this.fechaInicio).subtract(1, "day");
        // Ajusta la fecha de fin para incluir el día completo hasta el final
        const fechaFin = dayjs(this.fechaFin).add(1, "day");

        // Filtra las actividades para incluir desde el comienzo del día de la fecha de inicio hasta el final del día de la fecha de fin
        const actividadesFiltradas = this.actividades.filter(
          (actividad) =>
            dayjs(actividad.fecha).isAfter(fechaInicio) &&
            dayjs(actividad.fecha).isBefore(fechaFin)
        );

        if (actividadesFiltradas.length === 0) {
          // No se encontraron reportes en esas fechas
          Swal.fire({
            title: "Sin Resultados",
            text: "No se encontraron reportes en el rango de fechas seleccionado.",
            icon: "info",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
        } else {
          // Mapea las actividades filtradas para la tabla del PDF
          const datosTabla = actividadesFiltradas.map((actividad) => {
            return {
              id: actividad.idActEnsenanza,
              nombre: actividad.nombreAct,
              descripcion: actividad.descripcionAct,
              tipo: actividad.nombretipoAct,
              fecha: dayjs(actividad.fecha).format("YYYY-MM-DD"),
            };
          });

          // Crear un nuevo documento PDF
          const doc = new jsPDF();

          // Agregar encabezados y contenido a la tabla
          doc.autoTable({
            didDrawPage: (data) => {
              // Agrega logotipos o cualquier otra personalización aquí
              doc.addImage(logoSuperior, "JPEG", 5, 5, 195, 15);
              const centroX = doc.internal.pageSize.width / 2 - 100 / 2;
              doc.addImage(
                logoInferior,
                "JPEG",
                centroX,
                doc.internal.pageSize.height - 10,
                100,
                5
              );
            },
            head: [["ID", "Nombre", "Descripción", "Tipos", "Fecha"]],
            body: datosTabla.map((actividad) => [
              actividad.id,
              actividad.nombre,
              actividad.descripcion,
              actividad.tipo,
              actividad.fecha,
            ]),
            startY: 30,
            styles: { fontSize: 8 },
            // ... otras configuraciones de AutoTable ...
          });

          // Guardar el PDF
          doc.save(
            `reporte_actividades_${this.fechaInicio}_${this.fechaFin}.pdf`
          );

          this.fechaInicio = null;
          this.fechaFin = null;

          this.mostrarSelectorFechas = false; // Cerrar el selector de fechas
          Swal.fire({
            title: "¡Éxito!",
            text: "El reporte se ha generado correctamente.",
            icon: "success",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
        }
      } else {
        // Mostrar alerta de error si las fechas no son válidas
        Swal.fire({
          title: "Error",
          text: "Por favor, selecciona un rango de fechas válido.",
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      }
    },
    cargarActividadParaEditar(id) {
      const actividadAEditar = this.actividades.find(
        (act) => act.idActEnsenanza == id
      );
      this.$store.dispatch("setActividadAEditar", actividadAEditar);
    },
    eliminarActividad(id) {
      Swal.fire({
        title: "¿Estás seguro de eliminar la actividad?",
        text: "Esta acción no se puede revertir",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          apiEnsenanza
            .eliminarActividad(id)
            .then((response) => {
              Swal.fire(
                "Actividad eliminada",
                "La actividad se eliminó correctamente",
                "success"
              );
              this.$store.dispatch("cambiarBanderaActualizarTabla");
            })
            .catch((error) => {
              console.error("Error al eliminar la actividad:", error);
              Swal.fire(
                "Error al eliminar la actividad",
                "Ocurrió un error al eliminar la actividad",
                "error"
              );
            });
        }
      });
    },
    mostrarDetalleActividad(id) {
      this.modalData = id; // Solo guarda el ID en lugar de todo el objeto de datos
      this.isModalVisible = true;
    },
  },
};
</script>

<style>
/* Estilos para DataTable en Modo Oscuro */
.dark .data-table-custom td,
.dark .data-table-custom th {
  background-color: #535353;
  /* Color de fondo para las celdas en modo oscuro */
  color: #e0e0e0;
  /* Color del texto en modo oscuro */
}

/* Estilos adicionales para botones dentro de DataTable en Modo Oscuro */
.dark .btn-editar-actividad,
.dark .btn-eliminar-actividad,
.dark .btn-detalle-actividad {
  /* Color de fondo para botones en modo oscuro */
  color: #ffffff;
  /* Color del texto en botones en modo oscuro */
}
</style>
