// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

import ModulosView from "../views/ModulosView.vue";
import Home from "../views/Home.vue";
import TutoriasView from "../views/TutoriaView.vue";
import EnsenanzaView from "../views/EnsenanzaView.vue";
import asignarMateria from "../views/asignarMateria.vue";
import Login from "../views/Login.vue";
import InvestigacionView from "../views/InvestigacionView.vue";
import reportesInvestigacion from "../components/Investigacion/Reportes/reportesInvestigacion.vue";
import agregarMateria from "../components/Ensenanza/agregarMateria.vue";
import agregarDocente from "../components/Secretaria/agregarDocente.vue";
import NotFound from "../views/404.vue";
import NoPermisos from "../views/noPermisos.vue";
import SecretariaView from "../views/SecretariaView.vue";

// PRÁCTICAS (ADMIN)
import PracticasResumen from "../components/Practicas/admin/resumen.vue";
import PracticasFechas from "../components/Practicas/admin/agregarFechas.vue";
import PracticasAlumnos from "../components/Practicas/admin/consultarAlumnos.vue";
import PracticasEmpresas from "../components/Practicas/admin/consultarEmpresas.vue";

// ALUMNO (dashboard estudiante)
import DashboardStudent from "../components/Practicas/alumnos/DashboardStudent.vue";
import Alumno from "../components/Practicas/alumnos/Alumno.vue";
import CartaPresentacion from "../components/Practicas/alumnos/CartaPresentacion.vue";
import Empresas from "../components/Practicas/alumnos/Empresas.vue";
import Fechas from "../components/Practicas/alumnos/Fechas.vue";
import SubirDocumentos from "../components/Practicas/alumnos/SubirDocumentos.vue";
import AlumnoRegistro from "../components/Practicas/alumnos/AlumnoRegistro.vue";

/* ============ Normalización ============ */
const sinAcentos = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function canon(rol = "") {
  if (!rol) return "";
  let r = String(rol).trim();
  r = sinAcentos(r).toUpperCase().replace(/[ \.-]+/g, "_");

  const map = {
    SUPER_ADMINISTRADOR: "SUPERADMIN",
    SUPER_ADMIN: "SUPERADMIN",
    SUPERADMIN: "SUPERADMIN",

    ADMINISTRADOR: "ADMINISTRADOR",
    DOCENTE: "DOCENTE",
    SECRETARIA: "SECRETARIA",
    EMPRESARIO: "EMPRESARIO",
    ESTUDIANTE: "ESTUDIANTE",

    ENSENANZA: "ENSENANZA",
    INVESTIGACION: "INVESTIGACION",
    PRACTICAS: "PRACTICAS",
    TUTORIAS: "TUTORIAS",
    SECRETARIA_ACADEMICA: "SECRETARIA",

    PRACTICAS_ADMIN: "ADMIN_PRACTICAS",
    ADMIN_PRACTICAS: "ADMIN_PRACTICAS",
    ADMINISTRADOR_PRACTICAS: "ADMIN_PRACTICAS",

    INVESTIGACION_ADMIN: "ADMIN_INVESTIGACION",
    ADMIN_INVESTIGACION: "ADMIN_INVESTIGACION",
    ADMINISTRADOR_INVESTIGACION: "ADMIN_INVESTIGACION",

    ENSENANZA_ADMIN: "ADMIN_ENSENANZA",
    ADMIN_ENSENANZA: "ADMIN_ENSENANZA",
    ADMINISTRADOR_ENSENANZA: "ADMIN_ENSENANZA",

    SECRETARIA_ADMIN: "ADMIN_SECRETARIA",
    ADMIN_SECRETARIA: "ADMIN_SECRETARIA",
    ADMINISTRADOR_SECRETARIA: "ADMIN_SECRETARIA",
  };

  if (!map[r] && /^(ENSENANZA|INVESTIGACION|PRACTICAS|SECRETARIA|TUTORIAS)_ADMIN$/.test(r)) {
    const m = r.match(/^(.*)_ADMIN$/);
    if (m) return `ADMIN_${m[1]}`;
  }
  return map[r] || r;
}
const canonList = (list = []) =>
  (Array.isArray(list) ? list : []).map(canon).filter(Boolean);

/* ============ Hidratar roles desde cualquier fuente ============ */
function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function writeRolesCanon(rolesArr) {
  const norm = canonList(rolesArr || []);
  if (norm.length) {
    localStorage.setItem("roles", JSON.stringify(norm));
  }
  return norm;
}
function hydrateRolesFromAnything() {
  // 1) Si ya hay roles válidos, devolverlos
  let roles = readJSON("roles");
  if (Array.isArray(roles) && roles.length) {
    roles = writeRolesCanon(roles);
    return roles;
  }

  // 2) permisos viejo (estructura antigua)
  const permisosObj = readJSON("permisos");
  const listaPermisos = permisosObj?.data?.permisos;
  if (Array.isArray(listaPermisos) && listaPermisos.length) {
    const arr = listaPermisos.map((p) => p?.Permiso || p).filter(Boolean);
    if (arr.length) return writeRolesCanon(arr);
  }

  // 3) user contenedor
  const user = readJSON("user");
  if (user) {
    if (Array.isArray(user.roles) && user.roles.length) return writeRolesCanon(user.roles);
    if (Array.isArray(user.permisos) && user.permisos.length) return writeRolesCanon(user.permisos);
    if (user.rol) return writeRolesCanon([user.rol]);
    if (user.role) return writeRolesCanon([user.role]);
    if (user.nombre_rol) return writeRolesCanon([user.nombre_rol]);
  }

  // 4) nada -> vacío
  return [];
}

/* ============ Auth / helpers ============ */
function isAuthenticated() {
  // mejor checar token + user
  return !!localStorage.getItem("token") && !!localStorage.getItem("user");
}
function isDev() {
  try {
    if (typeof import.meta !== "undefined")
      return import.meta?.env?.MODE === "development";
  } catch {}
  try {
    return process?.env?.NODE_ENV === "development";
  } catch {}
  return false;
}
function isDevSuperAdmin() {
  return isDev() || localStorage.getItem("DEV_SUPERADMIN") === "1";
}

function getRolesCanon() {
  const hydrated = hydrateRolesFromAnything(); // asegura roles normalizados en LS
  return canonList(hydrated);
}
function isStudent() {
  return getRolesCanon().includes("ESTUDIANTE");
}

function hasAnyRole(allowList) {
  if (isDevSuperAdmin()) return true;
  const roles = getRolesCanon(); // ya normalizados
  const allow = canonList(allowList || []);

  if (roles.includes("SUPERADMIN")) return true;
  if (!allow.length) return true;
  return allow.some((r) => roles.includes(r));
}

/* ============ Rutas ============ */
const routes = [
  /* ---------- LOGIN / REGISTRO (públicas) ---------- */
  { path: "/login", name: "Login", component: Login, meta: { title: "SIGEA", hideChrome: true } },
  { path: "/registro", name: "AlumnoRegistro", component: AlumnoRegistro, meta: { title: "Registro de Alumno", hideChrome: true } },

  /* ---------- ADMIN (tu app original) ---------- */
  {
    path: "/",
    component: Home,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: { name: "home" } },
      {
        path: "home",
        name: "home",
        component: ModulosView,
        meta: { title: "Sistema de Gestión de Actividades" },
      },

      {
        path: "tutorias",
        name: "Tutorias",
        component: TutoriasView,
        meta: { title: "Tutorías", allow: ["ADMINISTRADOR", "DOCENTE"] },
      },

      {
        path: "ensenanza",
        name: "Enseñanza",
        component: EnsenanzaView,
        meta: { title: "Enseñanza", allow: ["DOCENTE"] },
      },

      {
        path: "/asignarMateria",
        name: "Asignar Materia",
        component: asignarMateria,
        meta: { title: "Asignación de Materia", allow: ["ADMINISTRADOR"] },
      },
      {
        path: "/agregarDocente",
        name: "Agregar Docente",
        component: agregarDocente,
        meta: { title: "Agregar Docente", allow: ["ADMINISTRADOR"] },
      },
      {
        path: "/agregarMateria",
        name: "Agregar Materia",
        component: agregarMateria,
        meta: { title: "Agregar Materia", allow: ["ADMINISTRADOR"] },
      },

      {
        path: "/secretaria",
        name: "Secretaria",
        component: SecretariaView,
        meta: { title: "Secretaría Académica" },
      },

      {
        path: "/investigacion",
        name: "Investigacion",
        component: InvestigacionView,
        meta: { title: "Coordinación de Investigación", allow: ["DOCENTE"] },
      },
      {
        path: "/reportesInvestigacion",
        name: "Reportes Investigación",
        component: reportesInvestigacion,
        meta: { title: "Reportes Investigación", allow: ["DOCENTE"] },
      },

      // PRÁCTICAS (ADMIN)
      {
        path: "practicas/resumen",
        name: "PracticasResumen",
        component: PracticasResumen,
        meta: {
          title: "Prácticas - Información",
          allow: ["DOCENTE", "PRACTICAS", "ADMIN_PRACTICAS"],
        },
      },
      {
        path: "practicas/fechas",
        name: "PracticasFechas",
        component: PracticasFechas,
        meta: {
          title: "Prácticas - Fechas",
          allow: ["ADMIN_PRACTICAS", "PRACTICAS_ADMIN", "ADMINISTRADOR_PRACTICAS"],
        },
      },
      {
        path: "practicas/alumnos",
        name: "PracticasAlumnos",
        component: PracticasAlumnos,
        meta: {
          title: "Prácticas - Consultar Alumnos",
          allow: ["SECRETARIA", "ADMIN_PRACTICAS", "PRACTICAS_ADMIN", "ADMINISTRADOR_PRACTICAS"],
        },
      },
      {
        path: "practicas/empresas",
        name: "PracticasEmpresas",
        component: PracticasEmpresas,
        meta: {
          title: "Prácticas - Empresas",
          allow: ["ADMIN_PRACTICAS", "PRACTICAS_ADMIN", "ADMINISTRADOR_PRACTICAS"],
        },
      },
    ],
  },

  /* ---------- ALUMNO (dashboard estudiante) ---------- */
  {
    path: "/alumno",
    component: DashboardStudent,
    meta: { requiresAuth: true, title: "Residencias" },
    children: [
      { path: "", redirect: { name: "AlumnoHome" } },
      {
        path: "inicio",
        name: "AlumnoHome",
        component: Alumno,
        meta: { requiresAuth: true, allow: ["ESTUDIANTE"], title: "Inicio" },
      },
      {
        path: "carta-presentacion",
        name: "AlumnoCarta",
        component: CartaPresentacion,
        meta: { requiresAuth: true, allow: ["ESTUDIANTE"], title: "Carta de Presentación" },
      },
      {
        path: "empresas",
        name: "AlumnoEmpresas",
        component: Empresas,
        meta: { requiresAuth: true, allow: ["ESTUDIANTE"], title: "Empresas" },
      },
      {
        path: "fechas",
        name: "AlumnoFechas",
        component: Fechas,
        meta: { requiresAuth: true, allow: ["ESTUDIANTE"], title: "Fechas" },
      },
      {
        path: "subir-documentos",
        name: "AlumnoSubir",
        component: SubirDocumentos,
        meta: { requiresAuth: true, allow: ["ESTUDIANTE"], title: "Subir Documentos" },
      },
    ],
  },

  { path: "/no-permisos", name: "NoPermisos", component: NoPermisos, meta: { title: "No Tienes Permisos" } },
  { path: "/404", name: "NotFound", component: NotFound, meta: { title: "404 Not Found" } },
  { path: "/:pathMatch(.*)*", redirect: { name: "NotFound" } },
];

const router = createRouter({ history: createWebHistory(), routes });

/* ============ Guard global ============ */
router.beforeEach((to, from, next) => {
  document.title = to.meta?.title || "SIGEA";

  // Asegura roles normalizados en LS antes de checks
  hydrateRolesFromAnything();

  // Ya logueado → no dejar /login ni /registro
  if ((to.path.toLowerCase() === "/login" || to.name === "AlumnoRegistro") && isAuthenticated()) {
    if (isStudent()) return next({ path: "/alumno/inicio" });
    return next({ path: "/home" });
  }

  // Rutas protegidas → exige login
  if (to.matched.some((r) => r.meta.requiresAuth) && !isAuthenticated()) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }

  // Chequeo de permisos por ruta
  const allow = to.meta?.allow;
  if (allow && !hasAnyRole(allow)) {
    return next("/no-permisos");
  }

  // Si el usuario es ESTUDIANTE y viene al root admin, llévalo a su dashboard
  if ((to.path === "/" || to.name === "home") && isAuthenticated() && isStudent()) {
    return next({ path: "/alumno/inicio" });
  }

  next();
});

export default router;
