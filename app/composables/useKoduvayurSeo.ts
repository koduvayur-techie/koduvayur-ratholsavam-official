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
  const cleanPath = route.path === '/' ? '/' : route.path.replace(/\/+$/, '')
  const canonicalUrl = `${siteUrl}${cleanPath}`

  const title = options.title || 'Koduvayur Ratholsavam | Something Is Coming Home'
  const description =
    options.description ||
    'Something is coming home. An interactive digital chronicle of Koduvayur Ratholsavam — arriving 24.11.26 at 21:00 IST.'
  const ogImage = options.image || `${siteUrl}/images/og/home.jpg`

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
    ogImageAlt: 'Koduvayur Ratholsavam — Something Is Coming Home (24.11.26 · 21:00 IST)',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
  })

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
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
        '@type': 'Place',
        '@id': `${siteUrl}/#place`,
        name: 'Koduvayur, Palakkad, Kerala',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Koduvayur',
          addressRegion: 'Kerala',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 10.6844,
          longitude: 76.647,
        },
      },
      {
        '@type': 'Festival',
        '@id': `${siteUrl}/#festival`,
        name: 'Koduvayur Ratholsavam',
        description,
        startDate: '2026-11-24T21:00:00+05:30',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        image: [ogImage],
        url: canonicalUrl,
        location: {
          '@id': `${siteUrl}/#place`,
        },
      },
    ],
  }

  useHead({
    meta: [
      { name: 'twitter:url', content: canonicalUrl },
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schemaGraph),
      },
    ],
  })
}