<template>
  <div v-if="mostrarSelectorArea"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
    <div class="p-5 border w-96 shadow-lg rounded-md bg-white">
      <!-- Interfaz de selección de Área de Estudio -->
      <div class="flex flex-col items-center">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Generar Reporte por Área de Estudio</h2>
        <div class="mb-3 w-full">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="areaInput">
            Área de Estudio
          </label> 
          <input type="text" v-model="areaInput"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="flex items-center justify-between space-x-4">
          <button @click="generarReportePorArea"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Generar Reporte
          </button>
          <button @click="mostrarSelectorArea = false"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="w-full p-4">
    <div class="w-full">
      <DataTableComponent :data="secretariaData" :columns="columns" :dtoptions="dtoptions " >
        <template #headers>
          <th>ID</th>
          <th>RFC</th>
          <th>Nivel de Estudio</th>
          <th>Institución</th>
          <th>Area</th>
          <th>Acciones</th>
        </template>
      </DataTableComponent>
    </div>
  </div> 
  <ModalFormComponent :visible="showModal" :data="dataID" @update:visible="closeModal" @activityChanged="obtenerData" />

  <!-- Modal Component -->
  <evidenciasModal :show="isModalVisible" :idSecretaria="modalData" @close="isModalVisible = false"></evidenciasModal>
</template>

<script>
import apiSecretaria from "../../services/apiSecretaria";
import DataTableComponent from "../Plantillas/DataTableComponent.vue"; // Asegúrate de ajustar la ruta
import Swal from "sweetalert2";
import dayjs from "dayjs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ModalFormComponent from "../Secretaria/Modals/FormActividades.vue";
import logoSuperior from "../../assets/LogoSuperior";
import logoInferior from "../../assets/LogoInferior";
import evidenciasModal from "./Modals/evidenciasModal.vue";

export default {
  components: {
    DataTableComponent,
    ModalFormComponent,
    evidenciasModal,
  },
  props: {
    actividades: Array,
    idActividad: Number,
  },
  data() {
    return {
      areaInput: null,
      mostrarSelectorArea: false,
      isModalVisible: false,
      modalData: "",
      secretariaData: [],
      columns: [
        { data: "idSecretaria" },
        { data: "rfc" },
        { data: "nivelEstudio" },
        { data: "nombreInstitucion" },
        { data: "areaEspecializacion" },
        {
          title: "Acciones",
          data: null,
          render: (data, type, row) => {
            return `
                        <button title="Editar Registro" class="btn-editar-registro bg-yellow-500 text-white p-2 pt-3 rounded" data-id="${data.idSecretaria}"><i class="pi pi-pencil pointer-events-none"></i></button>
                        <button title="Eliminar Registro" class="btn-eliminar-registro bg-red-500 text-white  p-2 pt-3  rounded" data-id="${data.idSecretaria}"><i class="pi pi-trash pointer-events-none"></i></button>
                        <button title="Ver Evidencias" class="btn-detalle-actividad bg-blue-500 text-white p-2 pt-3 rounded" data-id="${data.idSecretaria}"><i class="pi pi-info-circle pointer-events-none"></i></button>
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
            tittle: "Reporte de actividades",
            extend: "excelHtml5",
            text: "Excel",
            className: "bg-green-500 btn btn-success border-0",
          },
          {
            tittle: "Reporte de actividades",
            extend: "pdfHtml5",
            text: '<i class="fa-regular fa-file"></i> PDF',
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
            tittle: "Reporte de actividades",
            extend: "print",
            text: "Imprimir",
            className: "bg-gray-500 btn btn-dark border-0",
          },
          {
            tittle: "Reporte de actividades",
            extend: "copy",
            text: "Copiar Texto",
            className: "bg-slate-300 btn btn-light border-0",
          },
          {
            title: "Generar Reporte",
            text: "Reportes",
            className: "bg-cyan-500 text-white btn hover:bg-purple-600 hover:text-white",
            action: function (e, dt, node, config) {
              this.abrirSelectorArea(); // Llamada al método para generar el reporte
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
      dataID: null
    };
  },

  mounted() {
    this.obtenerData();

    this.$nextTick(() => { 
      document.addEventListener("click", (event) => {
        // Verificar si se hizo clic en el botón de editar
        if (event.target.matches(".btn-editar-registro")) {
          const id = event.target.getAttribute("data-id");
          this.cargarEditar(id);
        }

        // Verificar si se hizo clic en el botón de eliminar
        if (event.target.matches(".btn-eliminar-registro")) {
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
    abrirSelectorArea() {
      this.mostrarSelectorArea = true;
    },
    generarReportePorArea() {
      if (this.areaInput) {
        const actividadesFiltradas = this.secretariaData.filter(actividad =>
          actividad.areaEspecializacion.toLowerCase().includes(this.areaInput.toLowerCase())
        );

        if (actividadesFiltradas.length === 0) {
          // No se encontraron reportes para el Área de Estudio ingresada
          Swal.fire({
            title: 'Sin Resultados',
            text: 'No se encontraron reportes para el Área de Estudio ingresada.',
            icon: 'info',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
        } else {
          // Mapea las actividades filtradas para la tabla del PDF
          const datosTabla = actividadesFiltradas.map(actividad => {
            return {
              id: actividad.idSecretaria,
              rfc: actividad.rfc,
              nivelEstudio: actividad.nivelEstudio,
              nombreInstitucion: actividad.nombreInstitucion,
              area: actividad.areaEspecializacion,
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
            head: [['ID', 'RFC', 'Nivel de Estudio', 'Institución', 'Área de Estudio']],
            body: datosTabla.map(actividad => [actividad.id, actividad.rfc, actividad.nivelEstudio, actividad.nombreInstitucion, actividad.area]),
            startY: 30,
            styles: { fontSize: 8 },
          });

          // Guardar el PDF
          doc.save(`reporte_actividades_${this.areaInput.toLowerCase()}.pdf`);

          this.areaInput = null;

          this.mostrarSelectorArea = false; // Cerrar el selector de Área de Estudio
          Swal.fire({
            title: '¡Éxito!',
            text: 'El reporte se ha generado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
        }
      } else {
        // Mostrar alerta de error si no se ha ingresado un Área de Estudio
        Swal.fire({
          title: 'Error',
          text: 'Por favor, ingresa un Área de Estudio válida.',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
    },
    updateData() {
      this.obtenerData(); // Esta función ya la tienes definida para obtener las actividades
    },
    obtenerData() {
      apiSecretaria
        .obtenerSecretaria()
        .then((response) => {
          this.secretariaData = response.data;
          // prueba para verificar que los datos se están obteniendo correctamente
          console.log("Datos recibidos:", this.secretariaData);
          console.log("Primera fila:", this.secretariaData[0]);

        })
        .catch((error) => {
          console.error("Error al obtener las actividades:", error);
        });
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
          apiSecretaria
            .eliminarDocente(id)
            .then((response) => {
              Swal.fire(
                "Eliminado!",
                "El registro fue eliminado correctamente",
                "success"
              );
              this.obtenerData();
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
    cargarEditar(id) {
      this.dataID = this.secretariaData.find((item) => item.idSecretaria == id);
      this.showModal = true;
    },
    openModal() {
      this.modalTitle = "Registrar Actividad";
      this.resetForm();
      this.formMode = "insertar";
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    mostrarDetalleActividad(id) {
      console.log(id);
      this.modalData = id;
      this.isModalVisible = true;
    },
  },
};
</script>
