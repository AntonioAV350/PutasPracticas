import axios from "axios";

const API_URL = "http://169.254.2.40:3000";

export default {
  insertarProyecto(data) {
    return axios.post(`${API_URL}/investigacion/proyectos_investigacion`, data);
  },

  obtenerProyectos() {
    return axios.get(`${API_URL}/investigacion/proyectos_investigacion`);
  },

  obtenerProyectoPorId(idProyecto){
    return axios.get(`${API_URL}/investigacion/proyectos_investigacion/${idProyecto}`);
  },

  editarProyecto(id, data) {
    return axios.put(`${API_URL}/investigacion/proyectos_investigacion/${id}`, data);
  },

  obtenerColaboradores(idColaborador) {
    return axios.get(`${API_URL}/investigacion/colaboradores/${idColaborador}`);
  },

  insertarColaborador(data) {
    return axios.post(`${API_URL}/investigacion/colaboradores`, data);
  },

  editarColaborador(id, data) {
    return axios.put(`${API_URL}/investigacion/colaboradores/${id}`, data);
  },

  eliminarColaborador(id) {
    return axios.delete(`${API_URL}/investigacion/colaboradores/${id}`);
  },

  insertarEvidencias(formData) {
    return axios.post(`${API_URL}/investigacion/insertarEvidencias`, formData);
  },

  obtenerEvidencias(idProyecto) {
    return axios.get(`${API_URL}/investigacion/evidencias/${idProyecto}`);
  },

  eliminarEvidencia(id) {
    return axios.delete(`${API_URL}/investigacion/evidencias/${id}`);
  },
};
