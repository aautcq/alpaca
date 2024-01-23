<script setup lang="ts">
import type { Message } from '~/types'

const props = defineProps<{
  message: Message
  isAwaitingResponse: boolean
  showStopBtn: boolean
}>()

const emit = defineEmits(['stop'])

const formatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const formattedTime = computed(() => formatter.format(props.message.created_at))
</script>

<template>
  <li class="my-3">
    <div
      class="header"
      :class="{ 'text-end': message.is_from_user }"
    >
      <span>{{ message.is_from_user ? 'You' : 'Matey' }}</span>
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
        :content="message.text"
      />
      <div v-else-if="isAwaitingResponse">
        <UIcon name="svg-spinners:3-dots-bounce" class="text-lg" />
      </div>
    </div>
    <Transition name="slide-fade" mode="out-in">
      <div v-if="showStopBtn" class="mt-1 w-full flex justify-center">
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
  </li>
</template>

<style lang="scss" scoped>
.header {
  @apply text-xs font-thin px-2 text-slate-400 mb-1;
}

.content {
  @apply max-w-[90%] md:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%] 2xl:max-w-[70%];
  @apply w-fit px-5 py-3 rounded-xl border;
  @apply break-words overflow-hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  @apply opacity-0 -translate-y-3;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  @apply transition-all;
}
</style>
