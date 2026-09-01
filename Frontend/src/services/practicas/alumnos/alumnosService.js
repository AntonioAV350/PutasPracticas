// src/services/alumnosService.js
import axios from 'axios';

const CARRERAS = {
  LCP: { clave: 'LCP', nombre: 'Licenciatura en Contaduría' },
  LIDTS: {
    clave: 'LIDTS',
    nombre: 'Ingeniería en Desarrollo y Tecnologías de Software',
    alias: ['Ingeniería en Software'],
  },
};

// Instancia local (sin http.js global)
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE || 'http://localhost:3000') + '/api',
  timeout: 15000,
});

// Si algún endpoint requiere token (opcional)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function pickCarreraInfo(form = {}) {
  const key = (form.licenciatura || '').toUpperCase();
  return CARRERAS[key] || null;
}

// Arma el payload que espera tu backend
function buildAlumnoConUsuarioPayload(form) {
  const username = (form.matricula || '').toUpperCase();
  const carrera = pickCarreraInfo(form);

  return {
    usuario: {
      username,
      password: form.password,
      nombre: form.nombres,
      apellido_paterno: form.apellidoP,
      apellido_materno: form.apellidoM,
      email: form.correo,
      // Opcionales: rfc, telefono, sexo ('MASCULINO'|'FEMENINO'|'OTRO'), status
    },
    alumno: {
      matricula: username,
      grado: Number(form.semestre) || null,     // 'grado' = semestre
      grupo: (form.grupo || '').toUpperCase(),
      id_carrera: carrera?.id ?? null,
      carrera_clave: carrera?.clave ?? null,
      carrera_nombre: carrera?.nombre ?? null,
    },
  };
}

export default {
  async crearAlumnoConUsuario(form) {
    const payload = buildAlumnoConUsuarioPayload(form);
    const { data } = await api.post('/alumnos-con-usuario', payload);
    return data; // { ok, usuario, alumno } | { ok:false, error }
  },

  // Extras si algún día los usas por separado:
  async crearUsuario(usuario) {
    const { data } = await api.post('/usuarios', usuario);
    return data;
  },
  async crearAlumno(alumno) {
    const { data } = await api.post('/alumnos', alumno);
    return data;
  },
};
