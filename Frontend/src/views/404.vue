<template>
  <body
    class="h-screen overflow-hidden flex items-center justify-center bg-slate-300"
  >
    <div
      class="min-w-screen min-h-screen flex items-center p-5 lg:p-20 overflow-hidden relative"
    >
      <div
        class="flex-1 min-h-full min-w-full rounded-3xl bg-white shadow-xl p-10 lg:p-20 text-gray-800 relative md:flex items-center text-center md:text-left"
      >
        <div class="w-full md:w-1/2">
          <div class="mb-10 lg:mb-20"></div>
          <div class="mb-10 md:mb-20 text-gray-600 font-normal text-xl">
            <h1
              class="font-black uppercase text-3xl lg:text-5xl text-yellow-500 mb-7"
            >
              ¡PARECES ESTAR PERDIDO!!
            </h1>
            <p class="mx-5">La página que estás buscando no está disponible.</p>
            <p class="mx-5">
              Intente buscar nuevamente o use el botón Regresar a continuación.
            </p>
          </div>
          <div class="mb-20 md:mb-0 mx-5">
            <router-link to="/">
              <button
                class="text-lg font-light outline-none focus:outline-none transform transition-all hover:scale-110 text-yellow-500 hover:text-yellow-600"
              >
              Regresar al inicio
              </button>
            </router-link>
          </div>
        </div>
        <div class="w-full md:w-1/2 text-center">
          <img src="../assets/404.png" alt="" />
        </div>
      </div>
    </div>
  </body>
</template>
