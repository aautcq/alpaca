// https://nuxt.com/docs/api/configuration/nuxt-config

const title = 'Matey'
const description = 'Matey is a chatbot using a locally running LLM for personal use'
const image = ''

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/fontaine',
    'nuxt-security',
    '@nuxt/ui',
  ],
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
  runtimeConfig: {
    ollamaUrl: import.meta.env.OLLAMA_URL,
    ollamaModel: import.meta.env.OLLAMA_MODEL,
    public: {
      ollamaUrl: import.meta.env.OLLAMA_URL,
      ollamaModel: import.meta.env.OLLAMA_MODEL,
    },
  },
})
