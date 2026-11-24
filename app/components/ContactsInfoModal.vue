<!-- app/components/ContactsInfoModal.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { FESTIVAL_2026_DATA } from '~/data/festival2026'
import { copyTextToClipboard } from '~/utils/clipboard'

const { isInfoOpen, closeInfo } = useFestivalModals()
const info = FESTIVAL_2026_DATA.essentialInfo
const copiedPhone = ref<string | null>(null)
let copyResetTimer: ReturnType<typeof setTimeout> | null = null

async function handleCopyPhone(phone: string) {
  const ok = await copyTextToClipboard(phone)
  if (!ok) return

  copiedPhone.value = phone
  if (copyResetTimer) clearTimeout(copyResetTimer)
  copyResetTimer = setTimeout(() => {
    if (copiedPhone.value === phone) copiedPhone.value = null
  }, 1800)
}

function handleKeydown(e: KeyboardEvent) {
  if (isInfoOpen.value && e.key === 'Escape') {
    e.preventDefault()
    closeInfo()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  if (copyResetTimer) clearTimeout(copyResetTimer)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="kr-overlay">
      <div
        v-if="isInfoOpen"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="kr-info-title"
        class="fixed inset-0 z-[75] overflow-y-auto overscroll-contain bg-[#18100a]/74 backdrop-blur-md"
        @click.self="closeInfo"
      >
        <div
          class="flex min-h-full items-center justify-center p-4 sm:p-6"
          @click.self="closeInfo"
        >
          <div
            class="kr-modal-card relative w-full max-w-2xl rounded-[4px] border border-[var(--kr-border-strong)] bg-[var(--kr-surface)] p-5 shadow-2xl sm:p-7"
          >
            <div class="flex items-start justify-between gap-4 border-b border-[var(--kr-border)] pb-4">
              <div>
                <p class="font-sans text-[0.68rem] leading-relaxed tracking-[0.2em] text-[var(--kr-gold-deep)] uppercase">
                  {{ info.subheading }}
                </p>
                <h2
                  id="kr-info-title"
                  class="mt-0.5 font-serif text-2xl font-semibold text-[var(--kr-ink)] sm:text-[1.75rem]"
                >
                  {{ info.heading }}
                </h2>
              </div>

              <button
                type="button"
                data-cursor-interactive
                aria-label="Close contacts dialog"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] text-[var(--kr-ink)] transition-colors hover:border-[var(--kr-gold)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
                @click="closeInfo"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div class="mt-5 space-y-6">
              <div v-for="group in info.groups" :key="group.groupTitle">
                <h3 class="font-sans text-[0.7rem] tracking-[0.2em] text-[var(--kr-gold-deep)] uppercase">
                  {{ group.groupTitle }}
                </h3>

                <div class="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div
                    v-for="person in group.contacts"
                    :key="`${person.role}-${person.name}`"
                    class="flex flex-col gap-1.5 rounded-[3px] border border-[var(--kr-border)] bg-[var(--kr-bg)] px-3.5 py-2.5"
                  >
                    <!-- Line 1: Full Unclipped Name on a Single Line -->
                    <p class="whitespace-nowrap font-serif text-[1.05rem] leading-snug font-semibold text-[var(--kr-ink)] sm:text-[1.1rem]">
                      {{ person.name }}
                    </p>

                    <!-- Line 2: Designation on Left + Phone & Copy Button on Right -->
                    <div class="flex items-center justify-between gap-2">
                      <span class="font-sans text-[0.72rem] leading-tight text-[var(--kr-ink-muted)]">
                        {{ person.role }}
                      </span>

                      <div class="flex shrink-0 items-center gap-1.5">
                        <a
                          :href="`tel:+91${person.phone}`"
                          data-cursor-interactive
                          class="rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] px-2.5 py-0.5 font-sans text-xs text-[var(--kr-gold-deep)] tabular-nums transition-colors hover:border-[var(--kr-gold)]"
                        >
                          {{ person.phone }}
                        </a>
                        <button
                          type="button"
                          data-cursor-interactive
                          :aria-label="`Copy phone number for ${person.name}`"
                          class="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--kr-border)] bg-[var(--kr-surface)] text-[0.68rem] text-[var(--kr-ink-secondary)] transition-colors hover:border-[var(--kr-gold)] hover:text-[var(--kr-gold-deep)] active:scale-95"
                          @click="handleCopyPhone(person.phone)"
                        >
                          <span v-if="copiedPhone === person.phone" class="font-sans text-[0.65rem] text-[var(--kr-gold-deep)]">
                            ✓
                          </span>
                          <svg
                            v-else
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            class="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <rect x="6.5" y="6.5" width="9" height="9" rx="1.5" />
                            <path stroke-linecap="round" d="M4.5 13.5v-8A1.5 1.5 0 0 1 6 4h8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
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
.kr-overlay-enter-active,
.kr-overlay-leave-active {
  transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.kr-overlay-enter-active .kr-modal-card,
.kr-overlay-leave-active .kr-modal-card {
  transition:
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.kr-overlay-enter-from,
.kr-overlay-leave-to {
  opacity: 0;
}

.kr-overlay-enter-from .kr-modal-card,
.kr-overlay-leave-to .kr-modal-card {
  opacity: 0;
  transform: translate3d(0, 14px, 0) scale(0.97);
}
</style>