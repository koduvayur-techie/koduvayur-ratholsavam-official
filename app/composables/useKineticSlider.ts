// app/composables/useKineticSlider.ts
import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue'
import { FESTIVAL_CHOREOGRAPHY } from '~/constants/choreography'

export function useKineticSlider(
  viewportRef: Ref<HTMLElement | null>,
  trackRef: Ref<HTMLElement | null>,
) {
  const currentOffset = ref(0)
  const maxScroll = ref(0)
  const snapPoints = ref<number[]>([0])
  const activeSnapIndex = ref(0)
  const visibleStartCard = ref(1)
  const visibleEndCard = ref(1)
  const totalCards = ref(1)
  const isDragging = ref(false)

  const isScrollable = computed(() => maxScroll.value > 2)
  const canScrollPrev = computed(() => isScrollable.value && currentOffset.value > 2)
  const canScrollNext = computed(
    () => isScrollable.value && currentOffset.value < maxScroll.value - 2,
  )
  const scrollProgress = computed(() => {
    if (maxScroll.value <= 0) return 1
    return Math.min(1, Math.max(0, currentOffset.value / maxScroll.value))
  })

  // Option A Counter: "1–3 of 8" on multi-card viewports, "1 of 8" on single-card mobile
  const visibleRangeLabel = computed(() => {
    const start = visibleStartCard.value
    const end = visibleEndCard.value
    const total = totalCards.value
    return start === end ? `${start} of ${total}` : `${start}–${end} of ${total}`
  })

  let internalOffset = 0
  let targetSnapOffset = 0
  let velocityPxPerFrame = 0
  let mode: 'idle' | 'dragging' | 'coasting' | 'snapping' = 'idle'
  let rafId: number | null = null
  let prevFrameTime = 0

  let pointerActive = false
  let activePointerId = -1
  let pointerStartX = 0
  let pointerStartY = 0
  let dragStartOffset = 0
  let lastPointerX = 0
  let lastPointerTime = 0
  let axisLocked: 'x' | 'y' | null = null
  let didDragGesture = false
  let suppressClickUntil = 0

  let resizeObserver: ResizeObserver | null = null
  let wheelSnapTimer: ReturnType<typeof setTimeout> | null = null

  function updateVisibleMetrics(px: number) {
    const pts = snapPoints.value
    if (pts.length <= 1) {
      activeSnapIndex.value = 0
    } else {
      let bestIdx = 0
      let bestDist = Infinity
      for (let i = 0; i < pts.length; i++) {
        const dist = Math.abs(pts[i]! - px)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      }
      activeSnapIndex.value = bestIdx
    }

    const viewport = viewportRef.value
    const track = trackRef.value
    if (!viewport || !track) return

    const children = Array.from(track.children) as HTMLElement[]
    const count = children.length
    totalCards.value = Math.max(1, count)
    if (count === 0) return

    const clampedPx = Math.max(0, Math.min(maxScroll.value, px))
    const viewStart = clampedPx
    const viewEnd = clampedPx + viewport.clientWidth

    let firstVisible = -1
    let lastVisible = -1

    for (let i = 0; i < count; i++) {
      const card = children[i]!
      const cLeft = card.offsetLeft
      const cWidth = card.offsetWidth
      const cRight = cLeft + cWidth
      const overlap = Math.min(viewEnd, cRight) - Math.max(viewStart, cLeft)

      if (cWidth > 0 && overlap / cWidth >= 0.72) {
        if (firstVisible === -1) firstVisible = i + 1
        lastVisible = i + 1
      }
    }

    if (firstVisible !== -1 && lastVisible !== -1) {
      visibleStartCard.value = firstVisible
      visibleEndCard.value = lastVisible
    } else {
      const fallbackCard = Math.min(count, activeSnapIndex.value + 1)
      visibleStartCard.value = fallbackCard
      visibleEndCard.value = fallbackCard
    }
  }

  function applyTransform(px: number) {
    internalOffset = px
    currentOffset.value = px
    if (trackRef.value) {
      trackRef.value.style.transform = `translate3d(${-px.toFixed(2)}px, 0, 0)`
    }
    updateVisibleMetrics(px)
  }

  function findNearestSnap(projectedPx: number): number {
    const clamped = Math.max(0, Math.min(maxScroll.value, projectedPx))
    const pts = snapPoints.value
    if (pts.length === 0) return clamped

    let nearest = pts[0]!
    let minDiff = Math.abs(clamped - nearest)
    for (let i = 1; i < pts.length; i++) {
      const diff = Math.abs(clamped - pts[i]!)
      if (diff < minDiff) {
        minDiff = diff
        nearest = pts[i]!
      }
    }
    return nearest
  }

  function measureGeometry() {
    const viewport = viewportRef.value
    const track = trackRef.value
    if (!viewport || !track) return

    const viewWidth = viewport.clientWidth
    const totalTrackWidth = track.scrollWidth
    const computedMax = Math.max(0, totalTrackWidth - viewWidth)
    maxScroll.value = computedMax

    const children = Array.from(track.children) as HTMLElement[]
    totalCards.value = Math.max(1, children.length)
    const rawStops: number[] = []

    for (const child of children) {
      const clampedStop = Math.min(child.offsetLeft, computedMax)
      if (rawStops.length === 0 || Math.abs(clampedStop - rawStops[rawStops.length - 1]!) > 2) {
        rawStops.push(clampedStop)
      }
    }

    snapPoints.value = rawStops.length > 0 ? rawStops : [0]

    if (internalOffset > computedMax) {
      stopAnimation()
      applyTransform(computedMax)
    } else {
      updateVisibleMetrics(internalOffset)
    }
  }

  function stopAnimation() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    mode = 'idle'
    velocityPxPerFrame = 0
  }

  function stepPhysics(now: number) {
    const dtFrames = Math.min(3, Math.max(0.25, (now - prevFrameTime) / 16.667))
    prevFrameTime = now

    const {
      frictionPerFrame,
      snapLerpFactor,
      velocityStopEpsilon,
      snapCompleteEpsilonPx,
    } = FESTIVAL_CHOREOGRAPHY.slider

    if (mode === 'coasting') {
      internalOffset += velocityPxPerFrame * dtFrames
      velocityPxPerFrame *= Math.pow(frictionPerFrame, dtFrames)

      if (internalOffset < 0 || internalOffset > maxScroll.value) {
        targetSnapOffset = internalOffset < 0 ? 0 : maxScroll.value
        velocityPxPerFrame = 0
        mode = 'snapping'
      } else if (Math.abs(velocityPxPerFrame) <= velocityStopEpsilon) {
        targetSnapOffset = findNearestSnap(internalOffset)
        velocityPxPerFrame = 0
        mode = 'snapping'
      }

      applyTransform(internalOffset)
      rafId = requestAnimationFrame(stepPhysics)
      return
    }

    if (mode === 'snapping') {
      const diff = targetSnapOffset - internalOffset
      if (Math.abs(diff) <= snapCompleteEpsilonPx) {
        applyTransform(targetSnapOffset)
        stopAnimation()
        return
      }

      const alpha = 1 - Math.pow(1 - snapLerpFactor, dtFrames)
      applyTransform(internalOffset + diff * alpha)
      rafId = requestAnimationFrame(stepPhysics)
    }
  }

  function startLoop(nextMode: 'coasting' | 'snapping') {
    mode = nextMode
    if (rafId === null && !document.hidden) {
      prevFrameTime = performance.now()
      rafId = requestAnimationFrame(stepPhysics)
    }
  }

  function scrollToOffset(offsetPx: number) {
    targetSnapOffset = Math.max(0, Math.min(maxScroll.value, offsetPx))
    velocityPxPerFrame = 0
    startLoop('snapping')
  }

  function scrollToSnap(index: number) {
    const pts = snapPoints.value
    if (pts.length === 0) return
    const safeIdx = Math.max(0, Math.min(index, pts.length - 1))
    scrollToOffset(pts[safeIdx]!)
  }

  function scrollNext() {
    scrollToSnap(activeSnapIndex.value + 1)
  }

  function scrollPrev() {
    scrollToSnap(activeSnapIndex.value - 1)
  }

  function scrubToRatio(ratio: number) {
    if (!isScrollable.value) return
    stopAnimation()
    const clampedRatio = Math.max(0, Math.min(1, ratio))
    applyTransform(clampedRatio * maxScroll.value)
  }

  function settleNearestSnap() {
    targetSnapOffset = findNearestSnap(internalOffset)
    startLoop('snapping')
  }

  function handlePointerDown(e: PointerEvent) {
    if (!isScrollable.value) return
    if (e.pointerType === 'mouse' && e.button !== 0) return

    const wasMovingFast = mode !== 'idle' && Math.abs(velocityPxPerFrame) > 1.5
    stopAnimation()

    pointerActive = true
    activePointerId = e.pointerId
    pointerStartX = e.clientX
    pointerStartY = e.clientY
    dragStartOffset = internalOffset
    lastPointerX = e.clientX
    lastPointerTime = performance.now()
    velocityPxPerFrame = 0
    axisLocked = e.pointerType === 'mouse' ? 'x' : null
    didDragGesture = wasMovingFast
  }

  function handleWindowPointerMove(e: PointerEvent) {
    if (!pointerActive || e.pointerId !== activePointerId) return

    const dx = e.clientX - pointerStartX
    const dy = e.clientY - pointerStartY
    const { axisLockThresholdPx, dragClickThresholdPx, rubberBandFactor } =
      FESTIVAL_CHOREOGRAPHY.slider

    if (axisLocked === null) {
      if (Math.abs(dx) < axisLockThresholdPx && Math.abs(dy) < axisLockThresholdPx) return
      if (Math.abs(dy) > Math.abs(dx)) {
        pointerActive = false
        isDragging.value = false
        return
      }
      axisLocked = 'x'
    }

    if (Math.abs(dx) > dragClickThresholdPx) {
      didDragGesture = true
      isDragging.value = true
      mode = 'dragging'
    }

    if (e.cancelable && axisLocked === 'x') {
      e.preventDefault()
    }

    const now = performance.now()
    const dtMs = Math.max(1, now - lastPointerTime)
    const instantVxPerFrame = ((lastPointerX - e.clientX) / dtMs) * 16.667
    velocityPxPerFrame = velocityPxPerFrame * 0.35 + instantVxPerFrame * 0.65

    lastPointerX = e.clientX
    lastPointerTime = now

    const rawOffset = dragStartOffset - dx
    let boundedOffset = rawOffset

    if (rawOffset < 0) {
      boundedOffset = rawOffset * rubberBandFactor
    } else if (rawOffset > maxScroll.value) {
      boundedOffset = maxScroll.value + (rawOffset - maxScroll.value) * rubberBandFactor
    }

    applyTransform(boundedOffset)
  }

  function handleWindowPointerUp(e: PointerEvent) {
    if (!pointerActive || e.pointerId !== activePointerId) return

    pointerActive = false
    isDragging.value = false

    if (didDragGesture) {
      suppressClickUntil = performance.now() + 90
    }

    if (performance.now() - lastPointerTime > 90) {
      velocityPxPerFrame = 0
    }

    if (internalOffset < 0) {
      scrollToOffset(0)
      return
    }
    if (internalOffset > maxScroll.value) {
      scrollToOffset(maxScroll.value)
      return
    }

    const { frictionPerFrame } = FESTIVAL_CHOREOGRAPHY.slider
    if (Math.abs(velocityPxPerFrame) > 3.2) {
      const projected =
        internalOffset + (velocityPxPerFrame / (1 - frictionPerFrame)) * 0.52
      targetSnapOffset = findNearestSnap(projected)

      if (
        targetSnapOffset === snapPoints.value[activeSnapIndex.value] &&
        Math.abs(velocityPxPerFrame) > 5.5
      ) {
        const nextIdx =
          velocityPxPerFrame > 0 ? activeSnapIndex.value + 1 : activeSnapIndex.value - 1
        scrollToSnap(nextIdx)
        return
      }

      startLoop('coasting')
    } else if (didDragGesture) {
      scrollToOffset(findNearestSnap(internalOffset))
    }
  }

  function handleWheel(e: WheelEvent) {
    if (!isScrollable.value) return

    const isHorizontalGesture =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) || (e.shiftKey && Math.abs(e.deltaY) > 0)
    if (!isHorizontalGesture) return

    const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if ((delta < 0 && internalOffset <= 0) || (delta > 0 && internalOffset >= maxScroll.value)) {
      return
    }

    e.preventDefault()
    stopAnimation()

    const nextPx = Math.max(0, Math.min(maxScroll.value, internalOffset + delta))
    applyTransform(nextPx)

    if (wheelSnapTimer) clearTimeout(wheelSnapTimer)
    wheelSnapTimer = setTimeout(() => {
      scrollToOffset(findNearestSnap(internalOffset))
    }, FESTIVAL_CHOREOGRAPHY.slider.wheelSnapDebounceMs)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isScrollable.value) return

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollNext()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollPrev()
    } else if (e.key === 'Home') {
      e.preventDefault()
      scrollToSnap(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      scrollToSnap(snapPoints.value.length - 1)
    }
  }

  function handleVisibilityChange() {
    if (document.hidden && rafId !== null) {
      stopAnimation()
      applyTransform(findNearestSnap(internalOffset))
    }
  }

  function shouldSuppressClick(): boolean {
    return didDragGesture && performance.now() < suppressClickUntil
  }

  onMounted(() => {
    measureGeometry()

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => measureGeometry())
      if (viewportRef.value) resizeObserver.observe(viewportRef.value)
      if (trackRef.value) resizeObserver.observe(trackRef.value)
    }

    const viewport = viewportRef.value
    if (viewport) {
      viewport.addEventListener('wheel', handleWheel, { passive: false })
    }

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false })
    window.addEventListener('pointerup', handleWindowPointerUp, { passive: true })
    window.addEventListener('pointercancel', handleWindowPointerUp, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    stopAnimation()
    if (wheelSnapTimer) clearTimeout(wheelSnapTimer)
    resizeObserver?.disconnect()

    const viewport = viewportRef.value
    if (viewport) {
      viewport.removeEventListener('wheel', handleWheel)
    }

    window.removeEventListener('pointermove', handleWindowPointerMove)
    window.removeEventListener('pointerup', handleWindowPointerUp)
    window.removeEventListener('pointercancel', handleWindowPointerUp)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    currentOffset,
    maxScroll,
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
  }
}