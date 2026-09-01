<template>
  <div class="leading-normal tracking-normal min-h-screen" id="main-body">
    <!-- Grid solo en desktop; animamos el ancho de las columnas -->
    <div
      id="layout"
      class="bg-gray-100 dark:bg-darkBackground md:grid transition-[grid-template-columns] duration-300 ease-in-out"
      :class="sideBarOpen ? 'md:grid-cols-[16rem_1fr]' : 'md:grid-cols-[0_1fr]'"
    >
      <!-- Columna del sidebar (siempre existe en desktop; en móvil es overlay desde el propio componente) -->
      <Sidebar />

      <!-- Columna del contenido -->
      <div
        id="main-content"
        class="min-h-screen w-full bg-gray-100 dark:bg-darkBackground transition-all duration-300 ease-in-out min-w-0"
      >
        <Navbar />
        <div class="bg-gray-100 dark:bg-darkBackground mx-5 mb-6 md:mx-2 lg:mx-10">
          <router-view />
        </div>
        <Footer />
      </div>
    </div>
  </div>
</template>
  
<script>
import { mapState } from 'vuex'

import Sidebar from '../components/Layouts/sidebar.vue'
import Navbar from '../components/Layouts/navbar.vue'
import Footer from '../components/Layouts/footer.vue'

export default {
  name: 'Home',
  computed: {
    ...mapState(['sideBarOpen'])
  },
  components: {
    Sidebar,
    Navbar,
    Footer
  }
}
</script>