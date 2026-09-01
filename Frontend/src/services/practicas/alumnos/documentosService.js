// src/services/practicas/alumnos/documentosService.js
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_BASE || 'http://localhost:3000') + '/api/practicas/alumnos/documentos';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Obtiene la lista de documentos para el alumno autenticado,
 * incluyendo su estado, fechas y si están bloqueados.
 */
async function getMisDocumentos() {
  const { data } = await api.get('/');
  if (data.ok) {
    return data.data; // El backend devuelve { ok: true, data: [...] }
  }
  throw new Error(data.error || 'No se pudieron cargar los documentos.');
}

/**
 * Sube un archivo para un tipo de documento específico.
 * @param {string} docKey - La clave del documento (ej. 'hoja-presentacion').
 * @param {File} file - El archivo a subir.
 * @param {function} onProgress - Callback para el progreso de la subida.
 */
async function uploadDocumento(docKey, file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docKey', docKey);
  // Podríamos necesitar enviar la matrícula también, dependiendo del backend
  // const matricula = ...;
  // formData.append('matricula', matricula);

  const { data } = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });

  return data;
}

export default {
  getMisDocumentos,
  uploadDocumento, // Aún no tenemos el endpoint del backend para esto
};
