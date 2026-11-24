<!-- app/components/CommitteeSection.vue -->
<script setup lang="ts">
import { FESTIVAL_2026_DATA } from '~/data/festival2026'

const { openLightboxById } = useFestivalModals()
const committee = FESTIVAL_2026_DATA.committee

function handlePanelClick(panelId: string) {
  openLightboxById(panelId)
}
</script>

<template>
  <section id="committee" class="border-b border-[var(--kr-border)]">
    <div class="mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-14 lg:px-10 lg:py-18">
      <SectionHeading
        eyebrow="2026 Organizing Leadership"
        :title="committee.title"
        :lead="committee.lead"
      />

      <div class="kr-leaders-row mt-8 sm:mt-10">
        <article
          v-for="leader in committee.topLeaders"
          :key="leader.id"
          v-reveal
          class="kr-leader-card flex flex-col justify-between rounded-[3px] border border-[var(--kr-border-strong)] bg-[var(--kr-surface)] p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--kr-gold)] sm:p-6"
        >
          <div>
            <p class="font-sans text-[0.68rem] tracking-[0.2em] text-[var(--kr-gold-deep)] uppercase">
              {{ leader.role }}
            </p>
            <h3
              class="mt-1.5 font-serif text-[1.42rem] leading-snug font-semibold text-[var(--kr-ink)] lg:text-[1.54rem]"
            >
              {{ leader.name }}
            </h3>
          </div>

          <a
            :href="leader.phoneHref"
            data-cursor-interactive
            class="mt-4 inline-flex w-fit items-center gap-2 font-sans text-[0.9rem] text-[var(--kr-ink-secondary)] transition-colors duration-200 hover:text-[var(--kr-gold-deep)] focus:outline-none focus-visible:underline"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              class="h-4 w-4 text-[var(--kr-gold)]"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.5 4.25A1.75 1.75 0 0 1 4.25 2.5h2.1c.78 0 1.46.52 1.68 1.27l.67 2.24a1.75 1.75 0 0 1-.52 1.81l-1.1.96a11.2 11.2 0 0 0 4.88 4.88l.96-1.1a1.75 1.75 0 0 1 1.81-.52l2.24.67c.75.22 1.27.9 1.27 1.68v2.1a1.75 1.75 0 0 1-1.75 1.75h-.75C8.36 18.24 1.76 11.64 1.76 3.5v-.75Z"
              />
            </svg>
            <span class="tabular-nums">{{ leader.phoneDisplay }}</span>
          </a>
        </article>
      </div>

      <!-- English & Malayalam 1:1 Committee Notices -->
      <div class="kr-committee-panels mt-7 sm:mt-8">
        <button
          v-for="panel in committee.noticePanels"
          :key="panel.id"
          v-reveal
          type="button"
          data-cursor-interactive
          :aria-label="`Expand ${panel.alt}`"
          class="kr-sacred-frame group relative block aspect-square w-full overflow-hidden rounded-[3px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
          @click="handlePanelClick(panel.id)"
        >
          <img
            :src="panel.src"
            :alt="panel.alt"
            :width="panel.width"
            :height="panel.height"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.024]"
          />

          <span
            v-if="panel.badgeLabel"
            class="pointer-events-none absolute right-3.5 bottom-3.5 z-10 inline-flex items-center gap-1.5 rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface)]/92 px-3 py-1 font-sans text-[0.72rem] text-[var(--kr-ink)] backdrop-blur-xs transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="h-3.5 w-3.5 text-[var(--kr-gold-deep)]">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.5h-4v4m9-4h4v4m0 5v4h-4m-9 0h4v-4" />
            </svg>
            <span>{{ panel.badgeLabel }}</span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kr-leaders-row {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

@media (min-width: 768px), ((orientation: landscape) and (min-width: 568px)) {
  .kr-leaders-row {
    flex-direction: row;
    align-items: stretch;
    gap: 1.25rem;
  }

  .kr-leader-card {
    flex: 1 1 0%;
    min-width: 0;
  }
}

.kr-committee-panels {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 33rem;
  margin-inline: auto;
}

@media (orientation: landscape) and (min-width: 568px) {
  .kr-committee-panels {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
    max-width: none;
    margin-inline: 0;
  }
}
</style>