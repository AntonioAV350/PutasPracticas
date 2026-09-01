<template>
  <div class="container mx-auto">
    <div class="md:flex items-center">
      <div class="w-full">
        <h2 class="text-sm md:text-2xl text-white-800 dark:text-white uppercase">
          <span class="font-bold">{{ selectedOpcion }}</span>
        </h2>
      </div>
    </div>
    <div class="md:flex justify-around">
      <div class="w-full">
        <p class="text-[10px] text-sm md:text-base text-white-800 dark:text-white uppercase">
          Ciclo escolar: <strong class="text-[10px] text-sm md:text-base font-bold text-white-400">{{
            cicloEscolar
          }}</strong>
        </p>
      </div>
      <div class="w-full md:text-right">
        <p class="text-[10px] text-sm md:text-base text-white-800 dark:text-white uppercase">
          Facultad de Negocios
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["selectedOpcion"]),
    cicloEscolar() {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // getMonth() devuelve 0-11

      if (currentMonth >= 1 && currentMonth <= 6) {
        return `Ene - Jun ${currentYear}`;
      } else {
        return `Ago - Dic ${currentYear}`;
      }
    },
  },
};
</script>
