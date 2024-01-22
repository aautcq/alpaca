<script setup lang="ts">
defineProps<{
  isGeneratingResponse: boolean
}>()

const emit = defineEmits(['sent'])

const state = reactive({
  user_input: '',
})

const inputTextarea = ref()

const textareaRows = computed(() => Math.max(1, Math.min(8, state.user_input.split('\n').length)))

async function send() {
  emit('sent', state.user_input)
  await nextTick()
  state.user_input = ''
}

defineExpose({
  focus() {
    inputTextarea.value?.textarea.focus()
  },
})
</script>

<template>
  <UForm
    :state="state"
    class="fixed bottom-0 inset-x-0 container flex items-end gap-x-2 w-full py-5"
    @submit="send"
  >
    <UTextarea
      ref="inputTextarea"
      v-model="state.user_input"
      name="user_input"
      :disabled="isGeneratingResponse"
      :autofocus="true"
      :rows="textareaRows"
      placeholder="Type a message..."
      class="flex-auto"
      @keydown.enter.exact.prevent="send"
    />
    <UButton
      type="submit"
      icon="mingcute:send-plane-fill"
      title="Send"
      variant="soft"
      :disabled="isGeneratingResponse"
    >
      <span class="hidden md:inline">Send</span>
    </UButton>
  </UForm>
</template>
