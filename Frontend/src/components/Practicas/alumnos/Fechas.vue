<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="page" aria-labelledby="cal-title">
    <h1 id="cal-title" class="page-title">Calendario</h1>

    <div class="layout">
      <div class="calendars" role="grid" aria-label="Calendario de prácticas">
        <div
          v-for="m in monthsToRender"
          :key="m.key"
          class="month-card"
          role="group"
          :aria-labelledby="`m-${m.key}`"
        >
          <div class="month-header" :id="`m-${m.key}`">{{ m.label.toUpperCase() }}</div>

          <div class="weekdays">
            <span v-for="w in weekdays" :key="w" class="wd">{{ w }}</span>
          </div>

          <div class="grid">
            <div
              v-for="i in m.offset"
              :key="`off-${m.key}-${i}`"
              class="cell empty"
              aria-hidden="true"
            ></div>

            <div
              v-for="day in m.days"
              :key="`${m.key}-${day}`"
              class="cell"
              :class="badgeFor(m.year, m.month, day)"
              role="gridcell"
              :aria-label="`${day} de ${m.label} de ${m.year}`"
            >
              <span class="num">{{ day }}</span>
            </div>
          </div>
        </div>
      </div>

      <aside class="legend" aria-labelledby="lgd-title">
        <div id="lgd-title" class="legend-title">Leyenda</div>
        <ul>
          <li><span class="dot dot-registro" aria-hidden="true"></span>REGISTRO</li>
          <li><span class="dot dot-subir" aria-hidden="true"></span>SUBIR DOCUMENTOS</li>
          <li><span class="dot dot-validacion" aria-hidden="true"></span>PERIODO DE VALIDACIÓN</li>
          <li><span class="dot dot-seleccion" aria-hidden="true"></span>SELECCIÓN DE EMPRESAS</li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup>
const year = new Date().getFullYear()

const months = [
  { month: 7, label: 'Agosto' },
  { month: 8, label: 'Septiembre' },
  { month: 9, label: 'Octubre' },
  { month: 10, label: 'Noviembre' },
  { month: 11, label: 'Diciembre' },
]

const ranges = {
  registro: [{ from: `${year}-08-09`, to: `${year}-08-14` }],
  subir: [{ from: `${year}-08-28`, to: `${year}-08-28` }],
  validacion: [
    { from: `${year}-09-02`, to: `${year}-09-05` },
    { from: `${year}-09-09`, to: `${year}-09-12` },
  ],
  seleccion: [{ from: `${year}-09-22`, to: `${year}-09-28` }],
}

const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate()
}
function offsetLunes(y, m) {
  const dow = new Date(y, m, 1).getDay()
  const map = [7, 1, 2, 3, 4, 5, 6]
  return map[dow] - 1
}

function expand(list) {
  const s = new Set()
  for (const r of list ?? []) {
    const start = new Date(r.from)
    const end = new Date(r.to)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      s.add(fmt(d))
    }
  }
  return s
}
function fmt(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const dateSets = {
  registro: expand(ranges.registro),
  subir: expand(ranges.subir),
  validacion: expand(ranges.validacion),
  seleccion: expand(ranges.seleccion),
}

function badgeFor(y, m, d) {
  const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  if (dateSets.seleccion.has(key)) return 'is-seleccion'
  if (dateSets.validacion.has(key)) return 'is-validacion'
  if (dateSets.subir.has(key)) return 'is-subir'
  if (dateSets.registro.has(key)) return 'is-registro'
  return ''
}

const monthsToRender = months.map(({ month, label }) => {
  const days = daysInMonth(year, month)
  const offs = offsetLunes(year, month)
  return {
    key: `${year}-${month}`,
    year,
    month,
    label,
    days: Array.from({ length: days }, (_, i) => i + 1),
    offset: offs,
  }
})
</script>

<style scoped src="../../../assets/styles/Fechas.css"></style>
