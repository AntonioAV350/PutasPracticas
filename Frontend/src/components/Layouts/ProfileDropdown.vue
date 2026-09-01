<template>
  <div class="relative">
    <button class="rounded-full border m-4 w-10 h-10 shadow-lg" @click="dropDownOpen = !dropDownOpen">
      <img src="../../assets/profile.svg" />
    </button>

    <!-- Dropdown -->
    <div
      class="absolute bg-gray-100 border border-t-0 shadow-xl text-gray-700 rounded-b-lg w-48 top-full right-0 mr-6"
      :class="dropDownOpen ? '' : 'hidden'"
    >
      <button @click="cargarUser(); showAccountModal()" class="w-full block px-4 py-2 hover:bg-gray-200">
        <i class="pi pi-user mr-4"></i> Cuenta
      </button>
      <button @click="handleLogout" class="w-full block px-4 py-2 hover:bg-gray-200">
        <i class="pi pi-sign-out mr-4"></i> Cerrar sesión
      </button>
    </div>

    <!-- Modal -->
    <div v-if="user">
      <div
        v-if="showModal"
        class="fixed z-50 top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex items-center justify-center"
        @click="closeModal"
      >
        <div class="w-11/12 md:w-5/12 bg-white dark:bg-[#2D3748] shadow-xl rounded-lg py-2" @click.stop>
          <form @submit.prevent="submit" class="px-6">
            <div class="flex flex-col items-center mb-6">
              <div class="photo-wrapper mb-2">
                <img
                  src="../../assets/profile.svg"
                  alt="Foto de perfil"
                  class="w-32 h-32 rounded-full mx-auto bg-white shadow-lg object-cover"
                />
              </div>
              <div class="w-full grid grid-cols-2 gap-2">
                <button
                  type="button"
                  v-if="!editar"
                  @click="editar = true"
                  class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex-1"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 flex-1"
                  @click="$emit('contactar-admin')"
                >
                  Contactar al administrador
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1" for="rfc">RFC</label>
                <input
                  id="rfc"
                  type="text"
                  v-model="formUser.rfc"
                  :disabled="!editar"
                  class="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1" for="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  v-model="formUser.nombre"
                  :disabled="!editar"
                  class="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1" for="apellido_paterno">Apellido Paterno</label>
                <input
                  id="apellido_paterno"
                  type="text"
                  v-model="formUser.apellido_paterno"
                  :disabled="!editar"
                  class="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1" for="apellido_materno">Apellido Materno</label>
                <input
                  id="apellido_materno"
                  type="text"
                  v-model="formUser.apellido_materno"
                  :disabled="!editar"
                  class="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1" for="n_plaza">Número de Plaza</label>
                <input
                  id="n_plaza"
                  type="text"
                  v-model="formUser.n_plaza"
                  :disabled="!editar"
                  class="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1" for="sexo">Sexo</label>
                <select
                  id="sexo"
                  v-model="formUser.sexo"
                  :disabled="!editar"
                  class="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1" for="email">Correo Electrónico</label>
                <input
                  id="email"
                  type="email"
                  v-model="formUser.email"
                  :disabled="!editar"
                  class="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div v-if="editar">
                <label class="block text-gray-700 dark:text-gray-300 mb-1" for="editRFC">Confirmar RFC</label>
                <input
                  id="editRFC"
                  type="text"
                  v-model="formUser.editRFC"
                  class="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div v-if="editar">
                <label class="block text-gray-700 dark:text-gray-300 mb-1" for="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  v-model="formUser.password"
                  class="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
                  placeholder="Ingrese nueva contraseña"
                />
              </div>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                v-if="editar"
                @click="resetForm"
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                v-if="editar"
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { logout } from '../../services/authServices'
import apiEnsenanza from '../../services/apiEnsenanza'
import Swal from 'sweetalert2'

export default {
  name: 'ProfileDropdown',
  data() {
    return {
      dropDownOpen: false,
      showModal: false,
      show: false,
      editar: false,
      formUser: {
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        rfc: '',
        editRFC: '',
        n_plaza: '',
        sexo: '',
        email: '',
        password: ''
      }
    }
  },
  computed: {
    ...mapState(['user']),
    userSafe() {
      return this.user || {}
    }
  },
  methods: {
    showAccountModal() {
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.dropDownOpen = false
      this.editar = false
      this.resetForm()
    },
    cargarUser() {
      if (this.user) {
        this.formUser.nombre = this.user.nombre || ''
        this.formUser.apellido_paterno = this.user.apellido_paterno || ''
        this.formUser.apellido_materno = this.user.apellido_materno || ''
        this.formUser.rfc = this.user.rfc || ''
        this.formUser.editRFC = this.user.rfc || ''
        this.formUser.n_plaza = this.user.n_plaza || ''
        this.formUser.sexo = this.user.sexo || ''
        this.formUser.email = this.user.email || ''
        this.formUser.password = ''
      }
    },
    submit() {
      if (this.formUser.rfc !== this.formUser.editRFC) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Los RFC no coinciden'
        })
        return
      }
      this.actualizarUser()
    },
    async actualizarUser() {
      try {
        const dataToUpdate = {
          nombre: this.formUser.nombre,
          apellido_paterno: this.formUser.apellido_paterno,
          apellido_materno: this.formUser.apellido_materno,
          rfc: this.formUser.rfc,
          n_plaza: this.formUser.n_plaza,
          sexo: this.formUser.sexo,
          email: this.formUser.email
        }
        if (this.formUser.password) {
          dataToUpdate.password = this.formUser.password
        }
        const response = await apiEnsenanza.put(`/usuarios/${this.user.id}`, dataToUpdate)
        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Su información ha sido actualizada correctamente'
          })
          this.editar = false
          this.showModal = false
          this.$store.dispatch('fetchUser')
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la información'
          })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar'
        })
      }
    },
    resetForm() {
      this.cargarUser()
      this.editar = false
      this.formUser.password = ''
    },
    handleLogout() {
      logout()
      this.$router.push('/login')
    }
  }
}
</script>