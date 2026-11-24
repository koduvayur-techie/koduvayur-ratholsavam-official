<!-- app/components/SiteFooter.vue -->
<template>
  <footer class="border-t border-[var(--kr-border)] bg-[var(--kr-surface)]">
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-10"
    >
      <p class="font-sans text-xs leading-relaxed text-[var(--kr-ink-muted)]">
        Koduvayur Ratholsavam 2026.
      </p>

      <a
        href="https://brandsta.in"
        target="_blank"
        rel="noopener noreferrer"
        data-cursor-interactive
        aria-label="Brandsta"
        class="group flex shrink-0 items-center justify-center rounded-xs text-[#0d1017] transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kr-gold)]"
      >
        <BrandstaSvg
          variant="mark"
          :decorative="true"
          class="h-7 w-auto sm:h-8"
        />
      </a>
    </div>
  </footer>
</template>