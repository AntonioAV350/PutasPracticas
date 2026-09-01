<template>
  <!-- ✅ ÚNICA RAÍZ -->
  <div id="sidebar-root">

    <!-- Overlay SOLO en móvil cuando el menú está abierto -->
    <div
      v-if="sideBarOpen"
      class="fixed inset-0 bg-black/40 z-40 md:hidden"
      @click="toggleSidebar"
    />

    <!-- SIDEBAR -->
    <div
      v-if="rolesReady"
      id="main-nav"
      class="fixed top-0 left-0 h-screen w-64 bg-primaryBlue dark:bg-[#2D3748]
             shadow-lg z-50 overflow-y-auto
             transition-transform duration-300 ease-in-out will-change-transform
             md:translate-x-0"
      :class="sideBarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-0 md:hidden'"
    >
      <div class="mb-4 px-4">
        <router-link to="/home" @click="handleNav">
          <div class="home w-full h-24 flex items-center pl-4 mr-4 rounded-lg shadow-lg cursor-pointer hover:text-white">
            <img class="h-18 flex" src="../../assets/unach.png" alt="Logo unach 2023" />
          </div>
        </router-link>

        <!-- ADMINISTRADOR -->
        <p
          v-if="esAdmin()"
          class="pl-4 text-sm font-semibold mt-4 mb-1 uppercase text-white tracking-widest border-b border-gray-600"
        >
          Administrador
        </p>
        <router-link to="/agregarMateria" v-if="esAdmin()" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-user text-2xl mr-2"></i>
            <span class="text-white">Usuarios</span>
          </div>
        </router-link>
      </div>

      <!-- ENSEÑANZA -->
      <div class="mb-4 px-4">
        <p
          v-if="esDocente() || esAdminDeModulo('Enseñanza')"
          class="pl-4 text-sm font-semibold mb-1 uppercase text-white tracking-widest border-b border-gray-600"
        >
          Enseñanza
        </p>
        <router-link to="/ensenanza" v-if="esDocente() || esAdminDeModulo('Enseñanza')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-folder-open text-2xl mr-2"></i>
            <span class="text-white">Actividades</span>
          </div>
        </router-link>
        <router-link to="/agregarMateria" v-if="esAdminDeModulo('Enseñanza')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-book text-2xl mr-2"></i>
            <span class="text-white">Materias</span>
          </div>
        </router-link>
        <router-link to="/asignarMateria" v-if="esAdminDeModulo('Enseñanza')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-id-card text-2xl mr-2"></i>
            <span class="text-white">Asignar Materias</span>
          </div>
        </router-link>
      </div>

      <!-- TUTORÍAS -->
      <div class="mb-4 px-4">
        <p
          v-if="esAdmin() || esDocente()"
          class="pl-4 text-sm font-semibold mb-1 uppercase text-white tracking-widest border-b border-gray-600"
        >
          Tutorías
        </p>
        <router-link to="/tutorias" v-if="esAdmin() || esDocente()" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-folder-open text-2xl mr-2"></i>
            <span class="text-white">Actividades</span>
          </div>
        </router-link>
      </div>

      <!-- INVESTIGACIÓN -->
      <div class="mb-4 px-4">
        <p
          v-if="esDocente() || esAdminDeModulo('Investigacion')"
          class="pl-4 text-sm font-semibold mb-1 uppercase text-white tracking-widest border-b border-gray-600"
        >
          Investigación
        </p>
        <router-link to="/investigacion" v-if="esDocente() || esAdminDeModulo('Investigacion')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-folder-open text-2xl mr-2"></i>
            <span class="text-white">Actividades</span>
          </div>
        </router-link>
        <router-link to="/reportesInvestigacion" v-if="esDocente() || esAdminDeModulo('Investigacion')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-book text-2xl mr-2"></i>
            <span class="text-white">Reportes</span>
          </div>
        </router-link>
      </div>

      <!-- SECRETARÍA -->
      <div class="mb-4 px-4">
        <p
          v-if="esAdminDeModulo('Secretaria') || tieneRol('EMPRESARIO')"
          class="pl-4 text-sm font-semibold mb-1 uppercase text-white tracking-widest border-b border-gray-600"
        >
          Secretaría
        </p>
        <router-link to="/secretaria" v-if="esAdminDeModulo('Secretaria') || tieneRol('EMPRESARIO')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-folder-open text-2xl mr-2"></i>
            <span class="text-white">Actividades</span>
          </div>
        </router-link>
        <router-link to="/agregarDocente" v-if="esAdminDeModulo('Enseñanza')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-user text-2xl mr-2"></i>
            <span class="text-white">Agregar Docentes</span>
          </div>
        </router-link>
      </div>

      <!-- PRÁCTICAS -->
      <div class="mb-4 px-4">
        <p
          v-if="esDocente() || esAdminDeModulo('Practicas')"
          class="pl-4 text-sm font-semibold mb-1 uppercase text-white tracking-widest border-b border-gray-600"
        >
          Prácticas Profesionales
        </p>
        <router-link to="/practicas/resumen" v-if="esDocente() || esAdminDeModulo('Practicas')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-chart-bar text-2xl mr-2"></i>
            <span class="text-white">Información</span>
          </div>
        </router-link>
        <router-link to="/practicas/fechas" v-if="esAdminDeModulo('Practicas')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-calendar text-2xl mr-2"></i>
            <span class="text-white">Fechas</span>
          </div>
        </router-link>
        <router-link to="/practicas/alumnos" v-if="esAdminDeModulo('Practicas') || tieneRol('SECRETARIA')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-users text-2xl mr-2"></i>
            <span class="text-white">Consultar Alumnos</span>
          </div>
        </router-link>
        <router-link to="/practicas/empresas" v-if="esAdminDeModulo('Practicas')" @click="handleNav">
          <div class="w-full flex items-center text-SecundaryGold h-10 pl-4 hover:bg-SecundaryGold rounded-lg cursor-pointer hover:text-white">
            <i class="pi pi-building text-2xl mr-2"></i>
            <span class="text-white">Empresas</span>
          </div>
        </router-link>
      </div>

      <!-- MODO -->
      <div class="mb-4 px-4">
        <p class="pl-4 text-sm font-semibold mb-2 uppercase text-white tracking-widest border-b border-gray-600">
          Modo
        </p>
        <label for="check" class="bg-gray-100 cursor-pointer relative w-32 h-10 rounded-full">
          <input type="checkbox" @change="toggleDarkMode" id="check" class="border sr-only peer" :checked="isDarkMode" />
          <span class="flex items-center justify-center relative w-3/5 h-4/5 bg-gray-900 absolute rounded-full left-1 top-1 peer-checked:bg-gray-600 peer-checked:left-12 transition-all duration-500">
            <i :class="isDarkMode ? 'pi pi-moon text-white' : 'pi pi-sun text-white'"></i>
          </span>
        </label>
      </div>
    </div>

    <!-- Cargando -->
    <div v-else class="p-4 text-white">Cargando permisos…</div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

/* ==== Normalización de roles / helpers ==== */
const sinAcentos = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function canon(rol = "") {
  if (!rol) return "";
  let r = String(rol).trim();
  r = sinAcentos(r).toUpperCase().replace(/[ \.-]+/g, "_");
  const map = {
    "SUPER_ADMINISTRADOR": "SUPERADMIN",
    "SUPER_ADMIN": "SUPERADMIN",
    "SUPERADMIN": "SUPERADMIN",
    "ADMINISTRADOR": "ADMINISTRADOR",
    "DOCENTE": "DOCENTE",
    "SECRETARIA": "SECRETARIA",
    "EMPRESARIO": "EMPRESARIO",
    "ENSENANZA": "ENSENANZA",
    "INVESTIGACION": "INVESTIGACION",
    "PRACTICAS": "PRACTICAS",
    "TUTORIAS": "TUTORIAS",
    "SECRETARIA_ACADEMICA": "SECRETARIA",
    "PRACTICAS_ADMIN": "ADMIN_PRACTICAS",
    "ADMIN_PRACTICAS": "ADMIN_PRACTICAS",
    "ADMINISTRADOR_PRACTICAS": "ADMIN_PRACTICAS",
    "INVESTIGACION_ADMIN": "ADMIN_INVESTIGACION",
    "ADMIN_INVESTIGACION": "ADMIN_INVESTIGACION",
    "ADMINISTRADOR_INVESTIGACION": "ADMIN_INVESTIGACION",
    "ENSENANZA_ADMIN": "ADMIN_ENSENANZA",
    "ADMIN_ENSENANZA": "ADMIN_ENSENANZA",
    "ADMINISTRADOR_ENSENANZA": "ADMIN_ENSENANZA",
    "SECRETARIA_ADMIN": "ADMIN_SECRETARIA",
    "ADMIN_SECRETARIA": "ADMIN_SECRETARIA",
    "ADMINISTRADOR_SECRETARIA": "ADMIN_SECRETARIA",
  };
  if (!map[r] && /^(ENSENANZA|INVESTIGACION|PRACTICAS|SECRETARIA|TUTORIAS)_ADMIN$/.test(r)) {
    const m = r.match(/^(.*)_ADMIN$/);
    if (m) return `ADMIN_${m[1]}`;
  }
  return map[r] || r;
}
function readJSON(key) { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } }
function getRolesCanonFromLS() {
  const rs = readJSON("roles");
  if (Array.isArray(rs) && rs.length) return rs.map(canon);
  const permisosObj = readJSON("permisos");
  const arr = permisosObj?.data?.permisos;
  if (Array.isArray(arr) && arr.length) return arr.map(p => canon(p?.Permiso || p));
  const user = readJSON("user");
  if (user) {
    if (Array.isArray(user.roles) && user.roles.length) return user.roles.map(canon);
    if (Array.isArray(user.permisos) && user.permisos.length) return user.permisos.map(canon);
    if (user.rol) return [canon(user.rol)];
    if (user.role) return [canon(user.role)];
    if (user.nombre_rol) return [canon(user.nombre_rol)];
  }
  return [];
}

export default {
  name: "Sidebar",
  computed: {
    ...mapState(["sideBarOpen", "roles", "rolesLoaded"]),
    ...mapGetters(["tienePermiso"]),
    rolesReady() {
      // Renderiza solo si hay roles (Vuex o LS)
      if (this.rolesLoaded && Array.isArray(this.roles) && this.roles.length > 0) return true;
      const ls = getRolesCanonFromLS();
      return Array.isArray(ls) && ls.length > 0;
    },
  },
  data() {
    return { isDarkMode: localStorage.getItem("darkMode") === "true" };
  },
  methods: {
    handleNav() {
      // cerrar en móvil al navegar
      if (window.innerWidth < 768 && this.$store?.state?.sideBarOpen) {
        this.$store.dispatch("toggleSidebar");
      }
    },
    esDev() {
      try { return (import.meta?.env?.MODE === "development") || (process?.env?.NODE_ENV === "development"); }
      catch { return false; }
    },
    tieneRol(rol) {
      const R = canon(rol);
      if (typeof this.tienePermiso === "function") {
        try { if (this.tienePermiso(R)) return true; } catch {}
      }
      const fromVuex = (Array.isArray(this.roles) ? this.roles : []).map(canon);
      const fromLS = getRolesCanonFromLS();
      const all = [...new Set([...fromVuex, ...fromLS])];
      if (all.includes("SUPERADMIN")) return true;
      if (all.includes("ADMINISTRADOR")) return true;
      return all.includes(R);
    },
    esSuperAdmin() {
      return this.tieneRol("SUPERADMIN") || localStorage.getItem("DEV_SUPERADMIN") === "1" || this.esDev();
    },
    esAdmin() { return this.esSuperAdmin(); },
    esDocente() { return this.tieneRol("DOCENTE") || this.esSuperAdmin(); },
    esAdminDeModulo(modulo) {
      if (this.esSuperAdmin()) return true;
      const MOD = canon(modulo);
      return this.tieneRol(`ADMIN_${MOD}`);
    },
    toggleSidebar() { this.$store.dispatch("toggleSidebar"); },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem("darkMode", this.isDarkMode);
      if (this.isDarkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    },
  },
  mounted() {
    // aplica dark mode inicial
    if (this.isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    // abre por defecto en desktop si estaba cerrado
    if (window.innerWidth >= 768 && this.$store?.state?.sideBarOpen === false) {
      this.$store.dispatch("openSidebar" in this.$store._actions ? "openSidebar" : "toggleSidebar");
    }
  },
};
</script>

<style>
@media screen and (max-width: 767px) { .home { margin-top: 125px; } }
@media screen and (max-width: 900px) { .home { margin-top: 110px; } }
</style>
