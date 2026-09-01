<template>
  <div
    class="w-full bg-white dark:bg-[#404040] dark:shadow-gray-950 shadow-xl border rounded-lg mb-3 p-5 border-transparent">
    <!-- Otros elementos de tu plantilla... -->
    <div v-if="!showModal1 && !showModal2" @click="showModal1 = true" class="flex space-x-9">
      <button
        class="bg-transparent border border-blue-500 text-blue-500 font-bold rounded transform transition duration-300 hover:scale-110 flex flex-col items-center justify-center p-4">
        <img src="../../../assets/report/report.jpg" alt="Icono 1" class="w-24 h-24 mb-2" />
        <!-- Ajusta el margen como desees -->
        Reportes generados por estatus.
      </button>
      <button @click.stop="showModal2 = true"
        class="bg-transparent border border-green-500 text-green-500 font-bold rounded transform transition duration-300 hover:scale-110 flex flex-col items-center justify-center p-4">
        <img src="../../../assets/report/3301542.png" alt="Icono 2" class="w-24 h-24 mb-2" />
        Reportes generados por fecha.
      </button>
    </div>

    <div v-if="showModal1" class="">
      <!-- Contenido del Modal 1 -->
      <button class="bg-primaryBlue p-2 rounded-xl text-white font-bold mb-5" @click="showModal1 = false">
        Regresar
      </button>
      <div class="w-full bg-white shadow-xl border rounded-lg border-gray-300 mb-3">
        <div class="w-full p-4">
          <div class="w-full">
            <h1 class=" font-bold text-zinc-800 mb-2">Imprimir por:</h1>
            <div class="mb-3 flex gap-5">
              <button class="bg-SecundaryGold p-2 rounded-md text-white font-bold hover:bg-primaryBlue"
                @click="generarPDFPorEstado(1)">
                Proyectos Activos
              </button>
              <button class="bg-SecundaryGold p-2 rounded-md text-white font-bold hover:bg-primaryBlue"
                @click="generarPDFPorEstado(2)">
                Proyectos Pendientes
              </button>
              <button class="bg-SecundaryGold p-2 rounded-md text-white font-bold hover:bg-primaryBlue"
                @click="generarPDFPorEstado(3)">
                Proyectos Finalizados
              </button>
            </div>
            <DataTableComponent :data="proyectos" :columns="columns" :dtoptions="dtoptions">
              <template #headers>
                <th>ID</th>
                <th>Nombre</th>
                <th>Fecha Registro</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Linea de Investigacion</th>
                <th>Lider del Proyecto</th>
                <th>Estatus</th>
              </template>
            </DataTableComponent>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal 2 -->
    <div v-if="showModal2" class="">
      <button class="bg-primaryBlue p-2 rounded-xl text-white font-bold mb-5" @click="showModal2 = false">
        Regresar
      </button>

      <div class="my-3 flex gap-5">
        <input type="date" v-model="fechaInicio"
          class="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-SecundaryGold focus:border-transparent transition duration-300 ease-in-out" />
        <input type="date" v-model="fechaFin"
          class="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-SecundaryGold focus:border-transparent transition duration-300 ease-in-out" />
        <button class="bg-SecundaryGold p-3 rounded-xl text-white font-bold hover:bg-primaryBlue"
          @click="generarPDFPorFechas">
          Generar Reporte
        </button>
      </div>
      <!-- Contenido del Modal 2 -->
      <div class="w-full bg-white shadow-xl border rounded-lg border-gray-300 mb-3">
        <div class="w-full p-4">
          <div class="w-full">
            <DataTableComponent :data="proyectos" :columns="columns" :dtoptions="dtoptions">
              <template #headers>
                <th>ID</th>
                <th>Nombre</th>
                <th>Fecha registro</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Linea de Investigacion</th>
                <th>Lider del Proyecto</th>
                <th>Estatus</th>
              </template>
            </DataTableComponent>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DataTableComponent from "../../Plantillas/DataTableComponent.vue";
import apiInvestigacion from "../../../services/apiInvestigacion";
import ModalFormComponent from "../../Investigacion/Modals/FormProyectos.vue";
import dayjs from "dayjs";
import colaboradoresModal from "../../Investigacion/Modals/ColaboradoresModal.vue";
import evidenciasModal from "../../Investigacion/Modals/EvidenciasModal.vue";
import ProyectoDetallesModal from "../Modals/ProyectoDetallesModal.vue";
import HeaderModule from "../../HeaderModuleComponent.vue";
import logoSuperior from "../../../assets/LogoSuperior";
import logoInferior from "../../../assets/LogoInferior";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  props: {
    projectData: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    DataTableComponent,
    ModalFormComponent,
    colaboradoresModal,
    evidenciasModal,
    ProyectoDetallesModal,
    HeaderModule,
  },
  data() {
    return {
      proyectos: [],
      fechaInicio: null,
      fechaFin: null,
      showModal: false,
      editingId: null,
      modalData: "",
      isModalVisible: false,
      isModalEvidenciaVisible: false,
      showModal1: false,
      showModal2: false,
      isProyectoDetallesVisible: false,
      selectedProject: {},
      selectedProjectCollaborators: [],

      columns: [
        { data: "id" },
        { data: "nombre" },
        {
          data: "fecha_registro",
          render: function (data, type, row) {
            if (type === "display" || type === "filter") {
              return dayjs(data).format("YYYY-MM-DD");
            }
            return data;
          },
        },
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
                  '<span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>';
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
            return badgeHTML;
          },
        },
      ],
      dtoptions: {
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
      },
    };
  },
  mounted() {
    this.$store.dispatch("setSelectedOption", "Investigación - Reportes");
    this.obtenerProyectos();
    console.log(this.proyectos);
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
        // Verificar si se hizo clic en el botón de editar
        if (event.target.matches(".btn-editar-proyecto")) {
          const id = event.target.getAttribute("data-id");
          this.cargarDatosParaEditar(id);
        }
      });
    });
  },
  methods: {
    toggleDarkMode() {
      this.$store.commit("toggleDarkMode");
      document.body.classList.toggle("dark-mode");
    },
    generarPDFPorEstado(estado) {
      const proyectosFiltrados = this.proyectos.filter((p) => p.estatus === estado);

      const doc = new jsPDF();

      // Agregar logo superior
      doc.addImage(logoSuperior, 'JPEG', 5, 5, 195, 15);

      // Añadir tabla con AutoTable
      const startY = 25; // Ajusta este valor según sea necesario
      doc.autoTable({
        startY: startY, // Asegúrate de que esto esté debajo del logo superior
        head: [["ID", "Nombre"]], // ... otros encabezados de columna
        body: proyectosFiltrados.map((proyecto) => [proyecto.id, proyecto.nombre]),
        columnStyles: {
          0: { cellWidth: 15 }, // Ejemplo de ajustar el ancho de una columna
          // ... ajustes para otras columnas
        },
        didDrawPage: function (data) {
          // Esta función se puede usar para añadir cosas como números de página
        },
        // ... otras opciones y estilos de AutoTable
      });

      const centroX = doc.internal.pageSize.width / 2 - 100 / 2;
      // Agregar logo inferior
      doc.addImage(logoInferior, 'JPEG', centroX, doc.internal.pageSize.height - 10, 100, 5);

      // Guardar el PDF generado
      doc.save(`reporte_proyectos_${estado}.pdf`);
    }
    ,

    generarPDFPorFechas() {
      const fechaInicio = dayjs(this.fechaInicio);
      const fechaFin = dayjs(this.fechaFin);

      const proyectosFiltrados = this.proyectos.filter(
        (p) =>
          dayjs(p.fecha_registro).isAfter(fechaInicio) &&
          dayjs(p.fecha_registro).isBefore(fechaFin)
      );
      const datosTabla = proyectosFiltrados.map((proyecto) => {
        return {
          id: proyecto.id,
          nombre: proyecto.nombre,
          fecha_registro: dayjs(proyecto.fecha_registro).format("YYYY-MM-DD"),
        };
      });
      const doc = new jsPDF();

      //doc.text('Reporte de Proyectos por Fecha', 10, 10);
      doc.autoTable({
        didDrawPage: (data) => {
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
        head: [["ID", "Nombre", "Fecha Registro"]],
        body: datosTabla.map((proyecto) => [
          proyecto.id,
          proyecto.nombre,
          proyecto.fecha_registro,
        ]),
        startY: 30,
        styles: { fontSize: 8 },
        // ... otras configuraciones de AutoTable ...
      });

      doc.save(`reporte_proyectos_${this.fechaInicio}_${this.fechaFin}.pdf`);
    },
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
      this.obtenerProyectos(); // Esta función ya esta definida para obtener las actividades
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
  },
};
</script>

<style>
body.dark-mode {
  background-color: #1a1a1a;
  color: #f0f0f0;
  /* Otros estilos para el modo oscuro */
}
</style>
