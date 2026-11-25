<!-- app/pages/index.vue -->
<script setup lang="ts">
import { FESTIVAL_2026_DATA } from '~/data/festival2026'
import { SPONSOR_BANDS_2026 } from '~/data/sponsors2026'

useKoduvayurSeo()

const [
  scheduleCategory,
  templeSpecialCategory,
  danceCategory,
  ratholsavamCategory,
  megaEntertainmentCategory,
  postFestivalCategory,
] = FESTIVAL_2026_DATA.eventCategories
</script>

<template>
  <div>
    <!-- 1. Hero Section (16:10 JPG Cover · Watch Film · Download Notice PDF) -->
    <FestivalHero />

    <!-- 2. Cordial Invitation, Priests, Subtle Contribution Link & 1:1 JPG Deity -->
    <InvitationDeitySection />

    <!-- 3. Sponsor Band 1: Top 2 Flagships (3:1 WebP — Vetri Finance & Hotel Srivatsa Regency) -->
    <SponsorLogoBand :band="SPONSOR_BANDS_2026.band1Flagships" />

    <!-- 4. Ratholsava Committee: Top 3 Leaders + English & Malayalam 1:1 JPG Rosters -->
    <CommitteeSection />

    <!-- 5. Sponsor Band 2 (5:2 WebP — 4 Ads) -->
    <SponsorLogoBand :band="SPONSOR_BANDS_2026.band2AfterCommittee" />

    <!-- 6. Daily Vedaparayanam & 9:00 AM Rudrabhishekam Note + Slider 1: Festival Schedule (8 Cards) -->
    <DailyRitualsBanner />
    <EventKineticSlider v-if="scheduleCategory" :category="scheduleCategory" />

    <!-- 7. Sponsor Band 3 (5:2 WebP — 4 Ads) -->
    <SponsorLogoBand :band="SPONSOR_BANDS_2026.band3AfterSchedule" />

    <!-- 8. Slider 2: Temple Special Events (6 Cards) -->
    <EventKineticSlider v-if="templeSpecialCategory" :category="templeSpecialCategory" />

    <!-- 9. Sponsor Band 4 (5:2 WebP — 4 Ads) -->
    <SponsorLogoBand :band="SPONSOR_BANDS_2026.band4AfterTempleSpecial" />

    <!-- 10. Slider 3: Cultural Dance Events (4 Cards) -->
    <EventKineticSlider v-if="danceCategory" :category="danceCategory" />

    <!-- 11. Sponsor Band 5 (5:2 WebP — 4 Ads with Sree Lakshmi Agencies) -->
    <SponsorLogoBand :band="SPONSOR_BANDS_2026.band5AfterDance" />

    <!-- 12. Slider 4: Ratholsavam Day One & Day Two (2 Cards) -->
    <EventKineticSlider v-if="ratholsavamCategory" :category="ratholsavamCategory" />

    <!-- 13. Sponsor Band 6 (5:2 WebP — 4 Ads) -->
    <SponsorLogoBand :band="SPONSOR_BANDS_2026.band6AfterRatholsavam" />

    <!-- 14. Slider 5: Mega Entertainment Events (3 Cards) -->
    <EventKineticSlider v-if="megaEntertainmentCategory" :category="megaEntertainmentCategory" />

    <!-- 15. Sponsor Band 7 (5:2 WebP — 4 Ads) -->
    <SponsorLogoBand :band="SPONSOR_BANDS_2026.band7AfterEntertainment" />

    <!-- 16. Slider 6: Post-Festival Events (4 Cards) -->
    <EventKineticSlider v-if="postFestivalCategory" :category="postFestivalCategory" />

    <!-- 17. Sponsor Band 8 (5:2 WebP — 4 Ads) -->
    <SponsorLogoBand :band="SPONSOR_BANDS_2026.band8AfterPostEvents" />

    <!-- 18. Adding Splendor to the Festivities (Light & Sound · Fireworks · Thirumanjanam Procession) -->
    <FestivalSplendorSection />

    <!-- 19. Closing Enquiries Link + Farewell Line ("...longing wait for the next Theru begins.") -->
    <FestivalClosingSection />

    <!-- 20. Sponsor Band 9: Centered Single 3:1 WebP Strip (Prasanna Lakshmi Group) -->
    <SponsorLogoBand :band="SPONSOR_BANDS_2026.band9ClosingSingle" />
    
  </div>
</template>