<!-- app/pages/index.vue -->
<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PromoVideoModal from '~/components/PromoVideoModal.vue'
import { useKoduvayurSeo } from '~/composables/useKoduvayurSeo'

useKoduvayurSeo()

const config = useRuntimeConfig()

// Centralized Asset & Snappy Silk Physics Constants
const LOGO_CANDIDATES = [
  '/images/rad26logo.png',
  '/images/rad26logo.webp',
  '/images/rad26logo.jpg',
] as const

const STAGE_PHYSICS = {
  cursorRingLerp: 0.28,
  parallaxLerp: 0.065,
  magneticLerp: 0.1,
  logoTiltLerp: 0.095,
  pondWaveLerp: 0.065,
  magneticRadius: 130,
  magneticStrength: 0.055,
  maxMagneticShift: 3.0,
  logoTiltMaxDeg: 5.0,
  maxTrailNodes: 15,
} as const

// 3-Act Entrance Schedule:
// Act 1: "SOMETHING IS COMING" (0.32s) -> "HOME" (1.05s - 2.67s)
// Act 2: Koduvayur Logo delayed & slower (2.75s - 5.20s)
// Act 3: Pond Countdown (5.18s - 5.66s) -> "ARRIVAL · 24.11.26 · 21:00 IST" (5.85s+)
const eyebrowChars = Array.from('SOMETHING IS COMING').map((ch, idx) => ({
  id: idx,
  char: ch === ' ' ? '\u00A0' : ch,
  delay: `${(0.32 + idx * 0.035).toFixed(3)}s`,
}))

const arrivalChars = Array.from('ARRIVAL · 24.11.26 · 21:00 IST').map((ch, idx) => ({
  id: idx,
  char: ch === ' ' ? '\u00A0' : ch,
  delay: `${(5.85 + idx * 0.022).toFixed(3)}s`,
}))

const logoIndex = ref(0)
const currentLogoSrc = computed(() => LOGO_CANDIDATES[logoIndex.value] ?? LOGO_CANDIDATES[0])

function handleLogoImgError() {
  if (logoIndex.value < LOGO_CANDIDATES.length - 1) {
    logoIndex.value += 1
  }
}

// Live IST Countdown (Deterministic SSR Snapshot -> Live Client Sync)
const targetTimestamp = new Date(
  (config.public.arrivalIso as string) || '2026-11-24T21:00:00+05:30',
).getTime()

const nowTimestamp = ref<number>(targetTimestamp - 7 * 86400000)
let countdownInterval: ReturnType<typeof setInterval> | null = null

const countdown = computed(() => {
  const diff = Math.max(0, targetTimestamp - nowTimestamp.value)
  const totalSeconds = Math.floor(diff / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
})

// Stage, Modal & Interactive Element Refs
const stageRef = ref<HTMLElement | null>(null)
const hasFineCursor = ref(false)
const isVideoModalOpen = ref(false)
const isNativeFullscreen = ref(false)

const logoButtonRef = ref<HTMLButtonElement | null>(null)
const isLogoRevealed = ref(false)
const isLogoHovered = ref(false)
const isLogoCeremonyActive = ref(false)
let logoCeremonyTimer: ReturnType<typeof setTimeout> | null = null
let logoRevealTimer: ReturnType<typeof setTimeout> | null = null

const playAnchorRef = ref<HTMLElement | null>(null)
const playButtonRef = ref<HTMLButtonElement | null>(null)
const isPlayHovered = ref(false)
const playPulseKey = ref(0)

// SVG Liquid Filter Refs (Strictly Pond Water + Logo Artwork Pixels)
const pondHueMatrixRef = ref<SVGFEColorMatrixElement | null>(null)
const pondDisplaceRef = ref<SVGFEDisplacementMapElement | null>(null)
const logoHueMatrixRef = ref<SVGFEColorMatrixElement | null>(null)
const logoDisplaceRef = ref<SVGFEDisplacementMapElement | null>(null)
const logoGammaRRef = ref<SVGFEFuncRElement | null>(null)
const logoGammaGRef = ref<SVGFEFuncGElement | null>(null)
const logoGammaBRef = ref<SVGFEFuncBElement | null>(null)

// Teleported Top-Layer Canvas Ref (Stays Above Both Stage & Video Modal)
const fxCanvasRef = ref<HTMLCanvasElement | null>(null)
let rafId: number | null = null
let entranceRippleTimer: ReturnType<typeof setTimeout> | null = null

// Damped Continuous Motion & Pond Wave State
const motionState = {
  px: 0,
  py: 0,
  targetPx: 0,
  targetPy: 0,
  ox: 0,
  oy: 0,
  targetOx: 0,
  targetOy: 0,
  logoRx: 0,
  logoRy: 0,
  targetLogoRx: 0,
  targetLogoRy: 0,
  logoWaveScale: 0,
  targetLogoWaveScale: 0,
  logoGlowAmp: 1,
  targetLogoGlowAmp: 1,
  pondWaveScale: 6.8,
  targetPondWaveScale: 6.8,
}

interface CursorTrailNode {
  x: number
  y: number
  alpha: number
}

interface WaterDisturbance {
  x: number
  y: number
  radius: number
  maxRadius: number
  strength: number
  alpha: number
  gold: boolean
}

interface GoldenMote {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  life: number
  maxLife: number
}

const cursor = {
  x: -999,
  y: -999,
  ringX: -999,
  ringY: -999,
  speed: 0,
  targetEnergy: 0,
  smoothEnergy: 0,
  active: false,
  isMouse: false,
  hoverInteractive: false,
  lastWaveSpawn: 0,
  lastMoteSpawn: 0,
}

let cursorTrail: CursorTrailNode[] = []
let waterDisturbances: WaterDisturbance[] = []
let goldenMotes: GoldenMote[] = []

function spawnWaterWave(x: number, y: number, strength = 0.9, gold = false) {
  if (waterDisturbances.length > 14) {
    waterDisturbances.shift()
  }
  waterDisturbances.push({
    x,
    y,
    radius: gold ? 14 : 8,
    maxRadius: gold ? 225 : 145 + strength * 42,
    strength: Math.min(1.4, strength),
    alpha: gold ? 0.48 : Math.min(0.34, 0.18 + strength * 0.1),
    gold,
  })
}

function spawnGoldenMotes(x: number, y: number, vx: number, vy: number, count = 1) {
  if (goldenMotes.length > 22) return
  for (let i = 0; i < count; i++) {
    goldenMotes.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 14,
      vx: vx * 0.06 + (Math.random() - 0.5) * 0.35,
      vy: vy * 0.06 + (Math.random() - 0.5) * 0.35,
      size: 1.0 + Math.random() * 1.35,
      alpha: 0.48 + Math.random() * 0.3,
      life: 0,
      maxLife: 38 + Math.random() * 26,
    })
  }
}

function triggerLogoCeremony() {
  isLogoCeremonyActive.value = true
  motionState.logoWaveScale = 12.5
  motionState.logoGlowAmp = 1.4
  motionState.pondWaveScale = 16.5

  if (logoCeremonyTimer) clearTimeout(logoCeremonyTimer)
  logoCeremonyTimer = setTimeout(() => {
    isLogoCeremonyActive.value = false
  }, 1350)

  if (typeof window === 'undefined') return

  const rect = logoButtonRef.value?.getBoundingClientRect()
  if (rect) {
    const cx = rect.left + rect.width * 0.54
    const cy = rect.top + rect.height * 0.44
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      spawnGoldenMotes(cx, cy, Math.cos(angle) * 6, Math.sin(angle) * 6, 1)
    }
  }

  spawnWaterWave(window.innerWidth * 0.5, window.innerHeight * 0.69, 1.25, true)
}

function handleLogoPointerMove(e: PointerEvent) {
  if (!logoButtonRef.value || isVideoModalOpen.value) return
  const rect = logoButtonRef.value.getBoundingClientRect()
  const nx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)))
  const ny = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)))
  motionState.targetLogoRy = nx * STAGE_PHYSICS.logoTiltMaxDeg
  motionState.targetLogoRx = -ny * STAGE_PHYSICS.logoTiltMaxDeg
}

function resetLogoTilt() {
  motionState.targetLogoRx = 0
  motionState.targetLogoRy = 0
}

function handlePlayPreviewClick() {
  playPulseKey.value += 1
  motionState.pondWaveScale = 16.0
  motionState.targetOx = 0
  motionState.targetOy = 0

  if (typeof window !== 'undefined') {
    spawnWaterWave(window.innerWidth * 0.5, window.innerHeight * 0.67, 1.3, true)
  }

  isVideoModalOpen.value = true
}

function handleCloseVideoModal() {
  isVideoModalOpen.value = false
  isPlayHovered.value = false
  playButtonRef.value?.focus({ preventScroll: true })
}

function handleGlobalPointerMove(e: PointerEvent) {
  const isMouse = e.pointerType === 'mouse'
  cursor.isMouse = isMouse
  if (isMouse && !hasFineCursor.value) {
    hasFineCursor.value = true
  }

  // Detect Interactive Controls Seamlessly Across Both Stage & Video Modal
  const targetEl = e.target as HTMLElement | null
  cursor.hoverInteractive = Boolean(
    targetEl?.closest('button, [data-cursor-interactive], [role="slider"]'),
  )

  const prevX = cursor.active ? cursor.x : e.clientX
  const prevY = cursor.active ? cursor.y : e.clientY
  const dxMove = e.clientX - prevX
  const dyMove = e.clientY - prevY
  const instantSpeed = Math.hypot(dxMove, dyMove)

  cursor.speed = Math.min(36, cursor.speed * 0.7 + instantSpeed * 0.3)
  cursor.x = e.clientX
  cursor.y = e.clientY

  if (!cursor.active) {
    cursor.ringX = e.clientX
    cursor.ringY = e.clientY
    cursorTrail = [{ x: e.clientX, y: e.clientY, alpha: 1 }]
    cursor.active = true
  } else {
    const lastNode = cursorTrail[cursorTrail.length - 1]
    if (!lastNode || Math.hypot(e.clientX - lastNode.x, e.clientY - lastNode.y) >= 1.5) {
      cursorTrail.push({ x: e.clientX, y: e.clientY, alpha: 1 })
      if (cursorTrail.length > STAGE_PHYSICS.maxTrailNodes) {
        cursorTrail.shift()
      }
    }
  }

  // Pause Background Pond & Parallax Updates While Video Theater Is Open
  if (isVideoModalOpen.value) return

  cursor.targetEnergy = Math.min(1.0, cursor.targetEnergy + instantSpeed * 0.008)

  const vw = window.innerWidth
  const vh = window.innerHeight

  motionState.targetPx = (e.clientX / vw - 0.5) * 2
  motionState.targetPy = (e.clientY / vh - 0.5) * 2

  if (isMouse && playAnchorRef.value) {
    const rect = playAnchorRef.value.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)

    if (dist < STAGE_PHYSICS.magneticRadius) {
      const pull = (1 - dist / STAGE_PHYSICS.magneticRadius) * STAGE_PHYSICS.magneticStrength
      motionState.targetOx = Math.max(
        -STAGE_PHYSICS.maxMagneticShift,
        Math.min(STAGE_PHYSICS.maxMagneticShift, dx * pull),
      )
      motionState.targetOy = Math.max(
        -STAGE_PHYSICS.maxMagneticShift,
        Math.min(STAGE_PHYSICS.maxMagneticShift, dy * pull),
      )
    } else {
      motionState.targetOx = 0
      motionState.targetOy = 0
    }
  }

  const now = performance.now()

  if (instantSpeed > 7.5 && now - cursor.lastMoteSpawn > 165) {
    cursor.lastMoteSpawn = now
    spawnGoldenMotes(e.clientX, e.clientY, dxMove, dyMove, 1)
  }

  if (now - cursor.lastWaveSpawn > 115 && instantSpeed > 2.0) {
    cursor.lastWaveSpawn = now
    if (e.clientY >= vh * 0.5 && e.clientY <= vh * 0.92) {
      spawnWaterWave(e.clientX, e.clientY, 0.65 + instantSpeed * 0.022, cursor.hoverInteractive)
    } else if (instantSpeed > 9.5) {
      const projectedWaterY = vh * (0.62 + Math.random() * 0.17)
      spawnWaterWave(e.clientX, projectedWaterY, 0.45 + instantSpeed * 0.014, false)
    }
  }
}

function handleGlobalPointerDown(e: PointerEvent) {
  cursor.x = e.clientX
  cursor.y = e.clientY
  if (!cursor.active) {
    cursor.ringX = e.clientX
    cursor.ringY = e.clientY
    cursorTrail = [{ x: e.clientX, y: e.clientY, alpha: 1 }]
    cursor.active = true
  }

  if (isVideoModalOpen.value) return

  cursor.targetEnergy = 0.95
  const vh = window.innerHeight
  const waveY = e.clientY >= vh * 0.5 ? e.clientY : vh * 0.68
  spawnWaterWave(e.clientX, waveY, 1.2, true)
  spawnGoldenMotes(e.clientX, e.clientY, 0, -2, 3)
}

function handleGlobalPointerUp(e: PointerEvent) {
  if (e.pointerType !== 'mouse') {
    cursor.active = false
  }
}

function handleDocumentPointerLeave() {
  cursor.active = false
  cursorTrail = []
  motionState.targetPx = 0
  motionState.targetPy = 0
  motionState.targetOx = 0
  motionState.targetOy = 0
}

function syncFullscreenState() {
  isNativeFullscreen.value = Boolean(document.fullscreenElement)
}

onMounted(() => {
  nowTimestamp.value = Date.now()
  hasFineCursor.value = window.matchMedia('(pointer: fine)').matches

  countdownInterval = setInterval(() => {
    nowTimestamp.value = Date.now()
  }, 1000)

  // Unlock Logo Hover/Click Right as Act 2 Emergence Begins (2.85s)
  logoRevealTimer = setTimeout(() => {
    isLogoRevealed.value = true
  }, 2850)

  pondDisplaceRef.value?.setAttribute('xChannelSelector', 'R')
  pondDisplaceRef.value?.setAttribute('yChannelSelector', 'G')
  logoDisplaceRef.value?.setAttribute('xChannelSelector', 'R')
  logoDisplaceRef.value?.setAttribute('yChannelSelector', 'G')

  window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true })
  window.addEventListener('pointerdown', handleGlobalPointerDown, { passive: true })
  window.addEventListener('pointerup', handleGlobalPointerUp, { passive: true })
  document.documentElement.addEventListener('mouseleave', handleDocumentPointerLeave)
  document.addEventListener('fullscreenchange', syncFullscreenState)

  const fxCanvas = fxCanvasRef.value
  if (!fxCanvas) return

  const fxCtx = fxCanvas.getContext('2d', { alpha: true })
  if (!fxCtx) return

  let width = window.innerWidth
  let height = window.innerHeight

  const resizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    fxCanvas.width = Math.floor(width * dpr)
    fxCanvas.height = Math.floor(height * dpr)
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas, { passive: true })

  // Ceremonial Golden Pond Wave Synced to Act 3 Countdown Entrance (5.35s)
  entranceRippleTimer = setTimeout(() => {
    if (!isVideoModalOpen.value) {
      spawnWaterWave(width * 0.5, height * 0.69, 1.2, true)
    }
  }, 5350)

  let compassRotation = 0

  const renderLoop = (time: number) => {
    if (document.visibilityState === 'hidden') {
      rafId = requestAnimationFrame(renderLoop)
      return
    }

    // 1. Update Stage Parallax & Pond Distortion Only When Video Modal Is Closed
    if (!isVideoModalOpen.value) {
      motionState.px += (motionState.targetPx - motionState.px) * STAGE_PHYSICS.parallaxLerp
      motionState.py += (motionState.targetPy - motionState.py) * STAGE_PHYSICS.parallaxLerp
      motionState.ox += (motionState.targetOx - motionState.ox) * STAGE_PHYSICS.magneticLerp
      motionState.oy += (motionState.targetOy - motionState.oy) * STAGE_PHYSICS.magneticLerp
      motionState.logoRx +=
        (motionState.targetLogoRx - motionState.logoRx) * STAGE_PHYSICS.logoTiltLerp
      motionState.logoRy +=
        (motionState.targetLogoRy - motionState.logoRy) * STAGE_PHYSICS.logoTiltLerp

      cursor.targetEnergy *= 0.95
      cursor.smoothEnergy += (cursor.targetEnergy - cursor.smoothEnergy) * 0.08

      const activeRipplesBoost = Math.min(4.5, waterDisturbances.length * 0.55)
      motionState.targetPondWaveScale =
        7.2 + cursor.smoothEnergy * 8.5 + activeRipplesBoost
      motionState.pondWaveScale +=
        (motionState.targetPondWaveScale - motionState.pondWaveScale) * STAGE_PHYSICS.pondWaveLerp

      if (pondHueMatrixRef.value && pondDisplaceRef.value) {
        const waterPhaseDeg = (time * 0.068) % 360
        pondHueMatrixRef.value.setAttribute('values', waterPhaseDeg.toFixed(1))
        pondDisplaceRef.value.setAttribute('scale', motionState.pondWaveScale.toFixed(2))
      }

      motionState.targetLogoWaveScale = isLogoCeremonyActive.value
        ? 9.5
        : isLogoHovered.value
          ? 5.6
          : 0
      motionState.targetLogoGlowAmp = isLogoCeremonyActive.value
        ? 1.34
        : isLogoHovered.value
          ? 1.2
          : 1.0

      motionState.logoWaveScale +=
        (motionState.targetLogoWaveScale - motionState.logoWaveScale) * 0.08
      motionState.logoGlowAmp +=
        (motionState.targetLogoGlowAmp - motionState.logoGlowAmp) * 0.08

      if (logoHueMatrixRef.value && logoDisplaceRef.value) {
        const logoPhaseDeg = (time * 0.05) % 360
        logoHueMatrixRef.value.setAttribute('values', logoPhaseDeg.toFixed(1))
        logoDisplaceRef.value.setAttribute('scale', motionState.logoWaveScale.toFixed(2))
      }

      if (logoGammaRRef.value && logoGammaGRef.value && logoGammaBRef.value) {
        const rAmp = motionState.logoGlowAmp.toFixed(3)
        const gAmp = (1 + (motionState.logoGlowAmp - 1) * 0.84).toFixed(3)
        const bAmp = (1 + (motionState.logoGlowAmp - 1) * 0.45).toFixed(3)
        logoGammaRRef.value.setAttribute('amplitude', rAmp)
        logoGammaGRef.value.setAttribute('amplitude', gAmp)
        logoGammaBRef.value.setAttribute('amplitude', bAmp)
      }

      const stageEl = stageRef.value
      if (stageEl) {
        stageEl.style.setProperty('--px', motionState.px.toFixed(4))
        stageEl.style.setProperty('--py', motionState.py.toFixed(4))
        stageEl.style.setProperty('--ox', `${motionState.ox.toFixed(2)}px`)
        stageEl.style.setProperty('--oy', `${motionState.oy.toFixed(2)}px`)
        stageEl.style.setProperty('--logo-rx', `${motionState.logoRx.toFixed(2)}deg`)
        stageEl.style.setProperty('--logo-ry', `${motionState.logoRy.toFixed(2)}deg`)
      }
    }

    cursor.speed *= 0.88

    // =========================================================================
    // TOP-LAYER FX CANVAS: POND RINGS, DUST MOTES & GLOBAL ROYAL GOLD CURSOR
    // =========================================================================
    fxCtx.clearRect(0, 0, width, height)

    if (!isVideoModalOpen.value) {
      // 1. Perspective Water Wave Rings on Pond Surface
      for (let i = waterDisturbances.length - 1; i >= 0; i--) {
        const w = waterDisturbances[i]!
        w.radius += w.gold ? 1.65 : 1.3 + w.strength * 0.25
        w.alpha *= 0.982

        if (w.alpha < 0.01 || w.radius > w.maxRadius) {
          waterDisturbances.splice(i, 1)
          continue
        }

        const ry = w.radius * 0.22

        fxCtx.strokeStyle = w.gold
          ? `rgba(236, 198, 122, ${w.alpha.toFixed(3)})`
          : `rgba(224, 206, 168, ${w.alpha.toFixed(3)})`
        fxCtx.lineWidth = w.gold ? 1.5 : 1.15
        fxCtx.beginPath()
        fxCtx.ellipse(w.x, w.y, w.radius, ry, 0, 0, Math.PI * 2)
        fxCtx.stroke()

        if (w.radius > 24) {
          fxCtx.strokeStyle = w.gold
            ? `rgba(212, 175, 106, ${(w.alpha * 0.48).toFixed(3)})`
            : `rgba(186, 205, 230, ${(w.alpha * 0.3).toFixed(3)})`
          fxCtx.lineWidth = 0.8
          fxCtx.beginPath()
          fxCtx.ellipse(w.x, w.y, w.radius * 0.68, ry * 0.68, 0, 0, Math.PI * 2)
          fxCtx.stroke()
        }
      }

      // 2. Sparse Round Golden Dust Motes
      for (let i = goldenMotes.length - 1; i >= 0; i--) {
        const m = goldenMotes[i]!
        m.life += 1
        m.x += m.vx
        m.y += m.vy

        const progress = m.life / m.maxLife
        if (progress >= 1) {
          goldenMotes.splice(i, 1)
          continue
        }

        const fade = Math.sin(progress * Math.PI) * m.alpha
        fxCtx.fillStyle = `rgba(240, 208, 138, ${fade.toFixed(3)})`
        fxCtx.beginPath()
        fxCtx.arc(m.x, m.y, m.size, 0, Math.PI * 2)
        fxCtx.fill()
      }
    }

    // 3. Decay True-2D Cursor Trail Nodes
    for (let i = cursorTrail.length - 1; i >= 0; i--) {
      const pt = cursorTrail[i]!
      pt.alpha *= 0.86
      if (pt.alpha < 0.04) {
        cursorTrail.splice(i, 1)
      }
    }

    // 4. Crisp Custom Gold Cursor + True-2D Silk Trail (Active Over Both Stage & Modal)
    if (cursor.active && !isNativeFullscreen.value) {
      cursor.ringX += (cursor.x - cursor.ringX) * STAGE_PHYSICS.cursorRingLerp
      cursor.ringY += (cursor.y - cursor.ringY) * STAGE_PHYSICS.cursorRingLerp

      if (cursorTrail.length >= 2) {
        for (let t = 1; t < cursorTrail.length; t++) {
          const p0 = cursorTrail[t - 1]!
          const p1 = cursorTrail[t]!
          const ratio = t / cursorTrail.length
          const segAlpha = ratio * p1.alpha * 0.52

          if (segAlpha > 0.02) {
            fxCtx.strokeStyle = `rgba(228, 192, 118, ${segAlpha.toFixed(3)})`
            fxCtx.lineWidth = Math.max(0.8, ratio * (cursor.hoverInteractive ? 3.2 : 2.3))
            fxCtx.lineCap = 'round'
            fxCtx.lineJoin = 'round'
            fxCtx.beginPath()
            fxCtx.moveTo(p0.x, p0.y)
            fxCtx.lineTo(p1.x, p1.y)
            fxCtx.stroke()
          }
        }
      }

      if (cursor.isMouse) {
        compassRotation += cursor.hoverInteractive ? 0.016 : 0.006 + cursor.speed * 0.0008

        const glowRadius = cursor.hoverInteractive ? 98 : 68
        const lanternGrad = fxCtx.createRadialGradient(
          cursor.ringX,
          cursor.ringY,
          2,
          cursor.ringX,
          cursor.ringY,
          glowRadius,
        )
        lanternGrad.addColorStop(
          0,
          cursor.hoverInteractive
            ? 'rgba(236, 198, 122, 0.2)'
            : 'rgba(218, 180, 108, 0.12)',
        )
        lanternGrad.addColorStop(0.5, 'rgba(212, 175, 106, 0.04)')
        lanternGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        fxCtx.fillStyle = lanternGrad
        fxCtx.beginPath()
        fxCtx.arc(cursor.ringX, cursor.ringY, glowRadius, 0, Math.PI * 2)
        fxCtx.fill()

        const baseRingRadius = cursor.hoverInteractive ? 29 : 19.5
        fxCtx.strokeStyle = cursor.hoverInteractive
          ? 'rgba(246, 220, 162, 0.98)'
          : 'rgba(226, 190, 118, 0.94)'
        fxCtx.lineWidth = cursor.hoverInteractive ? 3.9 : 3.2
        fxCtx.beginPath()
        fxCtx.arc(cursor.ringX, cursor.ringY, baseRingRadius, 0, Math.PI * 2)
        fxCtx.stroke()

        fxCtx.save()
        fxCtx.translate(cursor.ringX, cursor.ringY)
        fxCtx.rotate(compassRotation)
        fxCtx.strokeStyle = cursor.hoverInteractive
          ? 'rgba(244, 239, 230, 0.72)'
          : 'rgba(212, 175, 106, 0.5)'
        fxCtx.lineWidth = 1.4
        fxCtx.setLineDash([7, 10])
        fxCtx.beginPath()
        fxCtx.arc(0, 0, baseRingRadius - 6, 0, Math.PI * 2)
        fxCtx.stroke()
        fxCtx.restore()

        const starR = cursor.hoverInteractive ? 5.5 : 4.5
        const innerR = starR * 0.35
        fxCtx.save()
        fxCtx.translate(cursor.x, cursor.y)
        fxCtx.fillStyle = '#fbf6ec'
        fxCtx.shadowColor = 'rgba(228, 190, 114, 0.95)'
        fxCtx.shadowBlur = 9
        fxCtx.beginPath()
        for (let p = 0; p < 8; p++) {
          const r = p % 2 === 0 ? starR : innerR
          const a = (p * Math.PI) / 4
          if (p === 0) fxCtx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
          else fxCtx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
        }
        fxCtx.closePath()
        fxCtx.fill()
        fxCtx.restore()
      }
    }

    rafId = requestAnimationFrame(renderLoop)
  }

  rafId = requestAnimationFrame(renderLoop)

  onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas)
    window.removeEventListener('pointermove', handleGlobalPointerMove)
    window.removeEventListener('pointerdown', handleGlobalPointerDown)
    window.removeEventListener('pointerup', handleGlobalPointerUp)
    document.documentElement.removeEventListener('mouseleave', handleDocumentPointerLeave)
    document.removeEventListener('fullscreenchange', syncFullscreenState)
  })
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (logoCeremonyTimer) clearTimeout(logoCeremonyTimer)
  if (logoRevealTimer) clearTimeout(logoRevealTimer)
  if (entranceRippleTimer) clearTimeout(entranceRippleTimer)
})
</script>

<template>
  <main
    ref="stageRef"
    class="preview-stage relative grid h-dvh w-full grid-rows-[auto_1fr_auto] overflow-hidden bg-black select-none"
    :class="hasFineCursor ? 'has-custom-cursor' : ''"
    @contextmenu.prevent
  >
    <!-- Hidden SVG Filter Definitions: Bottom Pond Water Waves + Logo Pixel Sculpting -->
    <svg class="pointer-events-none fixed h-0 w-0 opacity-0" aria-hidden="true">
      <defs>
        <filter id="koduvayur-pond-wave" x="0%" y="48%" width="100%" height="48%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.072"
            numOctaves="2"
            seed="5"
            result="pondNoise"
          />
          <feColorMatrix
            ref="pondHueMatrixRef"
            in="pondNoise"
            type="hueRotate"
            values="0"
            result="pondFlowNoise"
          />
          <feDisplacementMap
            ref="pondDisplaceRef"
            in="SourceGraphic"
            in2="pondFlowNoise"
            scale="7.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="koduvayur-logo-sculpt" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.016 0.038"
            numOctaves="2"
            seed="11"
            result="logoNoise"
          />
          <feColorMatrix
            ref="logoHueMatrixRef"
            in="logoNoise"
            type="hueRotate"
            values="0"
            result="logoFlowNoise"
          />
          <feDisplacementMap
            ref="logoDisplaceRef"
            in="SourceGraphic"
            in2="logoFlowNoise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            result="warpedLogo"
          />
          <feComponentTransfer in="warpedLogo">
            <feFuncR ref="logoGammaRRef" type="gamma" amplitude="1" exponent="1.12" offset="0" />
            <feFuncG ref="logoGammaGRef" type="gamma" amplitude="1" exponent="1.12" offset="0" />
            <feFuncB ref="logoGammaBRef" type="gamma" amplitude="1" exponent="1.12" offset="0" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>

    <!-- 1. Hero Background + Masked Wavy Pond Reflection Layer + Dark Pure-Black Radial Tint -->
    <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div class="parallax-bg h-full w-full">
        <div class="hero-media-scale relative h-full w-full">
          <picture class="block h-full w-full">
            <source
              media="(min-width: 768px)"
              srcset="/images/rad-pc.jpg"
              width="1440"
              height="960"
            />
            <img
              src="/images/rad-mob.jpg"
              alt="Illuminated Viswanatha Swamy Temple Pond in Koduvayur at night"
              width="600"
              height="900"
              fetchpriority="high"
              decoding="async"
              draggable="false"
              class="protected-media h-full w-full object-cover object-center"
            />
          </picture>

          <picture class="pond-wave-overlay absolute inset-0 block h-full w-full">
            <source
              media="(min-width: 768px)"
              srcset="/images/rad-pc.jpg"
              width="1440"
              height="960"
            />
            <img
              src="/images/rad-mob.jpg"
              alt=""
              width="600"
              height="900"
              decoding="async"
              draggable="false"
              class="protected-media h-full w-full object-cover object-center"
            />
          </picture>
        </div>
      </div>

      <div class="black-radial-tint absolute inset-0" />
      <div class="sky-vignette absolute inset-0" />
    </div>

    <!-- 2. Upper Sky Identity: "SOMETHING IS COMING HOME" Animates First -> Logo Second -->
    <header
      class="relative z-20 flex flex-col items-center px-4 pt-[clamp(1.25rem,3.4dvh,2.5rem)] text-center"
    >
      <!-- Act 2: Koduvayur Logo (Delayed to 2.75s, Slower 2.45s Emergence) -->
      <div class="parallax-logo">
        <div class="logo-entrance">
          <button
            ref="logoButtonRef"
            type="button"
            :data-cursor-interactive="isLogoRevealed ? '' : undefined"
            aria-label="Koduvayur Ratholsavam emblem"
            class="logo-button relative bg-transparent p-0 focus:outline-none"
            :class="isLogoRevealed ? 'pointer-events-auto' : 'pointer-events-none'"
            @click="triggerLogoCeremony"
            @pointerenter="isLogoHovered = true"
            @pointermove="handleLogoPointerMove"
            @pointerleave="
              () => {
                isLogoHovered = false
                resetLogoTilt()
              }
            "
            @contextmenu.prevent
          >
            <span
              class="logo-living-wrap block"
              :class="{
                'is-hovered': isLogoHovered,
                'is-ceremony': isLogoCeremonyActive,
              }"
            >
              <img
                :src="currentLogoSrc"
                alt="Koduvayur Ratholsavam"
                width="512"
                height="250"
                fetchpriority="high"
                decoding="async"
                draggable="false"
                class="protected-media logo-img aspect-[512/250] h-auto"
                @error="handleLogoImgError"
                @dragstart.prevent
                @contextmenu.prevent
              />
            </span>
          </button>
        </div>
      </div>

      <!-- Act 1A: "SOMETHING IS COMING" Animates In First (0.32s) -->
      <p
        aria-label="Something Is Coming"
        class="parallax-eyebrow mt-[clamp(1.85rem,4.8dvh,3.6rem)] flex flex-wrap items-center justify-center font-sans text-[clamp(0.65rem,min(2.6vw,1.48dvh),0.88rem)] font-normal tracking-[0.38em] text-[#efe9dd]"
      >
        <span
          v-for="item in eyebrowChars"
          :key="item.id"
          aria-hidden="true"
          class="char-reveal inline-block"
          :style="{ animationDelay: item.delay }"
        >
          {{ item.char }}
        </span>
      </p>

      <!-- Act 1B: Monumental H[O]ME Animates Immediately After Eyebrow (1.05s - 2.67s) -->
      <div class="parallax-home mt-[clamp(0.55rem,1.45dvh,1.15rem)] flex items-center justify-center">
        <h1 class="sr-only">Something Is Coming Home — Koduvayur Ratholsavam</h1>

        <div
          class="home-wordmark flex items-center justify-center font-serif leading-[0.92] font-semibold tracking-[0.06em] text-[#f7f2e8]"
        >
          <span
            aria-hidden="true"
            class="home-letter-reveal inline-block"
            style="animation-delay: 1.05s"
          >
            <span class="home-glyph-inner inline-block">H</span>
          </span>

          <span
            ref="playAnchorRef"
            class="home-letter-reveal inline-flex items-center justify-center"
            style="animation-delay: 1.23s"
          >
            <button
              ref="playButtonRef"
              type="button"
              data-cursor-interactive
              aria-haspopup="dialog"
              :aria-expanded="isVideoModalOpen"
              aria-label="Play Koduvayur Ratholsavam preview video"
              class="play-o-btn group relative mx-[0.03em] inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af6a]/85"
              @click="handlePlayPreviewClick"
              @pointerenter="isPlayHovered = true"
              @pointerleave="isPlayHovered = false"
            >
              <span
                class="play-o-glow pointer-events-none absolute inset-[-28%] rounded-full"
                :class="isPlayHovered ? 'scale-125 opacity-95' : 'scale-100 opacity-45'"
                aria-hidden="true"
              />

              <span
                v-if="playPulseKey > 0"
                :key="playPulseKey"
                class="play-o-ripple pointer-events-none absolute inset-0 rounded-full"
                aria-hidden="true"
              />

              <svg
                viewBox="0 0 100 100"
                class="play-o-svg overflow-visible"
                :class="isPlayHovered ? 'is-hovered' : ''"
                aria-hidden="true"
              >
                <ellipse
                  cx="50"
                  cy="50"
                  rx="40"
                  ry="42"
                  :fill="isPlayHovered ? 'rgba(212, 175, 106, 0.14)' : 'rgba(6, 5, 4, 0.36)'"
                  :stroke="isPlayHovered ? '#efd093' : '#f7f2e8'"
                  stroke-width="6.8"
                  class="o-stroke-draw"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="31.5"
                  fill="none"
                  stroke="#d4af6a"
                  stroke-width="1.2"
                  stroke-dasharray="34 16 10 16"
                  class="play-o-orbit opacity-60 group-hover:opacity-100"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="25.5"
                  fill="none"
                  stroke="#f3dba8"
                  stroke-width="0.8"
                  stroke-dasharray="14 18"
                  class="play-o-orbit-reverse opacity-25 group-hover:opacity-80"
                />

                <g class="o-triangle-reveal">
                  <path
                    d="M44.5 38 L62.5 50 L44.5 62 Z"
                    :fill="isPlayHovered ? '#f6dfa4' : '#d8b46e'"
                    :stroke="isPlayHovered ? '#f6dfa4' : '#d8b46e'"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                    class="o-triangle-hover"
                  />
                </g>
              </svg>
            </button>
          </span>

          <span
            aria-hidden="true"
            class="home-letter-reveal inline-block"
            style="animation-delay: 1.41s"
          >
            <span class="home-glyph-inner inline-block">M</span>
          </span>

          <span
            aria-hidden="true"
            class="home-letter-reveal inline-block"
            style="animation-delay: 1.59s"
          >
            <span class="home-glyph-inner inline-block">E</span>
          </span>
        </div>
      </div>
    </header>

    <!-- 3. Open Temple & Living Pond Reflection Window -->
    <div class="pointer-events-none relative z-10" aria-hidden="true" />

    <!-- 4. Act 3: Pond Countdown & Arrival Animate In After Koduvayur Logo Completes (5.18s+) -->
    <footer
      class="parallax-footer relative z-20 flex flex-col items-center px-3 pb-[clamp(1.15rem,3dvh,2rem)] text-center sm:px-4"
    >
      <div
        role="timer"
        aria-live="off"
        aria-label="Countdown to Koduvayur Ratholsavam arrival on 24 November 2026 at 21:00 IST"
        class="flex items-start justify-center gap-[clamp(0.4rem,2.2vw,1.65rem)]"
      >
        <div
          class="countdown-unit-reveal flex min-w-[2.95rem] flex-col items-center sm:min-w-[5.1rem]"
          style="animation-delay: 5.18s"
        >
          <span class="countdown-digits">{{ countdown.days }}</span>
          <span class="countdown-label">Days</span>
        </div>

        <span
          class="countdown-unit-reveal countdown-colon"
          style="animation-delay: 5.26s"
          aria-hidden="true"
        >
          :
        </span>

        <div
          class="countdown-unit-reveal flex min-w-[2.95rem] flex-col items-center sm:min-w-[5.1rem]"
          style="animation-delay: 5.34s"
        >
          <span class="countdown-digits">{{ countdown.hours }}</span>
          <span class="countdown-label">Hours</span>
        </div>

        <span
          class="countdown-unit-reveal countdown-colon"
          style="animation-delay: 5.42s"
          aria-hidden="true"
        >
          :
        </span>

        <div
          class="countdown-unit-reveal flex min-w-[2.95rem] flex-col items-center sm:min-w-[5.1rem]"
          style="animation-delay: 5.5s"
        >
          <span class="countdown-digits">{{ countdown.minutes }}</span>
          <span class="countdown-label">Minutes</span>
        </div>

        <span
          class="countdown-unit-reveal countdown-colon"
          style="animation-delay: 5.58s"
          aria-hidden="true"
        >
          :
        </span>

        <div
          class="countdown-unit-reveal flex min-w-[2.95rem] flex-col items-center sm:min-w-[5.1rem]"
          style="animation-delay: 5.66s"
        >
          <span class="countdown-digits">{{ countdown.seconds }}</span>
          <span class="countdown-label">Seconds</span>
        </div>
      </div>

      <p
        aria-label="Arrival 24.11.26 at 21:00 IST"
        class="mt-[clamp(0.85rem,2dvh,1.35rem)] flex flex-wrap items-center justify-center font-sans text-[clamp(0.6rem,min(2.2vw,1.3dvh),0.78rem)] font-medium tracking-[0.26em] text-[#c8ab73] uppercase"
      >
        <span
          v-for="item in arrivalChars"
          :key="item.id"
          aria-hidden="true"
          class="char-reveal inline-block"
          :style="{ animationDelay: item.delay }"
        >
          {{ item.char }}
        </span>
      </p>
    </footer>

    <!-- 5. Royal 9:16 Portrait Video Player Modal -->
    <PromoVideoModal
      :open="isVideoModalOpen"
      video-src="/videos/rad2026-home.mp4"
      poster-src="/images/rad-mob.jpg"
      :has-custom-cursor="hasFineCursor"
      @close="handleCloseVideoModal"
    />

    <!-- 6. Teleported Top-Layer Gold Cursor & Pond FX Canvas (z-[110]) -->
    <Teleport to="body">
      <canvas
        ref="fxCanvasRef"
        class="pointer-events-none fixed inset-0 z-[110] h-full w-full"
        aria-hidden="true"
      />
    </Teleport>
  </main>
</template>

<style scoped>
.preview-stage {
  --px: 0;
  --py: 0;
  --ox: 0px;
  --oy: 0px;
  --logo-rx: 0deg;
  --logo-ry: 0deg;
}

.has-custom-cursor,
.has-custom-cursor button {
  cursor: none !important;
}

.protected-media {
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  pointer-events: none;
}

.parallax-bg {
  transform: translate3d(calc(var(--px) * -4.5px), calc(var(--py) * -3px), 0);
  will-change: transform;
}

.parallax-logo {
  transform: translate3d(calc(var(--px) * 2.5px), calc(var(--py) * 1.8px), 0);
  will-change: transform;
}

.parallax-eyebrow {
  transform: translate3d(calc(var(--px) * 3.2px), calc(var(--py) * 2.2px), 0);
  will-change: transform;
}

.parallax-home {
  transform: translate3d(calc(var(--px) * 4.2px), calc(var(--py) * 2.8px), 0);
  will-change: transform;
}

.parallax-footer {
  transform: translate3d(calc(var(--px) * 2.2px), calc(var(--py) * 1.5px), 0);
  will-change: transform;
}

.hero-media-scale {
  opacity: 0;
  transform: scale(1.13);
  will-change: transform, opacity;
  animation: heroFadeZoomOut 2.8s cubic-bezier(0.16, 1, 0.3, 1) 0.04s forwards;
}

@keyframes heroFadeZoomOut {
  0% {
    opacity: 0;
    transform: scale(1.13);
  }
  100% {
    opacity: 1;
    transform: scale(1.022);
  }
}

.pond-wave-overlay {
  filter: url(#koduvayur-pond-wave);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 51.5%,
    rgba(0, 0, 0, 0.88) 58%,
    rgba(0, 0, 0, 0.96) 80%,
    transparent 91%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 51.5%,
    rgba(0, 0, 0, 0.88) 58%,
    rgba(0, 0, 0, 0.96) 80%,
    transparent 91%
  );
}

.black-radial-tint {
  background: radial-gradient(
    ellipse 74% 58% at 50% 52%,
    rgba(0, 0, 0, 0.24) 0%,
    rgba(0, 0, 0, 0.48) 56%,
    rgba(0, 0, 0, 0.86) 84%,
    #000000 100%
  );
}

.sky-vignette {
  background:
    linear-gradient(
      to bottom,
      #000000 0%,
      rgba(0, 0, 0, 0.84) 22%,
      rgba(0, 0, 0, 0.24) 40%,
      rgba(0, 0, 0, 0.14) 62%,
      rgba(0, 0, 0, 0.72) 85%,
      #000000 100%
    ),
    radial-gradient(ellipse at center, rgba(0, 0, 0, 0.1) 48%, rgba(0, 0, 0, 0.9) 100%);
}

/* Act 2: Delayed & Slower Same Logo Emergence (2.45s Duration after 2.75s Delay) */
.logo-entrance {
  opacity: 0;
  will-change: transform, opacity;
  animation: logoEmergence 2.45s cubic-bezier(0.22, 1, 0.36, 1) 2.75s forwards;
}

@keyframes logoEmergence {
  0% {
    opacity: 0;
    transform: translate3d(0, 20px, 0) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.logo-button {
  transform: perspective(860px) rotateX(var(--logo-rx)) rotateY(var(--logo-ry));
  will-change: transform;
}

.logo-living-wrap {
  animation: logoGentleFloat 5.5s ease-in-out infinite alternate;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.logo-living-wrap.is-hovered {
  transform: translate3d(0, -3px, 0) scale(1.045);
}

.logo-living-wrap.is-ceremony {
  transform: translate3d(0, -5px, 0) scale(1.068);
}

@keyframes logoGentleFloat {
  0% {
    translate: 0 0;
  }
  100% {
    translate: 0 -3px;
  }
}

.logo-img {
  width: clamp(156px, min(44vw, 20.5dvh), 258px);
  mix-blend-mode: screen;
  filter: url(#koduvayur-logo-sculpt);
}

.char-reveal {
  opacity: 0;
  will-change: transform, opacity;
  animation: cleanCharRise 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes cleanCharRise {
  0% {
    opacity: 0;
    transform: translate3d(0, 14px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.home-wordmark {
  font-size: clamp(3.7rem, min(16.6vw, 11.8dvh), 7.75rem);
  text-shadow: 0 10px 42px rgba(0, 0, 0, 0.95);
}

.home-letter-reveal {
  opacity: 0;
  will-change: transform, opacity;
  animation: cleanHomeRise 1.08s cubic-bezier(0.19, 1, 0.22, 1) forwards;
}

@keyframes cleanHomeRise {
  0% {
    opacity: 0;
    transform: translate3d(0, 32px, 0) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.home-glyph-inner {
  transition:
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.45s ease,
    text-shadow 0.45s ease;
}

.home-letter-reveal:hover .home-glyph-inner {
  color: #f6e3b8;
  transform: translate3d(0, -2.5px, 0);
  text-shadow: 0 0 28px rgba(212, 175, 106, 0.38);
}

.play-o-btn {
  transform: translate3d(var(--ox), var(--oy), 0);
  will-change: transform;
}

.play-o-glow {
  background: radial-gradient(
    circle,
    rgba(226, 188, 114, 0.38) 0%,
    rgba(212, 175, 106, 0.1) 56%,
    transparent 76%
  );
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.55s ease;
}

.play-o-svg {
  width: 0.74em;
  height: 0.74em;
  transform: translateY(-0.02em) scale(1);
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.play-o-svg.is-hovered {
  transform: translateY(-0.02em) scale(1.18);
}

.play-o-btn:active .play-o-svg {
  transform: translateY(-0.02em) scale(0.96);
}

.o-stroke-draw {
  stroke-dasharray: 265;
  stroke-dashoffset: 265;
  transition:
    stroke 0.5s ease,
    fill 0.5s ease;
  animation: drawRomanO 1.35s cubic-bezier(0.22, 1, 0.36, 1) 1.28s forwards;
}

@keyframes drawRomanO {
  to {
    stroke-dashoffset: 0;
  }
}

.o-triangle-reveal {
  opacity: 0;
  transform-origin: 50px 50px;
  animation: triangleBloom 0.85s cubic-bezier(0.22, 1, 0.36, 1) 1.62s forwards;
}

@keyframes triangleBloom {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.o-triangle-hover {
  transform-origin: 50px 50px;
  transition:
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    fill 0.4s ease,
    stroke 0.4s ease;
}

.play-o-svg.is-hovered .o-triangle-hover {
  transform: translateX(1.4px) scale(1.09);
}

.play-o-orbit {
  transform-origin: 50px 50px;
  transition: opacity 0.5s ease;
  animation: orbitSpin 24s linear infinite;
}

.play-o-orbit-reverse {
  transform-origin: 50px 50px;
  transition: opacity 0.5s ease;
  animation: orbitSpinReverse 16s linear infinite;
}

@keyframes orbitSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbitSpinReverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.play-o-ripple {
  border: 1.6px solid rgba(236, 198, 122, 0.85);
  animation: playPulseExpand 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes playPulseExpand {
  0% {
    opacity: 0.92;
    transform: scale(0.92);
  }
  100% {
    opacity: 0;
    transform: scale(1.95);
  }
}

.countdown-unit-reveal {
  opacity: 0;
  will-change: transform, opacity;
  animation: countdownRise 1.0s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes countdownRise {
  0% {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.countdown-digits {
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: clamp(2.1rem, min(8.6vw, 5.8dvh), 3.9rem);
  line-height: 1.02;
  letter-spacing: 0.04em;
  color: #faf7f0;
  text-shadow: 0 4px 28px rgba(0, 0, 0, 0.98);
  transition:
    color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.countdown-unit-reveal:hover .countdown-digits {
  color: #f3dba8;
  transform: translate3d(0, -2px, 0);
}

.countdown-label {
  margin-top: 0.48rem;
  font-family: var(--font-sans);
  font-size: clamp(0.54rem, min(1.95vw, 1.18dvh), 0.72rem);
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(240, 234, 222, 0.8);
}

.countdown-colon {
  margin-top: clamp(0.22rem, 0.65dvh, 0.45rem);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: clamp(1.55rem, min(6vw, 4.1dvh), 2.75rem);
  line-height: 1;
  color: rgba(222, 186, 114, 0.75);
}
</style>