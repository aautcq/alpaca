<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import type { Conversation, LLMModel } from '~/types'

const isLoadingStream = useState<boolean>('isLoadingStream', () => true)

await useOllamaModels()

const port = useState<number>('port')
const availableModels = useState<LLMModel[]>('models')
const isOllamaUp = useState<boolean>('isOllamaUp')
const isLLmReady = computed(
  () => isOllamaUp.value && availableModels.value.length > 0,
)

let stream: ((input: string, conversation: Conversation) => Promise<IterableReadableStream<string>>) | null = null

if (isLLmReady.value)
  stream = await useLlm()

isLoadingStream.value = false

const inputTextarea = ref()
const isAwaitingResponse = ref(false)
const isGeneratingResponse = ref(false)
const isSettingsMenuOpen = useState<boolean>('isSettingsMenuOpen', () => false)
const isClearModalOpen = useState<boolean>('isClearModalOpen', () => false)

const conversation = reactive<Conversation>({
  messages: [],
})

async function streamResponse(input: string, messageId: string) {
  if (!stream || !isLLmReady.value)
    return
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

async function updateSettings() {
  isLoadingStream.value = true
  await useOllamaModels()
  stream = isLLmReady.value ? await useLlm() : null
  isLoadingStream.value = false
}

async function clearChat() {
  conversation.messages = []
}

watch(() => isSettingsMenuOpen.value, (newVal) => {
  if (!newVal)
    setTimeout(() => inputTextarea.value?.focus(), 600) // wait for the transition to finish
})

watch(() => isClearModalOpen.value, (newVal) => {
  if (!newVal)
    setTimeout(() => inputTextarea.value?.focus(), 600) // wait for the transition to finish
})

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
    />
    <main class="container">
      <Transition name="fade" mode="out-in">
        <ConversationPlaceholder
          v-if="isLoadingStream"
          icon="svg-spinners:blocks-wave"
          content="Loading..."
        />
        <ConversationPlaceholder v-else-if="!isOllamaUp" icon="solar:sad-square-outline">
          Ollama is not running or the server port ({{ port }}) is incorrect.
          <template #description>
            <div>
              To install Ollama and a model, go to
              <ULink
                to="https://ollama.ai"
                target="_blank"
                active-class="text-primary"
                inactive-class="link"
                title="Ollama home page"
              >
                ollama.ai
              </ULink>
            </div>
          </template>
        </ConversationPlaceholder>
        <ConversationPlaceholder v-else-if="!availableModels.length" icon="solar:sad-square-outline">
          No models available. Please check your settings.
          <template #description>
            <div>
              To install a model, go to
              <ULink
                to="https://ollama.ai/library"
                target="_blank"
                active-class="text-primary"
                inactive-class="link"
                title="Ollama models library"
              >
                ollama.ai/library
              </ULink>
            </div>
          </template>
        </ConversationPlaceholder>
        <TransitionGroup
          v-else-if="conversation.messages.length"
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
        <ConversationPlaceholder
          v-else
          icon="material-symbols:contact-support"
          content="How can I help you?"
        />
      </Transition>
      <NewMessage
        v-if="isLLmReady"
        ref="inputTextarea"
        :is-generating-response="isGeneratingResponse"
        @sent="getResponse"
      />
    </main>
    <TheFooter />
    <UNotifications />
    <SettingsMenu
      v-model:is-open="isSettingsMenuOpen"
      @update-settings="updateSettings"
    />
    <ClearChatModal
      v-model:is-open="isClearModalOpen"
      @confirm="clearChat"
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

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-100;
}
</style>
