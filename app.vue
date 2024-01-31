<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { Conversation } from '~/types'

let stream = await useLlm()

const inputTextarea = ref()
const isAwaitingResponse = ref(false)
const isGeneratingResponse = ref(false)

const conversation = reactive<Conversation>({
  messages: [],
})

async function streamResponse(input: string, messageId: string) {
  const message = conversation.messages.find(m => m.id === messageId)
  if (!message)
    return

  const data = await stream(input, conversation)

  for await (const chunk of data) {
    // stop if user clicked stop button
    if (!isGeneratingResponse.value)
      break

    isAwaitingResponse.value = false
    message.text += chunk
    window.scrollTo(0, document.body.scrollHeight)
  }

  await data.cancel()
  await data.return()
  isGeneratingResponse.value = false
  isAwaitingResponse.value = false

  // scroll to bottom and focus textarea
  await nextTick()
  window.scrollTo(0, document.body.scrollHeight)
  inputTextarea.value?.focus()
}

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
    has_errored: false,
  })
  await nextTick()
  window.scrollTo(0, document.body.scrollHeight)

  // add bot message
  const messageId = uuidv4()
  conversation.messages.push({
    id: messageId,
    text: '',
    is_from_user: false,
    created_at: new Date(),
    has_errored: false,
  })

  await streamResponse(input, messageId)
}

async function regenerateLastResponse() {
  isAwaitingResponse.value = true
  isGeneratingResponse.value = true

  const lastAiMessage = conversation.messages[conversation.messages.length - 1]
  lastAiMessage.text = ''
  lastAiMessage.created_at = new Date()

  await streamResponse(
    conversation.messages[conversation.messages.length - 2].text,
    lastAiMessage.id,
  )
}

async function updatePrePromt() {
  stream = await useLlm()
  await nextTick()
  inputTextarea.value?.focus()
}

async function clearChat() {
  conversation.messages = []
  await nextTick()
  inputTextarea.value?.focus()
}

async function stopGeneration() {
  isGeneratingResponse.value = false
  isAwaitingResponse.value = false
  const lastAiMessage = conversation.messages[conversation.messages.length - 1]
  if (!lastAiMessage?.text.length)
    lastAiMessage.has_errored = true
}
</script>

<template>
  <div>
    <TheHeader
      :show-clear-chat-btn="conversation.messages.length > 0 && !isGeneratingResponse"
      @clear-chat="clearChat"
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
            :is-being-generated="isGeneratingResponse"
            :is-last="index === conversation.messages.length - 1"
            @stop="stopGeneration"
            @redo="regenerateLastResponse"
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
