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
const stageLayerRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)

// 1x Swipe / Vertical-Dismiss state
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const isSwipeDragging = ref(false)

// Multi-Touch Zoom & 2D Pan state
const zoomScale = ref(1)
const panX = ref(0)
const panY = ref(0)
const isZoomInteracting = ref(false)
const isZoomAnimating = ref(false)

const totalCount = computed(() => lightboxItems.value.length)
const currentSlide = computed(() => lightboxItems.value[lightboxIndex.value] ?? null)
const canNavigateLoop = computed(() => totalCount.value > 1)
const isZoomed = computed(() => zoomScale.value > 1.03 || isZoomInteracting.value)

const stageTransformStyle = computed(() => {
  if (zoomScale.value !== 1 || panX.value !== 0 || panY.value !== 0 || isZoomAnimating.value) {
    return {
      transform: `translate3d(${panX.value.toFixed(1)}px, ${panY.value.toFixed(1)}px, 0) scale(${zoomScale.value.toFixed(4)})`,
      transition: isZoomInteracting.value
        ? 'none'
        : `transform ${FESTIVAL_CHOREOGRAPHY.lightbox.zoomTransitionMs}ms ${FESTIVAL_CHOREOGRAPHY.easeOutQuint}`,
    }
  }

  if (!isSwipeDragging.value && dragOffsetX.value === 0 && dragOffsetY.value === 0) {
    return {}
  }

  const verticalRatio = Math.min(1, Math.abs(dragOffsetY.value) / 260)
  const scale = 1 - verticalRatio * 0.08
  return {
    transform: `translate3d(${dragOffsetX.value.toFixed(1)}px, ${(dragOffsetY.value * 0.65).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`,
    transition: isSwipeDragging.value
      ? 'none'
      : `transform ${FESTIVAL_CHOREOGRAPHY.lightbox.zoomTransitionMs}ms ${FESTIVAL_CHOREOGRAPHY.easeOutQuint}`,
  }
})

interface PointerPoint {
  x: number
  y: number
}

const TAP_SLOP_PX = 10
const activePointers = new Map<number, PointerPoint>()
const capturedPointerIds = new Set<number>()

let viewportW = 1
let viewportH = 1
let baseImgW = 0
let baseImgH = 0

// Pinch & 2D Pan snapshots
let pinchStartDist = 1
let pinchStartScale = 1
let pinchStartMidOffsetX = 0
let pinchStartMidOffsetY = 0
let pinchStartPanX = 0
let pinchStartPanY = 0

let panStartClientX = 0
let panStartClientY = 0
let panOriginX = 0
let panOriginY = 0
let panEngaged = false

// Single-pointer gesture & hit-target tracking (recorded BEFORE any capture)
let primaryPointerId = -1
let downStartX = 0
let downStartY = 0
let downOnImage = false
let downOnBackdrop = false
let gestureMode: 'none' | 'swipe' | 'pan' | 'pinch' = 'none'
let hadMultiTouch = false
let pointerMovedBeyondTap = false

let swipeStartX = 0
let swipeStartY = 0
let swipeLastX = 0
let swipeLastTime = 0
let swipeVxPxPerMs = 0
let swipeAxis: 'x' | 'y' | null = null

let lastTapTime = 0
let lastTapX = 0
let lastTapY = 0
let lastWheelStepTime = 0
let zoomAnimTimer: ReturnType<typeof setTimeout> | null = null

function clearZoomAnimTimer() {
  if (zoomAnimTimer !== null) {
    clearTimeout(zoomAnimTimer)
    zoomAnimTimer = null
  }
}

function triggerSmoothZoomTransition() {
  clearZoomAnimTimer()
  isZoomAnimating.value = true
  zoomAnimTimer = setTimeout(() => {
    isZoomAnimating.value = false
    zoomAnimTimer = null
  }, FESTIVAL_CHOREOGRAPHY.lightbox.zoomTransitionMs + 25)
}

function captureStagePointer(pointerId: number) {
  if (capturedPointerIds.has(pointerId)) return
  const el = stageLayerRef.value
  if (!el) return
  try {
    el.setPointerCapture(pointerId)
    capturedPointerIds.add(pointerId)
  } catch {
    // Ignore if pointer already lifted
  }
}

function releaseStagePointer(pointerId: number) {
  if (!capturedPointerIds.has(pointerId)) return
  capturedPointerIds.delete(pointerId)
  const el = stageLayerRef.value
  if (!el) return
  try {
    if (el.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId)
    }
  } catch {
    // Ignore if already released
  }
}

function isPointOnImage(clientX: number, clientY: number, target: EventTarget | null): boolean {
  const targetEl = target as HTMLElement | null
  if (targetEl?.closest('.kr-lightbox-img') || targetEl?.closest('.kr-lightbox-stage-box')) {
    const img = imgRef.value
    if (!img) return true
    const rect = img.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      )
    }
    return true
  }

  const img = imgRef.value
  if (!img) return false
  const rect = img.getBoundingClientRect()
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  )
}

function syncViewportAndImageMetrics() {
  if (typeof window === 'undefined') return
  viewportW = Math.max(1, window.innerWidth)
  viewportH = Math.max(1, window.innerHeight)

  const img = imgRef.value
  if (img && img.offsetWidth > 0 && img.offsetHeight > 0) {
    baseImgW = img.offsetWidth
    baseImgH = img.offsetHeight
  }
}

function clampPanBounds(rawX: number, rawY: number, scale: number): [number, number] {
  if (scale <= 1.01) return [0, 0]
  syncViewportAndImageMetrics()

  const bw = baseImgW || Math.min(viewportW * 0.88, 720)
  const bh = baseImgH || Math.min(viewportH * 0.72, 720)
  const scaledW = bw * scale
  const scaledH = bh * scale

  const maxX = Math.max((scaledW - bw) * 0.38, (scaledW - viewportW) / 2 + 24)
  const maxY = Math.max((scaledH - bh) * 0.38, (scaledH - viewportH) / 2 + 48)

  return [
    Math.min(maxX, Math.max(-maxX, rawX)),
    Math.min(maxY, Math.max(-maxY, rawY)),
  ]
}

function resetSwipeState() {
  isSwipeDragging.value = false
  dragOffsetX.value = 0
  dragOffsetY.value = 0
  swipeAxis = null
}

function resetAllTransformState(animate = false) {
  for (const id of Array.from(capturedPointerIds)) {
    releaseStagePointer(id)
  }
  activePointers.clear()
  gestureMode = 'none'
  hadMultiTouch = false
  panEngaged = false
  isZoomInteracting.value = false
  resetSwipeState()

  if (animate && (zoomScale.value !== 1 || panX.value !== 0 || panY.value !== 0)) {
    triggerSmoothZoomTransition()
  } else {
    clearZoomAnimTimer()
    isZoomAnimating.value = false
  }

  zoomScale.value = 1
  panX.value = 0
  panY.value = 0
}

function zoomAroundClientPoint(
  targetScale: number,
  clientX: number,
  clientY: number,
  animate: boolean,
) {
  syncViewportAndImageMetrics()
  const { minZoomScale, maxZoomScale } = FESTIVAL_CHOREOGRAPHY.lightbox
  const clampedScale = Math.min(maxZoomScale, Math.max(minZoomScale, targetScale))

  if (clampedScale <= 1.03) {
    resetAllTransformState(animate)
    return
  }

  const ox = clientX - viewportW / 2
  const oy = clientY - viewportH / 2
  const nextPanX = ox - ((ox - panX.value) / zoomScale.value) * clampedScale
  const nextPanY = oy - ((oy - panY.value) / zoomScale.value) * clampedScale
  const [cx, cy] = clampPanBounds(nextPanX, nextPanY, clampedScale)

  if (animate) triggerSmoothZoomTransition()
  zoomScale.value = clampedScale
  panX.value = cx
  panY.value = cy
}

function toggleDoubleTapZoom(clientX: number, clientY: number) {
  // If zoomed in at ANY level (from double-tap, pinch-zoom, or wheel), settle cleanly to 1x default
  if (zoomScale.value > 1.03 || panX.value !== 0 || panY.value !== 0) {
    resetAllTransformState(true)
  } else {
    zoomAroundClientPoint(
      FESTIVAL_CHOREOGRAPHY.lightbox.doubleTapZoomScale,
      clientX,
      clientY,
      true,
    )
  }
}

function snapshotPinchBaseline() {
  const pts = Array.from(activePointers.values())
  if (pts.length < 2) return
  const [p1, p2] = [pts[0]!, pts[1]!]
  syncViewportAndImageMetrics()

  pinchStartDist = Math.max(12, Math.hypot(p2.x - p1.x, p2.y - p1.y))
  pinchStartScale = zoomScale.value
  pinchStartMidOffsetX = (p1.x + p2.x) / 2 - viewportW / 2
  pinchStartMidOffsetY = (p1.y + p2.y) / 2 - viewportH / 2
  pinchStartPanX = panX.value
  pinchStartPanY = panY.value
}

function snapshotSinglePanBaseline(pt: PointerPoint) {
  panStartClientX = pt.x
  panStartClientY = pt.y
  panOriginX = panX.value
  panOriginY = panY.value
}

function handleStagePointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  const targetEl = e.target as HTMLElement | null
  if (targetEl?.closest('button')) return

  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  // 2+ fingers -> immediately engage multi-touch pinch + midpoint pan
  if (activePointers.size >= 2) {
    clearZoomAnimTimer()
    isZoomAnimating.value = false
    hadMultiTouch = true
    pointerMovedBeyondTap = true
    panEngaged = true
    gestureMode = 'pinch'
    resetSwipeState()
    isZoomInteracting.value = true

    for (const id of activePointers.keys()) {
      captureStagePointer(id)
    }
    snapshotPinchBaseline()
    return
  }

  // Single pointer down — record hit target BEFORE any lazy pointer capture
  primaryPointerId = e.pointerId
  downStartX = e.clientX
  downStartY = e.clientY
  downOnImage = isPointOnImage(e.clientX, e.clientY, e.target)
  downOnBackdrop = !downOnImage
  hadMultiTouch = false
  pointerMovedBeyondTap = false
  panEngaged = false

  if (zoomScale.value > 1.03) {
    gestureMode = 'pan'
    snapshotSinglePanBaseline({ x: e.clientX, y: e.clientY })
  } else {
    gestureMode = 'swipe'
    swipeStartX = e.clientX
    swipeStartY = e.clientY
    swipeLastX = e.clientX
    swipeLastTime = performance.now()
    swipeVxPxPerMs = 0
    swipeAxis = null
  }
}

function handleStagePointerMove(e: PointerEvent) {
  if (!activePointers.has(e.pointerId)) return
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (gestureMode === 'pinch' && activePointers.size >= 2) {
    const pts = Array.from(activePointers.values())
    const [p1, p2] = [pts[0]!, pts[1]!]
    const dist = Math.max(8, Math.hypot(p2.x - p1.x, p2.y - p1.y))
    const midOffsetX = (p1.x + p2.x) / 2 - viewportW / 2
    const midOffsetY = (p1.y + p2.y) / 2 - viewportH / 2

    const { maxZoomScale } = FESTIVAL_CHOREOGRAPHY.lightbox
    let nextScale = pinchStartScale * (dist / pinchStartDist)

    if (nextScale < 1) {
      nextScale = 1 - (1 - nextScale) * 0.32
      nextScale = Math.max(0.82, nextScale)
    } else if (nextScale > maxZoomScale) {
      nextScale = maxZoomScale + (nextScale - maxZoomScale) * 0.24
    }

    zoomScale.value = nextScale
    panX.value =
      midOffsetX - ((pinchStartMidOffsetX - pinchStartPanX) / pinchStartScale) * nextScale
    panY.value =
      midOffsetY - ((pinchStartMidOffsetY - pinchStartPanY) / pinchStartScale) * nextScale
    return
  }

  if (gestureMode === 'pan' && activePointers.size === 1 && e.pointerId === primaryPointerId) {
    if (!panEngaged) {
      const distFromDown = Math.hypot(e.clientX - downStartX, e.clientY - downStartY)
      if (distFromDown <= TAP_SLOP_PX) return

      // Engage lazy pan seamlessly with zero jump
      clearZoomAnimTimer()
      isZoomAnimating.value = false
      panEngaged = true
      pointerMovedBeyondTap = true
      isZoomInteracting.value = true
      captureStagePointer(e.pointerId)
      snapshotSinglePanBaseline({ x: e.clientX, y: e.clientY })
      return
    }

    const dx = e.clientX - panStartClientX
    const dy = e.clientY - panStartClientY
    const [cx, cy] = clampPanBounds(panOriginX + dx, panOriginY + dy, zoomScale.value)
    panX.value = cx
    panY.value = cy
    return
  }

  if (gestureMode === 'swipe' && activePointers.size === 1 && e.pointerId === primaryPointerId) {
    const rawDx = e.clientX - downStartX
    const rawDy = e.clientY - downStartY

    if (swipeAxis === null) {
      if (Math.hypot(rawDx, rawDy) <= TAP_SLOP_PX) return

      // Engage 1x swipe seamlessly with zero jump
      pointerMovedBeyondTap = true
      isSwipeDragging.value = true
      swipeAxis = Math.abs(rawDx) >= Math.abs(rawDy) ? 'x' : 'y'
      swipeStartX = e.clientX
      swipeStartY = e.clientY
      swipeLastX = e.clientX
      swipeLastTime = performance.now()
      captureStagePointer(e.pointerId)
      return
    }

    const dx = e.clientX - swipeStartX
    const dy = e.clientY - swipeStartY
    const now = performance.now()
    const dt = Math.max(1, now - swipeLastTime)
    swipeVxPxPerMs = swipeVxPxPerMs * 0.4 + ((e.clientX - swipeLastX) / dt) * 0.6
    swipeLastX = e.clientX
    swipeLastTime = now

    const { rubberBandEdgeFactor } = FESTIVAL_CHOREOGRAPHY.lightbox
    if (swipeAxis === 'x') {
      dragOffsetX.value = canNavigateLoop.value ? dx : dx * rubberBandEdgeFactor
      dragOffsetY.value = 0
    } else {
      dragOffsetX.value = dx * 0.18
      dragOffsetY.value = dy
    }
  }
}

function handleStagePointerUp(e: PointerEvent) {
  if (!activePointers.has(e.pointerId)) return
  releaseStagePointer(e.pointerId)
  activePointers.delete(e.pointerId)

  // Seamless 2-finger pinch -> 1-finger pan handoff
  if (activePointers.size === 1) {
    const [remainingId, remainingPt] = Array.from(activePointers.entries())[0]!
    primaryPointerId = remainingId
    if (zoomScale.value > 1.03) {
      gestureMode = 'pan'
      panEngaged = true
      isZoomInteracting.value = true
      snapshotSinglePanBaseline(remainingPt)
    } else {
      gestureMode = 'none'
    }
    return
  }

  if (activePointers.size > 1) {
    snapshotPinchBaseline()
    return
  }

  // All pointers lifted — 1. Check stationary Tap / Double-Tap first
  const now = performance.now()
  if (!hadMultiTouch && !pointerMovedBeyondTap) {
    const currentlyZoomed = zoomScale.value > 1.03 || panX.value !== 0 || panY.value !== 0

    // Tap on image (at 1x or zoomed) OR tap anywhere on stage while zoomed -> Double-Tap candidate
    if (downOnImage || currentlyZoomed) {
      const { doubleTapDelayMs, doubleTapMaxDistPx } = FESTIVAL_CHOREOGRAPHY.lightbox
      const dt = now - lastTapTime
      const dist = Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY)

      if (lastTapTime > 0 && dt <= doubleTapDelayMs && dist <= doubleTapMaxDistPx) {
        lastTapTime = 0
        isZoomInteracting.value = false
        panEngaged = false
        gestureMode = 'none'
        resetSwipeState()
        toggleDoubleTapZoom(e.clientX, e.clientY)
        return
      }

      lastTapTime = now
      lastTapX = e.clientX
      lastTapY = e.clientY
      isZoomInteracting.value = false
      panEngaged = false
      gestureMode = 'none'
      resetSwipeState()
      return
    }

    // Stationary single click/tap strictly on empty dark backdrop at 1x -> Close lightbox
    if (downOnBackdrop && !currentlyZoomed) {
      lastTapTime = 0
      gestureMode = 'none'
      resetSwipeState()
      closeLightbox()
      return
    }
  } else {
    lastTapTime = 0
  }

  // 2. Settle Pinch or 2D Pan
  if (gestureMode === 'pinch' || gestureMode === 'pan') {
    isZoomInteracting.value = false
    panEngaged = false
    gestureMode = 'none'
    const { maxZoomScale } = FESTIVAL_CHOREOGRAPHY.lightbox

    if (zoomScale.value <= 1.03) {
      resetAllTransformState(true)
    } else {
      const settledScale = Math.min(maxZoomScale, zoomScale.value)
      const [cx, cy] = clampPanBounds(panX.value, panY.value, settledScale)
      if (settledScale !== zoomScale.value || cx !== panX.value || cy !== panY.value) {
        triggerSmoothZoomTransition()
        zoomScale.value = settledScale
        panX.value = cx
        panY.value = cy
      }
    }
    return
  }

  // 3. Settle 1x Horizontal Swipe or Vertical Dismiss
  if (gestureMode === 'swipe' && isSwipeDragging.value) {
    const dx = e.clientX - swipeStartX
    const dy = e.clientY - swipeStartY
    const {
      swipeDistanceThresholdPx,
      swipeVelocityThresholdPxPerMs,
      verticalDismissThresholdPx,
    } = FESTIVAL_CHOREOGRAPHY.lightbox

    const axis = swipeAxis
    gestureMode = 'none'
    resetSwipeState()

    if (axis === 'y' && Math.abs(dy) >= verticalDismissThresholdPx) {
      closeLightbox()
      return
    }

    if (axis === 'x' && canNavigateLoop.value) {
      const isStrongFlick = Math.abs(swipeVxPxPerMs) >= swipeVelocityThresholdPxPerMs
      if (dx <= -swipeDistanceThresholdPx || (isStrongFlick && swipeVxPxPerMs < 0)) {
        nextLightboxSlide()
      } else if (dx >= swipeDistanceThresholdPx || (isStrongFlick && swipeVxPxPerMs > 0)) {
        prevLightboxSlide()
      }
    }
  } else {
    gestureMode = 'none'
    resetSwipeState()
  }
}

function handleStagePointerCancel(e: PointerEvent) {
  releaseStagePointer(e.pointerId)
  activePointers.delete(e.pointerId)
  if (activePointers.size === 0) {
    isZoomInteracting.value = false
    panEngaged = false
    gestureMode = 'none'
    resetSwipeState()
    if (zoomScale.value <= 1.03) {
      resetAllTransformState(true)
    } else {
      const settledScale = Math.min(
        FESTIVAL_CHOREOGRAPHY.lightbox.maxZoomScale,
        zoomScale.value,
      )
      const [cx, cy] = clampPanBounds(panX.value, panY.value, settledScale)
      zoomScale.value = settledScale
      panX.value = cx
      panY.value = cy
    }
  }
}

function handleWheel(e: WheelEvent) {
  if (!isLightboxOpen.value) return
  e.preventDefault()

  // Trackpad pinch (ctrlKey) or scroll-wheel while zoomed -> cursor-anchored zoom
  if (e.ctrlKey || zoomScale.value > 1.03) {
    const factor = e.deltaY < 0 ? 1.14 : 1 / 1.14
    zoomAroundClientPoint(zoomScale.value * factor, e.clientX, e.clientY, false)
    return
  }

  if (!canNavigateLoop.value) return
  const now = performance.now()
  if (now - lastWheelStepTime < FESTIVAL_CHOREOGRAPHY.lightbox.wheelCooldownMs) return

  const primaryDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
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
    case '0':
      if (isZoomed.value) {
        e.preventDefault()
        resetAllTransformState(true)
      }
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

function handleViewportResizeOrRotate() {
  if (!isLightboxOpen.value) return
  requestAnimationFrame(() => {
    syncViewportAndImageMetrics()
    if (zoomScale.value > 1.03) {
      const [cx, cy] = clampPanBounds(panX.value, panY.value, zoomScale.value)
      panX.value = cx
      panY.value = cy
    }
  })
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

watch(
  () => [isLightboxOpen.value, lightboxIndex.value] as const,
  async ([open, idx]) => {
    resetAllTransformState(false)
    baseImgW = 0
    baseImgH = 0
    lastTapTime = 0

    if (open) {
      preloadNeighbors(idx)
      await nextTick()
      syncViewportAndImageMetrics()
      rootRef.value?.focus({ preventScroll: true })
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleViewportResizeOrRotate, { passive: true })
  window.addEventListener('orientationchange', handleViewportResizeOrRotate, { passive: true })
})

onUnmounted(() => {
  clearZoomAnimTimer()
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleViewportResizeOrRotate)
  window.removeEventListener('orientationchange', handleViewportResizeOrRotate)
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
        class="kr-lightbox-backdrop fixed inset-0 z-[85] overflow-hidden touch-none select-none focus:outline-none"
        @wheel="handleWheel"
      >
        <!-- Top Absolute Header: Counter + 1x Reset + Close Button (z-30) -->
        <header
          class="kr-lightbox-top pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-3.5 pb-1.5 sm:px-7 sm:pt-4"
        >
          <span
            class="rounded-full bg-black/38 px-2.5 py-0.5 font-sans text-[0.76rem] tracking-[0.12em] text-[#ede4d3]/75 tabular-nums transition-opacity duration-200 sm:text-[0.8rem]"
            :class="isZoomed ? 'opacity-0' : 'opacity-100'"
            aria-live="polite"
          >
            {{ lightboxIndex + 1 }} of {{ totalCount }}
          </span>

          <div class="pointer-events-auto flex items-center gap-2">
            <button
              v-if="isZoomed"
              type="button"
              data-cursor-interactive
              aria-label="Reset zoom"
              class="flex h-10 items-center justify-center rounded-full border border-[#d9a94c]/38 bg-black/65 px-3 font-sans text-[0.72rem] tracking-[0.08em] text-[#f6f1e7] tabular-nums backdrop-blur-md transition-all duration-200 hover:border-[#ebca7e] hover:text-[#f8dfa1] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a94c]"
              @click.stop="resetAllTransformState(true)"
            >
              1×
            </button>

            <button
              type="button"
              data-cursor-interactive
              aria-label="Close gallery viewer"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9a94c]/38 bg-black/65 text-[#f6f1e7] backdrop-blur-md transition-all duration-250 hover:scale-105 hover:border-[#ebca7e] hover:text-[#f8dfa1] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a94c]"
              @click.stop="closeLightbox"
            >
              <svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </header>

        <!-- Desktop / Landscape Side Navigation Arrows -->
        <button
          v-if="canNavigateLoop"
          type="button"
          data-cursor-interactive
          aria-label="Previous image"
          class="kr-side-nav left-4 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-[#d9a94c]/38 bg-black/55 text-[#f6f1e7] backdrop-blur-md transition-all duration-250 hover:scale-106 hover:border-[#ebca7e] hover:text-[#f8dfa1] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a94c] sm:left-6 lg:left-8"
          :class="isZoomed ? 'pointer-events-none opacity-0' : 'opacity-100'"
          @click.stop="prevLightboxSlide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 5.25 8.25 12 15 18.75" />
          </svg>
        </button>

        <button
          v-if="canNavigateLoop"
          type="button"
          data-cursor-interactive
          aria-label="Next image"
          class="kr-side-nav right-4 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-[#d9a94c]/38 bg-black/55 text-[#f6f1e7] backdrop-blur-md transition-all duration-250 hover:scale-106 hover:border-[#ebca7e] hover:text-[#f8dfa1] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a94c] sm:right-6 lg:right-8"
          :class="isZoomed ? 'pointer-events-none opacity-0' : 'opacity-100'"
          @click.stop="nextLightboxSlide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5.25 15.75 12 9 18.75" />
          </svg>
        </button>

        <!-- Full-Bleed Interactive Stage: z-10 at rest, rises to z-25 OVER caption (z-15) when zoomed -->
        <div
          ref="stageLayerRef"
          class="kr-lightbox-stage-layer absolute inset-0 flex items-center justify-center"
          :class="isZoomed ? 'z-25' : 'z-10'"
          @pointerdown="handleStagePointerDown"
          @pointermove="handleStagePointerMove"
          @pointerup="handleStagePointerUp"
          @pointercancel="handleStagePointerCancel"
        >
          <div
            class="kr-lightbox-stage-box flex items-center justify-center will-change-transform"
            :style="stageTransformStyle"
          >
            <Transition
              :name="lightboxDirection === 'next' ? 'kr-slide-next' : 'kr-slide-prev'"
              mode="out-in"
            >
              <img
                :key="currentSlide.id"
                ref="imgRef"
                :src="currentSlide.src"
                :alt="currentSlide.alt"
                :width="currentSlide.width"
                :height="currentSlide.height"
                draggable="false"
                decoding="async"
                class="kr-lightbox-img block rounded-[3px] border border-[#d9a94c]/35 bg-[#16100b] object-contain shadow-[0_28px_80px_rgba(0,0,0,0.85)]"
                :class="
                  isZoomed
                    ? 'cursor-move'
                    : isSwipeDragging
                      ? 'cursor-grabbing'
                      : 'cursor-grab'
                "
                @load="syncViewportAndImageMetrics"
                @dragstart.prevent
                @error="handleFallbackError"
              />
            </Transition>
          </div>
        </div>

        <!-- Absolute Bottom Caption (line-clamp-2, z-15 so zoomed image at z-25 overlaps it cleanly) -->
        <footer
          class="kr-lightbox-bottom pointer-events-none absolute inset-x-0 bottom-0 z-15 mx-auto flex w-full max-w-4xl flex-col items-center gap-2.5 px-4 pt-2 pb-4 text-center sm:px-8 sm:pb-5"
        >
          <p
            v-if="currentSlide.caption"
            class="kr-lightbox-caption line-clamp-2 max-w-2xl rounded-md bg-black/42 px-3 py-1 font-sans text-[0.82rem] leading-relaxed text-[#f2eadb]/86 sm:text-[0.88rem]"
            aria-live="polite"
          >
            {{ currentSlide.caption }}
          </p>

          <div
            v-if="canNavigateLoop"
            class="kr-mobile-bottom-nav flex items-center justify-center gap-4 transition-opacity duration-200"
            :class="isZoomed ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'"
          >
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
  background: radial-gradient(
    ellipse at center,
    rgba(22, 15, 9, 0.92) 0%,
    rgba(8, 5, 3, 0.97) 75%,
    #050302 100%
  );
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

/* Portrait mobile resting optical balance: clears both top header and bottom 2-line caption + nav */
.kr-lightbox-stage-layer {
  padding-bottom: 2.25rem;
}

.kr-lightbox-img {
  max-width: min(92vw, 68rem);
  max-height: calc(100dvh - 13.25rem);
  width: auto;
  height: auto;
}

.kr-lightbox-caption {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 768px), (orientation: landscape) {
  .kr-lightbox-stage-layer {
    padding-bottom: 0;
  }

  .kr-side-nav {
    display: flex;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .kr-mobile-bottom-nav {
    display: none;
  }

  .kr-lightbox-img {
    max-width: min(80vw, 70rem);
    max-height: calc(100dvh - 8.25rem);
  }
}

@media (max-height: 540px) and (orientation: landscape) {
  .kr-lightbox-top {
    padding-top: 0.45rem;
    padding-bottom: 0.2rem;
  }

  .kr-lightbox-bottom {
    padding-top: 0.2rem;
    padding-bottom: 0.45rem;
  }

  .kr-lightbox-caption {
    font-size: 0.74rem;
    line-height: 1.35;
  }

  .kr-lightbox-img {
    max-width: 74vw;
    max-height: calc(100dvh - 5.5rem);
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