<template>
  <section class="flex flex-col md:flex-row h-screen items-center">
    <div
      class="bg-gray w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center"
    >
      <div class="w-full h-screen">
        <img src="../assets/unachlogo.svg" class="h-40 mx-auto mt-10 fill-current" />
        <div
          class="my-4 mt-2 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300"
        >
          <p class="mx-4 mb-0 text-center font-semibold text-slate-600 uppercase tracking-widest text-xl">
            SIGEAA
          </p>
        </div>

        <!-- IMPORTANTE: stop + prevent -->
        <form class="mt-2" @submit.stop.prevent="onSubmit" method="POST">
          <div>
            <label class="block text-gray-700" for="identity">RFC o correo institucional</label>
            <input
              id="identity"
              class="w-full px-2 py-2 rounded-lg bg-gray-100 border focus:border-SecundaryGold focus:bg-white focus:outline-none"
              type="text"
              placeholder="Ej. ASFI900101ABC o nombre.apellido@unach.mx"
              v-model.trim="identity"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              autofocus
              @keydown.enter.exact.prevent="onSubmit"
            />
          </div>

          <div class="mt-4">
            <label class="block text-gray-700" for="password">Contraseña</label>
            <input
              id="password"
              class="w-full px-2 py-2 rounded-lg bg-gray-100 border focus:border-SecundaryGold focus:bg-white focus:outline-none"
              type="password"
              placeholder="Contraseña"
              v-model="password"
              autocomplete="current-password"
              @keydown.enter.exact.prevent="onSubmit"
            />
          </div>

          <div class="text-right mt-2">
            <a href="#" class="text-sm font-semibold text-gray-700 hover:text-SecundaryGold">¿Olvidaste tu
              contraseña?</a>
          </div>

          <button
            type="submit"
            class="w-full block bg-primaryBlue hover:bg-blue-800 focus:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 mt-2"
          >
            Iniciar Sesión
          </button>
        </form>

        <hr class="my-4 border-gray-300 w-full" />

        <p class="mt-4">
          ¿No tienes una cuenta?
          <br />
          <router-link
            :to="{ name: 'AlumnoRegistro' }"
            class="text-primaryBlue hover:text-SecundaryGold font-semibold"
          >
            Registrarse
          </router-link>
        </p>

        <p class="text-sm text-gray-500 mt-5">&copy; 2025 UNACH - Todos los derechos reversados.</p>
      </div>
    </div>

    <div class="bg-blue-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
      <img src="../assets/fondo.jpg" alt="" class="w-full h-full object-cover brightness-75" />
    </div>
  </section>
</template>

<script>
import { login as apiLogin, getPermisos } from "../services/authServices";
import Swal from "sweetalert2";

const RFC_REGEX = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i;
const UNACH_MAIL = /^[^\s@]+@unach\.mx$/i;

const sinAcentos = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function canon(raw = "") {
  let s = String(raw || "").trim();
  s = sinAcentos(s).toUpperCase().replace(/[ \.-]+/g, "_");
  const map = {
    SUPER_ADMINISTRADOR: "SUPERADMIN",
    SUPER_ADMIN: "SUPERADMIN",
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
  if (!map[s] && /^(ENSENANZA|INVESTIGACION|PRACTICAS|SECRETARIA|TUTORIAS)_ADMIN$/.test(s)) {
    const m = s.match(/^(.*)_ADMIN$/);
    if (m) return `ADMIN_${m[1]}`;
  }
  return map[s] || s;
}

export default {
  name: "Login",
  data() {
    return {
      identity: "", // RFC o correo
      password: "",
    };
  },
  methods: {
    async onSubmit() {
      console.log("[Login] submit fired");
      const id = (this.identity || "").trim();
      const pass = this.password;

      if (!id) {
        console.warn("[Login] identity vacío");
        Swal.fire({
          position: "top",
          icon: "warning",
          title: "Ingresa tu RFC o correo institucional.",
          showConfirmButton: false,
          timer: 1400,
        });
        return;
      }
      if (!pass) {
        console.warn("[Login] password vacío");
        Swal.fire({
          position: "top",
          icon: "warning",
          title: "Ingresa tu contraseña.",
          showConfirmButton: false,
          timer: 1400,
        });
        return;
      }

      const isEmail = id.includes("@");

      if (isEmail) {
        if (!UNACH_MAIL.test(id)) {
          console.error("[Login] correo no institucional:", id);
          Swal.fire({
            position: "top",
            icon: "error",
            title: "El correo debe ser institucional (@unach.mx).",
            showConfirmButton: true,
          });
          return;
        }
      } else if (!RFC_REGEX.test(id)) {
        console.warn("[Login] RFC inválido:", id);
        Swal.fire({
          position: "top",
          icon: "warning",
          title: "RFC inválido.",
          showConfirmButton: false,
          timer: 1400,
        });
        return;
      }

      try {
        const payload = isEmail
          ? { email: id, password: pass }
          : { rfc: id.toUpperCase(), password: pass };

        console.log("[Login] calling backend with payload:", payload);
        const res = await apiLogin(payload);
        console.log("[Login] backend response:", res);

        if (!res?.ok) throw new Error("Login falló");

        // token + usuario
        this.$store?.dispatch?.("setToken", res.token);
        this.$store?.dispatch?.("setUser", res.usuario);
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.usuario));

        // roles
        let roles = Array.isArray(res.roles) ? res.roles : [];
        if (!roles.length && res?.usuario?.rfc) {
          const permisosResp = await getPermisos(res.usuario.rfc);
          roles = Array.isArray(permisosResp?.items) ? permisosResp.items : [];
        }
        roles = Array.from(new Set(roles.map(canon)));
        localStorage.setItem("roles", JSON.stringify(roles));

        // dashboard según rol
        if (roles.includes("ESTUDIANTE")) {
          localStorage.setItem("auth", "1");
          if (isEmail) localStorage.setItem("alumno_email", id);
          this.$router.push("/alumno");
        } else {
          this.$router.push("/home");
        }
      } catch (err) {
        console.error("[Login] error:", err);
        Swal.fire({
          position: "top",
          icon: "error",
          title: "Usuario o contraseña inválidos, o sin permisos.",
          showConfirmButton: true,
        });
      }
    },
  },
};
</script>
