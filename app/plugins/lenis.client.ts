// app/plugins/lenis.client.ts
import Lenis from 'lenis'
import { watch } from 'vue'
import { FESTIVAL_CHOREOGRAPHY } from '~/constants/choreography'

export default defineNuxtPlugin((nuxtApp) => {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }
  window.scrollTo(0, 0)

  const { hasAnyModalOpen } = useFestivalModals()
  let lenisInstance: Lenis | null = null
  let resizeObserver: ResizeObserver | null = null

  const resetScrollOnUnload = () => {
    window.scrollTo(0, 0)
  }

  window.addEventListener('beforeunload', resetScrollOnUnload)

  nuxtApp.hook('app:mounted', () => {
    window.scrollTo(0, 0)

    const lenis = new Lenis({
      duration: FESTIVAL_CHOREOGRAPHY.lenis.duration * FESTIVAL_CHOREOGRAPHY.tempoScale,
      wheelMultiplier: FESTIVAL_CHOREOGRAPHY.lenis.wheelMultiplier,
      touchMultiplier: FESTIVAL_CHOREOGRAPHY.lenis.touchMultiplier,
      autoRaf: true,
      syncTouch: false,
    })

    lenis.scrollTo(0, { immediate: true, force: true })
    lenisInstance = lenis

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        lenis.resize()
      })
      resizeObserver.observe(document.body)
    }

    watch(
      hasAnyModalOpen,
      (locked) => {
        if (locked) {
          lenis.stop()
          document.documentElement.style.overflow = 'hidden'
        } else {
          document.documentElement.style.overflow = ''
          lenis.start()
          lenis.resize()
        }
      },
      { immediate: true },
    )
  })

  return {
    provide: {
      getLenis: () => lenisInstance,
    },
  }
})