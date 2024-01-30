<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/dark.css'

const props = defineProps<{ content: string }>()

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  }),
)

const contentRef = ref()

function addIdsToCodeElements(node: Node) {
  if (node.nodeType === Node.ELEMENT_NODE && node.nodeName.toLowerCase() === 'code') {
    const el = node as HTMLElement
    if (el.classList.length > 0 && el.classList.contains('hljs'))
      el.id = `code-${uuidv4()}`
  }

  if (node.childNodes.length > 0)
    node.childNodes.forEach(addIdsToCodeElements)
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0)
      mutation.addedNodes.forEach(addIdsToCodeElements)
  })
})

onMounted(() => observer.observe(contentRef.value, { childList: true, subtree: true }))
onUnmounted(() => observer.disconnect())

const parsedContent = computed(() => marked.parse(props.content))
</script>

<template>
  <div ref="contentRef" class="message" v-html="parsedContent" />
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
