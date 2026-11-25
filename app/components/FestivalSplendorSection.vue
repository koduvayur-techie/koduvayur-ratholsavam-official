<!-- app/components/FestivalSplendorSection.vue -->
<script setup lang="ts">
import { FESTIVAL_2026_DATA } from '~/data/festival2026'

const splendor = FESTIVAL_2026_DATA.splendor
</script>

<template>
  <section
    id="festival-splendor"
    class="border-b border-[var(--kr-border)] bg-[var(--kr-bg-warm)]/32"
  >
    <div class="mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      <SectionHeading
        :eyebrow="splendor.eyebrow"
        :title="splendor.title"
      />

      <div class="kr-splendor-grid mt-8 sm:mt-10">
        <article
          v-for="item in splendor.items"
          :key="item.id"
          v-reveal
          class="kr-splendor-card flex flex-col justify-between rounded-[3px] border border-[var(--kr-border-strong)] bg-[var(--kr-surface)] p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--kr-gold)] sm:p-6"
        >
          <!-- Card Header: Category Eyebrow + Subtle Thematic Ornament -->
          <div class="flex items-center justify-between gap-3">
            <p class="font-sans text-[0.68rem] tracking-[0.2em] text-[var(--kr-gold-deep)] uppercase">
              {{ item.category }}
            </p>

            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--kr-border)] bg-[var(--kr-bg)] text-[var(--kr-gold-deep)]"
              aria-hidden="true"
            >
              <!-- Light & Sound Icon -->
              <svg
                v-if="item.id === 'light-and-sound'"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.45"
                class="h-3.5 w-3.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 2.75v2m0 10.5v2M4.87 4.87l1.42 1.42m7.42 7.42 1.42 1.42M2.75 10h2m10.5 0h2M4.87 15.13l1.42-1.42m7.42-7.42 1.42-1.42M12.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                />
              </svg>

              <!-- Fireworks Starburst Icon -->
              <svg
                v-else-if="item.id === 'fireworks'"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.45"
                class="h-3.5 w-3.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 2.5v3.25m0 8.5v3.25M2.5 10h3.25m8.5 0h3.25M4.7 4.7l2.3 2.3m6 6 2.3 2.3m0-10.6-2.3 2.3m-6 6-2.3 2.3M10 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
                />
              </svg>

              <!-- Thirumanjanam Ceremonial Crown / Crest Icon -->
              <svg
                v-else
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.45"
                class="h-3.5 w-3.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 3.25c2.9 0 5.45 1.9 6.25 4.65H3.75c.8-2.75 3.35-4.65 6.25-4.65Zm0 0v-1m0 5.65v8.85m-3.25 0h6.5"
                />
              </svg>
            </span>
          </div>

          <!-- Card Body: Optional Kicker ("Presenting") + Honoree Name -->
          <div class="mt-4 pt-1">
            <p
              v-if="item.kicker"
              class="mb-1 font-sans text-[0.72rem] tracking-[0.16em] text-[var(--kr-ink-muted)] uppercase"
            >
              {{ item.kicker }}
            </p>
            <h3
              class="font-serif text-[1.4rem] leading-[1.2] font-semibold text-[var(--kr-ink)] lg:text-[1.52rem]"
            >
              {{ item.name }}
            </h3>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kr-splendor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;
}

@media (min-width: 768px), ((orientation: landscape) and (min-width: 568px)) {
  .kr-splendor-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }
}
</style>