<!-- app/components/ImageExpandBadge.vue -->
<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'md' | 'sm'
  }>(),
  {
    size: 'md',
  },
)
</script>

<template>
  <span
    aria-hidden="true"
    class="kr-expand-badge pointer-events-none absolute z-10 flex items-center justify-center rounded-full border border-[#d9a94c]/48 bg-[#120c07]/68 text-[#f6ebd4] shadow-[0_2px_8px_rgba(0,0,0,0.36)] transition-transform duration-300 ease-out group-hover:scale-108 group-hover:border-[#ebca7e]/80 group-hover:bg-[#120c07]/82"
    :class="
      size === 'sm'
        ? 'top-1.5 right-1.5 h-5 w-5 opacity-85 group-hover:opacity-100 sm:top-2 sm:right-2 sm:h-5.5 sm:w-5.5'
        : 'top-2.5 right-2.5 h-7 w-7 opacity-90 group-hover:opacity-100 sm:top-3 sm:right-3 sm:h-7.5 sm:w-7.5'
    "
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      :stroke-width="size === 'sm' ? '1.75' : '1.5'"
      :class="size === 'sm' ? 'h-3 w-3 sm:h-3.25 sm:w-3.25' : 'h-4 w-4 sm:h-4.25 sm:w-4.25'"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  </span>
</template>