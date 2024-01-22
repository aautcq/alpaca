<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { Conversation } from '~/types'

const llm = useLlm()

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
  const data = await llm.stream({ input })
  for await (const chunk of data) {
    isAwaitingResponse.value = false
    const message = conversation.messages.find(m => m.id === answerId)
    if (message)
      message.text += chunk
    window.scrollTo(0, document.body.scrollHeight)
  }

  isGeneratingResponse.value = false

  // scroll to bottom and focus input
  await nextTick()
  window.scrollTo(0, document.body.scrollHeight)
  inputTextarea.value?.focus()
}
</script>

<template>
  <div class="container">
    <TransitionGroup name="list" tag="ul" class="pb-20 pt-3">
      <ConversationMessage
        v-for="message in conversation.messages"
        :key="message.id"
        :message="message"
        :is-awaiting-response="isAwaitingResponse"
      />
    </TransitionGroup>
    <NewMessage
      ref="inputTextarea"
      :is-generating-response="isGeneratingResponse"
      @sent="getResponse"
    />
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
</style>
