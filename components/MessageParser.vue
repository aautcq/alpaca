<script setup lang="ts">
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/dark.css'

defineProps<{ content: string }>()

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  }),
)
</script>

<template>
  <div class="message" v-html="marked.parse(content)" />
</template>

<style lang="scss" scoped>
.message :deep(> *) {
  @apply mb-8 last:mb-0;
}

.message :deep(ul) {
  @apply list-disc list-inside;
}

.message :deep(ol) {
  @apply list-decimal list-inside;
}
</style>
