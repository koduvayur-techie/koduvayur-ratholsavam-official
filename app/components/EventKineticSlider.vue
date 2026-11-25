<!-- app/components/EventKineticSlider.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EventCategoryGroup } from '~/data/festival2026'

const props = defineProps<{
  category: EventCategoryGroup
}>()

const { openLightboxById } = useFestivalModals()

const viewportRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const scrubRailRef = ref<HTMLElement | null>(null)
const isScrubbingRail = ref(false)

let cachedRailLeft = 0
let cachedRailWidth = 1

const isPairCategory = computed(() => props.category.slides.length === 2)

const slideCountClass = computed(() => {
  const len = props.category.slides.length
  if (len === 2) return 'kr-track--pair'
  if (len === 3) return 'kr-track--trio'
  return 'kr-track--multi'
})

const {
  snapPoints,
  activeSnapIndex,
  visibleRangeLabel,
  isDragging,
  isScrollable,
  canScrollPrev,
  canScrollNext,
  scrollProgress,
  handlePointerDown,
  handleKeydown,
  scrollNext,
  scrollPrev,
  scrollToSnap,
  scrubToRatio,
  settleNearestSnap,
  shouldSuppressClick,
} = useKineticSlider(viewportRef, trackRef)

const clampedProgress = computed(() =>
  Math.min(1, Math.max(0, scrollProgress.value)),
)

function handleCardClick(slideId: string, e: MouseEvent) {
  if (shouldSuppressClick()) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  openLightboxById(slideId)
}

function handleFallbackError(e: Event) {
  const img = e.target as HTMLImageElement | null
  if (img && !img.src.endsWith('/images/rad-pc.jpg')) {
    img.src = '/images/rad-pc.jpg'
  }
}

function applyCachedRailScrub(clientX: number) {
  const ratio = Math.min(1, Math.max(0, (clientX - cachedRailLeft) / cachedRailWidth))
  scrubToRatio(ratio)
}

function handleRailPointerDown(e: PointerEvent) {
  const rail = scrubRailRef.value
  if (!rail || !isScrollable.value) return
  if (e.pointerType === 'mouse' && e.button !== 0) return

  const rect = rail.getBoundingClientRect()
  cachedRailLeft = rect.left
  cachedRailWidth = Math.max(1, rect.width)

  isScrubbingRail.value = true
  rail.setPointerCapture(e.pointerId)
  applyCachedRailScrub(e.clientX)
}

function handleRailPointerMove(e: PointerEvent) {
  if (!isScrubbingRail.value) return
  applyCachedRailScrub(e.clientX)
}

function finishRailScrub(e: PointerEvent) {
  if (!isScrubbingRail.value) return
  const rail = scrubRailRef.value
  if (rail && rail.hasPointerCapture(e.pointerId)) {
    rail.releasePointerCapture(e.pointerId)
  }
  isScrubbingRail.value = false
  settleNearestSnap()
}
</script>

<template>
  <section :id="props.category.id" class="border-b border-[var(--kr-border)]">
    <div class="mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      <!-- Decorated Category Header + Counter & Prev/Next Controls -->
      <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div class="min-w-0 flex-1">
          <SectionHeading
            :eyebrow="props.category.eyebrow"
            :title="props.category.title"
            :lead="props.category.lead"
          />
        </div>

        <div
          v-if="isScrollable"
          v-reveal="{ delay: 80 }"
          class="flex shrink-0 items-center justify-between gap-3 md:justify-end"
        >
          <span
            class="font-sans text-xs tracking-[0.1em] text-[var(--kr-ink-muted)] tabular-nums md:mr-1"
            aria-live="polite"
          >
            {{ visibleRangeLabel }}
          </span>

          <div class="flex items-center gap-2">
            <button
              type="button"
              data-cursor-interactive
              :disabled="!canScrollPrev"
              :aria-label="`Previous ${props.category.title} cards`"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] text-[var(--kr-ink)] shadow-2xs transition-all duration-250 enabled:hover:-translate-y-0.5 enabled:hover:border-[var(--kr-gold)] enabled:hover:text-[var(--kr-gold-deep)] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
              @click="scrollPrev"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.65" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12.5 4.5 7 10l5.5 5.5" />
              </svg>
            </button>

            <button
              type="button"
              data-cursor-interactive
              :disabled="!canScrollNext"
              :aria-label="`Next ${props.category.title} cards`"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] text-[var(--kr-ink)] shadow-2xs transition-all duration-250 enabled:hover:-translate-y-0.5 enabled:hover:border-[var(--kr-gold)] enabled:hover:text-[var(--kr-gold-deep)] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
              @click="scrollNext"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.65" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 4.5 13 10l-5.5 5.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Kinetic Horizontal Viewport -->
      <div
        ref="viewportRef"
        v-reveal="{ delay: 90 }"
        role="region"
        :tabindex="isScrollable ? 0 : -1"
        :aria-label="`${props.category.title} gallery slider`"
        class="kr-slider-viewport -mx-0.5 mt-7 overflow-hidden px-0.5 py-2 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)] sm:mt-8"
        :class="[
          isPairCategory ? 'kr-viewport--pair' : '',
          isScrollable ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : '',
        ]"
        @pointerdown="handlePointerDown"
        @keydown="handleKeydown"
      >
        <div
          ref="trackRef"
          class="kr-slider-track flex items-start"
          :class="[slideCountClass, isScrollable ? 'kr-slider-track--kinetic' : '']"
        >
          <button
            v-for="slide in props.category.slides"
            :key="slide.id"
            type="button"
            data-cursor-interactive
            :aria-label="slide.caption"
            :style="{ aspectRatio: `${slide.width} / ${slide.height}` }"
            class="kr-slider-card kr-sacred-frame group relative block shrink-0 overflow-hidden rounded-[3px] bg-[var(--kr-surface-elevated)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
            @click="handleCardClick(slide.id, $event)"
            @dragstart.prevent
          >
            <ImageExpandBadge size="md" />
            <img
              :src="slide.src"
              :alt="slide.alt"
              :width="slide.width"
              :height="slide.height"
              draggable="false"
              loading="lazy"
              decoding="async"
              class="pointer-events-none h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.028]"
              @error="handleFallbackError"
            />
          </button>
        </div>
      </div>

      <!-- Bottom Interactive Gold Scrub Rail + Snap Indicators -->
      <div
        v-if="isScrollable"
        v-reveal="{ delay: 130 }"
        class="mt-5 flex items-center justify-between gap-4 sm:mt-6"
      >
        <div
          ref="scrubRailRef"
          data-cursor-interactive
          role="slider"
          tabindex="-1"
          :aria-label="`Scrub ${props.category.title} timeline`"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :aria-valuenow="Math.round(clampedProgress * 100)"
          class="group relative mx-1.5 flex h-6 flex-1 cursor-pointer touch-none items-center"
          @pointerdown="handleRailPointerDown"
          @pointermove="handleRailPointerMove"
          @pointerup="finishRailScrub"
          @pointercancel="finishRailScrub"
          @lostpointercapture="finishRailScrub"
        >
          <div class="relative h-[2px] w-full overflow-hidden rounded-full bg-[var(--kr-border-strong)]/45 transition-all duration-200 group-hover:h-[3px]">
            <div
              class="h-full w-full origin-left rounded-full bg-gradient-to-r from-[var(--kr-gold-deep)] via-[var(--kr-gold)] to-[var(--kr-gold-bright)]"
              :style="{ transform: `scaleX(${clampedProgress})` }"
            />
          </div>

          <span
            class="pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[var(--kr-gold-deep)] bg-[var(--kr-surface-elevated)] shadow-2xs transition-transform duration-200 group-hover:scale-125"
            :style="{ left: `${clampedProgress * 100}%` }"
            aria-hidden="true"
          />
        </div>

        <div v-if="snapPoints.length <= 12" class="hidden items-center gap-1.5 sm:flex">
          <button
            v-for="(_, idx) in snapPoints"
            :key="idx"
            type="button"
            data-cursor-interactive
            :aria-label="`Jump to slide position ${idx + 1}`"
            class="h-2 rounded-full transition-all duration-300 focus:outline-none"
            :class="
              idx === activeSnapIndex
                ? 'w-5 bg-[var(--kr-gold-deep)]'
                : 'w-2 bg-[var(--kr-border-strong)] hover:bg-[var(--kr-gold)]'
            "
            @click="scrollToSnap(idx)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kr-slider-viewport {
  touch-action: pan-y pinch-zoom;
}

.kr-slider-track {
  --kr-slide-gap: 1rem;
  gap: var(--kr-slide-gap);
}

.kr-slider-track--kinetic {
  will-change: transform;
}

/* Portrait Mobile (< 540px): ~1.22 cards visible so next card peeks cleanly */
.kr-slider-card {
  width: 79%;
}

/* 540px+: 2-card category fills exact 2 balanced columns; 3+ cards peek kinetically */
@media (min-width: 540px) {
  .kr-slider-track {
    --kr-slide-gap: 1.15rem;
  }

  .kr-track--pair .kr-slider-card {
    width: calc((100% - var(--kr-slide-gap)) / 2);
  }

  .kr-track--trio .kr-slider-card,
  .kr-track--multi .kr-slider-card {
    width: calc((100% - var(--kr-slide-gap)) / 2.22);
  }
}

/* Tablets & Foldables (768px – 1023px) */
@media (min-width: 768px) {
  .kr-slider-track {
    --kr-slide-gap: 1.35rem;
  }

  .kr-track--pair .kr-slider-card {
    width: calc((100% - var(--kr-slide-gap)) / 2);
  }

  .kr-track--trio .kr-slider-card,
  .kr-track--multi .kr-slider-card {
    width: calc((100% - var(--kr-slide-gap) * 2) / 2.68);
  }
}

/* Auto-Rotated Mobile Landscape (< 1024px width & short height): Fit posters inside viewport height */
@media (max-width: 1023.98px) and (max-height: 540px) and (orientation: landscape) {
  .kr-viewport--pair {
    max-width: min(100%, calc((100dvh - 6.5rem) * 1.65));
    margin-inline: auto;
  }

  .kr-track--trio .kr-slider-card,
  .kr-track--multi .kr-slider-card {
    width: calc((100% - var(--kr-slide-gap) * 3) / 3.35);
  }
}

/* Laptops (1024px+): Laptop-height-friendly centered diptych for 2-card 4:5 section */
@media (min-width: 1024px) {
  .kr-slider-track {
    --kr-slide-gap: 1.5rem;
  }

  .kr-viewport--pair {
    max-width: 56rem;
    margin-inline: auto;
  }

  .kr-track--pair .kr-slider-card {
    width: calc((100% - var(--kr-slide-gap)) / 2);
  }

  .kr-track--trio .kr-slider-card {
    width: calc((100% - var(--kr-slide-gap) * 2) / 3);
  }

  .kr-track--multi .kr-slider-card {
    width: calc((100% - var(--kr-slide-gap) * 2) / 3.16);
  }
}

/* Wide Desktops (1280px+) */
@media (min-width: 1280px) {
  .kr-track--multi .kr-slider-card {
    width: calc((100% - var(--kr-slide-gap) * 3) / 3.35);
  }
}

/* Tall Desktop Monitors (1440px+ width & 940px+ height): Extra breathing scale for 4:5 pair */
@media (min-width: 1440px) and (min-height: 940px) {
  .kr-viewport--pair {
    max-width: 64rem;
  }
}
</style>