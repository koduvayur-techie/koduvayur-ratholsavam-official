<!-- app/components/CursorHaloCompanion.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { FESTIVAL_CHOREOGRAPHY } from '~/constants/choreography'

const haloRef = ref<HTMLElement | null>(null)
const isSupported = ref(false)
const isVisible = ref(false)
const isOverClickable = ref(false)
const isPressed = ref(false)

let targetX = -100
let targetY = -100
let currentX = -100
let currentY = -100
let rafId: number | null = null

function stepHalo() {
  const dx = targetX - currentX
  const dy = targetY - currentY
  const { lerpFactor, settleEpsilonPx, pressedScale } = FESTIVAL_CHOREOGRAPHY.cursorHalo

  currentX += dx * lerpFactor
  currentY += dy * lerpFactor

  if (haloRef.value) {
    const baseScale = isOverClickable.value ? 1.38 : 1
    const finalScale = isPressed.value ? baseScale * pressedScale : baseScale
    haloRef.value.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${finalScale.toFixed(3)})`
  }

  if (Math.abs(dx) > settleEpsilonPx || Math.abs(dy) > settleEpsilonPx) {
    rafId = requestAnimationFrame(stepHalo)
  } else {
    rafId = null
  }
}

function wakeLoop() {
  if (rafId === null && !document.hidden) {
    rafId = requestAnimationFrame(stepHalo)
  }
}

function handlePointerMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return

  if (!isVisible.value) {
    currentX = e.clientX
    currentY = e.clientY
    isVisible.value = true
  }

  targetX = e.clientX
  targetY = e.clientY

  const hit = (e.target as HTMLElement | null)?.closest(
    'a, button, [role="button"], [data-cursor-interactive]',
  )
  isOverClickable.value = Boolean(hit)
  wakeLoop()
}

function handlePointerDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  isPressed.value = true
  wakeLoop()
}

function handlePointerUp(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  isPressed.value = false
  wakeLoop()
}

function handlePointerLeave() {
  isVisible.value = false
  isPressed.value = false
}

onMounted(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!finePointer) return

  isSupported.value = true
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerdown', handlePointerDown, { passive: true })
  window.addEventListener('pointerup', handlePointerUp, { passive: true })
  document.addEventListener('mouseleave', handlePointerLeave)
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('pointerup', handlePointerUp)
  document.removeEventListener('mouseleave', handlePointerLeave)
})
</script>

<template>
  <div
    v-if="isSupported"
    ref="haloRef"
    aria-hidden="true"
    class="kr-cursor-halo pointer-events-none fixed top-0 left-0 z-95 rounded-full"
    :class="[
      isVisible ? 'opacity-100' : 'opacity-0',
      isOverClickable ? 'kr-cursor-halo--clickable' : '',
      isPressed ? 'kr-cursor-halo--pressed' : '',
    ]"
  />
</template>

<style scoped>
/* State 1: Hover / Glide Default — Crisp Thicker 2px Circular Gold Outline */
.kr-cursor-halo {
  width: 34px;
  height: 34px;
  border: 2px solid rgba(181, 131, 40, 0.72);
  background: radial-gradient(
    circle,
    rgba(217, 169, 76, 0.14) 0%,
    rgba(217, 169, 76, 0.03) 68%,
    transparent 100%
  );
  will-change: transform, opacity;
  transition:
    opacity 200ms ease,
    border-color 200ms ease,
    border-width 180ms ease,
    background-color 200ms ease,
    box-shadow 200ms ease;
}

/* State 2: Clickable Target Hover & Click — Bold 2.75px Burnished Circular Outline */
.kr-cursor-halo--clickable {
  border-width: 2.75px;
  border-color: rgba(145, 98, 16, 0.96);
  background: radial-gradient(
    circle,
    rgba(217, 169, 76, 0.24) 0%,
    rgba(217, 169, 76, 0.07) 72%,
    transparent 100%
  );
  box-shadow: 0 0 14px rgba(181, 131, 40, 0.25);
}

.kr-cursor-halo--pressed {
  border-width: 3.25px;
  border-color: rgba(133, 91, 18, 1);
  background-color: rgba(217, 169, 76, 0.22);
}
</style>