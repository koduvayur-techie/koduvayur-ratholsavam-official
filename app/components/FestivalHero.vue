<!-- app/components/FestivalHero.vue -->
<script setup lang="ts">
import { FESTIVAL_2026_DATA } from '~/data/festival2026'

const { openVideo, openLightboxById } = useFestivalModals()
const heroData = FESTIVAL_2026_DATA.hero

function handleCoverClick() {
  openLightboxById(heroData.coverImage.id)
}
</script>

<template>
  <section class="kr-hero-section border-b border-[var(--kr-border)]">
    <div class="kr-hero-container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-10 lg:py-14 xl:py-16">
      <div class="kr-hero-stage">
        <!-- Left / Top Editorial Column (Staggered Item-by-Item) -->
        <div class="kr-hero-copy">
          <h1
            v-reveal
            class="font-serif text-[clamp(2.7rem,6.3vw,4.85rem)] leading-[0.95] font-medium tracking-[-0.018em] text-[var(--kr-ink)]"
          >
            <span class="block">{{ heroData.titleLine1 }}</span>
            <span class="block">{{ heroData.titleLine2 }}</span>
          </h1>

          <!-- Dates & Malayalam Calendar Era -->
          <div v-reveal class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 sm:mt-5">
            <span class="font-serif text-[1.24rem] font-semibold text-[var(--kr-ink)] sm:text-[1.36rem]">
              {{ heroData.datesPrimary }}
            </span>
            <span class="h-1 w-1 rounded-full bg-[var(--kr-gold)]" aria-hidden="true" />
            <span class="font-sans text-[0.86rem] text-[var(--kr-ink-muted)] sm:text-[0.9rem]">
              {{ heroData.datesMalayalamEra }}
            </span>
          </div>

          <p
            v-reveal
            class="mt-3.5 max-w-xl font-sans text-[0.96rem] leading-[1.7] text-[var(--kr-ink-secondary)] sm:mt-4 sm:text-[1.02rem]"
          >
            {{ heroData.shortIntro }}
          </p>

          <!-- Matched-Height Ceremonial Action Pair: Watch Film + Download Notice PDF -->
          <div v-reveal class="kr-hero-actions mt-6 flex flex-wrap items-center gap-3.5 sm:mt-7 sm:gap-4">
            <!-- Primary CTA: Watch Festival Film -->
            <button
              type="button"
              data-cursor-interactive
              class="kr-video-cta group relative inline-flex h-[3.35rem] items-center gap-3.5 overflow-hidden rounded-full pr-6 pl-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
              @click="openVideo"
            >
              <!-- Burnished Gold Play Medallion -->
              <span
                class="kr-play-medallion relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#24160a] transition-transform duration-300 group-hover:scale-108"
                aria-hidden="true"
              >
                <span class="kr-play-pulse absolute inset-0 rounded-full" />
                <svg viewBox="0 0 24 24" class="relative h-4 w-4 translate-x-[1px]" fill="currentColor">
                  <path d="M7 5.25v13.5L18.25 12 7 5.25z" />
                </svg>
              </span>

              <span class="flex flex-col">
                <span class="font-sans text-[0.62rem] tracking-[0.22em] text-[#e8c882] uppercase">
                  Official Preview
                </span>
                <span class="font-serif text-[1.1rem] leading-none font-medium text-[#fbf8f2] sm:text-[1.14rem]">
                  {{ heroData.videoCtaLabel }}
                </span>
              </span>
            </button>

            <!-- Secondary CTA: Download Notice PDF (Crafted Parchment & Brass Pill) -->
            <a
              :href="heroData.noticePdfUrl"
              download
              data-cursor-interactive
              class="kr-pdf-cta group inline-flex h-[3.35rem] items-center gap-3 rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] pr-4 pl-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--kr-gold)] hover:bg-[var(--kr-surface)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kr-border)] bg-[var(--kr-bg)] text-[var(--kr-gold-deep)] transition-colors duration-300 group-hover:border-[var(--kr-gold)] group-hover:bg-[var(--kr-gold)]/12"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.65"
                  class="h-4 w-4 transition-transform duration-300 group-hover:translate-y-[1.5px]"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 3.75v11.25m0 0 4-4m-4 4-4-4M4.5 17.25v1.5A1.5 1.5 0 0 0 6 20.25h12a1.5 1.5 0 0 0 1.5-1.5v-1.5"
                  />
                </svg>
              </span>

              <span class="font-sans text-[0.88rem] text-[var(--kr-ink)]">
                {{ heroData.noticePdfLabel }}
              </span>

              <span
                class="rounded-full border border-[var(--kr-border)] bg-[var(--kr-bg)] px-2 py-0.5 font-sans text-[0.65rem] tracking-[0.12em] text-[var(--kr-gold-deep)] uppercase"
              >
                PDF
              </span>
            </a>
          </div>
        </div>

        <!-- Right / Bottom Cover Media Frame (8:5 / 16:10) -->
        <div v-reveal class="kr-hero-media-col">
          <button
            type="button"
            data-cursor-interactive
            aria-label="View festival cover photograph in full screen"
            class="kr-sacred-frame kr-hero-frame group block w-full overflow-hidden rounded-[3px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
            @click="handleCoverClick"
          >
            <span class="kr-corner-dot top-3 left-3" aria-hidden="true" />
            <span class="kr-corner-dot top-3 right-3" aria-hidden="true" />
            <span class="kr-corner-dot right-3 bottom-3" aria-hidden="true" />
            <span class="kr-corner-dot bottom-3 left-3" aria-hidden="true" />

            <img
              :src="heroData.coverImage.src"
              :alt="heroData.coverImage.alt"
              :width="heroData.coverImage.width"
              :height="heroData.coverImage.height"
              fetchpriority="high"
              loading="eager"
              decoding="async"
              class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.028]"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Default < 1024px: Block stack with text on top */
.kr-hero-stage {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.kr-hero-media-col {
  width: 100%;
}

.kr-hero-frame {
  aspect-ratio: 16 / 10;
}

/* Narrow Mobile (< 430px): Balanced Full-Width Tactile Buttons */
@media (max-width: 429.98px) {
  .kr-hero-actions > * {
    width: 100%;
  }

  .kr-pdf-cta {
    justify-content: space-between;
  }
}

/* Tablet & Foldable Width Cap (640px – 1023px Portrait/Square): Curated Proportion */
@media (min-width: 640px) and (max-width: 1023.98px) {
  .kr-hero-media-col {
    max-width: min(82%, 45rem);
    margin-inline: auto;
  }
}

/* Auto-Rotated Mobile Landscape (< 1024px width & short height): Compact Two-Column Fit */
@media (max-width: 1023.98px) and (max-height: 540px) and (orientation: landscape) {
  .kr-hero-container {
    padding-block: 1.35rem;
  }

  .kr-hero-stage {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
    align-items: center;
    gap: 1.5rem;
  }

  .kr-hero-media-col {
    max-width: none;
    margin-inline: 0;
  }
}

/* 1024px+ (Laptops): Left-Right Editorial Split */
@media (min-width: 1024px) {
  .kr-hero-stage {
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
    align-items: center;
    gap: 2.75rem;
  }
}

/* 1280px+ (Wide Desktop & Ultrawide): Strict 16:10 (8:5) Gallery Lock */
@media (min-width: 1280px) {
  .kr-hero-stage {
    grid-template-columns: minmax(0, 0.94fr) minmax(0, 1.06fr);
    gap: 3.75rem;
  }

  .kr-hero-frame {
    aspect-ratio: 16 / 10;
  }
}

.kr-video-cta {
  background: linear-gradient(135deg, #24160d 0%, #3a2617 52%, #1f130b 100%);
  border: 1px solid rgba(217, 169, 76, 0.62);
  box-shadow:
    0 14px 30px -12px rgba(35, 22, 13, 0.55),
    inset 0 1px 0 rgba(255, 238, 196, 0.18);
}

.kr-video-cta:hover {
  border-color: rgba(238, 197, 110, 0.95);
  box-shadow:
    0 18px 36px -12px rgba(35, 22, 13, 0.65),
    0 0 22px rgba(217, 169, 76, 0.24);
}

.kr-play-medallion {
  background: linear-gradient(145deg, #f8e2a6 0%, #d6a240 55%, #9d6d14 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.kr-pdf-cta {
  box-shadow: 0 8px 22px -14px rgba(35, 22, 13, 0.22);
}

@keyframes krPulseRing {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.68);
    opacity: 0;
  }
}

.kr-play-pulse {
  border: 1.5px solid #ebca7e;
  animation: krPulseRing 2.3s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}

.kr-corner-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background-color: var(--kr-gold);
  z-index: 3;
  pointer-events: none;
}
</style>