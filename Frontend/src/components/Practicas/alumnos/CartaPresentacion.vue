<!-- src/views/CartaPresentacion.vue -->
<template>
  <section class="page">
    <h1 class="page-title">Formulario Hoja de Presentación</h1>

    <!-- Bloque de datos del alumno -->
    <div class="form-card">
      <h2 class="form-title">Datos del Alumno</h2>
      <p class="form-subtitle">
        Verifica que tus datos sean correctos. Si encuentras algún error, puedes corregirlo aquí y guardarlo.
      </p>
      <div class="form-grid">
        <div class="field">
          <label for="nombres">Nombre(s)</label>
          <input id="nombres" type="text" placeholder="Nombre(s)" v-model="studentData.nombre" />
        </div>
        <div class="field">
          <label for="apellidoP">Apellido paterno</label>
          <input id="apellidoP" type="text" placeholder="Apellido paterno" v-model="studentData.apellido_paterno" />
        </div>
        <div class="field">
          <label for="apellidoM">Apellido materno</label>
          <input id="apellidoM" type="text" placeholder="Apellido materno" v-model="studentData.apellido_materno" />
        </div>
        <div class="field">
          <label for="matricula">Matrícula</label>
          <input id="matricula" type="text" placeholder="Matrícula" v-model="studentData.matricula" />
        </div>
        <div class="field">
          <label for="email">Correo institucional</label>
          <input id="email" type="email" placeholder="Correo" v-model="studentData.email" />
        </div>
        <div class="field">
          <label for="semestre">Semestre</label>
          <input id="semestre" type="text" placeholder="Semestre" v-model="studentData.grado" />
        </div>
        <div class="field">
          <label for="grupo">Grupo</label>
          <input id="grupo" type="text" placeholder="Grupo" v-model="studentData.grupo" />
        </div>
        <div class="field">
          <label for="carrera">Licenciatura</label>
          <input id="carrera" type="text" placeholder="Licenciatura" v-model="studentData.carrera" disabled />
        </div>
        <div class="field field-full">
          <label>Tipo de Práctica</label>
          <input id="tipo_practica" type="text" :value="practicaLabel" disabled />
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="saveStudentData">Guardar Cambios</button>
      </div>
    </div>

    <!-- Bloque de datos de la empresa -->
    <div class="form-card">
      <h2 class="form-title">Datos de la Empresa</h2>
      <div class="form-grid">
        <div class="field">
          <label>Empresa</label>
          <input type="text" placeholder="Empresa" />
        </div>
        <div class="field">
          <label>Nombre del destinatario</label>
          <input type="text" placeholder="Nombre" />
        </div>
        <div class="field">
          <label>Actividad a realizar</label>
          <input type="text" placeholder="Actividad" />
        </div>
        <div class="field">
          <label>Número de horas</label>
          <input type="text" placeholder="Horas automáticas" disabled />
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-primary">Guardar Datos de la Empresa</button>
        <button class="btn btn-success">Generar Carta de Presentación</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import perfilService from '../../../services/practicas/alumnos/perfilService';

const studentData = reactive({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  matricula: '',
  email: '',
  grado: '',
  grupo: '',
  carrera: '',
  tipo_practica: 'P1', // Valor por defecto
});

const isSoftware = computed(() => studentData.carrera === 'Ingeniería en Desarrollo y Tecnologías de Software');

const practicaLabel = computed(() => {
  const practica = studentData.tipo_practica;
  if (practica === 'P1') return 'Prácticas Profesionales I';
  if (practica === 'P2') return 'Prácticas Profesionales II';
  if (practica === 'RES' && isSoftware.value) return 'Residencia Profesional';
  return 'No asignada';
});


onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      studentData.nombre = userData.nombre || '';
      studentData.apellido_paterno = userData.apellido_paterno || '';
      studentData.apellido_materno = userData.apellido_materno || '';
      studentData.matricula = userData.matricula || '';
      studentData.email = userData.email || '';
      studentData.grado = userData.grado || '';
      studentData.grupo = userData.grupo || '';
      studentData.carrera = userData.carrera || '';
      // El backend debe devolver `tipo_practica` para que se cargue aquí
      studentData.tipo_practica = userData.tipo_practica || 'P1';
    } catch (error) {
      console.error("Error al parsear datos del usuario desde localStorage:", error);
      Swal.fire('Error', 'No se pudieron cargar tus datos. Recarga la página.', 'error');
    }
  } else {
    Swal.fire('Error', 'No se encontraron datos de sesión. Por favor, inicia sesión de nuevo.', 'error');
  }
});

async function saveStudentData() {
  try {
    const updatedData = await perfilService.updateMyData(studentData);
    
    // Actualizar localStorage con los datos frescos del backend
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...storedUser, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Tus datos han sido actualizados correctamente.',
      timer: 2000,
      showConfirmButton: false,
    });

  } catch (error) {
    console.error("Error al guardar datos:", error);
    Swal.fire('Error', error.message || 'No se pudieron guardar los cambios. Inténtalo de nuevo.', 'error');
  }
}
</script>

<style scoped src="../../../assets/styles/CartaPresentacion.css"></style>