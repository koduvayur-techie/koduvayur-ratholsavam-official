<!-- app/components/SponsorLogoBand.vue -->
<script setup lang="ts">
import type { SponsorBandGroup } from '~/data/sponsors2026'

const props = defineProps<{
  band: SponsorBandGroup
}>()

const { openSponsorLightboxById } = useFestivalModals()

function handleFallbackError(e: Event) {
  const img = e.target as HTMLImageElement | null
  if (img && !img.src.endsWith('/images/rad-pc.jpg')) {
    img.src = '/images/rad-pc.jpg'
  }
}
</script>

<template>
  <section
    :id="props.band.id"
    aria-label="Festival Sponsors"
    class="border-b border-[var(--kr-border)] bg-[var(--kr-bg-warm)]/38"
  >
    <div
      class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10"
      :class="props.band.variant === 'flagship' ? 'py-7 sm:py-9' : 'py-5 sm:py-7'"
    >
      <!-- Variant 1: Top 2 Flagship Sponsors (3:1 · 1 col portrait mobile -> 2 cols side-by-side) -->
      <div
        v-if="props.band.variant === 'flagship'"
        class="kr-sponsor-flagship-grid"
      >
        <button
          v-for="sponsor in props.band.items"
          :key="sponsor.id"
          v-reveal
          type="button"
          data-cursor-interactive
          :aria-label="`View advertisement for ${sponsor.name}`"
          class="kr-sacred-frame group relative block aspect-[3/1] w-full overflow-hidden rounded-[3px] bg-[var(--kr-surface-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
          @click="openSponsorLightboxById(sponsor.id)"
        >
          <ImageExpandBadge size="sm" />
          <img
            :src="sponsor.thumbSrc"
            :alt="sponsor.name"
            :width="sponsor.thumbWidth"
            :height="sponsor.thumbHeight"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            @error="handleFallbackError"
          />
        </button>
      </div>

      <!-- Variant 2: Standard 4-Sponsor Band (5:2 · 2 cols mobile -> 4 cols single line desktop) -->
      <div
        v-else-if="props.band.variant === 'standard'"
        class="kr-sponsor-standard-grid"
      >
        <button
          v-for="sponsor in props.band.items"
          :key="sponsor.id"
          v-reveal
          type="button"
          data-cursor-interactive
          :aria-label="`View advertisement for ${sponsor.name}`"
          class="group relative block aspect-[5/2] w-full overflow-hidden rounded-[3px] border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--kr-gold)] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
          @click="openSponsorLightboxById(sponsor.id)"
        >
          <ImageExpandBadge size="sm" />
          <img
            :src="sponsor.thumbSrc"
            :alt="sponsor.name"
            :width="sponsor.thumbWidth"
            :height="sponsor.thumbHeight"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            @error="handleFallbackError"
          />
        </button>
      </div>

      <!-- Variant 3: Bottom Single 3:1 Strip (Centered Flexbox) -->
      <div
        v-else
        class="flex justify-center"
      >
        <button
          v-for="sponsor in props.band.items"
          :key="sponsor.id"
          v-reveal
          type="button"
          data-cursor-interactive
          :aria-label="`View advertisement for ${sponsor.name}`"
          class="kr-closing-single-card kr-sacred-frame group relative block aspect-[3/1] w-full overflow-hidden rounded-[3px] bg-[var(--kr-surface-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
          @click="openSponsorLightboxById(sponsor.id)"
        >
          <ImageExpandBadge size="sm" />
          <img
            :src="sponsor.thumbSrc"
            :alt="sponsor.name"
            :width="sponsor.thumbWidth"
            :height="sponsor.thumbHeight"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            @error="handleFallbackError"
          />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Flagships: 1 per row on portrait mobile, 2 side-by-side on 640px+ & landscape mobile */
.kr-sponsor-flagship-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;
}

@media (min-width: 640px), ((orientation: landscape) and (min-width: 540px)) {
  .kr-sponsor-flagship-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.35rem;
  }
}

/* Standard 4-Ad Band: 2 per row on mobile (2x2), 4 on 1 single line on 768px+ */
.kr-sponsor-standard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .kr-sponsor-standard-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.15rem;
  }
}

/* Bottom Single 3:1 Strip: Centered at exact single-flagship proportion on desktop */
.kr-closing-single-card {
  max-width: 100%;
}

@media (min-width: 640px), ((orientation: landscape) and (min-width: 540px)) {
  .kr-closing-single-card {
    width: calc((100% - 1.35rem) / 2);
    max-width: 37rem;
  }
}
</style>