import axios from "axios";

const API_URL = "http://169.254.2.40:3000"; // Cambia esto según la URL de tu backend

export default {
  obtenerActividades() {
    return axios.get(`${API_URL}/ensenanza/showall`);
  },
  buscarTipoActividad() {
    return axios.get(`${API_URL}/ensenanza/buscarTipoActividad`);
  },
  buscarMaterias(rfc) {
    return axios.get(`${API_URL}/ensenanza/showMateriasByRfc/${rfc}`);
  },
  
  insertarActividad(formData) {
    return axios.post(`${API_URL}/ensenanza/insertarActividad`, formData);
  },
  actualizarActividad(id, formData) {
    return axios.put(`${API_URL}/ensenanza/editarActividad/${id}`, formData);
  },
  eliminarActividad(id) {
    return axios.delete(`${API_URL}/ensenanza/eliminarActividad/${id}`);
  },

  obtenerEvidencias(idEvidencia) {
    return axios.get(`${API_URL}/ensenanza/evidencias/${idEvidencia}`);
  },
  insertarEvidencias(formData) {
    return axios.post(`${API_URL}/ensenanza/insertarEvidencias`, formData);
  },
  eliminarEvidencia(id) {
    return axios.delete(`${API_URL}/ensenanza/eliminarEvidencias/${id}`);
  },
  actualizarEvidencias(id, formData) {
    return axios.put(
      `${API_URL}/ensenanza/actualizarEvidencias/${id}`,
      formData
    );
  },

  getUsuarios() {
    return axios.get(`${API_URL}/ensenanza/getUsuarios`);
  },
  getMaterias() {
    return axios.get(`${API_URL}/ensenanza/getMaterias`);
  },
  getSemestre() {
    return axios.get(`${API_URL}/ensenanza/getSemestre`);
  },
  getProg() {
    return axios.get(`${API_URL}/ensenanza/getProg`);
  },




  obtenerDetalleDocente() {
    return axios.get(`${API_URL}/ensenanza/getDetalleD`);
  },
  asignarMateriaDocente(formData) {
    return axios.post(`${API_URL}/ensenanza/asignarMateriaDocente`, formData);
  },
  editarMateriaDocente(id, formData) {
    return axios.put(
      `${API_URL}/ensenanza/editarMateriaDocente/${id}`,
      formData
    );
  },
  eliminarDetalleDocente(id) {
    return axios.delete(`${API_URL}/ensenanza/eliminarDetalleDocente/${id}`);
  },



  obtenerMaterias() {
    return axios.get(`${API_URL}/ensenanza/obtenerMaterias`);
  },
  insertarMateria(formData) {
    return axios.post(`${API_URL}/ensenanza/insertarMateria`, formData);
  },
  actualizarMateria(id, formData) {
    return axios.put(`${API_URL}/ensenanza/editarMateria/${id}`, formData);
  },
  eliminarMateria(id) {
    return axios.delete(`${API_URL}/ensenanza/eliminarMateria/${id}`);
  },



  

};
