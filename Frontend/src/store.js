import { createStore } from "vuex";

function normalizeRoles(input) {
  // Acepta:
  // - ["ADMINISTRADOR","DOCENTE"]
  // - [{ nombre_rol:"ADMINISTRADOR" }, { rol:"DOCENTE" }]
  // - [{ Permiso:"Super-Admin" }, ...] (compatibilidad antigua)
  if (!input) return [];
  return input
    .map((x) => {
      if (typeof x === "string") return x.toUpperCase();
      if (x?.nombre_rol) return String(x.nombre_rol).toUpperCase();
      if (x?.rol)        return String(x.rol).toUpperCase();
      if (x?.Permiso) {
        // Mapear permisos antiguos a roles nuevos
        const p = String(x.Permiso).toUpperCase();
        if (p === "SUPER-ADMIN") return "ADMINISTRADOR";
        if (p === "ENSEÑANZA" || p === "ENSENANZA" || p === "ENSEÑANZA-ADMIN" || p === "ENSENANZA-ADMIN") return "DOCENTE";
        if (p === "TUTORIAS" || p === "TUTORIAS-ADMIN") return "DOCENTE";
        if (p === "INVESTIGACION" || p === "INVESTIGACION-ADMIN") return "DOCENTE";
        if (p === "SECRETARIA" || p === "SECRETARIA-ADMIN") return "ADMINISTRADOR";
        return p; // fallback
      }
      return String(x).toUpperCase();
    })
    .filter(Boolean);
}

export default createStore({
  state: {
    sideBarOpen: false,
    actualizarTabla: false,
    actividadEditar: null,

    token: null,
    user: null,

    // Roles normalizados
    roles: [],
    rolesLoaded: false,

    selectedMateria: null,
    selectedOpcion: null,
  },

  getters: {
    sideBarOpen: (state) => state.sideBarOpen,

    // Getter robusto con wildcard ADMINISTRADOR
    tienePermiso:
      (state) =>
      (permiso) => {
        const wanted = String(permiso || "").toUpperCase();
        if (!wanted) return false;

        const list = Array.isArray(state.roles)
          ? state.roles.map((r) => String(r || "").toUpperCase())
          : [];

        // Si aún no cargan los roles, evita evaluar
        if (!state.rolesLoaded) return false;

        // ADMINISTRADOR = acceso total
        if (list.includes("ADMINISTRADOR")) return true;

        const ok = list.includes(wanted);
        console.log(`[GETTER] tienePermiso(${wanted}) →`, ok, "Roles:", list);
        return ok;
      },

    getSelectedMateria: (state) => state.selectedMateria,
    getSelectedOpcion: (state) => state.selectedOpcion,
  },

  mutations: {
    toggleSidebar(state) {
      state.sideBarOpen = !state.sideBarOpen;
    },
    CAMBIAR_BANDERA_ACTUALIZAR_TABLA(state) {
      state.actualizarTabla = !state.actualizarTabla;
    },
    SET_ACTIVIDAD_A_EDITAR(state, actividad) {
      state.actividadEditar = actividad;
    },

    SET_TOKEN(state, token) {
      state.token = token || null;
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    },
    SET_USER(state, userData) {
      state.user = userData || null;
      if (userData) localStorage.setItem("user", JSON.stringify(userData));
      else localStorage.removeItem("user");
    },

    // Roles
    SET_ROLES(state, roles) {
      state.roles = normalizeRoles(roles);
      state.rolesLoaded = true;

      // 🔥 Guardar también en localStorage para que el router los lea
      localStorage.setItem("roles", JSON.stringify(state.roles));

      console.log("✅ Roles cargados en Vuex y localStorage:", state.roles);
    },
    CLEAR_ROLES(state) {
      state.roles = [];
      state.rolesLoaded = false;
      localStorage.removeItem("roles");
    },

    setSelectedMateria(state, materia) {
      state.selectedMateria = materia;
    },
    setSelectedOption(state, titulo) {
      state.selectedOpcion = titulo;
    },
  },

  actions: {
    toggleSidebar({ commit }) {
      commit("toggleSidebar");
    },
    cambiarBanderaActualizarTabla({ commit }) {
      commit("CAMBIAR_BANDERA_ACTUALIZAR_TABLA");
    },
    setActividadAEditar({ commit }, actividad) {
      commit("SET_ACTIVIDAD_A_EDITAR", actividad);
    },
    setToken({ commit }, token) {
      commit("SET_TOKEN", token);
    },
    setUser({ commit }, userData) {
      commit("SET_USER", userData);
    },

    // Acepta { data:{roles:[...]}} o { data:{permisos:[...]}}
    setPermisos({ commit }, response) {
      const data = response?.data || {};
      const roles = data.roles || data.permisos || [];
      commit("SET_ROLES", roles);
    },

    clearPermisos({ commit }) {
      commit("CLEAR_ROLES");
    },

    // 🚀 Cargar sesión al iniciar la app
    bootstrapSession({ commit }) {
      try {
        const token = localStorage.getItem("token") || null;
        const userStr = localStorage.getItem("user");
        const rolesStr = localStorage.getItem("roles");

        if (token) commit("SET_TOKEN", token);
        if (userStr) commit("SET_USER", JSON.parse(userStr));
        if (rolesStr) {
          // Si ya hay roles en localStorage, márcalos como cargados
          commit("SET_ROLES", JSON.parse(rolesStr));
        } else {
          // Si no hay, asegúrate de marcar que aún no están listos
          commit("CLEAR_ROLES");
        }

        console.log("🧰 bootstrapSession listo");
      } catch (e) {
        console.warn("bootstrapSession error:", e);
        commit("CLEAR_ROLES");
      }
    },

    // 🔒 Logout limpio
    logout({ commit }) {
      commit("SET_TOKEN", null);
      commit("SET_USER", null);
      commit("CLEAR_ROLES");
      // limpia lo demás si aplica
    },

    setSelectedOption({ commit }, titulo) {
      commit("setSelectedOption", titulo);
    },
  },
});
