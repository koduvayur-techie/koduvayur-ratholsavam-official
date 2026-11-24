<!-- app/components/FestivalClosingSection.vue -->
<script setup lang="ts">
import { FESTIVAL_2026_DATA } from '~/data/festival2026'

const { openInfo } = useFestivalModals()
const closing = FESTIVAL_2026_DATA.closingSection
</script>

<template>
  <section class="border-b border-[var(--kr-border)] bg-[var(--kr-surface)]">
    <div class="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-10 lg:py-20">
      <!-- Advertisements & Ground Stall Enquiries -->
      <div v-reveal class="mx-auto flex max-w-xl flex-col items-center gap-3.5">
        <p class="font-sans text-[0.9rem] leading-[1.7] text-[var(--kr-ink-secondary)] sm:text-[0.95rem]">
          {{ closing.enquiryText }}
        </p>

        <button
          type="button"
          data-cursor-interactive
          class="group inline-flex items-center gap-2.5 rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-bg)] px-5 py-2.5 font-sans text-[0.84rem] text-[var(--kr-ink)] shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--kr-gold)] hover:bg-[var(--kr-surface-elevated)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
          @click="openInfo"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-4.5 w-4.5 text-[var(--kr-gold-deep)]"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
          <span>{{ closing.contactTriggerLabel }}</span>
        </button>
      </div>

      <!-- Sacred Gold Finial Divider -->
      <div v-reveal="{ delay: 60 }" class="my-8 flex items-center justify-center gap-3 sm:my-10" aria-hidden="true">
        <span class="h-[1px] w-16 bg-gradient-to-r from-transparent to-[var(--kr-gold)]/65 sm:w-24" />
        <svg viewBox="0 0 12 12" class="h-2.5 w-2.5 text-[var(--kr-gold)]" fill="currentColor">
          <path d="M6 0L12 6L6 12L0 6L6 0Z" />
        </svg>
        <span class="h-[1px] w-16 bg-gradient-to-l from-transparent to-[var(--kr-gold)]/65 sm:w-24" />
      </div>

      <!-- Closing Line -->
      <p
        v-reveal="{ delay: 110 }"
        class="mx-auto max-w-2xl font-serif text-[clamp(1.45rem,2.8vw,2.15rem)] leading-[1.32] font-medium text-[var(--kr-ink)]"
      >
        {{ closing.farewellQuote }}
      </p>
    </div>
  </section>
</template>