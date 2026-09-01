<template>
  <div class="w-full p-4">
    <div class="w-full">
      <DataTableComponent
        :data="proyectos"
        :columns="columns"
        :dtoptions="dtoptions"
      >
        <template #headers>
          <th>ID</th>
          <th>Nombre</th>
          <th>Fecha Inicio</th>
          <th>Fecha Fin</th>
          <th>Linea de Investigacion</th>
          <th>Lider del Proyecto</th>
          <th>Status</th>
          <th>Colaboradores</th>
          <th>Evidencias</th>
          <th>Acciones</th>
        </template>
      </DataTableComponent>
    </div>
  </div>
  <ModalFormComponent
    :visible="showModal"
    :idProyecto="editingId"
    @update:visible="closeModal"
    @projectsChanged="obtenerProyectos"
  />

  <!-- Modal Component -->
  <colaboradoresModal
    :show="isModalVisible"
    :projectId="modalData"
    @close="isModalVisible = false"
  ></colaboradoresModal>

  <!-- Modal Component -->
  <evidenciasModal
    :show="isModalEvidenciaVisible"
    :IdProject="modalData"
    @close="isModalEvidenciaVisible = false"
  ></evidenciasModal>

  <ProyectoDetallesModal
    :show="isProyectoDetallesVisible"
    :projectData="selectedProject"
    :collaboratorsData="selectedProjectCollaborators"
    @close="isProyectoDetallesVisible = false"
  />
</template>

<script>
import DataTableComponent from "../Plantillas/DataTableComponent.vue";
import apiInvestigacion from "../../services/apiInvestigacion";
import ModalFormComponent from "../Investigacion/Modals/FormProyectos.vue";
import dayjs from "dayjs";
import colaboradoresModal from "../Investigacion/Modals/ColaboradoresModal.vue";
import evidenciasModal from "../Investigacion/Modals/EvidenciasModal.vue";
import ProyectoDetallesModal from "./Modals/ProyectoDetallesModal.vue";
import Swal from "sweetalert2";

export default {
  components: {
    DataTableComponent,
    ModalFormComponent,
    colaboradoresModal,
    evidenciasModal,
    ProyectoDetallesModal,
  },
  data() {
    return {
      proyectos: [],
      showModal: false,
      editingId: null,
      modalData: "",
      isModalVisible: false,
      isModalEvidenciaVisible: false,

      isProyectoDetallesVisible: false,
      selectedProject: {},
      selectedProjectCollaborators: [],

      columns: [
        { data: "id" },
        { data: "nombre" },
        {
          data: "fecha_inicio",
          render: function (data, type, row) {
            if (type === "display" || type === "filter") {
              return dayjs(data).format("YYYY-MM-DD"); // ajusta el formato como desees
            }
            return data;
          },
        },
        {
          data: "fecha_final",
          render: function (data, type, row) {
            if (type === "display" || type === "filter") {
              return dayjs(data).format("YYYY-MM-DD"); // ajusta el formato como desees
            }
            return data;
          },
        },
        { data: "linea_investigacion" },
        { data: "lider_de_proyecto" },
        {
          data: "estatus",
          render: (data, type, row) => {
            let badgeHTML;
            switch (data) {
              case 0: // Rechazado
                badgeHTML =
                  '<span class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Rechazado</span>';
                break;
              case 1: // Activo
                badgeHTML =
                  '<span class="inline-flex items-center rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-red-600/10">Activo</span>';
                break;
              case 2: // En proceso
                badgeHTML =
                  '<span class="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10">En proceso</span>';
                break;
              case 3: // Finalizado
                badgeHTML =
                  '<span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">Finalizado</span>';
                break;
              default:
                badgeHTML =
                  '<span class="inline-flex items-center rounded-md bg-gray-500 px-2 py-1 text-xs font-medium text-white">Desconocido</span>';
            }

            // Botón para cambiar el estatus
            let buttonHTML = `<button class="flex btn-status bg-yellow-500 hover:bg-yellow-600 text-white p-2 pt-2 rounded transition duration-150 ease-in-out" data-id="${row.id}"><i class="pi pi-sync mt-0.5"></i>Status</button>`;

            // Devuelve el badge y el botón en una fila de flexbox
            return `<div class="flex items-center space-x-2">${badgeHTML}${buttonHTML}</div>`;
          },
        },

        {
          data: null,
          title: "Colaboradores",
          render: (data, type, row) => {
            return `
                        <button class="btn-colaboradores bg-blue-500 text-white p-2 pt-2 rounded" data-id="${data.id}">Colaboradores</button>
                      `;
          },
        },
        {
          data: null,
          title: "Evidencias",
          render: (data, type, row) => {
            return `
                        <button class="btn-evidencias bg-gray-500 text-white p-2 pt-2 rounded" data-id="${data.id}">Evidencias</button>
                      `;
          },
        },
        {
          title: "Acciones",
          data: null,
          render: (data, type, row) => {
            return `
                        <button class="btn-editar-proyecto bg-yellow-500 text-white p-2 pt-3 rounded" data-id="${data.id}"><i class="pi pi-pencil pointer-events-none"></i></button>
                        
                        <button class="btn-detalle-proyecto bg-blue-500 text-white p-2 pt-3 rounded" data-id="${data.id}"><i class="pi pi-info-circle pointer-events-none"></i></button>
                      `;
          }, 
        },
      ],
      dtoptions: {
        autoWidth: false,
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
            tittle: "Reporte de Proyectos de Investigacion",
            extend: "excelHtml5",
            text: "Excel",
            className: "bg-green-500 btn btn-success border-0 ",
          },
          {
            tittle: "Reporte de Proyectos de Investigacion",
            extend: "pdfHtml5",
            text: '<i class="fa-regular fa-file"></i> PDF',
            className: "bg-red-500 btn btn-danger border-0",
            customize: function (doc) {
              // Personalizar el documento PDF aquí

              // Añadir margen superior al títuloz
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
            tittle: "Reporte de Proyectos de Investigacion",
            extend: "print",
            text: "Imprimir",
            className: "bg-gray-500 btn btn-dark border-0",
          },
          {
            tittle: "Reporte de Proyectos de Investigacion",
            extend: "copy",
            text: "Copiar Texto",
            className: "bg-slate-300 btn btn-light border-0",
          },
        ],
      },
    };
  },
  mounted() {
    this.obtenerProyectos();

    this.$nextTick(() => {
      document.addEventListener("click", (event) => {
        // Verificar si se hizo clic en el botón de detalle
        if (event.target.matches(".btn-colaboradores")) {
          const id = event.target.getAttribute("data-id");
          this.mostrarDetalleColaboradores(id);
        }
      });

      document.addEventListener("click", (event) => {
        // Verificar si se hizo clic en el botón de detalle
        if (event.target.matches(".btn-evidencias")) {
          const id = event.target.getAttribute("data-id");
          this.mostrarDetalleEvidencias(id);
        }
      });

      document.addEventListener("click", (event) => {
        if (event.target.matches(".btn-detalle-proyecto")) {
          const id = parseInt(event.target.getAttribute("data-id"));
          this.mostrarDetalleProyecto(id);
        }
      });

      document.addEventListener("click", (event) => {
        if (event.target.matches(".btn-editar-proyecto")) {
          const id = event.target.getAttribute("data-id");
          this.cargarDatosParaEditar(id);
        }
      });

      document.addEventListener("click", (event) => {
        if (event.target.matches(".btn-status")) {
          const id = parseInt(event.target.getAttribute("data-id"));
          this.cambiarStatus(id);
        }
      });
    });
  },
  methods: {
    closeModal() {
      this.showModal = false;
    },
    obtenerProyectos() {
      apiInvestigacion
        .obtenerProyectos()
        .then((response) => {
          this.proyectos = response.data;
        })
        .catch((error) => {
          console.error("Error al obtener los proyectos:", error);
        });
    },
    updateData() {
      this.obtenerProyectos();
    },
    cargarDatosParaEditar(id) {
      this.editingId = id; // Asigna el ID a editar
      this.showModal = true;
    },
    mostrarDetalleColaboradores(id) {
      this.modalData = id; // Solo guarda el ID en lugar de todo el objeto de datos
      this.isModalVisible = true;
    },
    mostrarDetalleEvidencias(id) {
      this.modalData = id; // Solo guarda el ID en lugar de todo el objeto de datos
      this.isModalEvidenciaVisible = true;
    },
    mostrarDetalleProyecto(id) {
      const proyecto = this.proyectos.find((p) => p.id === id);
      this.selectedProject = proyecto;

      // Obtener colaboradores para el proyecto específico
      apiInvestigacion
        .obtenerColaboradores(id)
        .then((response) => {
          this.selectedProjectCollaborators = response.data;
          this.isProyectoDetallesVisible = true;
        })
        .catch((error) => {
          console.error("Error al obtener los colaboradores:", error);
        });
    },
    cambiarStatus(id) {
      Swal.fire({
        title: "Actualizar Estatus del Proyecto",
        showDenyButton: true,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#5CB85C",
        denyButtonColor: "#EF4444",
        cancelButtonColor: "#3B82F6",
        confirmButtonText: "Aceptar", 
        denyButtonText: "Rechazar",
        cancelButtonText: "Finalizar",
      }).then((result) => {
        let action = null;

        if (result.isConfirmed) {
          action = 2;
        } else if (result.isDenied) {
          action = 0;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          action = 3;
        } else if (result.dismiss === Swal.DismissReason.close) {
          
        }

        if (action !== null) {
          const data = {
            idProyecto: id,
            status: action,
          };

          apiInvestigacion
            .editarProyecto(data.idProyecto, data)
            .then((response) => {
              Swal.fire({
                title: `Status Actualizado`,
                text: `El estado del proyecto ha sido cambiado.`,
                icon: "success",
              });
              this.obtenerProyectos();
            })
            .catch((error) => {
              Swal.fire({
                title: "Error",
                text: "Hubo un problema al actualizar el proyecto.",
                icon: "error",
              });
            });
        }
      });
    },
  },
};
</script>
