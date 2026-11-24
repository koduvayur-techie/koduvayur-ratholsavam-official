<!-- app/layouts/default.vue -->
<script setup lang="ts">
import { FESTIVAL_2026_DATA } from '~/data/festival2026'

const { isVideoOpen, closeVideo } = useFestivalModals()
</script>

<template>
  <div class="grid min-h-dvh grid-rows-[auto_1fr_auto]">
    <SiteHeader />

    <main id="main-content">
      <slot />
    </main>

    <SiteFooter />

    <!-- Global Overlays & Native-Cursor Companion Halo -->
    <PromoVideoModal
      :open="isVideoOpen"
      :video-src="FESTIVAL_2026_DATA.hero.videoSrc"
      :poster-src="FESTIVAL_2026_DATA.hero.videoPosterSrc"
      :has-custom-cursor="false"
      @close="closeVideo"
    />
    <FestivalLightbox />
    <DonationModal />
    <ContactsInfoModal />
    <CursorHaloCompanion />
  </div>
</template>