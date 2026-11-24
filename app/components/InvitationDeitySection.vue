<!-- app/components/InvitationDeitySection.vue -->
<script setup lang="ts">
import { FESTIVAL_2026_DATA } from '~/data/festival2026'

const { openDonate, openLightboxById } = useFestivalModals()
const invite = FESTIVAL_2026_DATA.invitation

function handleDeityClick() {
  openLightboxById(invite.deityImage.id)
}
</script>

<template>
  <section class="border-b border-[var(--kr-border)] bg-[var(--kr-bg-warm)]/50">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      <div class="kr-invite-layout">
        <!-- Left (Landscape) / Top (Portrait): Cordial Invitation & Subtle Contribution Trigger -->
        <div class="kr-invite-copy">
          <p
            v-reveal
            class="font-sans text-[0.7rem] leading-relaxed tracking-[0.2em] text-[var(--kr-gold-deep)] uppercase"
          >
            {{ invite.invocation }}
          </p>

          <h2
            v-reveal
            class="mt-3 font-serif text-[clamp(1.85rem,3.2vw,2.5rem)] leading-[1.12] font-medium text-[var(--kr-ink)]"
          >
            {{ invite.salutation }}
          </h2>

          <div class="mt-4 space-y-4 font-sans text-[0.96rem] leading-[1.76] text-[var(--kr-ink-secondary)] sm:text-[1rem]">
            <p v-for="(paragraph, idx) in invite.paragraphs" :key="idx" v-reveal>
              {{ paragraph }}
            </p>
          </div>

          <!-- Temple Tantri & Melshanthi -->
          <div
            v-reveal
            class="mt-6 grid grid-cols-1 gap-3.5 border-y border-[var(--kr-border)] py-4 sm:grid-cols-2 sm:gap-6"
          >
            <div v-for="priest in invite.priests" :key="priest.title">
              <p class="font-sans text-[0.68rem] tracking-[0.18em] text-[var(--kr-ink-muted)] uppercase">
                {{ priest.title }}
              </p>
              <p class="mt-0.5 font-serif text-[1.15rem] font-semibold text-[var(--kr-ink)]">
                {{ priest.name }}
              </p>
            </div>
          </div>

          <!-- Subtle Contribution Trigger (Opens Same Rupee Donation Overlay) -->
          <div v-reveal class="mt-6">
            <button
              type="button"
              data-cursor-interactive
              class="group inline-flex items-center gap-2.5 rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] px-5 py-2.5 font-sans text-[0.86rem] text-[var(--kr-ink)] shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--kr-gold)] hover:bg-[var(--kr-surface)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
              @click="openDonate"
            >
              <span
                class="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[var(--kr-gold)]/18 font-serif text-sm font-semibold text-[var(--kr-gold-deep)]"
                aria-hidden="true"
              >
                ₹
              </span>
              <span>{{ invite.donateTriggerLabel }}</span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                class="h-3.5 w-3.5 text-[var(--kr-gold-deep)] transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 10h10m0 0-3.5-3.5M15 10l-3.5 3.5" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Directly After Button on All Portrait Devices | Right Side on Landscape Devices -->
        <div v-reveal class="kr-deity-media-wrap">
          <button
            type="button"
            data-cursor-interactive
            aria-label="View Sree Visalakshy Sametha Sree Viswanatha Swamy portrait"
            class="kr-sacred-frame group relative block aspect-square w-full overflow-hidden rounded-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
            @click="handleDeityClick"
          >
            <img
              :src="invite.deityImage.src"
              :alt="invite.deityImage.alt"
              :width="invite.deityImage.width"
              :height="invite.deityImage.height"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* All Portrait Devices: Stacked (Deity Image Directly Below the Button) */
.kr-invite-layout {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
}

.kr-deity-media-wrap {
  width: 100%;
  max-width: 25.5rem;
  margin-inline: auto;
}

/* All Landscape Devices (Auto-Rotated Phones, Landscape Tablets, Laptops & Desktops): Right Side */
@media (orientation: landscape) and (min-width: 568px) {
  .kr-invite-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.24fr) minmax(0, 0.76fr);
    align-items: center;
    gap: 2rem;
  }

  .kr-deity-media-wrap {
    max-width: 22rem;
    margin-inline: 0;
    justify-self: end;
  }
}

@media (orientation: landscape) and (min-width: 1024px) {
  .kr-invite-layout {
    grid-template-columns: minmax(0, 1.28fr) minmax(0, 0.72fr);
    gap: 3.75rem;
  }

  .kr-deity-media-wrap {
    max-width: 27rem;
  }
}
</style>