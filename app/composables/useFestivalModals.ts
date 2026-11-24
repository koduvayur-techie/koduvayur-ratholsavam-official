// app/composables/useFestivalModals.ts
import { computed } from 'vue'
import { MASTER_LIGHTBOX_SEQUENCE, type LightboxImageItem } from '~/data/festival2026'
import { SPONSOR_LIGHTBOX_SEQUENCE } from '~/data/sponsors2026'

export function useFestivalModals() {
  const isVideoOpen = useState<boolean>('kr-video-open', () => false)
  const isDonateOpen = useState<boolean>('kr-donate-open', () => false)
  const isInfoOpen = useState<boolean>('kr-info-open', () => false)

  const lightboxItems = useState<LightboxImageItem[]>(
    'kr-lightbox-items',
    () => MASTER_LIGHTBOX_SEQUENCE,
  )
  const lightboxIndex = useState<number>('kr-lightbox-index', () => 0)
  const lightboxDirection = useState<'next' | 'prev'>('kr-lightbox-dir', () => 'next')
  const isLightboxOpen = useState<boolean>('kr-lightbox-open', () => false)

  const hasAnyModalOpen = computed(
    () =>
      isVideoOpen.value ||
      isDonateOpen.value ||
      isInfoOpen.value ||
      isLightboxOpen.value,
  )

  function openVideo() {
    isDonateOpen.value = false
    isInfoOpen.value = false
    isLightboxOpen.value = false
    isVideoOpen.value = true
  }

  function closeVideo() {
    isVideoOpen.value = false
  }

  function openDonate() {
    isVideoOpen.value = false
    isInfoOpen.value = false
    isLightboxOpen.value = false
    isDonateOpen.value = true
  }

  function closeDonate() {
    isDonateOpen.value = false
  }

  function openInfo() {
    isVideoOpen.value = false
    isDonateOpen.value = false
    isLightboxOpen.value = false
    isInfoOpen.value = true
  }

  function closeInfo() {
    isInfoOpen.value = false
  }

  /** Stream 1: Opens the 31-slide JPG Festival Gallery at exact item ID */
  function openLightboxById(itemId: string) {
    isVideoOpen.value = false
    isDonateOpen.value = false
    isInfoOpen.value = false

    lightboxItems.value = MASTER_LIGHTBOX_SEQUENCE
    const foundIndex = MASTER_LIGHTBOX_SEQUENCE.findIndex((item) => item.id === itemId)
    lightboxIndex.value = foundIndex >= 0 ? foundIndex : 0
    lightboxDirection.value = 'next'
    isLightboxOpen.value = true
  }

  /** Stream 2: Opens the isolated 31-ad WebP Sponsor Gallery at exact sponsor ID */
  function openSponsorLightboxById(sponsorId: string) {
    isVideoOpen.value = false
    isDonateOpen.value = false
    isInfoOpen.value = false

    lightboxItems.value = SPONSOR_LIGHTBOX_SEQUENCE
    const foundIndex = SPONSOR_LIGHTBOX_SEQUENCE.findIndex((item) => item.id === sponsorId)
    lightboxIndex.value = foundIndex >= 0 ? foundIndex : 0
    lightboxDirection.value = 'next'
    isLightboxOpen.value = true
  }

  function setLightboxIndex(targetIndex: number) {
    const total = lightboxItems.value.length
    if (total === 0) return
    const wrapped = ((targetIndex % total) + total) % total
    if (wrapped === lightboxIndex.value) return
    lightboxDirection.value = wrapped > lightboxIndex.value ? 'next' : 'prev'
    lightboxIndex.value = wrapped
  }

  /** Infinite forward wrap: 31 -> 1 */
  function nextLightboxSlide(): boolean {
    const total = lightboxItems.value.length
    if (total <= 1) return false
    lightboxDirection.value = 'next'
    lightboxIndex.value = (lightboxIndex.value + 1) % total
    return true
  }

  /** Infinite backward wrap: 1 -> 31 */
  function prevLightboxSlide(): boolean {
    const total = lightboxItems.value.length
    if (total <= 1) return false
    lightboxDirection.value = 'prev'
    lightboxIndex.value = (lightboxIndex.value - 1 + total) % total
    return true
  }

  function closeLightbox() {
    isLightboxOpen.value = false
  }

  return {
    isVideoOpen,
    isDonateOpen,
    isInfoOpen,
    isLightboxOpen,
    lightboxItems,
    lightboxIndex,
    lightboxDirection,
    hasAnyModalOpen,
    openVideo,
    closeVideo,
    openDonate,
    closeDonate,
    openInfo,
    closeInfo,
    openLightboxById,
    openSponsorLightboxById,
    setLightboxIndex,
    nextLightboxSlide,
    prevLightboxSlide,
    closeLightbox,
  }
}