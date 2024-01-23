// https://nuxt.com/docs/api/configuration/nuxt-config

const title = 'Matey'
const description = 'Matey is a chatbot using a locally running LLM for personal use'
const image = 'https://memowise.s3.eu-west-3.amazonaws.com/android-chrome-192x192.png'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/fontaine',
    'nuxt-security',
    '@nuxt/ui',
    '@nuxtjs/html-validator',
    '@vite-pwa/nuxt',
  ],
  ssr: false,
  app: {
    head: {
      title,
      base: { href: '/' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'fragment', content: '!' },
        { name: 'description', content: description },
        { name: 'og:description', content: description },
        { name: 'og:title', content: title },
        { name: 'og:type', content: 'website' },
        { name: 'og:site_name', content: title },
        { name: 'og:image', content: image },
        { name: 'og:image:url', content: image },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  security: {
    ssg: {
      hashScripts: false,
      hashStyles: false,
    },
    sri: true,
    headers: {
      contentSecurityPolicy: {
        'img-src': '\'self\'',
        'script-src': ['\'self\'', '\'unsafe-inline\''],
        'base-uri': ['\'self\''],
      },
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,ts,css,html}'],
      sourcemap: true,
    },
    devOptions: {
      enabled: false,
    },
    manifest: {
      name: title,
      short_name: title,
      description,
      theme_color: '#0c0a09',
      background_color: '#0c0a09',
      start_url: '/',
      display: 'standalone',
      display_override: ['window-controls-overlay'],
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  },
  runtimeConfig: {
    ollamaUrl: import.meta.env.OLLAMA_URL,
    ollamaModel: import.meta.env.OLLAMA_MODEL,
    public: {
      ollamaUrl: import.meta.env.OLLAMA_URL,
      ollamaModel: import.meta.env.OLLAMA_MODEL,
    },
  },
})
