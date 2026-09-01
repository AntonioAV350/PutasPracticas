<template>
  <div class="container mx-auto">
    <div class="grid md:grid-cols-2 md:gap-4 lg:gap-4 md:m-10 lg:m-10">
      <div v-for="card in cardsConPermiso" :key="card.title">
        <HomeList :card="card" />
      </div>
    </div>
  </div>
</template>

<script>
import HomeList from "../components/Home/CardsLink.vue";
import imgTutorias from "../assets/responsive-pc.jpeg";
import { mapGetters } from "vuex";

/* ===== Normalización local ===== */
const sinAcentos = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function canon(s = "") {
  let r = String(s || "").trim();
  r = sinAcentos(r).toUpperCase().replace(/[ \.-]+/g, "_");
  // Mapeos comunes
  const map = {
    "SUPER_ADMINISTRADOR": "SUPERADMIN",
    "SUPER_ADMIN": "SUPERADMIN",
    "SUPERADMIN": "SUPERADMIN",
    "ADMINISTRADOR": "ADMINISTRADOR",
    "DOCENTE": "DOCENTE",
    "SECRETARIA": "SECRETARIA",
    "EMPRESARIO": "EMPRESARIO",
    "TUTORIAS": "TUTORIAS",
    "ENSENANZA": "ENSENANZA",
    "INVESTIGACION": "INVESTIGACION",
    "SECRETARIA_ACADEMICA": "SECRETARIA",
    "PRACTICAS": "PRACTICAS",
    "PRACTICAS_ADMIN": "ADMIN_PRACTICAS",
    "ADMIN_PRACTICAS": "ADMIN_PRACTICAS",
    "ADMINISTRADOR_PRACTICAS": "ADMIN_PRACTICAS",
  };
  if (!map[r] && /^(ENSENANZA|INVESTIGACION|PRACTICAS|SECRETARIA|TUTORIAS)_ADMIN$/.test(r)) {
    const m = r.match(/^(.*)_ADMIN$/);
    if (m) return `ADMIN_${m[1]}`;
  }
  return map[r] || r;
}
function readJSON(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }
function rolesCanonDesdeLS() {
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
  components: { HomeList },

  computed: {
    ...mapGetters(["tienePermiso"]),

    cardsConPermiso() {
      return this.cards.filter((card) => this.puedeVerModulo(card.requiredPermission));
    },
  },

  methods: {
    rolesAll() {
      // roles de Vuex si existen + fallback LS
      const fromVuex = Array.isArray(this.$store?.state?.roles) ? this.$store.state.roles.map(canon) : [];
      const fromLS = rolesCanonDesdeLS();
      return [...new Set([...fromVuex, ...fromLS])];
    },

    has(rolCanon) {
      // 1) intenta con getter del store (si mapea a tu normalización)
      if (typeof this.tienePermiso === "function") {
        try { if (this.tienePermiso(canon(rolCanon))) return true; } catch {}
      }
      // 2) fallback directo
      const roles = this.rolesAll();
      return roles.includes(canon(rolCanon));
    },

    puedeVerModulo(requiredPermission) {
      const P = canon(requiredPermission);
      const roles = this.rolesAll();

      // comodines globales
      if (roles.includes("SUPERADMIN") || roles.includes("ADMINISTRADOR")) return true;

      // Mapeo por módulo (alineado con tu router y sidebar)
      switch (P) {
        case "TUTORIAS":
          // router: allow ["ADMINISTRADOR","DOCENTE"]
          return this.has("DOCENTE") || this.has("TUTORIAS") || this.has("ADMIN_TUTORIAS");

        case "ENSENANZA":
          // router: allow ["DOCENTE"]
          // (sidebar también muestra si es admin del módulo, pero el guard actual no lo pide;
          // si algún día agregas allow a ADMIN_ENSENANZA, esto ya quedará listo)
          return this.has("DOCENTE") || this.has("ADMIN_ENSENANZA");

        case "INVESTIGACION":
          // router: allow ["DOCENTE"]
          return this.has("DOCENTE") || this.has("ADMIN_INVESTIGACION");

        case "SECRETARIA":
          // router: acceso general (sin allow), pero en sidebar lo muestras con ADMIN_SECRETARIA o EMPRESARIO
          // aquí lo hacemos consistente: secretaría visible si tiene alguno de estos
          return this.has("ADMIN_SECRETARIA") || this.has("SECRETARIA") || this.has("EMPRESARIO");

        // Si agregas más módulos en el futuro:
        case "PRACTICAS":
          // En router para resumen: ["DOCENTE","PRACTICAS"]
          return this.has("DOCENTE") || this.has("PRACTICAS") || this.has("ADMIN_PRACTICAS");

        default:
          // Por defecto, exige exactamente el permiso canonizado
          return this.has(P);
      }
    },
  },

  data() {
    return {
      cards: [
        {
          title: "Tutorias",
          img: imgTutorias,
          alt: "png-card-sitio-web",
          description:
            "Bienvenido al Módulo de Tutorías: Aquí puedes gestionar y participar en diversas actividades del Programa de Orientación Profesional (POP), incluyendo conferencias, talleres, y ferias de empleo. Este módulo te permite registrar eventos, asegurando un seguimiento efectivo del desarrollo profesional de los estudiantes.",
          route: "/tutorias",
          requiredPermission: "Tutorias", // se normaliza a TUTORIAS
        },
        {
          title: "Enseñanza",
          img: imgTutorias,
          alt: "png-card-sitio-web",
          description:
            "Bienvenido al Módulo de Enseñanza: Este módulo te permite administrar y supervisar las actividades de enseñanza-aprendizaje. Incluye funciones para controlar información sobre docentes, materias, evaluaciones, y avance de contenidos, facilitando la gestión académica y la evaluación del rendimiento estudiantil en cada unidad académica.",
          route: "/ensenanza",
          requiredPermission: "Enseñanza", // → ENSENANZA
        },
        {
          title: "Investigacion",
          img: imgTutorias,
          alt: "png-card-sitio-web",
          description:
            "Bienvenido al Módulo de Coordinación de Investigación: Este espacio está dedicado al registro y seguimiento de proyectos de investigación. Aquí podrás introducir y consultar información sobre proyectos en curso, incluyendo líderes de proyecto, colaboradores, fechas clave, recursos utilizados y resultados obtenidos, fomentando así la colaboración y el avance académico en la facultad.",
          route: "/investigacion",
          requiredPermission: "Investigacion", // → INVESTIGACION
        },
        {
          title: "Secretaria",
          img: imgTutorias,
          alt: "png-card-sitio-web",
          description:
            "Bienvenido al Módulo de Secretaría Académica: Esta plataforma está diseñada para gestionar y almacenar información detallada sobre los docentes y sus actividades académicas. Aquí podrás acceder y actualizar datos sobre formación académica, certificaciones, participación en congresos, cursos impartidos, y publicaciones, contribuyendo a un eficiente manejo de los recursos académicos.",
          route: "/secretaria",
          requiredPermission: "Secretaria", // → SECRETARIA
        },
        {
          title: "Prácticas",
          img: imgTutorias,
          alt: "png-card-sitio-web",
          description:
            "Resumen e información de Prácticas Profesionales.",
          route: "/practicas/resumen",
          requiredPermission: "Practicas", 
        },
      ],
    };
  },

  mounted() {
    this.$store.dispatch("setSelectedOption", "Inicio");
  },
};
</script>
