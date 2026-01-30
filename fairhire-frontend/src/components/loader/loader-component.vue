<script setup>
import { defineProps, onMounted, onBeforeUnmount, onUnmounted } from "vue";
const props = defineProps({
  color: {
    type: String,
    default: "#7D4996",
  },
  show: {
    type: Boolean,
  },
  message: {
    type: String,
    default: "Please wait while processing",
  },
});
</script>
<template>
  <div
    v-if="show"
    class="fixed z-50 inset-0 bg-gray-300 opacity-[85%] flex flex-col gap-4 justify-center items-center h-screen"
  >
    <svg
      class="mr-3 h-12 w-12 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="gray-500"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        :fill="color"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p
      class="opacity-100 z-[51] font-medium text-lg text-center px-4 max-w-md"
      :style="{ color: color }"
    >
      {{ message }}...
    </p>
  </div>
</template>

<style scoped></style>
