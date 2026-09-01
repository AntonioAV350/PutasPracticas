// services/api.js
import axios from 'axios';

const API_URL = 'http://169.254.2.40:3000'; // Cambia esto según la URL de tu backend

export default {
  obtenerActividades() {
    return axios.get(`${API_URL}/tutorias/tutorias`);
  },
  buscarProgAcademico() {
    return axios.get(`${API_URL}/tutorias/buscarProgAcademico`);
  },

  buscarActividad(id) {
    return axios.get(`${API_URL}/tutorias/buscartutorias/${id}`);
  },

  insertarActividad(data) {
    return axios.post(`${API_URL}/tutorias/tutorias`, data);
  },

  editarActividad(id, data) {
    return axios.put(`${API_URL}/tutorias/tutorias/${id}`, data);
  },

  eliminarActividad(id) {
    return axios.delete(`${API_URL}/tutorias/eliminarActividad/${id}`);
  },
  // Agrega más funciones para otras peticiones si es necesario

  // services/api.js
  obtenerEvidencias(id) {
    return axios.get(`${API_URL}/tutorias/evidencias/${id}`);
  },
  insertarEvidencias(formData) {
    return axios.post(`${API_URL}/tutorias/evidencias`, formData);
  },
  eliminarEvidencia(id) {
    return axios.delete(`${API_URL}/tutorias/evidencias/${id}`);
  },
  actualizarEvidencias(id, formData) {
    return axios.put(
      `${API_URL}/tutorias/evidencias/${id}`,
      formData
    );
  },
};