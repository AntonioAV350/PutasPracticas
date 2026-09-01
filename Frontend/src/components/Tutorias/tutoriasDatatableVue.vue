<template>
  <div v-if="mostrarSelectorFechas"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
    <div class="p-5 border w-96 shadow-lg rounded-md bg-white">
      <!-- Aquí tu interfaz de selección de fechas -->
      <div class="flex flex-col items-center">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Seleccionar Rango de Fechas</h2>
        <div class="mb-3 w-full">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="fechaInicio">
            Fecha Inicio
          </label>
          <input type="date" v-model="fechaInicio"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="mb-6 w-full">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="fechaFin">
            Fecha Fin
          </label>
          <input type="date" v-model="fechaFin"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="flex items-center justify-between space-x-4">
          <button @click="generarReporte"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Generar Reporte
          </button>
          <button @click="mostrarSelectorFechas = false"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="w-full p-4">
    <div class="w-full">
      <DataTableComponent :data="actividades" :columns="columns" :dtoptions="dtoptions" @click="handleTableClick">
        <template #headers>
          <th>No_Actividad</th>
          <th>Nombre</th>
          <th>Descripcion</th>
          <th>Fecha</th>
          <th>Programa Academico</th>
          <th>Acciones</th>
        </template>
      </DataTableComponent>
    </div>
  </div>
  <ModalFormComponent :visible="showModal" :id_act="editingId" @update:visible="closeModal"
    @activityChanged="obtenerActividades" />

  <!-- Modal Component -->
  <evidenciasModal :show="isModalVisible" :actividadId="modalData" @close="isModalVisible = false"></evidenciasModal>
</template>

<script>
import api from "../../services/apiTutorias";
import DataTableComponent from "../Plantillas/DataTableComponent.vue"; // Asegúrate de ajustar la ruta
import Swal from "sweetalert2";
import dayjs from "dayjs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ModalFormComponent from "../Tutorias/Modals/FormActividades.vue";
import logoSuperior from "../../assets/LogoSuperior";
import logoInferior from "../../assets/LogoInferior";
import evidenciasModal from "./Modals/evidenciasModal.vue";

export default {
  components: {
    DataTableComponent,
    ModalFormComponent,
    evidenciasModal
  },
  props: {
    actividadesT: Array,
    idActividad: Number,
  },
  data() {
    return {
      fechaInicio: null,
      fechaFin: null,
      mostrarSelectorFechas: false,
      isModalVisible: false,
      modalData: "",
      actividades: [],
      columns: [
        { data: "id_actividad" },
        { data: "nombre_actividad" },
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
        { data: "nombre_carrera" },
        {
          title: "Acciones",
          data: null,
          render: (data, type, row) => {

            return `
            <button class="btn btn-warning btn-editar-actividad p-2" data-id="${data.id_actividad}">
              <i class="pi pi-pencil"></i>
            </button>
            <button class="btn btn-danger btn-eliminar-actividad p-2" data-id="${data.id_actividad}">
              <i class="pi pi-trash"></i>
            </button>
            <button class="btn btn-primary btn-detalle-actividad p-2" data-id="${data.id_actividad}">
              <i class="pi pi-info-circle"></i>
            </button>
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
            text: '<i class="fa-regular fa-file"></i> PDF',
            className: "bg-red-500 btn btn-danger border-0",
            customize: function (doc) {
              // Personalizar el documento PDF aquí

              // Añadir margen superior al título
              if (doc.content[0].text) { // Verifica si hay un título
                doc.content[0].margin = [0, 10, 0, 0]; // 50 es el margen superior
              }

              // Añadir margen superior a la tabla para moverla hacia abajo
              if (doc.content[1].table) { // Verifica si hay una tabla
                doc.content[1].margin = [0, 10, 0, 0]; // 70 es el margen superior
              }
              doc['header'] = function (currentPage, pageCount, pageSize) {
                return {
                  image: logoSuperior,
                  width: 550,
                  alignment: 'center',
                  margin: [0, 28, 0, 25]  // Ajusta según necesites
                };
              };

              doc['footer'] = function (currentPage, pageCount, pageSize) {
                return {
                  image: logoInferior,
                  width: 450,
                  alignment: 'center',
                  margin: [0, 10, 0, 10]  // Ajusta según necesites
                };
              };
            }
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
          {
            title: "Generar Reporte",
            text: "Reportes",
            className: "bg-cyan-500 text-white btn hover:bg-purple-600 hover:text-white",
            action: function (e, dt, node, config) {
              this.abrirSelectorFechas(); // Llamada al método para generar el reporte
            }.bind(this),
          },
        ],
      },
      // Para el formulario y la ventana flotante
      form: {
        nombre: "",
        fecha: "",
        descripcion: "",
        prog_academico: "",
        evidencias: null,
      },
      showModal: false, // Controla si se muestra o no la ventana flotante
      modalTitle: "",
      formMode: "", // Puede ser 'insertar' o 'editar'
      editingId: null, // ID del elemento que se está editando
    };
  },
  computed: {
    actividadesFiltradas() {
      if (this.idActividad) {
        return this.actividades.filter(
          (actividad) => actividad.idtipoActividad === this.idActividad
        );
      }
      return this.actividades;
    },
  },

  mounted() {
    this.obtenerActividades();
    this.$nextTick(() => {
      // ✅ DESPUÉS (Código corregido y robusto)
      document.addEventListener("click", (event) => {
        // Para el botón de editar
        const editButton = event.target.closest(".btn-editar-actividad");
        if (editButton) {
          const id = editButton.getAttribute("data-id");
          this.cargarActividadParaEditar(id);
          return; // Detiene la ejecución para no checar los otros botones innecesariamente
        }

        // Para el botón de eliminar
        const deleteButton = event.target.closest(".btn-eliminar-actividad");
        if (deleteButton) {
          const id = deleteButton.getAttribute("data-id");
          this.eliminarActividad(id);
          return;
        }

        // Para el botón de detalle
        const detailButton = event.target.closest(".btn-detalle-actividad");
        if (detailButton) {
          const id = detailButton.getAttribute("data-id");
          this.mostrarDetalleActividad(id);
        }
      });
    });

  },
  methods: {
    mounted() {
      this.obtenerActividades();
      this.$nextTick(() => {
        // ✅ DESPUÉS (Código corregido y robusto)
        document.addEventListener("click", (event) => {
          // Para el botón de editar
          const editButton = event.target.closest(".btn-editar-actividad");
          if (editButton) {
            const id = editButton.getAttribute("data-id");
            this.cargarActividadParaEditar(id);
            return; // Detiene la ejecución para no checar los otros botones innecesariamente
          }

          // Para el botón de eliminar
          const deleteButton = event.target.closest(".btn-eliminar-actividad");
          if (deleteButton) {
            const id = deleteButton.getAttribute("data-id");
            this.eliminarActividad(id);
            return;
          }

          // Para el botón de detalle
          const detailButton = event.target.closest(".btn-detalle-actividad");
          if (detailButton) {
            const id = detailButton.getAttribute("data-id");
            this.mostrarDetalleActividad(id);
          }
        });
      });

    },
    abrirSelectorFechas() {
      this.mostrarSelectorFechas = true;
    },
    generarReporte() {
      if (this.fechaInicio && this.fechaFin) {
        // Resta un día a la fecha de inicio para incluir el día completo desde el principio
        const fechaInicio = dayjs(this.fechaInicio).startOf('day');
        // Ajusta la fecha de fin para incluir el día completo hasta el final
        const fechaFin = dayjs(this.fechaFin).endOf('day');

        // Filtra las actividades para incluir desde el comienzo del día de la fecha de inicio hasta el final del día de la fecha de fin
        const actividadesFiltradas = this.actividades.filter(actividad =>
          dayjs(actividad.fechaActTutorias).isAfter(fechaInicio) && dayjs(actividad.fechaActTutorias).isBefore(fechaFin)
        );


        if (actividadesFiltradas.length === 0) {
          // No se encontraron reportes en esas fechas
          Swal.fire({
            title: 'Sin Resultados',
            text: 'No se encontraron reportes en el rango de fechas seleccionado.',
            icon: 'info',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
        } else {

          // Mapea las actividades filtradas para la tabla del PDF
          const datosTabla = actividadesFiltradas.map(actividad => {
            return {
              id: actividad.idActTutorias,
              nombre: actividad.nombreActTutorias,
              descripcion: actividad.descripcionActTutorias,
              fecha: dayjs(actividad.fechaActTutorias).format('YYYY-MM-DD'),
              prog_academico: actividad.prog_academico
            };
          });

          // Crear un nuevo documento PDF
          const doc = new jsPDF();

          // Agregar encabezados y contenido a la tabla
          doc.autoTable({
            didDrawPage: (data) => {
              // Agrega logotipos o cualquier otra personalización aquí
              doc.addImage(logoSuperior, 'JPEG', 5, 5, 195, 15);
              const centroX = (doc.internal.pageSize.width / 2) - (100 / 2);
              doc.addImage(logoInferior, 'JPEG', centroX, doc.internal.pageSize.height - 10, 100, 5);
            },
            head: [['No_Actividad', 'Nombre', 'Descripción', 'Fecha']],
            body: datosTabla.map(actividad => [actividad.id, actividad.nombre, actividad.descripcion, actividad.fecha]),
            startY: 30,
            styles: { fontSize: 8 },
          });

          // Guardar el PDF
          doc.save(`reporte_actividades_${this.fechaInicio}_${this.fechaFin}.pdf`);

          this.fechaInicio = null;
          this.fechaFin = null;

          this.mostrarSelectorFechas = false; // Cerrar el selector de fechas
          Swal.fire({
            title: '¡Éxito!',
            text: 'El reporte se ha generado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
        }
      } else {
        // Mostrar alerta de error si las fechas no son válidas
        Swal.fire({
          title: 'Error',
          text: 'Por favor, selecciona un rango de fechas válido.',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
    },
    obtenerActividades() {
      api
        .obtenerActividades()
        .then((response) => {
          this.actividades = response.data;
        })
        .catch((error) => {
          console.error("Error al obtener las actividades:", error);
        });
    },
    updateData() {
      this.obtenerActividades(); // Esta función ya la tienes definida para obtener las actividades
    },
    eliminarActividad(id) {
      Swal.fire({
        title: "¿Estás seguro de que deseas eliminar esta actividad?",
        text: "Si eliminas esta actividad, no podrás recuperarla.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, eliminar!",
      }).then((result) => {
        if (result.isConfirmed) {
          api
            .eliminarActividad(id)
            .then((response) => {
              Swal.fire(
                "Eliminado!",
                "El registro fue eliminado correctamente",
                "success"
              );
              this.obtenerActividades();
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
    cargarActividadParaEditar(id) {
      console.log("El ID que se pasará al modal es:", id);
      this.editingId = id; // Asigna el ID a editar
      this.showModal = true;
    },

    handleFileUpload(event) {
      this.form.evidencias = event.target.files;
    },
    // Nuevas funciones para abrir y cerrar la ventana flotante
    openModal() {
      this.modalTitle = "Registrar Actividad";
      this.resetForm(); // Aquí restableces el formulario
      this.formMode = "insertar"; // Establece el modo a insertar
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    mostrarDetalleActividad(id) {
      this.modalData = id; // Solo guarda el ID en lugar de todo el objeto de datos
      this.isModalVisible = true;
    },
  },

};
</script>