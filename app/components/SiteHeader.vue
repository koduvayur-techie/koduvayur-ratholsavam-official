<!-- app/components/SiteHeader.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { FESTIVAL_2026_DATA } from '~/data/festival2026'

const { openDonate, openInfo } = useFestivalModals()
const headerData = FESTIVAL_2026_DATA.header
const logoLoadError = ref(false)
const rupeeLoadError = ref(false)
</script>

<template>
  <header
    class="kr-site-header sticky top-0 z-40 border-b border-[var(--kr-border)] bg-[var(--kr-surface)]/95 backdrop-blur-md"
  >
    <div
      class="kr-header-bar mx-auto grid h-16 max-w-7xl grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 px-4 sm:h-[4.5rem] sm:grid-cols-[2.625rem_minmax(0,1fr)_2.625rem] sm:gap-4 sm:px-6 lg:px-10"
    >
      <!-- Left: Info SVG Trigger -->
      <button
        type="button"
        data-cursor-interactive
        aria-label="Open essential festival contacts and information"
        class="flex h-10 w-10 items-center justify-center justify-self-start rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] text-[var(--kr-ink)] shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--kr-gold)] hover:text-[var(--kr-gold-deep)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)] sm:h-10.5 sm:w-10.5"
        @click="openInfo"
      >
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
      </button>

      <!-- Center: rad26logo.png — Dead-Center on Mobile & Desktop with Whisper-Faint Shadow -->
      <NuxtLink
        to="/"
        aria-label="Koduvayur Ratholsavam 2026 Home"
        class="group flex h-full items-center justify-center justify-self-center py-1 rounded-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)] sm:py-1.25"
      >
        <img
          v-if="!logoLoadError"
          :src="headerData.logoSrc"
          :alt="headerData.logoAlt"
          width="320"
          height="156"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          class="kr-logo-emblem h-[3.35rem] w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:h-[3.85rem]"
          @error="logoLoadError = true"
        />
        <span
          v-else
          class="truncate font-serif text-xl font-semibold tracking-tight text-[var(--kr-ink)] sm:text-2xl"
        >
          Koduvayur Ratholsavam
        </span>
      </NuxtLink>

      <!-- Right: Metallic Rupee Coin Donation Trigger -->
      <button
        type="button"
        data-cursor-interactive
        aria-label="Open festival contribution details"
        class="group relative flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-bg)] p-[2px] shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--kr-gold)] hover:shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)] sm:h-10.5 sm:w-10.5"
        @click="openDonate"
      >
        <img
          v-if="headerData.rupeeIconSrc && !rupeeLoadError"
          :src="headerData.rupeeIconSrc"
          alt=""
          width="40"
          height="40"
          decoding="async"
          class="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
          @error="rupeeLoadError = true"
        />
        <span
          v-else
          class="kr-rupee-coin flex h-full w-full items-center justify-center rounded-full font-serif text-[1.15rem] leading-none font-semibold text-[#382004] transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          ₹
        </span>
      </button>
    </div>
  </header>
</template>

<style scoped>
/* Downward-cast warm elevation shadow outside the bottom of the header */
.kr-site-header {
  box-shadow:
    0 10px 28px -10px rgba(35, 22, 13, 0.16),
    0 2px 6px -1px rgba(35, 22, 13, 0.07);
}

/* Very faint, whisper-light shadow on the emblem */
.kr-logo-emblem {
  filter: drop-shadow(0 1px 2px rgba(35, 22, 13, 0.08));
}

.kr-rupee-coin {
  background: conic-gradient(
    from 135deg,
    #f6dc93 0deg,
    #cf9932 80deg,
    #f9e6ad 155deg,
    #b17b19 245deg,
    #f6dc93 360deg
  );
  box-shadow:
    inset 0 0 0 1.5px rgba(84, 50, 6, 0.28),
    inset 0 1px 2px rgba(255, 250, 230, 0.75);
}

@media (max-height: 520px) and (orientation: landscape) {
  .kr-header-bar {
    height: 3.5rem;
  }

  .kr-logo-emblem {
    height: 2.9rem;
  }
}
</style>