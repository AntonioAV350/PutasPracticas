<template>
  <div class="w-full bg-white dark:bg-[#2D3748] dark:shadow-gray-950 unach-table">
    <DataTable 
      :data="localData" 
      :columns="columns"
      class="dt-responsive table table-striped table-bordered m-0 bg-white dark:bg-[#2D3748] dark:text-gray-200 dark:border-white"
      :options="dtoptions"
    >
      <thead>
        <tr>
          <slot name="headers"></slot>
        </tr>
      </thead>
    </DataTable>
  </div>
</template>

<style scoped>
/* Contenedor de la tabla con esquinas redondeadas */
.unach-table :deep(table.dataTable) {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px; /* 👈 aquí controlas el redondeado */
  overflow-x: auto;    /* Permite scroll horizontal si la tabla es muy ancha */
  overflow-y: visible; /* Permite que los menús se desborden verticalmente */
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); /* sombra ligera opcional */
}

/* Encabezado */
.unach-table :deep(table.dataTable thead th) {
  background-color: #003366;
  color: white;
  font-weight: 700;
  text-align: center;
  border-top: 2px solid #003366;
  border-bottom: 2px solid #003366;
  padding: 10px;
}

/* Redondear solo las esquinas superiores */
.unach-table :deep(table.dataTable thead th:first-child) {
  border-top-left-radius: 12px;
}
.unach-table :deep(table.dataTable thead th:last-child) {
  border-top-right-radius: 12px;
}

/* Zebra */
.unach-table :deep(table.dataTable tbody tr:nth-child(odd)) {
  background-color: #fff8e1;
}
.unach-table :deep(table.dataTable tbody tr:nth-child(even)) {
  background-color: #ffffff;
}

/* Hover */
.unach-table :deep(table.dataTable tbody tr:hover) {
  background-color: #e9f0f7;
}

/* Esquinas inferiores (última fila) */
.unach-table :deep(table.dataTable tbody tr:last-child td:first-child) {
  border-bottom-left-radius: 12px;
}
.unach-table :deep(table.dataTable tbody tr:last-child td:last-child) {
  border-bottom-right-radius: 12px;
}
</style>
<script>
import DataTable from 'datatables.net-vue3';
import DataTableLib from 'datatables.net-bs5';
import Select from 'datatables.net-select';
import ButtonsHtml5 from 'datatables.net-buttons/js/buttons.html5';
import print from 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-responsive-dt';

import JsZip from 'jszip';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

window.JSZip = JsZip;
pdfMake.vfs = pdfFonts.vfs;
window.pdfMake = pdfMake;

DataTable.use(DataTableLib);
DataTable.use(Select);
DataTable.use(ButtonsHtml5);
DataTable.use(print);

export default {
  components: { DataTable },
  props: {
    data: { type: Array, required: true },
    columns: { type: Array, required: true },
    dtoptions: {
      type: Object,
      default: () => ({ responsive: true, autoWidth: false }),
    },
  },
  data() {
    return { localData: this.data };
  },
  mounted() { console.log('DataTable mounted', this.localData); },
  watch: {
    data(newData) { this.localData = newData; },
  },
};
</script>
