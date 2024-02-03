<script setup lang="ts">
import type { Message } from '~/types'

const props = defineProps<{
  message: Message
  isAwaitingResponse: boolean
  isBeingGenerated: boolean
  isLast: boolean
}>()

const emit = defineEmits(['stop', 'redo'])

const formatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const formattedTime = computed(() => formatter.format(props.message.created_at))

const displayCopyCodeBtn = computed(() =>
  props.message.text.includes('```')
  && !props.isBeingGenerated
  && !props.isAwaitingResponse,
)

const messageParserRef = ref()
const codeBlocksIds = ref<string[]>([])
const isCopied = reactive<Record<string, boolean>>({})

watch(() => displayCopyCodeBtn.value, (newVal) => {
  if (newVal) {
    const codeBlocks = messageParserRef.value?.$el.querySelectorAll('code')
    if (codeBlocks.length)
      codeBlocksIds.value = Array.from(codeBlocks).map(el => (el as Element).id)
  }
})

function copyCodeContent(id: string) {
  const el = document.getElementById(id)
  if (!el)
    return

  navigator.clipboard.writeText(el.textContent || '')
  isCopied[id] = true
  setTimeout(() => isCopied[id] = false, 1000)
}
</script>

<template>
  <li class="my-3">
    <div
      class="header"
      :class="{ 'text-end': message.is_from_user }"
    >
      <span>{{ message.is_from_user ? 'You' : 'Alpaca' }}</span>
      &middot;
      <span>{{ formattedTime }}</span>
    </div>
    <div
      class="content"
      :class="{
        'border-slate-700 bg-slate-800 ml-auto': message.is_from_user,
        'border-cyan-900 bg-cyan-950': !message.is_from_user,
      }"
    >
      <MessageParser
        v-if="message.text.length"
        ref="messageParserRef"
        :content="message.text"
      />
      <div v-else-if="isLast && isAwaitingResponse">
        <UIcon name="svg-spinners:3-dots-bounce" class="text-lg" />
      </div>
      <div v-else-if="message.has_errored" class="error">
        Oops! Something went wrong...
      </div>
      <Transition name="slide-fade-from-left" mode="out-in">
        <UButton
          v-if="!message.is_from_user && isLast && !isBeingGenerated"
          icon="ant-design:redo-outlined"
          title="Regenerate response"
          color="gray"
          variant="ghost"
          size="2xs"
          square
          class="absolute top-1/2 -right-10 -translate-y-1/2"
          @click="emit('redo')"
        />
      </Transition>
    </div>
    <Transition name="slide-fade-from-top" mode="out-in">
      <div v-if="isBeingGenerated && isLast" class="mt-1 w-full flex justify-center">
        <UButton
          icon="material-symbols:stop-outline-rounded"
          title="Stop"
          color="gray"
          size="2xs"
          @click="emit('stop')"
        >
          Stop
        </UButton>
      </div>
    </Transition>
    <div v-if="displayCopyCodeBtn && codeBlocksIds.length">
      <Teleport
        v-for="id in codeBlocksIds"
        :key="id"
        :to="`#${id}`"
        :disabled="!displayCopyCodeBtn || !id"
      >
        <UButton
          :icon="isCopied[id] ? 'mdi:clipboard-check-outline' : 'mdi:clipboard-outline'"
          :title="isCopied[id] ? 'Copied!' : 'Copy'"
          :color="isCopied[id] ? 'primary' : 'gray'"
          size="2xs"
          square
          class="absolute top-1 right-1 code-copy-btn"
          @click="copyCodeContent(id)"
        />
      </Teleport>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.header {
  @apply text-xs font-thin px-2 text-slate-400 mb-1;
}

.content {
  @apply max-w-[90%] md:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%] 2xl:max-w-[70%];
  @apply w-fit px-5 py-3 rounded-xl border;
  @apply break-words relative;
}

.error {
  @apply px-2 py-1 text-sm text-orange-500 bg-orange-950/50;
  @apply border-orange-900 rounded;
}

:deep(code) {
  @apply py-1 px-2 rounded-lg text-sm bg-slate-950;
  @apply inline-block align-middle;
}

:deep(.hljs) {
  @apply bg-slate-950;
}

:deep(pre:has(> code)) {
  @apply relative;
}

:deep(pre > code) {
  @apply w-full p-4 max-w-full overflow-y-auto;
}

code > button.code-copy-btn {
  @apply opacity-0 transition-opacity;
}

code:hover > button.code-copy-btn {
  @apply opacity-100;
}

.slide-fade-from-top-enter-from,
.slide-fade-from-top-leave-to {
  @apply opacity-0 -translate-y-3;
}
.slide-fade-from-top-enter-active,
.slide-fade-from-top-leave-active {
  @apply transition-all;
}

.slide-fade-from-left-enter-from,
.slide-fade-from-left-leave-to {
  @apply opacity-0 -translate-x-3;
}
.slide-fade-from-left-enter-active,
.slide-fade-from-left-leave-active {
  @apply transition-all;
}
</style>
