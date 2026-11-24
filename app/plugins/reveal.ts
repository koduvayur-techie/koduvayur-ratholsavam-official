// app/plugins/reveal.ts
import { FESTIVAL_CHOREOGRAPHY } from '~/constants/choreography'

interface RevealBindingValue {
  delay?: number
}

interface RevealNodeMeta {
  visible: boolean
  extraDelayMs: number
}

const nodeRegistry = new WeakMap<HTMLElement, RevealNodeMeta>()
const initialBootQueue: HTMLElement[] = []
let bootFlushTimer: ReturnType<typeof setTimeout> | null = null
let bootCompleted = false
let sharedObserver: IntersectionObserver | null = null

function triggerReveal(el: HTMLElement, computedDelayMs: number) {
  const meta = nodeRegistry.get(el)
  if (!meta || meta.visible) return

  meta.visible = true
  const scaledDelay = Math.round(computedDelayMs * FESTIVAL_CHOREOGRAPHY.tempoScale)
  el.style.setProperty('--kr-reveal-delay', `${scaledDelay}ms`)

  requestAnimationFrame(() => {
    el.classList.remove('kr-reveal-init')
    el.classList.add('kr-reveal-in')
  })
}

function resetHiddenOffscreen(el: HTMLElement) {
  const meta = nodeRegistry.get(el)
  if (!meta || !meta.visible) return

  meta.visible = false
  el.style.setProperty('--kr-reveal-delay', '0ms')
  el.classList.remove('kr-reveal-in')
  el.classList.add('kr-reveal-init')
}

function ensureObserver(): IntersectionObserver | null {
  if (import.meta.server || typeof IntersectionObserver === 'undefined') return null
  if (sharedObserver) return sharedObserver

  const { enterThreshold, scrollBatchStaggerMs } = FESTIVAL_CHOREOGRAPHY.reveal

  sharedObserver = new IntersectionObserver(
    (entries) => {
      if (!bootCompleted) return

      const enteringBatch: { el: HTMLElement; top: number; left: number; extraDelay: number }[] = []

      for (const entry of entries) {
        const el = entry.target as HTMLElement
        const meta = nodeRegistry.get(el)
        if (!meta) continue

        if (entry.isIntersecting && entry.intersectionRatio >= enterThreshold) {
          if (!meta.visible) {
            enteringBatch.push({
              el,
              top: entry.boundingClientRect.top,
              left: entry.boundingClientRect.left,
              extraDelay: meta.extraDelayMs,
            })
          }
        } else if (!entry.isIntersecting && entry.intersectionRatio === 0 && meta.visible) {
          // Only reset when 100% outside the viewport so boundary scrolling never flickers
          const rect = entry.boundingClientRect
          if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
            resetHiddenOffscreen(el)
          }
        }
      }

      // Stagger elements entering together in exact visual reading order
      if (enteringBatch.length > 0) {
        enteringBatch.sort((a, b) => a.top - b.top || a.left - b.left)
        enteringBatch.forEach((item, idx) => {
          triggerReveal(item.el, idx * scrollBatchStaggerMs + item.extraDelay)
        })
      }
    },
    {
      threshold: [0, enterThreshold],
      rootMargin: '0px 0px -4% 0px',
    },
  )

  return sharedObserver
}

function scheduleInitialCascade() {
  if (bootFlushTimer) clearTimeout(bootFlushTimer)

  bootFlushTimer = setTimeout(() => {
    const { initialStaggerMs, maxInitialDelayMs } = FESTIVAL_CHOREOGRAPHY.reveal
    const observer = ensureObserver()
    const viewportCutoff = window.innerHeight * 0.95

    let visibleOrderIndex = 0

    for (const el of initialBootQueue) {
      if (!el.isConnected) continue
      const rect = el.getBoundingClientRect()
      const meta = nodeRegistry.get(el)
      const inInitialView = rect.top < viewportCutoff && rect.bottom > 0

      if (inInitialView && meta) {
        const staggerDelay = Math.min(
          maxInitialDelayMs,
          visibleOrderIndex * initialStaggerMs + meta.extraDelayMs,
        )
        visibleOrderIndex += 1
        triggerReveal(el, staggerDelay)
      }

      observer?.observe(el)
    }

    initialBootQueue.length = 0
    bootCompleted = true
  }, 28)
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement, RevealBindingValue | undefined>('reveal', {
    getSSRProps() {
      return {}
    },

    mounted(el, binding) {
      const extraDelayMs = binding.value?.delay ?? 0
      nodeRegistry.set(el, { visible: false, extraDelayMs })
      el.classList.add('kr-reveal-init')

      if (!bootCompleted) {
        initialBootQueue.push(el)
        scheduleInitialCascade()
      } else {
        const observer = ensureObserver()
        observer?.observe(el)
      }
    },

    unmounted(el) {
      sharedObserver?.unobserve(el)
      nodeRegistry.delete(el)
    },
  })
})