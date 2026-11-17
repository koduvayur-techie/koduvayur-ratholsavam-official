// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // Force App directory mode
  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2025-07-15',

  // 1. Site Configuration for Sitemap, Robots & Canonical Authority (Forced Production Indexable)
  site: {
    url: 'https://koduvayur.in',
    name: 'Koduvayur Ratholsavam',
    indexable: true,
    env: 'production',
  },

  // 2. Wire up Tailwind v4 via Vite
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // 3. Modules (Fonts, Sitemap & Robots)
  modules: [
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  // 4. Google Fonts Configuration (Cormorant Garamond + Inter up to 700)
  fonts: {
    defaults: {
      styles: ['normal'],
      subsets: ['latin'],
    },
    families: [
      {
        name: 'Cormorant Garamond',
        provider: 'google',
        weights: [400, 500, 600, 700],
        styles: ['normal', 'italic'],
        global: true,
        preload: true,
      },
      {
        name: 'Inter',
        provider: 'google',
        weights: [300, 400, 500, 600, 700],
        styles: ['normal'],
        global: true,
        preload: true,
      },
    ],
  },

  // 5. Sitemap Configuration (Single Preview Route for 17.11 Launch)
  sitemap: {
    zeroRuntime: true,
    urls: [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
    ],
  },

  // 6. Robots.txt Configuration (Explicitly Open to All Search Crawlers)
  robots: {
    blockNonSeoBots: false,
    blockAiBots: false,
    allow: ['/'],
    disallow: [],
    sitemap: ['https://koduvayur.in/sitemap.xml'],
  },

  // 7. Static Prerendering Route Rules
  routeRules: {
    '/robots.txt': { prerender: true },
    '/sitemap.xml': { prerender: true },
    '/': { prerender: true },
  },

  // 8. Nitro Asset Compression & Crawler Prerendering
  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true,
      routes: [
        '/robots.txt',
        '/sitemap.xml',
        '/',
      ],
    },
  },

  // 9. Payload Extraction for Instant Navigation
  experimental: {
    payloadExtraction: true,
  },

  // 10. Point to Master CSS File
  css: ['~/assets/css/main.css'],

  // 11. Inline CSS to Eliminate Render-Blocking & Font-Chaining Delays
  features: {
    inlineStyles: true,
  },

  // 12. Runtime Configuration (No Hardcoded Secrets)
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://koduvayur.in',
      arrivalIso: '2026-11-24T21:00:00+05:30',
    },
  },

  // 13. Global Head, Koduvayur Geo Coordinates, 1200x630 JPG OG Standards & Full Favicon Matrix
  app: {
    baseURL: '/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      title: 'Koduvayur Ratholsavam | Something Is Coming Home',

      htmlAttrs: {
        lang: 'en',
      },

      meta: [
        {
          name: 'description',
          content:
            'Something is coming home. An interactive digital chronicle of Koduvayur Ratholsavam — arriving 24.11.26 at 21:00 IST.',
        },
        {
          name: 'robots',
          content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        },
        { name: 'author', content: 'kriz - https://brandsta.in' },
        { name: 'application-name', content: 'Koduvayur Ratholsavam' },
        { name: 'format-detection', content: 'telephone=no' },

        // Geographic Coordinates (Koduvayur, Palakkad, Kerala)
        { name: 'geo.region', content: 'IN-KL' },
        { name: 'geo.placename', content: 'Koduvayur, Palakkad, Kerala, India' },
        { name: 'geo.position', content: '10.6844;76.6470' },
        { name: 'ICBM', content: '10.6844, 76.6470' },

        // Windows PWA & Mobile Meta Tags (Unified #cccccc)
        { name: 'msapplication-TileColor', content: '#cccccc' },
        { name: 'msapplication-TileImage', content: '/images/favicons/ms-icon-144x144.png' },
        { name: 'theme-color', content: '#cccccc' },
        { name: 'msapplication-config', content: '/browserconfig.xml' },

        // PWA & Mobile Device Customizations
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Koduvayur' },

        // Global Social & WhatsApp Unfurling Standards (1200x630 JPG)
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_IN' },
        { property: 'og:site_name', content: 'Koduvayur Ratholsavam' },
        { property: 'og:title', content: 'Koduvayur Ratholsavam | Something Is Coming Home' },
        {
          property: 'og:description',
          content:
            'Something is coming home. An interactive digital chronicle of Koduvayur Ratholsavam — arriving 24.11.26 at 21:00 IST.',
        },
        { property: 'og:image', content: 'https://koduvayur.in/images/og/home.jpg' },
        { property: 'og:image:secure_url', content: 'https://koduvayur.in/images/og/home.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/jpeg' },
        {
          property: 'og:image:alt',
          content: 'Koduvayur Ratholsavam — Something Is Coming Home (24.11.26 · 21:00 IST)',
        },

        // Twitter / X Layout Standards
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Koduvayur Ratholsavam | Something Is Coming Home' },
        {
          name: 'twitter:description',
          content:
            'Something is coming home. An interactive digital chronicle of Koduvayur Ratholsavam — arriving 24.11.26 at 21:00 IST.',
        },
        { name: 'twitter:image', content: 'https://koduvayur.in/images/og/home.jpg' },
      ],

      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },

        // Apple Touch Icons
        { rel: 'apple-touch-icon', sizes: '57x57', href: '/images/favicons/apple-icon-57x57.png' },
        { rel: 'apple-touch-icon', sizes: '60x60', href: '/images/favicons/apple-icon-60x60.png' },
        { rel: 'apple-touch-icon', sizes: '72x72', href: '/images/favicons/apple-icon-72x72.png' },
        { rel: 'apple-touch-icon', sizes: '76x76', href: '/images/favicons/apple-icon-76x76.png' },
        { rel: 'apple-touch-icon', sizes: '114x114', href: '/images/favicons/apple-icon-114x114.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/images/favicons/apple-icon-120x120.png' },
        { rel: 'apple-touch-icon', sizes: '144x144', href: '/images/favicons/apple-icon-144x144.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/images/favicons/apple-icon-152x152.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/favicons/apple-icon-180x180.png' },
        { rel: 'apple-touch-icon', sizes: '167x167', href: '/images/favicons/apple-icon.png' },
        { rel: 'apple-touch-icon', sizes: '190x190', href: '/images/favicons/apple-icon-precomposed.png' },

        // Standard Favicons
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/images/favicons/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/favicons/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/images/favicons/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/images/favicons/android-icon-192x192.png' },

        // Web Manifest
        { rel: 'manifest', crossorigin: 'use-credentials', href: '/manifest.json' },
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