// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2025-07-15',

  site: {
    url: 'https://koduvayur.in',
    name: 'Koduvayur Ratholsavam',
    indexable: true,
    env: 'production',
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: [
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@vercel/speed-insights/nuxt',
    '@vercel/analytics/nuxt',
  ],

  // Strict 3-File Font Payload: Cormorant Garamond (500, 600) + Inter (400), normal style only
  fonts: {
    defaults: {
      styles: ['normal'],
      subsets: ['latin'],
    },
    families: [
      {
        name: 'Cormorant Garamond',
        provider: 'google',
        weights: [500, 600],
        styles: ['normal'],
        global: true,
        preload: true,
      },
      {
        name: 'Inter',
        provider: 'google',
        weights: [400],
        styles: ['normal'],
        global: true,
        preload: true,
      },
    ],
  },

  sitemap: {
    zeroRuntime: true,
    urls: [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
    ],
  },

  robots: {
    blockNonSeoBots: false,
    blockAiBots: false,
    allow: ['/', '/llms.txt'],
    disallow: [],
    sitemap: ['https://koduvayur.in/sitemap.xml'],
  },

  routeRules: {
    '/robots.txt': { prerender: true },
    '/sitemap.xml': { prerender: true },
    '/llms.txt': { prerender: true },
    '/': { prerender: true },
  },

  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true,
      routes: [
        '/robots.txt',
        '/sitemap.xml',
        '/llms.txt',
        '/',
      ],
    },
  },

  experimental: {
    payloadExtraction: true,
  },

  css: ['~/assets/css/main.css'],

  features: {
    inlineStyles: true,
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://koduvayur.in',
    },
  },

  app: {
    baseURL: '/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      title: 'Koduvayur Ratholsavam 2026 | Koduvayur Sree Viswanatha Swamy Temple Chariot Festival',

      htmlAttrs: {
        lang: 'en',
      },

      meta: [
        {
          name: 'description',
          content:
            'Official 2026 festival notice and schedule for Koduvayur Ratholsavam (December 24–25, 2026 · 1202 Dhanu 09, 10) at Sree Visalakshy Sametha Sree Viswanatha Swamy Temple, Koduvayur Keralapuram Agraharam, Palakkad.',
        },
        {
          name: 'robots',
          content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        },
        { name: 'author', content: 'kriz - https://brandsta.in' },
        { name: 'application-name', content: 'Koduvayur Ratholsavam' },
        { name: 'format-detection', content: 'telephone=no' },

        { name: 'geo.region', content: 'IN-KL' },
        { name: 'geo.placename', content: 'Koduvayur, Palakkad, Kerala, India' },
        { name: 'geo.position', content: '10.6844;76.6470' },
        { name: 'ICBM', content: '10.6844, 76.6470' },

        { name: 'msapplication-TileColor', content: '#1a1a1a' },
        { name: 'msapplication-TileImage', content: '/images/favicons/ms-icon-144x144.png' },
        { name: 'theme-color', content: '#f6f1e7' },
        { name: 'msapplication-config', content: '/browserconfig.xml' },

        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Koduvayur' },

        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://koduvayur.in' },
        { property: 'og:locale', content: 'en_IN' },
        { property: 'og:site_name', content: 'Koduvayur Ratholsavam' },
        {
          property: 'og:title',
          content: 'Koduvayur Ratholsavam 2026 | Koduvayur Sree Viswanatha Swamy Temple Chariot Festival',
        },
        {
          property: 'og:description',
          content:
            'Join us in Koduvayur Keralapuram Agraharam on December 24–25, 2026 (1202 Dhanu 09, 10) for the annual chariot festival of Sree Visalakshy Sametha Sree Viswanatha Swamy.',
        },
        { property: 'og:image', content: 'https://koduvayur.in/images/og/rad26.jpg' },
        { property: 'og:image:secure_url', content: 'https://koduvayur.in/images/og/rad26.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/jpeg' },
        {
          property: 'og:image:alt',
          content: 'Koduvayur Ratholsavam 2026 — Koduvayur Sree Viswanatha Swamy Temple Chariot Festival (Dec 24–25)',
        },

        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'Koduvayur Ratholsavam 2026 | Koduvayur Sree Viswanatha Swamy Temple Chariot Festival',
        },
        {
          name: 'twitter:description',
          content:
            'Official 2026 festival notice, schedules, and committee details for Koduvayur Ratholsavam (Dec 24–25, 2026) at Koduvayur Keralapuram Agraharam.',
        },
        { name: 'twitter:image', content: 'https://koduvayur.in/images/og/rad26.jpg' },
        {
          name: 'twitter:image:alt',
          content: 'Koduvayur Ratholsavam 2026 — Koduvayur Sree Viswanatha Swamy Temple Chariot Festival (Dec 24–25)',
        },
      ],

      link: [
        { key: 'canonical', rel: 'canonical', href: 'https://koduvayur.in' },
        {
          rel: 'preload',
          as: 'image',
          type: 'image/webp',
          href: '/images/festival/rad-2026-cover.webp',
          fetchpriority: 'high',
        },
        { rel: 'icon', type: 'image/x-icon', sizes: '32x32', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/images/favicons/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/favicons/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/images/favicons/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/images/favicons/android-icon-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/favicons/apple-icon-180x180.png' },
        { rel: 'apple-touch-icon', sizes: '167x167', href: '/images/favicons/apple-icon-167x167.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/images/favicons/apple-icon-152x152.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/images/favicons/apple-icon-120x120.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'alternate', type: 'text/plain', href: '/llms.txt', title: 'LLMs Festival Reference' },
      ],
    },
  },

  ssr: true,
  devtools: { enabled: false },
  devServer: {
    host: '0.0.0.0',
    port: 3006,
  },
})