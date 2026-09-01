<template>
  <section class="page" aria-labelledby="sd-title">
    <div class="content">
      <h1 id="sd-title" class="page-title">Subir Documentos</h1>

      <div v-if="isLoading" class="loading-state">
        <p>Cargando información de documentos...</p>
      </div>

      <div v-if="error" class="error-state">
        <p>Error al cargar: {{ error }}</p>
        <button @click="fetchDocs" class="btn btn-primary">Reintentar</button>
      </div>

      <div v-if="!isLoading && !error" class="cards">
        <article
          v-for="(doc, i) in docs"
          :key="doc.key"
          class="doc-card"
          :class="{ 'is-locked': doc.is_locked, 'is-approved': doc.estado_revision === 'APROBADO', 'is-rejected': doc.estado_revision === 'RECHAZADO' }"
          :aria-labelledby="`t-${doc.key}`"
        >
          <div class="doc-left">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="none" />
              <line x1="7" y1="8" x2="13" y2="8" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="7" y1="16" x2="17" y2="16" />
            </svg>

            <div class="doc-title" :id="`t-${doc.key}`">{{ doc.title }}</div>
            
            <div class="doc-status" :aria-live="polite">{{ doc.status_label }}</div>

            <div v-if="doc.formUrl" class="download">
              <a 
                :href="doc.is_locked ? 'javascript:void(0)' : doc.formUrl"
                :target="doc.is_locked ? '_self' : '_blank'"
                rel="noopener noreferrer"
                class="btn btn-primary"
                :class="{ 'disabled-link': doc.is_locked }"
                @click.prevent="doc.is_locked && $event.preventDefault()"
              >
                Abrir formulario
              </a>
              <span v-if="doc.help" class="hint">{{ doc.help }}</span>
            </div>
            
            <div v-if="doc.nombre_archivo && !doc.file" class="file-name" aria-live="polite">
              Archivo actual: <strong>{{ doc.nombre_archivo }}</strong>
            </div>
          </div>

          <div class="doc-actions">
            <input
              :id="`file-${i}`"
              ref="fileInputs"
              type="file"
              class="hidden-file"
              :accept="doc.accept || 'application/pdf'"
              @change="onChoose(i, $event)"
              :disabled="doc.is_locked"
            />
            <button class="btn btn-primary" type="button" @click="triggerFile(i)" :disabled="doc.is_locked">
              {{ doc.nombre_archivo ? 'Cambiar' : 'Adjuntar' }}
            </button>
            <button
              class="btn btn-danger"
              type="button"
              :disabled="!doc.file"
              @click="removeFile(i)"
            >
              Quitar
            </button>
            <button class="btn btn-gold" type="button" :disabled="!doc.file || doc.is_locked" @click="saveFile(i)">
              Guardar
            </button>
          </div>

          <div v-if="doc.file" class="file-name" aria-live="polite">
            Nuevo: {{ doc.file.name }}
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import documentosService from '../../../services/practicas/alumnos/documentosService';
import Swal from 'sweetalert2';

const docs = ref([]);
const isLoading = ref(true);
const error = ref(null);
const fileInputs = ref([]);

async function fetchDocs() {
  isLoading.value = true;
  error.value = null;
  try {
    const backendDocs = await documentosService.getMisDocumentos();
    // Añadir el campo 'file' local para manejar la UI
    docs.value = backendDocs.map(d => ({ ...d, file: null }));
  } catch (e) {
    error.value = e.message || 'Ocurrió un error desconocido.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchDocs);

function triggerFile(i) {
  fileInputs.value?.[i]?.click();
}

function onChoose(i, e) {
  const f = e.target.files?.[0];
  if (!f) return;
  docs.value[i].file = f;
}

function removeFile(i) {
  docs.value[i].file = null;
  if (fileInputs.value?.[i]) {
    fileInputs.value[i].value = '';
  }
}

async function saveFile(i) {
  const doc = docs.value[i];
  if (!doc.file) return;

  try {
    // TODO: Implementar la lógica de subida en el servicio
    // Por ahora, solo mostramos una alerta.
    // await documentosService.uploadDocumento(doc.key, doc.file, progressEvent => { ... });
    
    Swal.fire({
      icon: 'success',
      title: '¡Guardado (simulación)!',
      text: `Se ha guardado el archivo: ${doc.file.name}`,
      timer: 2000,
      showConfirmButton: false,
    });

    // Después de una subida exitosa, deberíamos volver a cargar la lista
    // para reflejar el nuevo estado del servidor.
    // fetchDocs();

  } catch (uploadError) {
    Swal.fire({
      icon: 'error',
      title: 'Error al subir',
      text: uploadError.message,
    });
  }
}
</script>

<style src="../../../assets/styles/SubirDocumentos.css" scoped>
/* Estilos adicionales para los nuevos estados */
.doc-card.is-locked {
  background-color: #f1f5f9; /* cool-gray-100 */
  opacity: 0.7;
}

.doc-card.is-locked .doc-actions button {
  cursor: not-allowed;
}

.doc-status {
  font-size: 0.875rem;
  color: #475569; /* cool-gray-600 */
  margin-top: 4px;
  font-weight: 500;
}

.is-approved .doc-status {
  color: #16a34a; /* green-600 */
}

.is-rejected .doc-status {
  color: #dc2626; /* red-600 */
}

.file-name {
  grid-column: span 2;
  font-size: 0.8rem;
  color: #475569;
  margin-top: 8px;
  padding: 4px 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
}

.disabled-link {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
</style>