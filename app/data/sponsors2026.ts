// app/data/sponsors2026.ts
import type { LightboxImageItem } from '~/data/festival2026'

export type SponsorBandVariant = 'flagship' | 'standard' | 'closing-single'

export interface SponsorEntry {
  id: string
  name: string
  thumbSrc: string
  thumbWidth: number
  thumbHeight: number
  adSrc: string
  adWidth: number
  adHeight: number
}

export interface SponsorBandGroup {
  id: string
  variant: SponsorBandVariant
  items: SponsorEntry[]
}

/**
 * Live `.jpg` thumbnails and full ads inside
 * `public/images/sponsors/thumb/` and `public/images/sponsors/full/`.
 */
const USE_SPONSOR_PLACEHOLDERS = false
const PLACEHOLDER_IMG = '/images/rad-pc.jpg'

function thumbJpg(filename: string): string {
  return USE_SPONSOR_PLACEHOLDERS ? PLACEHOLDER_IMG : `/images/sponsors/thumb/${filename}.jpg`
}

function adJpg(filename: string): string {
  return USE_SPONSOR_PLACEHOLDERS ? PLACEHOLDER_IMG : `/images/sponsors/full/${filename}.jpg`
}

function createSponsor(
  num: string,
  slug: string,
  name: string,
  thumbFile: string,
  thumbSize: [width: number, height: number],
  adFile: string,
  adSize: [width: number, height: number],
): SponsorEntry {
  return {
    id: `sponsor-${num}-${slug}`,
    name,
    thumbSrc: thumbJpg(thumbFile),
    thumbWidth: thumbSize[0],
    thumbHeight: thumbSize[1],
    adSrc: adJpg(adFile),
    adWidth: adSize[0],
    adHeight: adSize[1],
  }
}

export const SPONSOR_BANDS_2026 = {
  // Band 1: After Dear Devotees, Before Committee (2 Flagship 3:1 Ads · 600x200 Thumbs)
  band1Flagships: {
    id: 'sponsors-band-1-flagships',
    variant: 'flagship',
    items: [
      createSponsor(
        '01',
        'vetri-finance',
        'Vetri Finance · Koduvayur & Peruvemba',
        'vetrifinance',
        [600, 200],
        'VetriFinance',
        [1000, 1333],
      ),
      createSponsor(
        '02',
        'hotel-srivatsa-regency',
        'Hotel Srivatsa Regency · Koduvayur',
        'hotelsrivatsa',
        [600, 200],
        'HotelSrivatsa',
        [1000, 1414],
      ),
    ],
  } satisfies SponsorBandGroup,

  // Band 2: After Committee, Before Daily Rituals & Festival Schedule (4 Standard 5:2 Ads · 600x240 Thumbs)
  band2AfterCommittee: {
    id: 'sponsors-band-2',
    variant: 'standard',
    items: [
      createSponsor(
        '03',
        'pulse-medical-centre',
        'Pulse Medical Centre · Koduvayur',
        'pulseclinic',
        [600, 240],
        'pulse',
        [1000, 651],
      ),
      createSponsor(
        '04',
        'sulekha-auditorium',
        'Sulekha Auditorium · Koduvayur',
        'sulekhaauditorium',
        [600, 240],
        'Sulekha',
        [1000, 647],
      ),
      createSponsor(
        '05',
        'uk-agencies',
        'U.K. Agencies · Cement & Steel, Koduvayur',
        'ukagencies',
        [600, 240],
        'UKAgencies',
        [1000, 591],
      ),
      createSponsor(
        '06',
        'usha-harish-masai-mara',
        'Mara Siligi Camp & Usha Harish Photography',
        'ushaharishmarasiligi',
        [600, 240],
        'UshaHarish',
        [1000, 591],
      ),
    ],
  } satisfies SponsorBandGroup,

  // Band 3: After Festival Schedule, Before Temple Special Events (4 Standard 5:2 Ads · 600x240 Thumbs)
  band3AfterSchedule: {
    id: 'sponsors-band-3',
    variant: 'standard',
    items: [
      createSponsor(
        '07',
        'skandavel-seva-kada',
        'Skandavel Seva Kada · Koduvayur',
        'skandavelseva',
        [600, 240],
        'SkandavelSeva',
        [1000, 591],
      ),
      createSponsor(
        '08',
        'sree-mookambika-transport',
        'Sree Mookambika Transport · Packers & Movers',
        'mookambikatransport',
        [600, 240],
        'MookambikaTransport',
        [1000, 591],
      ),
      createSponsor(
        '09',
        'sree-gold-loan',
        'Sree Gold Loan & Fin Solutions · Koduvayur',
        'sreegoldloan',
        [600, 240],
        'sreegoldloan',
        [1000, 666],
      ),
      createSponsor(
        '10',
        'lakshmi-tiles',
        'Lakshmi Tiles & Sanitary Ware · Koduvayur',
        'lakshmitiles',
        [600, 240],
        'LakshmiTiles',
        [1000, 591],
      ),
    ],
  } satisfies SponsorBandGroup,

  // Band 4: After Temple Special Events, Before Cultural Dance Events (4 Standard 5:2 Ads · 600x240 Thumbs)
  band4AfterTempleSpecial: {
    id: 'sponsors-band-4',
    variant: 'standard',
    items: [
      createSponsor(
        '11',
        'time-kids-preschool',
        'T.I.M.E. Kids Pre-School · Thannissery',
        'timekids',
        [600, 240],
        'TimeKids',
        [1000, 591],
      ),
      createSponsor(
        '12',
        'vedha-pooja-store',
        'Vedha Pooja Store · Gramapeedika, Koduvayur',
        'vedhapoojastore',
        [600, 240],
        'VedhaPooja',
        [1000, 647],
      ),
      createSponsor(
        '13',
        'amrutha-jewellery',
        'Amrutha Jewellery · Main Road, Koduvayur',
        'amrithajewellery',
        [600, 240],
        'AmrithaJewellery',
        [1000, 646],
      ),
      createSponsor(
        '14',
        'galaxy-health-insurance',
        'Galaxy Health Insurance · Palakkad',
        'galaxyinsurance',
        [600, 240],
        'GalaxyInsurance',
        [1000, 591],
      ),
    ],
  } satisfies SponsorBandGroup,

  // Band 5: After Cultural Dance Events, Before Ratholsavam Day 1 & 2 (4 Standard 5:2 Ads · 600x240 Thumbs)
  band5AfterDance: {
    id: 'sponsors-band-5',
    variant: 'standard',
    items: [
      createSponsor(
        '15',
        'keya-foods',
        'Keya Foods · Gourmet Kitchen Essentials',
        'keyafoods',
        [600, 240],
        'KeyaFoods',
        [1000, 647],
      ),
      createSponsor(
        '16',
        'haridra-catering',
        'Haridra Catering & Event Management · Old Kalpathy',
        'haridra',
        [600, 240],
        'HaridraCatering',
        [1000, 591],
      ),
      createSponsor(
        '17',
        'sree-lakshmi-agencies',
        'Sree Lakshmi Agencies · Koduvayur & Pittupeedika',
        'sreelakshmiagencies',
        [600, 240],
        'SreeLakshmiAgencies',
        [1000, 591],
      ),
      createSponsor(
        '18',
        'meenakshi-paint-house',
        'Meenakshi Paint House & Hardware · Koduvayur',
        'meenakshigroup',
        [600, 240],
        'MeenakshiGroup',
        [1000, 591],
      ),
    ],
  } satisfies SponsorBandGroup,

  // Band 6: After Ratholsavam Day 1 & 2, Before Mega Entertainment Events (4 Standard 5:2 Ads · 600x240 Thumbs)
  band6AfterRatholsavam: {
    id: 'sponsors-band-6',
    variant: 'standard',
    items: [
      createSponsor(
        '19',
        'ksp-iyyer-special',
        'KSP Iyyer Special · Sweets & Savouries, Koduvayur',
        'kspiyyerspecial',
        [600, 240],
        'KSPIyyerSpecial',
        [1000, 314],
      ),
      createSponsor(
        '20',
        'royal-granites',
        'Royal Granites · Palakkad Road, Koduvayur',
        'royalgranites',
        [600, 240],
        'RoyalGranites',
        [1000, 314],
      ),
      createSponsor(
        '21',
        'skill-tech-institute',
        'Skill Tech Institute · Palakkad & Koduvayur',
        'skilltechacademy',
        [600, 240],
        'SkillTech',
        [1000, 314],
      ),
      createSponsor(
        '22',
        'tezpro-fire-system',
        'Tezpro Fire System Pvt. Ltd.',
        'tezprofiresafety',
        [600, 240],
        'TezProFireSystem',
        [1000, 314],
      ),
    ],
  } satisfies SponsorBandGroup,

  // Band 7: After Mega Entertainment Events, Before Post-Festival Events (4 Standard 5:2 Ads · 600x240 Thumbs)
  band7AfterEntertainment: {
    id: 'sponsors-band-7',
    variant: 'standard',
    items: [
      createSponsor(
        '23',
        'peacock-bridal-studio',
        'Peacock Bridal Studio · Koduvayur',
        'peacockbridalstudio',
        [600, 240],
        'PeacockBridalStudio',
        [1000, 314],
      ),
      createSponsor(
        '24',
        'national-driving-institute',
        'National Driving Institute · Pittupeedika, Koduvayur',
        'nationaldriving',
        [600, 240],
        'NationalDriving',
        [1000, 314],
      ),
      createSponsor(
        '25',
        'lic-sukumaran',
        'LIC Premium Point — P. Sukumaran · Koduvayur',
        'licsukumaran',
        [600, 240],
        'LICSukumaran',
        [1000, 314],
      ),
      createSponsor(
        '26',
        'hotel-keerthy',
        'Hotel Keerthy · Pure Vegetarian, Palakkad',
        'hotelkeerthy',
        [600, 240],
        'HotelKeerthi',
        [1000, 314],
      ),
    ],
  } satisfies SponsorBandGroup,

  // Band 8: After Post-Festival Events, Before Closing Section (4 Standard 5:2 Ads · 600x240 Thumbs)
  band8AfterPostEvents: {
    id: 'sponsors-band-8',
    variant: 'standard',
    items: [
      createSponsor(
        '27',
        'hindustan-fashion-point',
        'Hindustan Fashion Point Ladies Tailoring · Koduvayur',
        'hindustanfashion',
        [600, 240],
        'HindustanTailor',
        [1000, 314],
      ),
      createSponsor(
        '28',
        'bismi-vegetables',
        'Bismi Vegetables · Main Road, Koduvayur',
        'bismivegetables',
        [600, 240],
        'BismiVegetables',
        [1000, 314],
      ),
      createSponsor(
        '29',
        'sabari-bakes-finance',
        'Sabari Bakes & Sabari Finance · Mannathukavu',
        'sabaribakesfin',
        [600, 240],
        'SabariBakesFinance',
        [1000, 314],
      ),
      createSponsor(
        '30',
        'welcome-water-supply',
        'Welcome Water Supply · Koduvayur',
        'welcomewater',
        [600, 240],
        'WelcomeWater',
        [1000, 314],
      ),
    ],
  } satisfies SponsorBandGroup,

  // Band 9: Final Single Centered 3:1 Strip After Closing Section (600x200 Thumb)
  band9ClosingSingle: {
    id: 'sponsors-band-9-closing',
    variant: 'closing-single',
    items: [
      createSponsor(
        '31',
        'prasanna-lakshmi-group',
        'Prasanna Lakshmi Auditorium · Sree Tharun Viha · M.R. Ramanchettiar Son',
        'prasannalakshmi',
        [600, 200],
        'PrasannaLakshmi',
        [1000, 591],
      ),
    ],
  } satisfies SponsorBandGroup,
} as const

export const ALL_SPONSORS_ORDERED: SponsorEntry[] = [
  ...SPONSOR_BANDS_2026.band1Flagships.items,
  ...SPONSOR_BANDS_2026.band2AfterCommittee.items,
  ...SPONSOR_BANDS_2026.band3AfterSchedule.items,
  ...SPONSOR_BANDS_2026.band4AfterTempleSpecial.items,
  ...SPONSOR_BANDS_2026.band5AfterDance.items,
  ...SPONSOR_BANDS_2026.band6AfterRatholsavam.items,
  ...SPONSOR_BANDS_2026.band7AfterEntertainment.items,
  ...SPONSOR_BANDS_2026.band8AfterPostEvents.items,
  ...SPONSOR_BANDS_2026.band9ClosingSingle.items,
]

/**
 * Stream 2 — Isolated Sponsor Lightbox Sequence (31 JPG Full Ads):
 * Completely separate from the Festival Lightbox sequence.
 */
export const SPONSOR_LIGHTBOX_SEQUENCE: LightboxImageItem[] = ALL_SPONSORS_ORDERED.map(
  (sponsor) => ({
    id: sponsor.id,
    src: sponsor.adSrc,
    alt: sponsor.name,
    caption: sponsor.name,
    width: sponsor.adWidth,
    height: sponsor.adHeight,
  }),
)