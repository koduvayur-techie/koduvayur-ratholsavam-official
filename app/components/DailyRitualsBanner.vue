<!-- app/components/DailyRitualsBanner.vue -->
<script setup lang="ts">
import { FESTIVAL_2026_DATA } from '~/data/festival2026'

const note = FESTIVAL_2026_DATA.dailyRitualsNote
</script>

<template>
  <div class="border-b border-[var(--kr-border)] bg-[var(--kr-surface)]/80">
    <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
      <div
        v-reveal
        class="flex flex-col gap-2 rounded-[3px] border border-[var(--kr-border-strong)] bg-[var(--kr-bg)]/75 px-4 py-3.5 sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between md:gap-6"
      >
        <div class="flex shrink-0 items-center gap-2">
          <svg
            viewBox="0 0 12 12"
            class="h-2.5 w-2.5 shrink-0 text-[var(--kr-gold)]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6 0L12 6L6 12L0 6L6 0Z" />
          </svg>
          <span class="font-sans text-[0.7rem] tracking-[0.18em] text-[var(--kr-gold-deep)] uppercase">
            {{ note.datesBadge }}
          </span>
        </div>

        <p class="font-sans text-[0.88rem] leading-[1.65] text-[var(--kr-ink-secondary)] sm:text-[0.92rem]">
          {{ note.text }}
        </p>
      </div>
    </div>
  </div>
</template>