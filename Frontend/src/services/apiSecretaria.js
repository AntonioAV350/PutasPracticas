// services/api.js
import axios from 'axios';

const API_URL = 'http://169.254.2.40:3000'; // Cambia esto según la URL de tu backend

export default {

  obtenerDocentes() {
    return axios.get(`${API_URL}/secretaria/obtenerDocentes`);
  },

  insertarDocente(formData) {
    return axios.post(`${API_URL}/secretaria/insertarDocente`, formData);
  },
  actualizarDocente(id, formData) {
    return axios.put(`${API_URL}/secretaria/editarDocente/${id}`, formData);
  },
  eliminarDocente(id) {
    return axios.delete(`${API_URL}/secretaria/eliminarDocente/${id}`);
  },

  

   getUsuario() {
    return axios.get(`${API_URL}/secretaria/getUsuario`);
  },

  obtenerSecretaria() {
    return axios.get(`${API_URL}/secretaria/showAll`);
  },

  obtenerDocumentos(id) {
    return axios.get(`${API_URL}/secretaria/documentos/${id}`);
  },

  insertarDocumentos(formData) {
    return axios.post(`${API_URL}/secretaria/insertarDocumentos`, formData);
  },

  eliminarDocumentos(id) {
    return axios.delete(`${API_URL}/secretaria/eliminarDocumentos/${id}`);
  },
  actualizarDocumentos(id, formData) {
    return axios.put(
      `${API_URL}/secretaria/actualizarDocumentos/${id}`,
      formData
    );
  },

  getTipoDoc(){
    return axios.get(`${API_URL}/secretaria/getTipo/`);
  },

  obtener_Docentes() {
    return axios.get(`${API_URL}/secretaria/obtener_Docentes`);
  },

  insertar_Docente(formData) {
    return axios.post(`${API_URL}/secretaria/insertar_Docente`, formData);
  },
  actualizar_Docente(id, formData) {
    return axios.put(`${API_URL}/secretaria/editar_Docente/${id}`, formData);
  },
  eliminar_Docente(id) {
    return axios.delete(`${API_URL}/secretaria/eliminar_Docente/${id}`);
  },
  obtenerRoles() {
    return axios.get(`${API_URL}/secretaria/obtener_Roles`);
  }


};