<template>
  <img
    src="/logo.png"
    :alt="alt"
    :class="[imageClass, { 'rounded-xl ring-1 ring-white/20': onDark }]"
    decoding="async"
  >
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Rendered height of the logo. */
    size?: 'sm' | 'md' | 'lg';
    /** Kept for API compatibility; the wordmark is part of the logo image. */
    withText?: boolean;
    /** Use on dark backgrounds: adds rounded corners so the white plate reads as a card. */
    onDark?: boolean;
    alt?: string;
  }>(),
  {
    size: 'md',
    withText: true,
    onDark: false,
    alt: 'NASAFISHA — NAKURU CLEAN — MUNICIPAL SOLID WASTE MANAGEMENT. NAKURU COUNTY.'
  }
);

const imageClass = computed(() => {
  const dim =
    props.size === 'sm' ? 'h-8 w-auto' : props.size === 'lg' ? 'h-14 w-auto' : 'h-10 w-auto';
  return dim;
});
</script>
