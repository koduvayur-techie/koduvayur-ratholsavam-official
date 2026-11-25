// app/data/festival2026.ts

export interface LightboxImageItem {
  id: string
  src: string
  alt: string
  caption: string
  width: number
  height: number
  badgeLabel?: string
}

export interface CommitteeLeader {
  id: string
  role: string
  name: string
  phoneDisplay: string
  phoneHref: string
}

export interface EventCategoryGroup {
  id: string
  eyebrow: string
  title: string
  lead?: string
  slides: LightboxImageItem[]
}

export interface EssentialContactGroup {
  groupTitle: string
  contacts: {
    role: string
    name: string
    phone: string
  }[]
}

export interface SplendorCreditItem {
  id: 'light-and-sound' | 'fireworks' | 'thirumanjanam-procession'
  category: string
  kicker?: string
  name: string
}

/**
 * Live `.webp` assets inside `public/images/festival/`.
 */
const USE_EVENT_PLACEHOLDERS = false
const PLACEHOLDER_IMG = '/images/rad-pc.jpg'

function eventWebp(slug: string): string {
  return USE_EVENT_PLACEHOLDERS ? PLACEHOLDER_IMG : `/images/festival/${slug}.webp`
}

export const FESTIVAL_2026_DATA = {
  header: {
    logoSrc: '/images/rad26logo.webp',
    logoAlt: 'Koduvayur Ratholsavam 2026',
    rupeeIconSrc: '',
  },

  hero: {
    titleLine1: 'Koduvayur',
    titleLine2: 'Ratholsavam',
    datesPrimary: '24–25 December 2026',
    datesMalayalamEra: 'Thursday & Friday · 1202 Dhanu 09, 10',
    shortIntro:
      'Join us in Koduvayur Keralapuram Agraharam for the historic annual chariot festival of Sree Visalakshy Sametha Sree Viswanatha Swamy.',
    coverImage: {
      id: 'festival-01-hero-cover',
      src: eventWebp('rad-2026-cover'),
      alt: 'Koduvayur Ratholsavam temple chariots in Koduvayur Agraharam',
      caption: 'Koduvayur Ratholsavam · 24 & 25 Dec 2026 (1202 Dhanu 09, 10)',
      width: 1200,
      height: 750,
    } satisfies LightboxImageItem,
    noticePdfUrl: '/pdf/RAD2026.pdf',
    noticePdfLabel: 'Download Notice',
    videoSrc: '/videos/rad2026-promo.mp4',
    videoPosterSrc: '/images/rad-mob.jpg',
    videoCtaLabel: 'Watch Festival Film',
  },

  invitation: {
    invocation: 'Sree Visalakshy Sametha Sree Viswanatha Swamy Sahayam',
    salutation: 'Dear Devotees,',
    paragraphs: [
      'Amidst the misty, vow-sanctified mornings of Dhanu, the ancient Vedic village of Koduvayur Keralapuram Agraharam prepares to celebrate the grand Ratholsavam of Sree Visalakshy Sametha Sree Viswanatha Swamy on 24 and 25 December 2026 (1202 Dhanu 09, 10). We cordially invite you and your family to gather in devotion, witness the sacred chariot procession, and attain the blessings of the Lord.',
      'We deeply admire and cherish the moral and financial support extended by devotees over the years in preserving these centuries-old traditions. Devotees who wish to share in supporting this year’s Utsavam and Ratholsavam celebrations are warmly welcome to offer their contribution.',
    ],
    donateTriggerLabel: 'Offer a Festival Contribution',
    priests: [
      {
        title: 'Temple Tantri',
        name: 'Sree Sivasree Ramkumar Sivacharyar',
      },
      {
        title: 'Temple Melshanthi',
        name: 'Sivasree Maheswara Sivacharyar',
      },
    ],
    deityImage: {
      id: 'festival-02-deity',
      src: eventWebp('sivakataksham'),
      alt: 'Sree Visalakshy Sametha Sree Viswanatha Swamy',
      caption: 'Sree Visalakshy Sametha Sree Viswanatha Swamy',
      width: 800,
      height: 800,
    } satisfies LightboxImageItem,
  },

  committee: {
    title: 'Ratholsava Committee',
    lead: 'We thank you for the support you have given the festival over the years and welcome you to this year’s celebrations.',
    topLeaders: [
      {
        id: 'president',
        role: 'President',
        name: 'K.G. Vignesh Viswanathan',
        phoneDisplay: '+91 88922 97617',
        phoneHref: 'tel:+918892297617',
      },
      {
        id: 'secretary',
        role: 'Secretary',
        name: 'K.N. Jayaram',
        phoneDisplay: '+91 89217 02502',
        phoneHref: 'tel:+918921702502',
      },
      {
        id: 'treasurer',
        role: 'Treasurer',
        name: 'K.M. Vignesh',
        phoneDisplay: '+91 82811 77167',
        phoneHref: 'tel:+918281177167',
      },
    ] satisfies CommitteeLeader[],
    noticePanels: [
      {
        id: 'festival-03-committee-en',
        src: eventWebp('rad26-team-en'),
        alt: 'Ratholsava Committee 2026 — English Official Roster',
        caption: 'Ratholsava Committee 2026 · English Roster',
        width: 800,
        height: 800,
        badgeLabel: 'English',
      },
      {
        id: 'festival-04-committee-ml',
        src: eventWebp('rad26-team-mal'),
        alt: 'Ratholsava Committee 2026 — Malayalam Official Roster',
        caption: 'Ratholsava Committee 2026 · Malayalam Roster',
        width: 800,
        height: 800,
        badgeLabel: 'Malayalam',
      },
    ] satisfies LightboxImageItem[],
  },

  dailyRitualsNote: {
    datesBadge: '18 – 23 December 2026 · Daily Schedule',
    text: 'Vedaparayanam will be held in the Sree Viswanatha Swamy Temple premises every morning and evening, and Rudrabhishekam followed by Deeparadhana will begin daily at 9:00 AM.',
  },

  eventCategories: [
    // Category 1: Festival Schedule (9 Cards · Slides 5–13 of 32)
    {
      id: 'festival-schedule',
      eyebrow: '04 – 23 December 2026',
      title: 'Festival Schedule',
      lead: 'From Muhurthakaal, Vasthuhomam, and Dhwajarohanam through the six Utsavam days and evening Vahanam processions.',
      slides: [
        {
          id: 'festival-05-muhurthakaal',
          src: eventWebp('muhurthakaal'),
          alt: '04 Dec Morning 8:00 AM — Muhurthakaal Ceremony',
          caption: '04 Dec · 8:00 AM — Muhurthakaal Ceremony',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-06-vasthuhomam',
          src: eventWebp('gramasanthi'),
          alt: '17 Dec Night 11:00 PM — Vasthuhomam followed by Gramasanthi',
          caption: '17 Dec · 11:00 PM — Vasthuhomam & Gramasanthi',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-07-dhwajarohanam',
          src: eventWebp('dhwajarohanam'),
          alt: '18 Dec Utsavam Day 1 Morning 7:15 AM to 8:30 AM — Dhwajarohanam',
          caption: '18 Dec · Utsavam Day 1 — Dhwajarohanam (7:15 AM – 8:30 AM)',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-08-utsavam-day1',
          src: eventWebp('day-1'),
          alt: '18 Dec Utsavam Day 1 Night 9:30 PM — Kamadhenu Vahanam Procession',
          caption: '18 Dec · Utsavam Day 1 — Kamadhenu Vahanam Procession (9:30 PM)',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-09-utsavam-day2',
          src: eventWebp('day-2'),
          alt: '19 Dec Utsavam Day 2 — Bootha Vahanam Procession',
          caption: '19 Dec · Utsavam Day 2 — Bootha Vahanam Procession (9:30 PM)',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-10-utsavam-day3',
          src: eventWebp('day-3'),
          alt: '20 Dec Utsavam Day 3 — Kuthira Vahanam Procession',
          caption: '20 Dec · Utsavam Day 3 — Kuthira Vahanam Procession (9:30 PM)',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-11-utsavam-day4',
          src: eventWebp('day-4'),
          alt: '21 Dec Utsavam Day 4 — Kailasam Vahanam Procession',
          caption: '21 Dec · Utsavam Day 4 — Kailasam Vahanam Procession (9:30 PM)',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-12-utsavam-day5',
          src: eventWebp('day-5'),
          alt: '22 Dec Utsavam Day 5 — Rishaba Vahanam Procession',
          caption: '22 Dec · Utsavam Day 5 — Rishaba Vahanam Procession (10:30 PM)',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-13-utsavam-day6',
          src: eventWebp('day-6'),
          alt: '23 Dec Utsavam Day 6 — Aana Vahanam Procession',
          caption: '23 Dec · Utsavam Day 6 — Aana Vahanam Procession (9:00 PM)',
          width: 800,
          height: 800,
        },
      ],
    },

    // Category 2: Temple Special Events (6 Cards · Slides 14–19 of 32)
    {
      id: 'temple-special-events',
      eyebrow: '19 – 23 December 2026',
      title: 'Temple Special Events',
      lead: 'Sacred Vedic homams, Mahapradosham, Shiva Parvathi Thiru Kalyanam, Special Nadaswara Kacheri, and twilight Ganga Arathi.',
      slides: [
        {
          id: 'festival-14-rudra-ekadashi',
          src: eventWebp('rudraekadashi'),
          alt: '19 Dec Morning 8:00 AM — Rudra Ekadashi',
          caption: '19 Dec · 8:00 AM — Rudra Ekadashi',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-15-subramanya-homam',
          src: eventWebp('subramanyahomam'),
          alt: '20 Dec Morning 8:00 AM — Sri Subramanya Homam',
          caption: '20 Dec · 8:00 AM — Sri Subramanya Homam',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-16-mahapradosham',
          src: eventWebp('mahapradosham'),
          alt: '21 Dec Afternoon 3:00 PM — Mahapradosham',
          caption: '21 Dec · 3:00 PM — Mahapradosham',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-17-thiru-kalyanam',
          src: eventWebp('kalyanotsavam'),
          alt: '22 Dec Morning 8:00 AM — Shiva Parvathi Thiru Kalyanam',
          caption: '22 Dec · 8:00 AM — Shiva Parvathi Thiru Kalyanam · Erode Rajamani Bhagavathar & Party',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-18-nadaswara-kacheri',
          src: eventWebp('nadaswaram'),
          alt: '22 Dec Night 10:30 PM — Special Nadaswara Kacheri',
          caption: '22 Dec · 10:30 PM — Special Nadaswara Kacheri · Pazhani Manikandan, Pazhani Sivakumar & Party',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-19-ganga-arathi',
          src: eventWebp('ganga-aarathi'),
          alt: '23 Dec Night 7:30 PM — Ganga Arathi at Viswanatha Swamy Temple Pond',
          caption: '23 Dec · 7:30 PM — Ganga Arathi at Viswanatha Swamy Temple Pond',
          width: 800,
          height: 800,
        },
      ],
    },

    // Category 3: Cultural Dance Events (4 Cards · Slides 20–23 of 32)
    {
      id: 'cultural-dance-events',
      eyebrow: '18 – 21 December · 5:45 PM – 8:30 PM',
      title: 'Cultural Dance Events',
      lead: 'Four evenings of devotional dance performances presented on the festival stage.',
      slides: [
        {
          id: 'festival-20-dance-day1',
          src: eventWebp('dance-1'),
          alt: '18 Dec Dance Performance — Kalaivani Group, Sivasakthi Group & Natyakalakshetra Group',
          caption: '18 Dec · 5:45 PM — Dance Performance · Kalaivani Group, Sivasakthi Group & Natyakalakshetra Group',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-21-dance-day2',
          src: eventWebp('dance-2'),
          alt: '19 Dec Dance Performance — Devi Group, Souparnika Nrithakalalayam & Sivasakthi Nrithakalalayam',
          caption: '19 Dec · 5:45 PM — Dance Performance · Devi Group, Souparnika Nrithakalalayam & Sivasakthi Nrithakalalayam',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-22-dance-day3',
          src: eventWebp('dance-3'),
          alt: '20 Dec Dance Performance — Mazhamariyamman Group, Krishnapriya Nandan & Chilanka Dance Academy',
          caption: '20 Dec · 5:45 PM — Dance Performance · Mazhamariyamman Group, Krishnapriya Nandan & Chilanka Dance Academy',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-23-dance-day4',
          src: eventWebp('dance-4'),
          alt: '21 Dec Thiruvathirakali Dance Performance — Natyajyothi Nrithakalalayam, Kausthubham Group & Layam Group',
          caption: '21 Dec · 5:45 PM — Dance Performance (Thiruvathirakali) · Natyajyothi Nrithakalalayam, Kausthubham Group & Layam Group',
          width: 800,
          height: 800,
        },
      ],
    },

    // Category 4: Ratholsavam Day 1 & Day 2 (2 Cards · 4:5 Portrait 800x1000 · Slides 24–25 of 32)
    {
      id: 'ratholsavam-chariot-days',
      eyebrow: '24 & 25 December · 1202 Dhanu 09, 10',
      title: 'Ratholsavam: Day One & Day Two',
      lead: 'The grand two-day sacred chariot procession of Sree Ganesha, Sree Subramania Swamy, and Sree Visalakshy Sametha Sree Viswanatha Swamy across Koduvayur Agraharam.',
      slides: [
        {
          id: 'festival-24-ratholsavam-day1',
          src: eventWebp('rad-day-1'),
          alt: '24 Dec Ratholsavam Day 1 — First Chariot Day',
          caption: '24 Dec · Ratholsavam Day 1 — Poornabhishekam, Ardhra Darshanam, Radharohanam & Grama Pradakshinam',
          width: 800,
          height: 1000,
        },
        {
          id: 'festival-25-ratholsavam-day2',
          src: eventWebp('rad-day-2'),
          alt: '25 Dec Ratholsavam Day 2 — Second Chariot Day',
          caption: '25 Dec · Ratholsavam Day 2 — Gokula Street Chariot Pooja, Procession & Fireworks',
          width: 800,
          height: 1000,
        },
      ],
    },

    // Category 5: Mega Entertainment Events (3 Cards · Slides 26–28 of 32)
    {
      id: 'mega-entertainment-events',
      eyebrow: '22, 24 & 25 December Nights',
      title: 'Mega Entertainment Events',
      lead: 'Festive street bandset and grand Panchari and Pandi Melam percussion ensembles.',
      slides: [
        {
          id: 'festival-26-gokula-bandset',
          src: eventWebp('bandset'),
          alt: '22 Dec Night 7:00 PM — Gokula Street Bandset by Ragadeepam Mundathikode',
          caption: '22 Dec · 7:00 PM — Gokula Street Bandset · Ragadeepam Mundathikode (Team Altharakoottam)',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-27-panchari-melam',
          src: eventWebp('panjarimelam'),
          alt: '24 Dec Night 7:00 PM — Panchari Melam led by Pazhuvil Raghu Marar',
          caption: '24 Dec · 7:00 PM — Panchari Melam · Pazhuvil Raghu Marar & Ensemble',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-28-pandi-melam',
          src: eventWebp('pandimelam'),
          alt: '25 Dec Night 11:00 PM — Pandi Melam led by Kizhakkoot Aniyan Marar',
          caption: '25 Dec · 11:00 PM — Pandi Melam · Kizhakkoot Aniyan Marar & 101+ Artists',
          width: 800,
          height: 800,
        },
      ],
    },

    // Category 6: Post-Festival Events (4 Cards · Slides 29–32 of 32)
    {
      id: 'post-festival-events',
      eyebrow: '26 – 28 December 2026',
      title: 'Post-Festival Events',
      lead: 'Sacred concluding rites from early-morning Pallakku Kacheri and Kulatheru through Dhwajavarohanam and Mahabhishekam.',
      slides: [
        {
          id: 'festival-29-pallakku-kulatheru',
          src: eventWebp('kulatheru'),
          alt: '26 Dec Early Morning — Pallakku Kacheri, Kulatheru & Mounavritham',
          caption: '26 Dec · 2:30 AM Pallakku Kacheri · 4:00 AM Kulatheru & Mounavritham',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-30-manjal-neerattu',
          src: eventWebp('manjalneerattu'),
          alt: '27 Dec Morning 9:00 AM — Manjal Neerattu',
          caption: '27 Dec · 9:00 AM — Manjal Neerattu',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-31-dhwajavarohanam',
          src: eventWebp('dhwajavarohanam'),
          alt: '27 Dec Night 7:00 PM — Dhwajavarohanam',
          caption: '27 Dec · 7:00 PM — Dhwajavarohanam',
          width: 800,
          height: 800,
        },
        {
          id: 'festival-32-mahabhishekam',
          src: eventWebp('mahabhishekam'),
          alt: '28 Dec Morning 9:30 AM — Mahabhishekam',
          caption: '28 Dec · 9:30 AM — Mahabhishekam',
          width: 800,
          height: 800,
        },
      ],
    },
  ] satisfies EventCategoryGroup[],

  splendor: {
    eyebrow: 'Procession · Illumination · Pyrotechnics',
    title: 'Adding Splendor to the Festivities',
    items: [
      {
        id: 'light-and-sound',
        category: 'Light & Sound',
        name: 'Devanza Events & Raja Sound',
      },
      {
        id: 'fireworks',
        category: 'Fireworks',
        name: 'Satheesh Nemmara',
      },
      {
        id: 'thirumanjanam-procession',
        category: 'Thirumanjanam Procession',
        kicker: 'Presenting',
        name: 'Yuvarajakesari Kelasheri Kannan',
      },
    ] satisfies SplendorCreditItem[],
  },

  closingSection: {
    enquiryText:
      'For advertisements, festival ground shops, and prior display permissions, please connect with the organizing and media desk.',
    contactTriggerLabel: 'Contacts & Permissions',
    farewellQuote:
      'Everyone goes back to their lives from the next day, and the longing wait for the next Theru begins.',
  },

  donation: {
    heading: 'Festival Contributions',
    subheading: 'Remittances towards Koduvayur Ratholsavam 2026',
    bankName: 'Federal Bank · Koduvayur Branch',
    accountHolder: 'Koduvayur Ratholsava Committee',
    ddPayableTo: 'Koduvayur Keralapuram Rathothsava Committee',
    accountNumber: '18850100025285',
    ifscCode: 'FDRL0001885',
    upiId: 'rathothsava2022@fbl',
    qrImageSrc: '/images/rad26-qr.jpg',
    qrImageAlt: 'Koduvayur Ratholsavam 2026 Federal Bank UPI QR Code (rathothsava2022@fbl)',
    intimationPhones: ['8281177167', '8129779158'],
    intimationEmail: 'koduvayurratholsavam@gmail.com',
  },

  essentialInfo: {
    heading: 'Essential Contacts & Info',
    subheading: 'Koduvayur Ratholsava Committee 2026',
    groups: [
      {
        groupTitle: 'Core Office Bearers',
        contacts: [
          { role: 'President', name: 'K.G. Vignesh Viswanathan', phone: '8892297617' },
          { role: 'Vice President', name: 'R. Ranganathan', phone: '8075614695' },
          { role: 'Vice President', name: 'K.K. Balasubramanian', phone: '9400478442' },
          { role: 'Secretary', name: 'K.N. Jayaram', phone: '8921702502' },
          { role: 'Joint Secretary', name: 'K.S. Sreeram', phone: '9207034727' },
          { role: 'Joint Secretary', name: 'K.V. Viswanath', phone: '8129779158' },
          { role: 'Treasurer', name: 'K.M. Vignesh', phone: '8281177167' },
          { role: 'Joint Treasurer', name: 'K.S. Guruvayurappan', phone: '9497191282' },
          { role: 'Executive Officer', name: 'Eswaran', phone: '9446658711' },
        ],
      },
      {
        groupTitle: 'Media & Advertising',
        contacts: [
          { role: 'Media & Advertising', name: 'K.R. Krishnan', phone: '9400653709' },
          { role: 'Media & Advertising', name: 'T.V. Sreeram', phone: '8891571599' },
        ],
      },
      {
        groupTitle: 'Festival Ground & Stall Permissions',
        contacts: [
          { role: 'Stalls & Flex Approval', name: 'Committee Permit Desk', phone: '9447528860' },
          { role: 'Treasurer & Enquiries', name: 'K.M. Vignesh', phone: '8281177167' },
        ],
      },
    ] satisfies EssentialContactGroup[],
  },
} as const

/**
 * Stream 1 — Festival Gallery Sequence (32 WebP Slides):
 * Cover -> Deity -> English Committee -> Malayalam Committee -> 6 Event Categories in Chronological Order.
 */
export const MASTER_LIGHTBOX_SEQUENCE: LightboxImageItem[] = [
  FESTIVAL_2026_DATA.hero.coverImage,
  FESTIVAL_2026_DATA.invitation.deityImage,
  ...FESTIVAL_2026_DATA.committee.noticePanels,
  ...FESTIVAL_2026_DATA.eventCategories.flatMap((category) => category.slides),
]