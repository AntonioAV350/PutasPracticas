<template>
  <div class="sticky top-2 z-40 mx-2 md:mx-4 mb-6">
    <div
      class="w-full sm:h-24 md:h-24 lg:h-20 px-4 py-3 bg-SecundaryGold dark:bg-[#2D3748] flex items-center rounded-lg shadow-lg">
      <!-- left navbar -->
      <div class="flex">
        <!-- mobile hamburger -->
        <div class="flex items-center mr-4">
          <button class="hover:text-blue-500 hover:border-white focus:outline-none navbar-burger"
            @click="toggleSidebar()">
            <svg class="h-5 w-5" v-bind:style="{ fill: 'white' }" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
      </div>
      <HeaderModule class="w-full sm:mr-6 md:mr-6 lg:mr-10" />
      <!-- right navbar -->
      <ProfileDropdown />
    </div>

<!-- dropdown menu -->
    <div
      class="absolute bg-gray-100 border border-t-0 shadow-xl text-gray-700 rounded-b-lg w-48 top-full right-0 mr-6"
      :class="dropDownOpen ? '' : 'hidden'"
    >
      <button
        @click="cargarUser(), showAccountModal()"
        class="w-full block px-4 py-2 hover:bg-gray-200"
      >
        <i class="pi pi-user mr-4"></i>
        Cuenta
      </button>
      <button @click="handleLogout" class="w-full block px-4 py-2 hover:bg-gray-200">
        <i class="pi pi-sign-out mr-4"></i>
        Cerrar sesion
      </button>
    </div>
    <!-- dropdown menu end -->
  </div>
</template>

<script>
import { mapState } from "vuex";
import { logout } from "../../services/authServices";
import HeaderModule from "../HeaderModuleComponent.vue";
import ProfileDropdown from './ProfileDropdown.vue';

export default {
  name: "Navbar",
  computed: {
    ...mapState(["sideBarOpen", "selectedOpcion", "user", "permisos"]),
  },
  data() {
    return {
      titulo: "",
      isDarkMode: localStorage.getItem("darkMode") === "true",
      dropDownOpen: false,
      showModal: false,
    };
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode; // Reactividad
      localStorage.setItem("darkMode", this.isDarkMode);

      if (this.isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    showAccountModal() {
      this.showModal = true;
    },
    toggleSidebar() {
      this.$store.dispatch("toggleSidebar");
    },
    handleLogout() {
      logout();
      this.$router.push("/login"); // Redirigir al usuario a la página de inicio de sesión después de cerrar sesión.
    },
  },
  components: {
    HeaderModule,
    ProfileDropdown
  },
};
</script>
