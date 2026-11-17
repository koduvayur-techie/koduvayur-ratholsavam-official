<!-- app/components/PromoVideoModal.vue -->
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  videoSrc?: string
  posterSrc?: string
  hasCustomCursor?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const resolvedVideoSrc = computed(() => props.videoSrc || '/videos/promo.mp4')
const resolvedPosterSrc = computed(() => props.posterSrc || '/images/rad-mob.jpg')

const modalRootRef = ref<HTMLElement | null>(null)
const playerStageRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const scrubTrackRef = ref<HTMLElement | null>(null)

const hasActivatedMedia = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)
const isBuffering = ref(false)
const hasEnded = ref(false)
const needsSoundUnlock = ref(false)
const isFullscreen = ref(false)
const controlsVisible = ref(true)
const isScrubbing = ref(false)

const currentTime = ref(0)
const duration = ref(0)
const bufferedRatio = ref(0)

let idleControlsTimer: ReturnType<typeof setTimeout> | null = null
let progressRafId: number | null = null

const progressPercent = computed(() => {
  if (!duration.value || duration.value <= 0) return 0
  return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100))
})

const bufferedPercent = computed(() => Math.min(100, Math.max(0, bufferedRatio.value * 100)))

function formatTimecode(secondsInput: number): string {
  if (!Number.isFinite(secondsInput) || secondsInput < 0) return '00:00'
  const total = Math.floor(secondsInput)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const formattedCurrent = computed(() => formatTimecode(currentTime.value))
const formattedDuration = computed(() => formatTimecode(duration.value))

function scheduleControlsAutoHide() {
  if (idleControlsTimer) clearTimeout(idleControlsTimer)
  controlsVisible.value = true

  if (!isPlaying.value || isScrubbing.value) return

  idleControlsTimer = setTimeout(() => {
    if (isPlaying.value && !isScrubbing.value) {
      controlsVisible.value = false
    }
  }, 2600)
}

function wakeControls() {
  scheduleControlsAutoHide()
}

function stopProgressLoop() {
  if (progressRafId !== null) {
    cancelAnimationFrame(progressRafId)
    progressRafId = null
  }
}

function startProgressLoop() {
  stopProgressLoop()
  const tick = () => {
    const vid = videoRef.value
    if (vid && !isScrubbing.value) {
      currentTime.value = vid.currentTime || 0
      if (vid.duration && Number.isFinite(vid.duration)) {
        duration.value = vid.duration
      }
    }
    if (isPlaying.value) {
      progressRafId = requestAnimationFrame(tick)
    }
  }
  progressRafId = requestAnimationFrame(tick)
}

async function startPlaybackFromOpen() {
  const vid = videoRef.value
  if (!vid) return

  hasEnded.value = false
  isBuffering.value = true
  vid.currentTime = 0
  currentTime.value = 0

  try {
    vid.muted = false
    isMuted.value = false
    needsSoundUnlock.value = false
    await vid.play()
  } catch {
    // Fallback if browser restricts unmuted playback
    try {
      vid.muted = true
      isMuted.value = true
      needsSoundUnlock.value = true
      await vid.play()
    } catch {
      isPlaying.value = false
      isBuffering.value = false
      controlsVisible.value = true
    }
  }
}

function unlockAudio() {
  const vid = videoRef.value
  if (!vid) return
  vid.muted = false
  isMuted.value = false
  needsSoundUnlock.value = false
  if (vid.paused) {
    vid.play().catch(() => {})
  }
  wakeControls()
}

async function togglePlayPause() {
  const vid = videoRef.value
  if (!vid) return

  if (needsSoundUnlock.value) {
    unlockAudio()
    return
  }

  if (vid.paused || vid.ended) {
    if (vid.ended) {
      vid.currentTime = 0
      currentTime.value = 0
    }
    try {
      await vid.play()
    } catch {
      isPlaying.value = false
    }
  } else {
    vid.pause()
  }
  wakeControls()
}

function handleSurfaceTap(e: PointerEvent) {
  if (e.pointerType !== 'mouse' && !controlsVisible.value && isPlaying.value) {
    wakeControls()
    return
  }
  togglePlayPause()
}

function toggleMute() {
  const vid = videoRef.value
  if (!vid) return
  vid.muted = !vid.muted
  isMuted.value = vid.muted
  if (!vid.muted) {
    needsSoundUnlock.value = false
  }
  wakeControls()
}

function updateBufferedProgress() {
  const vid = videoRef.value
  if (!vid || !vid.duration || vid.buffered.length === 0) return
  const end = vid.buffered.end(vid.buffered.length - 1)
  bufferedRatio.value = Math.min(1, end / vid.duration)
}

function handleLoadedMetadata() {
  const vid = videoRef.value
  if (!vid) return
  if (vid.duration && Number.isFinite(vid.duration)) {
    duration.value = vid.duration
  }
  updateBufferedProgress()
}

function handlePlayEvent() {
  isPlaying.value = true
  hasEnded.value = false
  isBuffering.value = false
  startProgressLoop()
  scheduleControlsAutoHide()
}

function handlePauseEvent() {
  isPlaying.value = false
  stopProgressLoop()
  controlsVisible.value = true
}

function handleEndedEvent() {
  isPlaying.value = false
  hasEnded.value = true
  stopProgressLoop()
  controlsVisible.value = true
  if (duration.value > 0) {
    currentTime.value = duration.value
  }
}

function seekToClientX(clientX: number) {
  const track = scrubTrackRef.value
  const vid = videoRef.value
  if (!track || !vid || !duration.value) return

  const rect = track.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  const targetTime = ratio * duration.value
  currentTime.value = targetTime
  vid.currentTime = targetTime
}

function handleScrubPointerDown(e: PointerEvent) {
  const track = scrubTrackRef.value
  if (!track) return

  isScrubbing.value = true
  track.setPointerCapture(e.pointerId)
  seekToClientX(e.clientX)
  wakeControls()
}

function handleScrubPointerMove(e: PointerEvent) {
  if (!isScrubbing.value) return
  seekToClientX(e.clientX)
}

function handleScrubPointerUp(e: PointerEvent) {
  if (!isScrubbing.value) return
  const track = scrubTrackRef.value
  if (track && track.hasPointerCapture(e.pointerId)) {
    track.releasePointerCapture(e.pointerId)
  }
  isScrubbing.value = false
  scheduleControlsAutoHide()
}

async function toggleFullscreen() {
  const stage = playerStageRef.value
  const vid = videoRef.value as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
  if (!stage) return

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else if (stage.requestFullscreen) {
      await stage.requestFullscreen()
    } else if (vid?.webkitEnterFullscreen) {
      vid.webkitEnterFullscreen()
    }
  } catch {
    // Ignore restricted fullscreen environments
  }
  wakeControls()
}

function handleFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

async function closeModal() {
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch {
      // Ignore
    }
  }
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.open) return

  if (e.key === 'Escape') {
    e.preventDefault()
    closeModal()
    return
  }

  if (e.key === ' ' || e.key.toLowerCase() === 'k') {
    const activeTag = (document.activeElement as HTMLElement | null)?.tagName
    if (activeTag !== 'BUTTON') {
      e.preventDefault()
      togglePlayPause()
    }
    return
  }

  if (e.key.toLowerCase() === 'm') {
    e.preventDefault()
    toggleMute()
    return
  }

  if (e.key.toLowerCase() === 'f') {
    e.preventDefault()
    toggleFullscreen()
    return
  }

  const vid = videoRef.value
  if (!vid || !duration.value) return

  if (e.key === 'ArrowRight') {
    e.preventDefault()
    vid.currentTime = Math.min(duration.value, vid.currentTime + 5)
    currentTime.value = vid.currentTime
    wakeControls()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    vid.currentTime = Math.max(0, vid.currentTime - 5)
    currentTime.value = vid.currentTime
    wakeControls()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      hasActivatedMedia.value = true
      controlsVisible.value = true
      await nextTick()
      modalRootRef.value?.focus({ preventScroll: true })
      await startPlaybackFromOpen()
    } else {
      stopProgressLoop()
      if (idleControlsTimer) clearTimeout(idleControlsTimer)
      const vid = videoRef.value
      if (vid) {
        vid.pause()
      }
      isPlaying.value = false
      isBuffering.value = false
      needsSoundUnlock.value = false
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  stopProgressLoop()
  if (idleControlsTimer) clearTimeout(idleControlsTimer)
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="royal-theater">
      <div
        v-if="open"
        ref="modalRootRef"
        role="dialog"
        aria-modal="true"
        aria-label="Koduvayur Ratholsavam Preview Film"
        tabindex="-1"
        class="royal-modal-backdrop fixed inset-0 z-[80] grid place-items-center p-4 select-none focus:outline-none sm:p-6"
        :class="hasCustomCursor && !isFullscreen ? 'hide-native-cursor' : ''"
        @click.self="closeModal"
        @pointermove="wakeControls"
        @contextmenu.prevent
      >
        <!-- Ambient Warm Temple-Gold Halo Behind Portrait Shrine -->
        <div
          class="royal-shrine-halo pointer-events-none absolute"
          aria-hidden="true"
        />

        <!-- Royal 9:16 Portrait Frame Shell -->
        <div class="royal-theater-card relative flex items-center justify-center">
          <!-- Ornate SVG Corner Filigree & Cardinal Finials (Outside Video Crop) -->
          <svg
            viewBox="0 0 360 640"
            fill="none"
            class="pointer-events-none absolute -inset-[10px] z-30 h-[calc(100%+20px)] w-[calc(100%+20px)] overflow-visible sm:-inset-[13px] sm:h-[calc(100%+26px)] sm:w-[calc(100%+26px)]"
            aria-hidden="true"
          >
            <!-- Outer Hairline Gold Frame -->
            <rect
              x="4"
              y="4"
              width="352"
              height="632"
              rx="4"
              stroke="rgba(212, 175, 106, 0.46)"
              stroke-width="1"
            />

            <!-- Top-Left Temple Corner Filigree -->
            <path
              d="M4 34 V8 C4 5.8 5.8 4 8 4 H34 M11 22 V11 H22 M4 14 C10 14 14 10 14 4"
              stroke="#e5c380"
              stroke-width="1.35"
              stroke-linecap="round"
            />
            <circle cx="15.5" cy="15.5" r="1.6" fill="#efd093" />

            <!-- Top-Right Temple Corner Filigree -->
            <path
              d="M356 34 V8 C356 5.8 354.2 4 352 4 H326 M349 22 V11 H338 M356 14 C350 14 346 10 346 4"
              stroke="#e5c380"
              stroke-width="1.35"
              stroke-linecap="round"
            />
            <circle cx="344.5" cy="15.5" r="1.6" fill="#efd093" />

            <!-- Bottom-Left Temple Corner Filigree -->
            <path
              d="M4 606 V632 C4 634.2 5.8 636 8 636 H34 M11 618 V629 H22 M4 626 C10 626 14 630 14 636"
              stroke="#e5c380"
              stroke-width="1.35"
              stroke-linecap="round"
            />
            <circle cx="15.5" cy="624.5" r="1.6" fill="#efd093" />

            <!-- Bottom-Right Temple Corner Filigree -->
            <path
              d="M356 606 V632 C356 634.2 354.2 636 352 636 H326 M349 618 V629 H338 M356 626 C350 626 346 630 346 636"
              stroke="#e5c380"
              stroke-width="1.35"
              stroke-linecap="round"
            />
            <circle cx="344.5" cy="624.5" r="1.6" fill="#efd093" />

            <!-- Top & Bottom Sacred Lotus Diamond Finials -->
            <path
              d="M174 4 L180 -1.5 L186 4 L180 9.5 Z"
              fill="#0a0806"
              stroke="#e5c380"
              stroke-width="1.2"
            />
            <circle cx="180" cy="4" r="1.5" fill="#efd093" />

            <path
              d="M174 636 L180 630.5 L186 636 L180 641.5 Z"
              fill="#0a0806"
              stroke="#e5c380"
              stroke-width="1.2"
            />
            <circle cx="180" cy="636" r="1.5" fill="#efd093" />
          </svg>

          <!-- 9:16 Portrait Video Stage -->
          <div
            ref="playerStageRef"
            class="royal-portrait-stage relative grid overflow-hidden rounded-[3px] bg-[#050403] shadow-[0_28px_90px_rgba(0,0,0,0.95)] ring-1 ring-[#d4af6a]/45"
          >
            <!-- Protected Portrait HTML5 Video -->
            <video
              v-if="hasActivatedMedia"
              ref="videoRef"
              :src="resolvedVideoSrc"
              :poster="resolvedPosterSrc"
              playsinline
              preload="metadata"
              controlslist="nodownload noplaybackrate"
              disablepictureinpicture
              class="col-start-1 row-start-1 h-full w-full object-cover"
              @click="handleSurfaceTap"
              @loadedmetadata="handleLoadedMetadata"
              @progress="updateBufferedProgress"
              @timeupdate="
                () => {
                  if (videoRef && !isScrubbing) currentTime = videoRef.currentTime
                }
              "
              @play="handlePlayEvent"
              @pause="handlePauseEvent"
              @ended="handleEndedEvent"
              @waiting="isBuffering = true"
              @playing="isBuffering = false"
              @canplay="isBuffering = false"
              @contextmenu.prevent
              @dragstart.prevent
            />

            <!-- Top & Bottom Royal Velvet Vignettes (Fade Cleanly When Playing Idle) -->
            <div
              class="pointer-events-none col-start-1 row-start-1 z-10 flex flex-col justify-between transition-opacity duration-500"
              :class="controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'"
              aria-hidden="true"
            >
              <div class="h-28 bg-gradient-to-b from-black/82 via-black/38 to-transparent" />
              <div class="h-36 bg-gradient-to-t from-black/90 via-black/48 to-transparent" />
            </div>

            <!-- Top Header Bar: Eyebrow Title & Royal Close Button -->
            <div
              class="pointer-events-none col-start-1 row-start-1 z-20 flex items-start justify-between p-3.5 transition-all duration-500 sm:p-4"
              :class="
                controlsVisible || !isPlaying
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-2 opacity-0'
              "
            >
              <div class="flex flex-col pt-1 pl-0.5">
                <span
                  class="font-sans text-[0.58rem] font-medium tracking-[0.3em] text-[#e5c483] uppercase sm:text-[0.62rem]"
                >
                  Koduvayur Ratholsavam
                </span>
                <span
                  class="mt-0.5 font-serif text-[0.95rem] italic tracking-[0.04em] text-[#f4efe6]/85 sm:text-[1.05rem]"
                >
                  The Arrival Preview
                </span>
              </div>

              <button
                type="button"
                data-cursor-interactive
                aria-label="Close video player"
                class="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#d4af6a]/45 bg-black/65 text-[#f4efe6] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#efd093] hover:bg-[#d4af6a]/20 hover:text-[#f8e4b4] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af6a]"
                @click.stop="closeModal"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <!-- Center Sacred Play / Replay / Buffering Medallion -->
            <div
              class="pointer-events-none col-start-1 row-start-1 z-20 grid place-items-center"
            >
              <!-- Tap to Unmute Pill (Only if Browser Forced Muted Autoplay) -->
              <button
                v-if="needsSoundUnlock && isPlaying"
                type="button"
                data-cursor-interactive
                class="pointer-events-auto flex items-center gap-2 rounded-full border border-[#d4af6a]/65 bg-black/75 px-4 py-2 font-sans text-[0.68rem] font-medium tracking-[0.22em] text-[#f6dfa4] uppercase backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95"
                @click.stop="unlockAudio"
              >
                <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
                </svg>
                <span>Tap for Sound</span>
              </button>

              <!-- Buffering Golden Ring -->
              <div
                v-else-if="isBuffering && isPlaying"
                class="h-14 w-14 animate-spin rounded-full border-2 border-[#d4af6a]/20 border-t-[#efd093]"
                aria-hidden="true"
              />

              <!-- Royal Center Play / Replay Button When Paused or Ended -->
              <button
                v-else-if="!isPlaying"
                type="button"
                data-cursor-interactive
                :aria-label="hasEnded ? 'Replay preview video' : 'Play preview video'"
                class="royal-center-play pointer-events-auto group relative flex h-16 w-16 items-center justify-center rounded-full border border-[#e5c380]/70 bg-black/62 backdrop-blur-md transition-all duration-400 hover:scale-110 hover:border-[#f6dfa4] hover:bg-black/78 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af6a] sm:h-[4.5rem] sm:w-[4.5rem]"
                @click.stop="togglePlayPause"
              >
                <span
                  class="pointer-events-none absolute -inset-2 rounded-full border border-[#d4af6a]/30 transition-transform duration-500 group-hover:scale-110"
                  aria-hidden="true"
                />
                <!-- Replay Icon -->
                <svg
                  v-if="hasEnded"
                  viewBox="0 0 24 24"
                  class="h-6 w-6 text-[#efd093]"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"
                  />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v5h5" />
                </svg>
                <!-- Play Triangle -->
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  class="h-6 w-6 translate-x-[1.5px] text-[#efd093]"
                  fill="currentColor"
                >
                  <path d="M7 5.25v13.5L18.25 12 7 5.25z" />
                </svg>
              </button>
            </div>

            <!-- Bottom Royal Timeline & Control Strip -->
            <div
              class="col-start-1 row-start-1 z-20 flex flex-col justify-end self-end p-3.5 transition-all duration-500 sm:p-4"
              :class="
                controlsVisible || !isPlaying
                  ? ' pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-2 opacity-0'
              "
              @click.stop
            >
              <!-- Draggable Temple-Gold Scrub Bar -->
              <div
                ref="scrubTrackRef"
                role="slider"
                data-cursor-interactive
                tabindex="0"
                aria-label="Seek video timeline"
                :aria-valuemin="0"
                :aria-valuemax="Math.round(duration)"
                :aria-valuenow="Math.round(currentTime)"
                class="group relative flex h-5 w-full touch-none items-center focus:outline-none"
                @pointerdown="handleScrubPointerDown"
                @pointermove="handleScrubPointerMove"
                @pointerup="handleScrubPointerUp"
                @pointercancel="handleScrubPointerUp"
              >
                <!-- Base Track -->
                <div class="relative h-[3px] w-full overflow-hidden rounded-full bg-white/20 transition-all duration-200 group-hover:h-[4px]">
                  <!-- Buffered Fill -->
                  <div
                    class="absolute inset-y-0 left-0 rounded-full bg-[#d4af6a]/30"
                    :style="{ width: `${bufferedPercent}%` }"
                  />
                  <!-- Active Gold Progress Fill -->
                  <div
                    class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#c89f53] via-[#e4c17a] to-[#f7e3b3]"
                    :style="{ width: `${progressPercent}%` }"
                  />
                </div>

                <!-- Golden Jewel Playhead Thumb -->
                <div
                  class="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f7e4b4] shadow-[0_0_10px_rgba(228,192,118,0.95)] ring-2 ring-[#0a0806] transition-transform duration-200 group-hover:scale-125"
                  :style="{ left: `${progressPercent}%` }"
                />
              </div>

              <!-- Controls Row: Play/Pause + Timecode + Mute + Fullscreen -->
              <div class="mt-1.5 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <!-- Play / Pause Toggle -->
                  <button
                    type="button"
                    data-cursor-interactive
                    :aria-label="isPlaying ? 'Pause' : 'Play'"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-[#f4efe6] transition-colors duration-200 hover:bg-white/10 hover:text-[#f6dfa4] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#d4af6a]"
                    @click="togglePlayPause"
                  >
                    <svg
                      v-if="isPlaying"
                      viewBox="0 0 24 24"
                      class="h-4 w-4"
                      fill="currentColor"
                    >
                      <rect x="6" y="5" width="3.8" height="14" rx="1" />
                      <rect x="14.2" y="5" width="3.8" height="14" rx="1" />
                    </svg>
                    <svg
                      v-else
                      viewBox="0 0 24 24"
                      class="h-4 w-4 translate-x-[1px]"
                      fill="currentColor"
                    >
                      <path d="M7 5.25v13.5L18.25 12 7 5.25z" />
                    </svg>
                  </button>

                  <!-- Tabular Timecode -->
                  <div
                    class="font-sans text-[0.68rem] font-medium tracking-[0.08em] text-[#efe9dd]/90 tabular-nums sm:text-[0.72rem]"
                  >
                    <span class="text-[#f6dfa4]">{{ formattedCurrent }}</span>
                    <span class="mx-1 text-[#d4af6a]/55">/</span>
                    <span class="text-[#efe9dd]/70">{{ formattedDuration }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5">
                  <!-- Mute / Unmute -->
                  <button
                    type="button"
                    data-cursor-interactive
                    :aria-label="isMuted ? 'Unmute audio' : 'Mute audio'"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-[#f4efe6] transition-colors duration-200 hover:bg-white/10 hover:text-[#f6dfa4] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#d4af6a]"
                    @click="toggleMute"
                  >
                    <svg
                      v-if="isMuted"
                      viewBox="0 0 24 24"
                      class="h-4 w-4 text-[#d4af6a]"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.75"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5L6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6" />
                    </svg>
                    <svg
                      v-else
                      viewBox="0 0 24 24"
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.75"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
                    </svg>
                  </button>

                  <!-- Fullscreen Toggle -->
                  <button
                    type="button"
                    data-cursor-interactive
                    :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-[#f4efe6] transition-colors duration-200 hover:bg-white/10 hover:text-[#f6dfa4] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#d4af6a]"
                    @click="toggleFullscreen"
                  >
                    <svg
                      v-if="isFullscreen"
                      viewBox="0 0 24 24"
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.75"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                    </svg>
                    <svg
                      v-else
                      viewBox="0 0 24 24"
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.75"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.royal-modal-backdrop {
  background: radial-gradient(
    ellipse at center,
    rgba(10, 8, 5, 0.86) 0%,
    rgba(0, 0, 0, 0.96) 75%,
    #000000 100%
  );
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

/* Keep Custom Gold Cursor Consistent Until Native OS Fullscreen Takes Over */
.hide-native-cursor,
.hide-native-cursor button,
.hide-native-cursor [role="slider"],
.hide-native-cursor video {
  cursor: none !important;
}

.royal-portrait-stage:fullscreen,
.royal-portrait-stage:fullscreen button,
.royal-portrait-stage:fullscreen [role="slider"],
.royal-portrait-stage:fullscreen video {
  cursor: auto !important;
}

.royal-portrait-stage:fullscreen button,
.royal-portrait-stage:fullscreen [role="slider"] {
  cursor: pointer !important;
}

/* Warm Sacred Backlight Behind the 9:16 Frame */
.royal-shrine-halo {
  width: min(94vw, calc(88dvh * 9 / 16));
  aspect-ratio: 9 / 16;
  background: radial-gradient(
    ellipse at center,
    rgba(212, 175, 106, 0.22) 0%,
    rgba(168, 124, 56, 0.08) 48%,
    transparent 74%
  );
  filter: blur(28px);
}

/* Exact 9:16 Portrait Proportions Across Mobile, Tablet & Desktop */
.royal-portrait-stage {
  width: min(86vw, calc(82dvh * 9 / 16));
  aspect-ratio: 9 / 16;
}

.royal-portrait-stage:fullscreen {
  width: 100%;
  height: 100%;
  max-width: none;
  border-radius: 0;
}

.royal-portrait-stage:fullscreen video {
  object-fit: contain;
  background-color: #000000;
}

.royal-center-play {
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.78),
    0 0 28px rgba(212, 175, 106, 0.22);
}

/* Royal Pop-Up Entrance & Exit Choreography */
.royal-theater-enter-active {
  transition: opacity 0.46s cubic-bezier(0.22, 1, 0.36, 1);
}

.royal-theater-leave-active {
  transition: opacity 0.36s cubic-bezier(0.22, 1, 0.36, 1);
}

.royal-theater-enter-active .royal-theater-card {
  transition:
    transform 0.62s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.52s cubic-bezier(0.22, 1, 0.36, 1);
}

.royal-theater-leave-active .royal-theater-card {
  transition:
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease;
}

.royal-theater-enter-from,
.royal-theater-leave-to {
  opacity: 0;
}

.royal-theater-enter-from .royal-theater-card {
  opacity: 0;
  transform: translate3d(0, 26px, 0) scale(0.9);
}

.royal-theater-leave-to .royal-theater-card {
  opacity: 0;
  transform: translate3d(0, 14px, 0) scale(0.94);
}
</style>