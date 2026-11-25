// app/constants/choreography.ts
export const FESTIVAL_CHOREOGRAPHY = {
  /** Master tempo scale — adjust once to tune global choreography speed */
  tempoScale: 1,

  easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',

  reveal: {
    initialStaggerMs: 85,
    maxInitialDelayMs: 620,
    scrollBatchStaggerMs: 95,
    enterThreshold: 0.12,
  },

  lenis: {
    duration: 1.05,
    wheelMultiplier: 0.96,
    touchMultiplier: 1.15,
  },

  cursorHalo: {
    lerpFactor: 0.2,
    settleEpsilonPx: 0.12,
    defaultSizePx: 34,
    clickableSizePx: 48,
    pressedScale: 0.82,
  },

  /** Kinetic 1:1 Slider Physics (Normalized to 60fps frames) */
  slider: {
    frictionPerFrame: 0.92,
    snapLerpFactor: 0.16,
    rubberBandFactor: 0.28,
    dragClickThresholdPx: 6,
    axisLockThresholdPx: 6,
    velocityStopEpsilon: 0.45,
    snapCompleteEpsilonPx: 0.35,
    wheelSnapDebounceMs: 130,
  },

  /** Full-Sensor Lightbox & Multi-Touch Zoom Physics */
  lightbox: {
    swipeDistanceThresholdPx: 52,
    swipeVelocityThresholdPxPerMs: 0.42,
    verticalDismissThresholdPx: 88,
    rubberBandEdgeFactor: 0.24,
    wheelCooldownMs: 340,
    minZoomScale: 1,
    maxZoomScale: 4,
    doubleTapZoomScale: 2.5,
    doubleTapDelayMs: 330,
    doubleTapMaxDistPx: 38,
    zoomTransitionMs: 260,
  },
} as const