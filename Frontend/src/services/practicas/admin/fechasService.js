import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE || 'http://localhost:3000') + '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap(response) {
  if (!response?.data?.ok) {
    const error = response?.data?.error || 'Operación no completada.';
    throw new Error(error);
  }
  return response.data.data ?? null;
}

export default {
  async listar() {
    const res = await api.get('/fechas');
    return unwrap(res) || [];
  },
  async crear(payload) {
    const res = await api.post('/fechas', payload);
    return unwrap(res);
  },
  async actualizar(id, payload) {
    const res = await api.put(`/fechas/${id}`, payload);
    return unwrap(res);
  },
  async eliminar(id) {
    const res = await api.delete(`/fechas/${id}`);
    if (!res?.data?.ok) throw new Error(res?.data?.error || 'No se pudo eliminar.');
    return true;
  },
};
