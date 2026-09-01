// src/services/practicas/alumnos/perfilService.js
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE || 'http://localhost:3000') + '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
 * Actualiza los datos del perfil del alumno autenticado.
 * @param {object} studentData - El objeto con los datos del formulario.
 */
async function updateMyData(studentData) {
  // El endpoint es PUT /api/practicas/alumnos/me
  const { data } = await api.put('/practicas/alumnos/me', studentData);

  if (data.ok) {
    return data.data; // El backend devuelve { ok: true, data: <updated_user> }
  }
  throw new Error(data.error || 'No se pudieron actualizar los datos.');
}

/**
 * Obtiene el estado de todos los documentos del alumno autenticado.
 */
async function getMisDocumentos() {
  // El endpoint es GET /api/practicas/alumnos/documentos
  const { data } = await api.get('/practicas/alumnos/documentos');
  if (data.ok) {
    return data.data; // El backend devuelve { ok: true, data: { P1: [...], P2: [...], RES: [...] } }
  }
  throw new Error(data.error || 'No se pudieron obtener los documentos.');
}

export default {
  updateMyData,
  getMisDocumentos,
};