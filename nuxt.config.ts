// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import pkg from './package.json'

const title = 'Alpaca'
const description = 'Alpaca is a chatbot using a locally running LLM for personal use'
const image = 'https://memowise.s3.eu-west-3.amazonaws.com/android-chrome-192x192.png'

fs.rmSync(path.join(__dirname, 'dist-electron'), { recursive: true, force: true })

const viteElectronBuildConfig = {
  build: {
    minify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
    },
  },
  resolve: {
    alias: {
      '~': __dirname,
    },
  },
}

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/fontaine',
    'nuxt-security',
    '@nuxt/ui',
    'nuxt-electron',
  ],
  ssr: false,
  experimental: {
    appManifest: false,
  },
  app: {
    head: {
      title,
      htmlAttrs: { lang: 'en' },
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
  electron: {
    build: [
      { entry: 'electron/main.ts', vite: viteElectronBuildConfig },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: viteElectronBuildConfig,
      },
    ],
  }
})
