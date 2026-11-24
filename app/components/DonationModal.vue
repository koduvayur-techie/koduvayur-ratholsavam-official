<!-- app/components/DonationModal.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { FESTIVAL_2026_DATA } from '~/data/festival2026'
import { copyTextToClipboard } from '~/utils/clipboard'

const { isDonateOpen, closeDonate } = useFestivalModals()
const donate = FESTIVAL_2026_DATA.donation
const copiedField = ref<string | null>(null)
let copyResetTimer: ReturnType<typeof setTimeout> | null = null

async function handleCopy(fieldKey: string, text: string) {
  const ok = await copyTextToClipboard(text)
  if (!ok) return

  copiedField.value = fieldKey
  if (copyResetTimer) clearTimeout(copyResetTimer)
  copyResetTimer = setTimeout(() => {
    if (copiedField.value === fieldKey) copiedField.value = null
  }, 2000)
}

function handleKeydown(e: KeyboardEvent) {
  if (isDonateOpen.value && e.key === 'Escape') {
    e.preventDefault()
    closeDonate()
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
      <!-- data-lenis-prevent + overflow-y-auto ensures silky native scrolling on any height -->
      <div
        v-if="isDonateOpen"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="kr-donate-title"
        class="fixed inset-0 z-[75] overflow-y-auto overscroll-contain bg-[#18100a]/74 backdrop-blur-md"
        @click.self="closeDonate"
      >
        <div
          class="flex min-h-full items-center justify-center p-4 sm:p-6"
          @click.self="closeDonate"
        >
          <div
            class="kr-modal-card relative w-full max-w-xl rounded-[4px] border border-[var(--kr-border-strong)] bg-[var(--kr-surface)] p-5 shadow-2xl sm:p-7"
          >
            <!-- Header -->
            <div class="flex items-start justify-between gap-4 border-b border-[var(--kr-border)] pb-4">
              <div>
                <p class="font-sans text-[0.68rem] tracking-[0.2em] text-[var(--kr-gold-deep)] uppercase">
                  Koduvayur Ratholsavam 2026
                </p>
                <h2
                  id="kr-donate-title"
                  class="mt-0.5 font-serif text-2xl font-semibold text-[var(--kr-ink)] sm:text-[1.75rem]"
                >
                  {{ donate.heading }}
                </h2>
                <p class="mt-0.5 font-sans text-xs text-[var(--kr-ink-muted)]">
                  {{ donate.subheading }}
                </p>
              </div>

              <button
                type="button"
                data-cursor-interactive
                aria-label="Close donation dialog"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] text-[var(--kr-ink)] transition-colors hover:border-[var(--kr-gold)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
                @click="closeDonate"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <!-- QR & Bank Credentials -->
            <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-[11rem_1fr] sm:items-center">
              <div class="kr-sacred-frame mx-auto aspect-square w-44 overflow-hidden rounded-[3px] bg-white p-2 sm:mx-0">
                <img
                  :src="donate.qrImageSrc"
                  alt="UPI QR Code for Koduvayur Ratholsava Committee"
                  width="240"
                  height="240"
                  class="h-full w-full object-cover"
                  loading="lazy" 
                  decoding="async"
                />
              </div>

              <div class="space-y-3">
                <div>
                  <p class="font-sans text-[0.66rem] tracking-[0.16em] text-[var(--kr-ink-muted)] uppercase">
                    Bank & Account Name
                  </p>
                  <p class="font-serif text-[1.16rem] font-semibold text-[var(--kr-ink)]">
                    {{ donate.accountHolder }}
                  </p>
                  <p class="font-sans text-xs text-[var(--kr-ink-secondary)]">
                    {{ donate.bankName }}
                  </p>
                </div>

                <!-- Account Number -->
                <div class="flex items-center justify-between gap-2 rounded-[3px] border border-[var(--kr-border)] bg-[var(--kr-bg)] px-3 py-2">
                  <div class="min-w-0">
                    <span class="block font-sans text-[0.64rem] tracking-[0.14em] text-[var(--kr-ink-muted)] uppercase">
                      Account No.
                    </span>
                    <span class="font-sans text-sm text-[var(--kr-ink)] tabular-nums">
                      {{ donate.accountNumber }}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-cursor-interactive
                    class="shrink-0 rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] px-3 py-1 font-sans text-xs text-[var(--kr-gold-deep)] transition-colors hover:border-[var(--kr-gold)] active:scale-95"
                    @click="handleCopy('acc', donate.accountNumber)"
                  >
                    {{ copiedField === 'acc' ? 'Copied ✓' : 'Copy' }}
                  </button>
                </div>

                <!-- IFSC & UPI -->
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div class="flex items-center justify-between gap-2 rounded-[3px] border border-[var(--kr-border)] bg-[var(--kr-bg)] px-3 py-2">
                    <div class="min-w-0">
                      <span class="block font-sans text-[0.64rem] tracking-[0.14em] text-[var(--kr-ink-muted)] uppercase">
                        IFSC
                      </span>
                      <span class="font-sans text-xs text-[var(--kr-ink)] tabular-nums">
                        {{ donate.ifscCode }}
                      </span>
                    </div>
                    <button
                      type="button"
                      data-cursor-interactive
                      class="shrink-0 rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] px-2.5 py-0.5 font-sans text-[0.72rem] text-[var(--kr-gold-deep)] transition-colors hover:border-[var(--kr-gold)] active:scale-95"
                      @click="handleCopy('ifsc', donate.ifscCode)"
                    >
                      {{ copiedField === 'ifsc' ? 'Copied ✓' : 'Copy' }}
                    </button>
                  </div>

                  <div class="flex items-center justify-between gap-2 rounded-[3px] border border-[var(--kr-border)] bg-[var(--kr-bg)] px-3 py-2">
                    <div class="min-w-0">
                      <span class="block font-sans text-[0.64rem] tracking-[0.14em] text-[var(--kr-ink-muted)] uppercase">
                        UPI ID
                      </span>
                      <span class="block truncate font-sans text-xs text-[var(--kr-ink)]">
                        {{ donate.upiId }}
                      </span>
                    </div>
                    <button
                      type="button"
                      data-cursor-interactive
                      class="shrink-0 rounded-full border border-[var(--kr-border-strong)] bg-[var(--kr-surface-elevated)] px-2.5 py-0.5 font-sans text-[0.72rem] text-[var(--kr-gold-deep)] transition-colors hover:border-[var(--kr-gold)] active:scale-95"
                      @click="handleCopy('upi', donate.upiId)"
                    >
                      {{ copiedField === 'upi' ? 'Copied ✓' : 'Copy' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Remittance Note -->
            <div class="mt-5 rounded-[3px] border border-[var(--kr-border)] bg-[var(--kr-bg-warm)]/60 p-3.5 font-sans text-xs leading-relaxed text-[var(--kr-ink-secondary)]">
              <p>
                MO, Cheque, or DD may be addressed to
                <span class="text-[var(--kr-ink)]">{{ donate.ddPayableTo }}</span>.
              </p>
              <p class="mt-1.5">
                Kindly share contribution details via SMS to
                <a :href="`tel:+91${donate.intimationPhones[0]}`" class="text-[var(--kr-gold-deep)] underline">
                  {{ donate.intimationPhones[0] }}
                </a>
                /
                <a :href="`tel:+91${donate.intimationPhones[1]}`" class="text-[var(--kr-gold-deep)] underline">
                  {{ donate.intimationPhones[1] }}
                </a>
                or email
                <a :href="`mailto:${donate.intimationEmail}`" class="text-[var(--kr-gold-deep)] underline">
                  {{ donate.intimationEmail }}
                </a>.
              </p>
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