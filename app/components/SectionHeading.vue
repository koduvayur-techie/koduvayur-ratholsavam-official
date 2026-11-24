<!-- app/components/SectionHeading.vue -->
<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  lead?: string
}>()
</script>

<template>
  <header class="kr-section-heading">
    <div class="kr-heading-layout">
      <div v-reveal class="kr-heading-title-wrap">
        <p
          v-if="eyebrow"
          class="mb-1.5 font-sans text-[0.7rem] tracking-[0.22em] text-[var(--kr-gold-deep)] uppercase"
        >
          {{ eyebrow }}
        </p>

        <h2
          class="font-serif text-[clamp(2rem,3.6vw,2.9rem)] leading-[1.06] font-medium tracking-[-0.01em] text-[var(--kr-ink)]"
        >
          {{ title }}
        </h2>

        <!-- Signature Sacred Gold Underline Rule -->
        <div class="mt-2.5 flex items-center gap-2" aria-hidden="true">
          <span class="h-[2px] w-14 bg-gradient-to-r from-[var(--kr-gold-deep)] to-[var(--kr-gold-bright)]" />
          <svg viewBox="0 0 12 12" class="h-2.5 w-2.5 shrink-0 text-[var(--kr-gold)]" fill="currentColor">
            <path d="M6 0L12 6L6 12L0 6L6 0Z" />
          </svg>
          <span class="h-[1px] w-24 bg-gradient-to-r from-[var(--kr-gold)]/60 to-transparent sm:w-32" />
        </div>
      </div>

      <p
        v-if="lead"
        v-reveal="{ delay: 60 }"
        class="max-w-md font-sans text-[0.94rem] leading-[1.68] text-[var(--kr-ink-secondary)]"
      >
        {{ lead }}
      </p>
    </div>
  </header>
</template>

<style scoped>
.kr-heading-layout {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

@media (min-width: 768px) {
  .kr-heading-layout {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2.5rem;
  }
}
</style>