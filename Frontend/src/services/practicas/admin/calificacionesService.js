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

export default {
  async obtenerCalificacion(matricula, practica) {
    const { data } = await api.get(`/calificaciones/${matricula}/${practica}`);
    return data?.data || null;
  },
  async guardarCalificacion(payload) {
    const { data } = await api.post('/calificaciones', payload);
    if (!data?.ok) throw new Error(data?.error || 'No se pudo guardar la calificación.');
    return data.data;
  },
};
