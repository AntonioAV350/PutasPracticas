<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

import TopBar from '../alumnos/TopBar.vue'
import NavBar from '../alumnos/NavBar.vue'
import FooterBar from '../alumnos/FooterBar.vue'

const route = useRoute()
const hideChrome = computed(() => route.meta.hideChrome === true)
const mainStyle = computed(() => (hideChrome.value ? { '--bars-height': '0px' } : {}))

function pick(sel1, sel2) {
  return (
    Array.from(document.querySelectorAll(sel1)).concat(
      Array.from(document.querySelectorAll(sel2)),
    ) || []
  )
}

/** Mide el borde inferior más bajo del header (TopBar/NavBar) */
function measureHeaderBottom() {
  const candidates = [...pick('[data-topbar]', '.topbar'), ...pick('[data-navbar]', '.navbar')]
  if (!candidates.length) return 0
  let maxBottom = 0
  for (const el of candidates) {
    const r = el.getBoundingClientRect()
    if (r.bottom > maxBottom) maxBottom = r.bottom
  }
  return Math.max(0, Math.round(maxBottom))
}

function measureFooterHeight() {
  const foot = document.querySelector('[data-footer]') || document.querySelector('.footerbar')
  if (!foot) return 0
  const r = foot.getBoundingClientRect()
  return Math.round(r.height)
}

function setHeights() {
  const bars = hideChrome.value ? 0 : measureHeaderBottom()
  const foot = hideChrome.value ? 0 : measureFooterHeight()
  document.documentElement.style.setProperty('--bars-height', `${bars}px`)
  document.documentElement.style.setProperty('--footer-height', `${foot}px`)
}

let roList = []
onMounted(() => {
  setHeights()

  const observe = (sel) => {
    const els = [...document.querySelectorAll(sel[0]), ...document.querySelectorAll(sel[1])]
    for (const el of els) {
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(setHeights)
        ro.observe(el)
        roList.push(ro)
      }
    }
  }

  observe(['[data-topbar]', '.topbar'])
  observe(['[data-navbar]', '.navbar'])
  observe(['[data-footer]', '.footerbar'])

  window.addEventListener('resize', setHeights)
  window.addEventListener('orientationchange', setHeights)
})

onBeforeUnmount(() => {
  for (const ro of roList) ro.disconnect?.()
  roList = []
  window.removeEventListener('resize', setHeights)
  window.removeEventListener('orientationchange', setHeights)
})
</script>

<template>
  <div class="app">
    <TopBar v-if="!hideChrome" />
    <NavBar v-if="!hideChrome" />
    <main class="main" :style="mainStyle">
      <RouterView />
    </main>
    <FooterBar v-if="!hideChrome" />
  </div>
</template>

<style>
:root {
  --unach-gold: #d1af1c;
  --unach-navy: #0a3a66;

  --bars-height: 114px; /* altura total del header (parte fija superior) */
  --footer-height: 52px; /* altura del footer fijo */
}

* { box-sizing: border-box; }

html, body { height: 100%; margin: 0; }
body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #111;
  background: #f6f7fb;
  overflow-x: hidden;
}
#app { max-width: none; margin: 0; padding: 0; }

/* Layout principal */
.main {
  min-height: calc(100vh - var(--bars-height) - var(--footer-height));
  padding-inline: 20px;
  padding-top: calc(var(--bars-height) + 12px);
  padding-bottom: calc(var(--footer-height) + 16px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
}

.page { padding-bottom: calc(var(--footer-height) + env(safe-area-inset-bottom, 0px)); }
:target { scroll-margin-top: calc(var(--bars-height) + 12px); }

:where(.navbar a, .navbar button):focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
.navbar { box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.12); }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .01ms !important; animation-iteration-count: 1 !important;
      transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
</style>
