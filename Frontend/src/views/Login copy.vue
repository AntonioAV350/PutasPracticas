<template>
  <section class="flex flex-col md:flex-row h-screen items-center">
    <div
      class="bg-white w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center"
    >
      <div class="w-full h-100">
        <img src="../assets/unachlogo.svg" class="h-60 mx-auto mt-10 fill-current" />

        <div
          class="my-5 mt-10 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300"
        >
          <p class="mx-4 mb-0 text-center font-semibold text-slate-600 uppercase tracking-widest text-2xl">
            SIGEAA
          </p>
        </div>

        <form class="mt-6" @submit.prevent="onSubmit" method="POST">
          <div>
            <label class="block text-gray-700" for="identity">RFC o correo institucional</label>
            <input
              id="identity"
              class="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-SecundaryGold focus:bg-white focus:outline-none normal-case"
              :style="{ textTransform: 'none' }"
              autocomplete="username"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              type="text"
              placeholder="RFC (e.g. ABCD001231XYZ) o correo @unach.mx"
              v-model.trim="identity"
            />
          </div>

          <div class="mt-4">
            <label class="block text-gray-700" for="password">Contraseña</label>
            <input
              class="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-SecundaryGold focus:bg-white focus:outline-none"
              id="password"
              type="password"
              placeholder="Contraseña"
              v-model="password"
              autocomplete="current-password"
            />
          </div>

          <div class="text-right mt-2">
            <a
              href="#"
              class="text-sm font-semibold text-gray-700 hover:text-SecundaryGold focus:text-blue-700"
            >¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="submit"
            class="w-full block bg-primaryBlue hover:bg-blue-800 focus:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 mt-6"
          >
            Iniciar Sesión
          </button>
        </form>

        <hr class="my-6 border-gray-300 w-full" />

        <p class="mt-8">
          ¿No tienes una cuenta?
          <a href="#" class="text-primaryBlue hover:text-SecundaryGold font-semibold">
            Solicita tu cuenta al administrador
          </a>
        </p>

        <p class="text-sm text-gray-500 mt-12">
          &copy; 2023 UNACH - Todos los derechos reversados.
        </p>
      </div>
    </div>

    <div class="bg-blue-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
      <img src="../assets/fondo.jpg" alt="" class="w-full h-full object-cover brightness-75" />
    </div>
  </section>
</template>

<script>
import { login, getPermisos } from "../services/authServices";
import Swal from "sweetalert2";

// Valida RFC (sin forzar mayúsculas visualmente; la regex es case-insensitive)
const RFC_REGEX = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i;
const UNACH_MAIL_REGEX = /^[^\s@]+@unach\.mx$/i;

export default {
  name: "LoginCopy",
  data() {
    return {
      identity: "", // <-- ahora aceptamos RFC o correo
      password: "",
    };
  },
  methods: {
    isRFC(v) {
      return RFC_REGEX.test(String(v || "").trim());
    },
    isUnachMail(v) {
      return UNACH_MAIL_REGEX.test(String(v || "").trim());
    },
    async onSubmit() {
      // Validar identidad
      if (!this.identity) {
        Swal.fire({ position: "top", icon: "warning", title: "Introduce tu RFC o correo @unach.mx.", showConfirmButton: false, timer: 1200 });
        return;
      }

      const id = String(this.identity).trim();
      const esRFC = this.isRFC(id);
      const esMail = this.isUnachMail(id);

      if (!esRFC && !esMail) {
        // Caso especial: si escribió correo pero de otro dominio, avisar explícito
        if (id.includes("@") && !id.toLowerCase().endsWith("@unach.mx")) {
          console.error("Correo inválido: el correo debe terminar en @unach.mx");
          Swal.fire({ position: "top", icon: "error", title: "El correo debe ser institucional (@unach.mx).", showConfirmButton: true });
        } else {
          Swal.fire({ position: "top", icon: "warning", title: "RFC inválido o correo no institucional.", showConfirmButton: true });
        }
        return;
      }

      // Validar contraseña
      if (!this.password) {
        Swal.fire({ position: "top", icon: "warning", title: "Por favor, introduce tu contraseña.", showConfirmButton: false, timer: 1200 });
        return;
      }

      try {
        // IMPORTANTE:
        // Si tu backend /auth/login ya acepta RFC **o** correo en el campo "rfc", esto funcionará.
        // Si NO, debes adaptar el backend para que intente buscar por email cuando 'identity' contenga "@",
        // o bien exponer /auth/login-student que reciba "email".
        const res = await login(id, this.password); // { ok, token, usuario, roles }
        if (!res?.ok) throw new Error("Login falló");

        // Guarda token y usuario
        this.$store.dispatch("setToken", res.token);
        this.$store.dispatch("setUser", res.usuario);
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.usuario));

        // Roles/permisos
        let roles = Array.isArray(res.roles) ? res.roles : [];
        if (!roles.length) {
          const permisosResp = await getPermisos(res.usuario?.rfc || id);
          roles = Array.isArray(permisosResp?.items) ? permisosResp.items : [];
        }
        localStorage.setItem("roles", JSON.stringify(roles));

        // Redirigir (ajusta si quieres mandar a dashboard de alumno según el rol)
        this.$router.push("/home");
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
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
