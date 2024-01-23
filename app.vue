<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { Conversation } from '~/types'

let stream = useLlm()

const inputTextarea = ref()
const isAwaitingResponse = ref(false)
const isGeneratingResponse = ref(false)

const conversation = reactive<Conversation>({
  messages: [],
})

async function getResponse(input: string) {
  if (!input.trim().length)
    return

  isAwaitingResponse.value = true
  isGeneratingResponse.value = true

  // add user message
  conversation.messages.push({
    id: uuidv4(),
    text: input,
    is_from_user: true,
    created_at: new Date(),
  })
  await nextTick()
  window.scrollTo(0, document.body.scrollHeight)

  // add bot message
  const answerId = uuidv4()
  conversation.messages.push({
    id: answerId,
    text: '',
    is_from_user: false,
    created_at: new Date(),
  })
  const data = await stream(input, conversation)
  for await (const chunk of data) {
    // stop if user clicked stop button
    if (!isGeneratingResponse.value)
      break

    isAwaitingResponse.value = false
    const message = conversation.messages.find(m => m.id === answerId)
    if (message)
      message.text += chunk
    window.scrollTo(0, document.body.scrollHeight)
  }

  isGeneratingResponse.value = false

  // scroll to bottom and focus textarea
  await nextTick()
  window.scrollTo(0, document.body.scrollHeight)
  inputTextarea.value?.focus()
}

function updatePrePromt() {
  stream = useLlm()
}
</script>

<template>
  <div>
    <TheHeader
      :show-clear-chat-btn="conversation.messages.length > 0 && !isGeneratingResponse"
      @clear-chat="conversation.messages = []"
      @update-pre-prompt="updatePrePromt"
    />
    <main class="container">
      <Transition name="fade" mode="out-in">
        <TransitionGroup
          v-if="conversation.messages.length"
          name="list"
          tag="ul"
          class="pb-20 pt-10"
        >
          <ConversationMessage
            v-for="(message, index) in conversation.messages"
            :key="message.id"
            :message="message"
            :is-awaiting-response="isAwaitingResponse"
            :show-stop-btn="isGeneratingResponse && index === conversation.messages.length - 1"
            @stop="isGeneratingResponse = false"
          />
        </TransitionGroup>
        <ConversationPlaceholder v-else />
      </Transition>
      <NewMessage
        ref="inputTextarea"
        :is-generating-response="isGeneratingResponse"
        @sent="getResponse"
      />
    </main>
    <TheFooter />
  </div>
</template>

<style lang="scss" scoped>
.list-enter-active,
.list-leave-active {
  @apply transition-all;
}
.list-enter-from,
.list-leave-to {
  @apply opacity-0 translate-x-3;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-100;
}
</style>
