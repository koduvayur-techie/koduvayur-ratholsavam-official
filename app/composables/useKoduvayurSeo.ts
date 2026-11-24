// app/composables/useKoduvayurSeo.ts
import { useHead, useRoute, useRuntimeConfig, useSeoMeta } from 'nuxt/app'

interface KoduvayurSeoOptions {
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'article'
}

export function useKoduvayurSeo(options: KoduvayurSeoOptions = {}) {
  const route = useRoute()
  const config = useRuntimeConfig()

  const siteUrl = (config.public.siteUrl || 'https://koduvayur.in').replace(/\/+$/, '')
  const cleanPath = route.path === '/' ? '' : route.path.replace(/\/+$/, '')
  const canonicalUrl = `${siteUrl}${cleanPath}`

  const title =
    options.title ||
    'Koduvayur Ratholsavam 2026 | Sree Viswanatha Swamy Temple Chariot Festival'
  const description =
    options.description ||
    'Official 2026 festival notice and schedule for Koduvayur Ratholsavam (December 24–25, 2026 · 1202 Dhanu 09, 10) at Sree Visalakshy Sametha Sree Viswanatha Swamy Temple, Koduvayur Keralapuram Agraharam, Palakkad.'
  const ogImage = options.image || `${siteUrl}/images/og/rad26.jpg`
  const ogImageAlt =
    'Koduvayur Ratholsavam 2026 — Koduvayur Sree Viswanatha Swamy Temple Chariot Festival, Koduvayur Agraharam (Dec 24–25)'

  useSeoMeta({
    title,
    description,
    ogType: options.type || 'website',
    ogSiteName: 'Koduvayur Ratholsavam',
    ogLocale: 'en_IN',
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,
    ogImage,
    ogImageSecureUrl: ogImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/jpeg',
    ogImageAlt,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    twitterImageAlt: ogImageAlt,
  })

  const publicEntryOffer = {
    '@type': 'Offer',
    url: canonicalUrl,
    price: 0,
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    validFrom: '2026-11-24T00:00:00+05:30',
  }

  const organizerRef = {
    '@type': 'Organization',
    '@id': `${siteUrl}/#committee`,
    name: 'Koduvayur Ratholsava Committee',
    url: canonicalUrl,
    email: 'koduvayurratholsavam@gmail.com',
    telephone: '+91-8892297617',
  }

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: canonicalUrl,
        name: 'Koduvayur Ratholsavam',
        description,
        inLanguage: 'en-IN',
        creator: {
          '@type': 'Organization',
          name: 'Brandsta Interactive',
          url: 'https://brandsta.in',
        },
      },
      {
        '@type': 'HinduTemple',
        '@id': `${siteUrl}/#temple`,
        name: 'Sree Visalakshy Sametha Sree Viswanatha Swamy Temple',
        alternateName: 'Koduvayur Viswanatha Swamy Temple',
        url: canonicalUrl,
        image: `${siteUrl}/images/festival/sivakataksham.jpg`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Keralapuram Agraharam',
          addressLocality: 'Koduvayur, Palakkad',
          addressRegion: 'Kerala',
          postalCode: '678501',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 10.6844,
          longitude: 76.647,
        },
      },
      organizerRef,
      {
        '@type': 'Festival',
        '@id': `${siteUrl}/#festival-2026`,
        name: 'Koduvayur Ratholsavam 2026',
        description,
        startDate: '2026-12-18T07:15:00+05:30',
        endDate: '2026-12-28T11:00:00+05:30',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        isAccessibleForFree: true,
        offers: publicEntryOffer,
        image: [
          ogImage,
          `${siteUrl}/images/festival/rad-2026-cover.jpg`,
          `${siteUrl}/images/festival/sivakataksham.jpg`,
        ],
        url: canonicalUrl,
        location: {
          '@id': `${siteUrl}/#temple`,
        },
        organizer: {
          '@id': `${siteUrl}/#committee`,
        },
        subEvent: [
          {
            '@type': 'Event',
            name: 'Koduvayur Ratholsavam Day 1 — First Chariot Procession & Panchari Melam',
            description:
              'Poornabhishekam, Ardhra Darshanam, Radharohanam of the three sacred temple chariots, Grama Pradakshinam, and evening Panchari Melam led by Pazhuvil Raghu Marar.',
            startDate: '2026-12-24T01:30:00+05:30',
            endDate: '2026-12-24T23:30:00+05:30',
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            isAccessibleForFree: true,
            offers: publicEntryOffer,
            image: [`${siteUrl}/images/festival/rad-day-1.jpg`],
            location: { '@id': `${siteUrl}/#temple` },
            organizer: { '@id': `${siteUrl}/#committee` },
          },
          {
            '@type': 'Event',
            name: 'Koduvayur Ratholsavam Day 2 — Second Chariot Procession, Fireworks & Pandi Melam',
            description:
              'Gokula Street Chariot Pooja, second day Radham Gramam procession across Koduvayur Agraharam, evening fireworks, and night Pandi Melam led by Kizhakkoot Aniyan Marar.',
            startDate: '2026-12-25T07:30:00+05:30',
            endDate: '2026-12-26T05:00:00+05:30',
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            isAccessibleForFree: true,
            offers: publicEntryOffer,
            image: [`${siteUrl}/images/festival/rad-day-2.jpg`],
            location: { '@id': `${siteUrl}/#temple` },
            organizer: { '@id': `${siteUrl}/#committee` },
          },
        ],
      },
    ],
  }

  useHead({
    meta: [{ key: 'twitter:url', name: 'twitter:url', content: canonicalUrl }],
    link: [{ key: 'canonical', rel: 'canonical', href: canonicalUrl }],
    script: [
      {
        key: 'ld-json-koduvayur-seo',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schemaGraph),
      },
    ],
  })
}