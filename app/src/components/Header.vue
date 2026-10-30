<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-transparent dark:bg-gray-900 shadow"
  >
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center space-x-2">
        <img
          src="/logo.png"
          alt="NASAFISHA — NAKURU CLEAN — MUNICIPAL SOLID WASTE MANAGEMENT. NAKURU COUNTY."
          class="h-12 w-auto"
        />
        <span class="text-xl font-semibold text-gray-800 dark:text-white"
          >NASAFISHA</span
        >
      </div>

      <div class="flex items-center gap-4">
        <button
          class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded me-2"
          @click="navigate()"
        >
          View Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "../router";

const navigate = () => {
  router.push("/home");
};
</script>
