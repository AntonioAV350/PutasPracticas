<template>
  <router-link :to="card.route">
    <div
      class="mb-6 border border-gray-400 dark:border-gray-600 rounded-lg rounded-lg shadow-lg shadow-gray-200 dark:shadow-gray-800 bg-white dark:bg-gray-800 duration-300 hover:-translate-y-3 hover:shadow-gray-400 dark:hover:shadow-gray-600"
    >
      <figure>
        <img
          :src="card.img"
          :alt="card.alt"
          class="h-80 w-full object-cover rounded-tl-lg rounded-tr-lg"
        />
        <figcaption class="p-4">
          <p
            class="text-lg mb-4 font-bold leading-relaxed text-gray-800 dark:text-gray-200"
          >
            {{ card.title }}
          </p>
          <small class="leading-5 text-gray-500 dark:text-gray-400">{{
            card.description
          }}</small>
        </figcaption>
      </figure>
    </div>
  </router-link>
</template>

<script>
export default {
  props: ["card"],
};
</script>
