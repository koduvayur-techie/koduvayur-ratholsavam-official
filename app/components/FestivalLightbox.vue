<!-- app/components/FestivalLightbox.vue -->
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { FESTIVAL_CHOREOGRAPHY } from '~/constants/choreography'

const {
  isLightboxOpen,
  lightboxItems,
  lightboxIndex,
  lightboxDirection,
  setLightboxIndex,
  nextLightboxSlide,
  prevLightboxSlide,
  closeLightbox,
} = useFestivalModals()

const rootRef = ref<HTMLElement | null>(null)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const isGestureDragging = ref(false)

const totalCount = computed(() => lightboxItems.value.length)
const currentSlide = computed(() => lightboxItems.value[lightboxIndex.value] ?? null)
const canNavigateLoop = computed(() => totalCount.value > 1)

const stageDragStyle = computed(() => {
  if (!isGestureDragging.value && dragOffsetX.value === 0 && dragOffsetY.value === 0) {
    return {}
  }
  const verticalRatio = Math.min(1, Math.abs(dragOffsetY.value) / 260)
  const scale = 1 - verticalRatio * 0.08
  return {
    transform: `translate3d(${dragOffsetX.value.toFixed(1)}px, ${(dragOffsetY.value * 0.65).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`,
    transition: isGestureDragging.value
      ? 'none'
      : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
  }
})

let activePointerId = -1
let startX = 0
let startY = 0
let lastX = 0
let lastTime = 0
let vxPxPerMs = 0
let gestureAxis: 'x' | 'y' | null = null
let lastWheelStepTime = 0

function resetDragPosition() {
  isGestureDragging.value = false
  dragOffsetX.value = 0
  dragOffsetY.value = 0
  gestureAxis = null
  activePointerId = -1
}

function preloadNeighbors(centerIdx: number) {
  if (typeof window === 'undefined') return
  const items = lightboxItems.value
  const len = items.length
  if (len <= 1) return

  for (const offset of [-1, 1, 2]) {
    const wrappedIdx = ((centerIdx + offset) % len + len) % len
    const neighbor = items[wrappedIdx]
    if (neighbor?.src) {
      const img = new Image()
      img.decoding = 'async'
      img.src = neighbor.src
    }
  }
}

function handleFallbackError(e: Event) {
  const img = e.target as HTMLImageElement | null
  if (img && !img.src.endsWith('/images/rad-pc.jpg')) {
    img.src = '/images/rad-pc.jpg'
  }
}

function handleStagePointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  if ((e.target as HTMLElement | null)?.closest('button')) return

  activePointerId = e.pointerId
  startX = e.clientX
  startY = e.clientY
  lastX = e.clientX
  lastTime = performance.now()
  vxPxPerMs = 0
  gestureAxis = null
  isGestureDragging.value = true
}

function handleStagePointerMove(e: PointerEvent) {
  if (!isGestureDragging.value || e.pointerId !== activePointerId) return

  const dx = e.clientX - startX
  const dy = e.clientY - startY

  if (gestureAxis === null) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
    gestureAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
  }

  const now = performance.now()
  const dt = Math.max(1, now - lastTime)
  vxPxPerMs = vxPxPerMs * 0.4 + ((e.clientX - lastX) / dt) * 0.6
  lastX = e.clientX
  lastTime = now

  const { rubberBandEdgeFactor } = FESTIVAL_CHOREOGRAPHY.lightbox

  if (gestureAxis === 'x') {
    dragOffsetX.value = canNavigateLoop.value ? dx : dx * rubberBandEdgeFactor
    dragOffsetY.value = 0
  } else {
    dragOffsetX.value = dx * 0.18
    dragOffsetY.value = dy
  }
}

function handleStagePointerUp(e: PointerEvent) {
  if (!isGestureDragging.value || e.pointerId !== activePointerId) return

  const dx = e.clientX - startX
  const dy = e.clientY - startY
  const {
    swipeDistanceThresholdPx,
    swipeVelocityThresholdPxPerMs,
    verticalDismissThresholdPx,
  } = FESTIVAL_CHOREOGRAPHY.lightbox

  const axis = gestureAxis
  resetDragPosition()

  if (axis === 'y' && Math.abs(dy) >= verticalDismissThresholdPx) {
    closeLightbox()
    return
  }

  if (axis === 'x' && canNavigateLoop.value) {
    const isStrongFlick = Math.abs(vxPxPerMs) >= swipeVelocityThresholdPxPerMs
    if (dx <= -swipeDistanceThresholdPx || (isStrongFlick && vxPxPerMs < 0)) {
      nextLightboxSlide()
    } else if (dx >= swipeDistanceThresholdPx || (isStrongFlick && vxPxPerMs > 0)) {
      prevLightboxSlide()
    }
  }
}

function handleWheel(e: WheelEvent) {
  if (!isLightboxOpen.value) return
  e.preventDefault()
  if (!canNavigateLoop.value) return

  const now = performance.now()
  if (now - lastWheelStepTime < FESTIVAL_CHOREOGRAPHY.lightbox.wheelCooldownMs) return

  const primaryDelta =
    Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  if (Math.abs(primaryDelta) < 14) return

  lastWheelStepTime = now
  if (primaryDelta > 0) {
    nextLightboxSlide()
  } else {
    prevLightboxSlide()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!isLightboxOpen.value) return

  switch (e.key) {
    case 'Escape':
      e.preventDefault()
      closeLightbox()
      break
    case 'ArrowRight':
    case 'PageDown':
      e.preventDefault()
      nextLightboxSlide()
      break
    case 'ArrowLeft':
    case 'PageUp':
      e.preventDefault()
      prevLightboxSlide()
      break
    case 'Home':
      e.preventDefault()
      setLightboxIndex(0)
      break
    case 'End':
      e.preventDefault()
      setLightboxIndex(totalCount.value - 1)
      break
  }
}

watch(
  () => [isLightboxOpen.value, lightboxIndex.value] as const,
  async ([open, idx]) => {
    resetDragPosition()
    if (open) {
      preloadNeighbors(idx)
      await nextTick()
      rootRef.value?.focus({ preventScroll: true })
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="kr-lightbox-fade">
      <div
        v-if="isLightboxOpen && currentSlide"
        ref="rootRef"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label="Gallery viewer"
        tabindex="-1"
        class="kr-lightbox-backdrop fixed inset-0 z-[85] grid touch-none select-none focus:outline-none"
        @wheel="handleWheel"
        @pointerdown="handleStagePointerDown"
        @pointermove="handleStagePointerMove"
        @pointerup="handleStagePointerUp"
        @pointercancel="resetDragPosition"
        @click.self="closeLightbox"
      >
        <!-- Row 1: Mild "1 of 31" Counter on Left + Close Button on Right -->
        <header
          class="kr-lightbox-top z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-3.5 pb-1.5 sm:px-7 sm:pt-4"
          @click.self="closeLightbox"
        >
          <span
            class="font-sans text-[0.76rem] tracking-[0.12em] text-[#ede4d3]/65 tabular-nums sm:text-[0.8rem]"
            aria-live="polite"
          >
            {{ lightboxIndex + 1 }} of {{ totalCount }}
          </span>

          <button
            type="button"
            data-cursor-interactive
            aria-label="Close gallery viewer"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9a94c]/38 bg-black/55 text-[#f6f1e7] backdrop-blur-md transition-all duration-250 hover:scale-105 hover:border-[#ebca7e] hover:text-[#f8dfa1] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a94c]"
            @click.stop="closeLightbox"
          >
            <svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <!-- Row 2: Image Stage + Desktop/Landscape Side Arrows -->
        <div
          class="relative flex min-h-0 w-full items-center justify-center px-3 sm:px-16 lg:px-24"
          @click.self="closeLightbox"
        >
          <button
            v-if="canNavigateLoop"
            type="button"
            data-cursor-interactive
            aria-label="Previous image"
            class="kr-side-nav left-4 hidden h-11 w-11 items-center justify-center rounded-full border border-[#d9a94c]/38 bg-black/55 text-[#f6f1e7] backdrop-blur-md transition-all duration-250 hover:scale-106 hover:border-[#ebca7e] hover:text-[#f8dfa1] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a94c] sm:left-6 lg:left-8"
            @click.stop="prevLightboxSlide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 5.25 8.25 12 15 18.75" />
            </svg>
          </button>

          <div
            class="kr-lightbox-stage-box flex items-center justify-center"
            :style="stageDragStyle"
            @click.self="closeLightbox"
          >
            <Transition
              :name="lightboxDirection === 'next' ? 'kr-slide-next' : 'kr-slide-prev'"
              mode="out-in"
            >
              <img
                :key="currentSlide.id"
                :src="currentSlide.src"
                :alt="currentSlide.alt"
                :width="currentSlide.width"
                :height="currentSlide.height"
                draggable="false"
                decoding="async"
                class="kr-lightbox-img rounded-[3px] border border-[#d9a94c]/35 bg-[#16100b] object-contain shadow-[0_28px_80px_rgba(0,0,0,0.85)]"
                @dragstart.prevent
                @error="handleFallbackError"
              />
            </Transition>
          </div>

          <button
            v-if="canNavigateLoop"
            type="button"
            data-cursor-interactive
            aria-label="Next image"
            class="kr-side-nav right-4 hidden h-11 w-11 items-center justify-center rounded-full border border-[#d9a94c]/38 bg-black/55 text-[#f6f1e7] backdrop-blur-md transition-all duration-250 hover:scale-106 hover:border-[#ebca7e] hover:text-[#f8dfa1] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a94c] sm:right-6 lg:right-8"
            @click.stop="nextLightboxSlide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5.25 15.75 12 9 18.75" />
            </svg>
          </button>
        </div>

        <!-- Row 3: Subtle Bottom Caption + Portrait-Mobile Navigation Controls -->
        <footer
          class="kr-lightbox-bottom z-20 mx-auto flex w-full max-w-4xl flex-col items-center gap-3 px-4 pt-2 pb-4 text-center sm:px-8 sm:pb-5"
          @click.self="closeLightbox"
        >
          <p
            v-if="currentSlide.caption"
            class="kr-lightbox-caption max-w-2xl font-sans text-[0.82rem] leading-relaxed text-[#f2eadb]/82 sm:text-[0.88rem]"
            aria-live="polite"
          >
            {{ currentSlide.caption }}
          </p>

          <div v-if="canNavigateLoop" class="kr-mobile-bottom-nav flex items-center justify-center gap-4">
            <button
              type="button"
              data-cursor-interactive
              aria-label="Previous image"
              class="flex h-10 w-14 items-center justify-center rounded-full border border-[#d9a94c]/38 bg-black/60 text-[#f6f1e7] backdrop-blur-md transition-all active:scale-95"
              @click.stop="prevLightboxSlide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-4.5 w-4.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 5.25 8.25 12 15 18.75" />
              </svg>
            </button>

            <button
              type="button"
              data-cursor-interactive
              aria-label="Next image"
              class="flex h-10 w-14 items-center justify-center rounded-full border border-[#d9a94c]/38 bg-black/60 text-[#f6f1e7] backdrop-blur-md transition-all active:scale-95"
              @click.stop="nextLightboxSlide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-4.5 w-4.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5.25 15.75 12 9 18.75" />
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.kr-lightbox-backdrop {
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: radial-gradient(
    ellipse at center,
    rgba(22, 15, 9, 0.92) 0%,
    rgba(8, 5, 3, 0.97) 75%,
    #050302 100%
  );
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.kr-lightbox-img {
  max-width: min(92vw, 68rem);
  max-height: calc(100dvh - 11.75rem);
  width: auto;
  height: auto;
  cursor: grab;
}

.kr-lightbox-img:active {
  cursor: grabbing;
}

@media (min-width: 768px), (orientation: landscape) {
  .kr-side-nav {
    display: flex;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
  }

  .kr-mobile-bottom-nav {
    display: none;
  }

  .kr-lightbox-img {
    max-width: min(80vw, 70rem);
    max-height: calc(100dvh - 7.75rem);
  }
}

@media (max-height: 540px) and (orientation: landscape) {
  .kr-lightbox-top {
    padding-top: 0.45rem;
    padding-bottom: 0.2rem;
  }

  .kr-lightbox-bottom {
    padding-top: 0.25rem;
    padding-bottom: 0.45rem;
  }

  .kr-lightbox-caption {
    font-size: 0.74rem;
    line-height: 1.35;
  }

  .kr-lightbox-img {
    max-width: 74vw;
    max-height: calc(100dvh - 4.75rem);
  }
}

.kr-lightbox-fade-enter-active,
.kr-lightbox-fade-leave-active {
  transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.kr-lightbox-fade-enter-from,
.kr-lightbox-fade-leave-to {
  opacity: 0;
}

.kr-slide-next-enter-active,
.kr-slide-next-leave-active,
.kr-slide-prev-enter-active,
.kr-slide-prev-leave-active {
  transition:
    opacity 200ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.kr-slide-next-enter-from {
  opacity: 0;
  transform: translate3d(24px, 0, 0) scale(0.985);
}

.kr-slide-next-leave-to {
  opacity: 0;
  transform: translate3d(-24px, 0, 0) scale(0.985);
}

.kr-slide-prev-enter-from {
  opacity: 0;
  transform: translate3d(-24px, 0, 0) scale(0.985);
}

.kr-slide-prev-leave-to {
  opacity: 0;
  transform: translate3d(24px, 0, 0) scale(0.985);
}
</style>