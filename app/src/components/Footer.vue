<template>
  <div class="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
    <div
      class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between"
    >
      <div class="flex items-center space-x-2 text-sm font-medium mb-2 sm:mb-0">
        <img
          src="/logo.png"
          alt="NASAFISHA — NAKURU CLEAN — MUNICIPAL SOLID WASTE MANAGEMENT. NAKURU COUNTY."
          class="h-8 w-auto"
        />
        <span>© {{ currentYear }} Info-Space Meta. All rights reserved.</span>
      </div>

      <div class="flex space-x-4 text-sm">
        <a href="#" class="hover:underline">About</a>
        <a href="#" class="hover:underline">Contact</a>
        <a href="#" class="hover:underline">Privacy</a>
      </div>
    </div>
  </div>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>
