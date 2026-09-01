<!-- src/views/AlumnoRegistro.vue -->
<template>
  <main class="reg-wrap">
    <!-- ===== Franja azul (mismo ancho que el formulario) ===== -->
    <header class="hero" aria-labelledby="reg-title">
      <div class="container">
        <div class="hero-box">
          <h1 id="reg-title">Crear cuenta de alumno</h1>
          <p>Completa tus datos para acceder al módulo de prácticas.</p>
          <ul class="features">
            <li>Carta de presentación</li>
            <li>Selección de empresas</li>
            <li>Subida de documentos</li>
          </ul>
          <div class="period">Periodo vigente: Ago–Dic</div>
        </div>
      </div>
    </header>

    <!-- ===== Tarjeta única del formulario ===== -->
    <section class="card form-card" aria-labelledby="form-title">
      <header class="form-head">
        <h2 id="form-title">Registro de alumno</h2>
        <p>Campos marcados con * son obligatorios.</p>
      </header>

      <div v-if="errorMsg" class="alert" role="alert" aria-live="polite">{{ errorMsg }}</div>
      <div
        v-if="okMsg"
        class="alert"
        style="background: #ecfdf5; border-color: #34d399; color: #065f46"
      >
        {{ okMsg }}
      </div>

      <form @submit.prevent="onSubmit" novalidate>
        <div class="form-grid">
          <!-- 1) LICENCIATURA -->
          <div class="field">
            <label for="lic">Licenciatura *</label>
            <div class="control" :class="{ invalid: t.licenciatura && !f.licenciatura }">
              <select id="lic" v-model="f.licenciatura" @blur="t.licenciatura = true">
                <option value="" disabled>Selecciona tu licenciatura</option>
                <option value="LCP">Licenciatura en Contaduría</option>
                <option value="LIDTS">Ingeniería en Desarrollo y Tecnologías de Software</option>
              </select>
            </div>
            <small class="hint">Primero elige la carrera para habilitar práctica y semestre.</small>
          </div>

          <!-- 2) PRÁCTICA -->
          <div class="field">
            <label>Práctica a realizar *</label>
            <div
              class="control control-radio"
              :class="{ invalid: t.practicaTipo && !f.practicaTipo }"
            >
              <label v-for="p in practicaOptions" :key="p.value" class="radio-item">
                <input
                  type="radio"
                  name="practicaTipo"
                  :value="p.value"
                  v-model="f.practicaTipo"
                  :disabled="!f.licenciatura || p.disabled"
                />
                <span>{{ p.label }}</span>
              </label>
            </div>

            <!-- Hints alineados a cada carrera -->
            <small class="hint" v-if="isContaduria">
              P1: semestres 3–6 (120 h). P2: 7–9 (240 h).
            </small>
            <small class="hint" v-else-if="isSoftware">
              P1: semestre 5 (240 h). P2: semestre 7 (240 h). Residencia: 9° (240 h).
            </small>
          </div>

          <!-- 3) SEMESTRE -->
          <div class="field">
            <label for="sem">Semestre *</label>
            <div class="control" :class="{ invalid: t.semestre && !val.semestre }">
              <input
                id="sem"
                type="number"
                :min="minSem"
                :max="maxSem"
                :step="1"
                v-model.number="f.semestre"
                :placeholder="placeholderSem"
                :disabled="!f.licenciatura || !f.practicaTipo"
                @keydown="onSemKeydown"
                @input="clampSemestre"
                @blur="t.semestre = true"
              />
            </div>
          </div>

          <!-- 4) HORAS TOTALES -->
          <div class="field">
            <label for="horas">Horas totales</label>
            <div class="control">
              <input id="horas" :value="horasTotales || ''" readonly />
            </div>
          </div>

          <!-- Datos del alumno -->
          <div class="field">
            <label for="nombres">Nombre(s) *</label>
            <div class="control" :class="{ invalid: t.nombres && !f.nombres }">
              <input id="nombres" v-model.trim="f.nombres" @blur="t.nombres = true" />
            </div>
          </div>

          <div class="field">
            <label for="apP">Apellido paterno *</label>
            <div class="control" :class="{ invalid: t.apellidoP && !f.apellidoP }">
              <input id="apP" v-model.trim="f.apellidoP" @blur="t.apellidoP = true" />
            </div>
          </div>

          <div class="field">
            <label for="apM">Apellido materno *</label>
            <div class="control" :class="{ invalid: t.apellidoM && !f.apellidoM }">
              <input id="apM" v-model.trim="f.apellidoM" @blur="t.apellidoM = true" />
            </div>
          </div>

          <div class="field">
            <label for="matricula">Matrícula *</label>
            <div class="control" :class="{ invalid: t.matricula && !val.matricula }">
              <input
                id="matricula"
                v-model.trim="f.matricula"
                placeholder="A0123456 / B123456 / 100000123"
                @input="f.matricula = f.matricula.toUpperCase()"
                @blur="t.matricula = true"
              />
            </div>
            <small class="hint">Formato: letra + 6–9 dígitos (p. ej. B012345) o solo dígitos (6–10, p. ej. 1000123456).
            </small>
          </div>

          <div class="field">
            <label for="correo">Correo institucional (@unach.mx) *</label>
            <div class="control" :class="{ invalid: t.correo && !val.correo }">
              <input
                id="correo"
                type="email"
                v-model.trim="f.correo"
                placeholder="nombre.apellido@unach.mx"
                @blur="t.correo = true"
              />
            </div>
          </div>

          <div class="field">
            <label for="grupo">Grupo *</label>
            <div class="control" :class="{ invalid: t.grupo && !val.grupo }">
              <input
                id="grupo"
                v-model.trim="f.grupo"
                placeholder="Ej. A o 1A"
                @input="f.grupo = f.grupo.toUpperCase()"
                @blur="t.grupo = true"
              />
            </div>
          </div>

          <!-- 5) CONTRASEÑA -->
          <div class="field">
            <label for="pw">Contraseña *</label>
            <div class="control" :class="{ invalid: t.password && !val.password }">
              <input
                id="pw"
                :type="showPass ? 'text' : 'password'"
                v-model="f.password"
                autocomplete="new-password"
                @blur="t.password = true"
              />
              <button
                type="button"
                @click="showPass = !showPass"
                :aria-pressed="showPass ? 'true' : 'false'"
                aria-label="Mostrar u ocultar contraseña"
                class="toggle-link"
              >
                {{ showPass ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <small class="hint">Mínimo 8 caracteres, con al menos una letra y un número.</small>
            <div
              v-if="f.password"
              class="hint"
              :style="{ marginTop: '6px', fontSize: '12px', color: pwColor }"
              aria-live="polite"
            >
              Seguridad: {{ pwLabel }}
            </div>
          </div>

          <div class="field">
            <label for="pw2">Confirmar contraseña *</label>
            <div class="control" :class="{ invalid: t.password2 && !val.password2 }">
              <input
                id="pw2"
                :type="showPass2 ? 'text' : 'password'"
                v-model="f.password2"
                autocomplete="new-password"
                @blur="t.password2 = true"
              />
              <button
                type="button"
                @click="showPass2 = !showPass2"
                :aria-pressed="showPass2 ? 'true' : 'false'"
                aria-label="Mostrar u ocultar confirmación de contraseña"
                class="toggle-link"
              >
                {{ showPass2 ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <small class="hint">Debe coincidir con la contraseña.</small>
          </div>

          <!-- Acciones -->
          <div class="actions span-2">
            <button class="btn btn-primary" type="submit" :disabled="loading">
              <span v-if="!loading">Crear cuenta</span>
              <span v-else>Registrando…</span>
            </button>
            <RouterLink class="btn btn-outline" :to="{ name: 'Login' }">Ya tengo cuenta</RouterLink>
          </div>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import alumnosApi from '../../../services/practicas/alumnos/alumnosService'


const router = useRouter()
const loading = ref(false)
const errorMsg = ref('')
const okMsg = ref('')

const showPass = ref(false)
const showPass2 = ref(false)

const f = reactive({
  licenciatura: '',       // 'LCP' | 'LIDTS'
  practicaTipo: '',       // 'P1' | 'P2' | 'RES'
  semestre: null,
  nombres: '',
  apellidoP: '',
  apellidoM: '',
  matricula: '',
  correo: '',
  grupo: '',
  password: '',
  password2: '',
})

const t = reactive({
  licenciatura: false,
  practicaTipo: false,
  semestre: false,
  nombres: false,
  apellidoP: false,
  apellidoM: false,
  matricula: false,
  correo: false,
  grupo: false,
  password: false,
  password2: false,
})

/* ===== Helpers de licenciatura ===== */
const licKey = computed(() => (f.licenciatura || '').toUpperCase().trim())
const isContaduria = computed(() => licKey.value === 'LCP')
const isSoftware   = computed(() => licKey.value === 'LIDTS')

/* ===== Opciones visibles de práctica según carrera ===== */
const practicaOptions = computed(() => {
  if (isContaduria.value) {
    // Solo P1 y P2
    return [
      { value: 'P1', label: 'Práctica 1 (3–6)' },
      { value: 'P2', label: 'Práctica 2 (7–9)' },
    ]
  }
  if (isSoftware.value) {
    // P1, P2 y Residencia
    return [
      { value: 'P1', label: 'Práctica 1 (5)' },
      { value: 'P2', label: 'Práctica 2 (7)' },
      { value: 'RES', label: 'Residencia (9°)' },
    ]
  }
  return [
    { value: 'P1', label: 'Práctica 1', disabled: true },
    { value: 'P2', label: 'Práctica 2', disabled: true },
  ]
})

/* ===== Rango dinámico de semestre ===== */
const minSem = computed(() => {
  if (isContaduria.value) {
    if (f.practicaTipo === 'P1') return 3
    if (f.practicaTipo === 'P2') return 7
    return 1
  }
  if (isSoftware.value) {
    if (f.practicaTipo === 'P1') return 5
    if (f.practicaTipo === 'P2') return 7
    if (f.practicaTipo === 'RES') return 9
    return 5
  }
  return 1
})

const maxSem = computed(() => {
  if (isContaduria.value) {
    if (f.practicaTipo === 'P1') return 6
    if (f.practicaTipo === 'P2') return 9
    return 9
  }
  if (isSoftware.value) {
    if (f.practicaTipo === 'P1') return 5
    if (f.practicaTipo === 'P2') return 7
    if (f.practicaTipo === 'RES') return 9
    return 9
  }
  return 12
})

const placeholderSem = computed(() => `${minSem.value}–${maxSem.value}`)

function onSemKeydown(e) {
  const allow = ['Tab', 'ArrowUp', 'ArrowDown', 'Home', 'End']
  if (!allow.includes(e.key)) e.preventDefault()
}

function clampSemestre() {
  if (typeof f.semestre !== 'number') return
  if (f.semestre < minSem.value) f.semestre = minSem.value
  if (f.semestre > maxSem.value) f.semestre = maxSem.value
  // (Opcional) auto–seleccionar RES solo si es Software y semestre 9
  // if (isSoftware.value && f.semestre === 9) f.practicaTipo = 'RES'
}

/* Reacciones */
watch(
  () => f.licenciatura,
  () => {
    f.practicaTipo = ''
    f.semestre = null
  },
)
watch(
  () => f.practicaTipo,
  () => {
    if (f.practicaTipo) f.semestre = minSem.value
  },
)
watch(
  () => f.semestre,
  () => {
    clampSemestre()
  },
)

/* Horas totales calculadas */
const horasTotales = computed(() => {
  if (isContaduria.value) {
    if (f.practicaTipo === 'P1') return 120
    if (f.practicaTipo === 'P2') return 240
  }
  if (isSoftware.value) {
    if (f.practicaTipo === 'P1' || f.practicaTipo === 'P2') return 240
    if (f.practicaTipo === 'RES') return 240 // cambia a 400 si tu plan lo requiere
  }
  return null
})

/* ===== Validaciones ===== */
const val = {
  get matricula() {
    const value = f.matricula || ''
    return /^[A-Z]\d{6,9}$/i.test(value) || /^\d{6,10}$/.test(value)
  },
  get correo() {
    return /^[^\s@]+@unach\.mx$/i.test(f.correo || '')
  },
  get grupo() {
    return /^[A-Z0-9]{1,3}$/.test(f.grupo || '')
  },
  get semestre() {
    const s = Number(f.semestre)
    return f.practicaTipo && Number.isInteger(s) && s >= minSem.value && s <= maxSem.value
  },
  get password() {
    const s = f.password || ''
    return s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s)
  },
  get password2() {
    return !!f.password && f.password2 === f.password
  },
}

const isFormOk = computed(
  () =>
    f.licenciatura &&
    f.practicaTipo &&
    val.semestre &&
    f.nombres &&
    f.apellidoP &&
    f.apellidoM &&
    val.matricula &&
    val.correo &&
    val.grupo &&
    val.password &&
    val.password2,
)

/* ===== Envío (simulado) ===== */
async function onSubmit() {
   errorMsg.value = ''
   okMsg.value = ''
   Object.keys(t).forEach((k) => (t[k] = true))

   if (!isFormOk.value) {
     errorMsg.value = 'Verifica los campos obligatorios.'
     return
   }

   loading.value = true
   try {
    const resp = await alumnosApi.crearAlumnoConUsuario(f)
    if (resp?.ok) {
      okMsg.value = 'Registro exitoso. Ahora puedes iniciar sesión.'
      f.password = ''
      f.password2 = ''
      setTimeout(() => router.push({ name: 'Login' }), 650)
    }
    else {
      throw new Error(resp?.error || 'No se pudo completar el registro.')
    }

    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'No se pudo completar el registro.'
      errorMsg.value = msg
    } finally {
     loading.value = false
   }
}
</script>

<style scoped src="../../../assets/styles/Registro.css"></style>
