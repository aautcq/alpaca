<script setup lang="ts">
const props = defineProps<{ isOpen: boolean }>()

const emit = defineEmits(['confirm', 'update:isOpen', 'updatePrePrompt'])

const localIsOpen = computed({
  get: () => props.isOpen,
  set: val => emit('update:isOpen', val),
})

const prePrompt = useState<string>('prePromt')
const savedFile = useState<{ name: string, content: Blob }>('file')

const state = reactive({
  pre_prompt: useState<string>('prePromt'),
})

function updateSettings() {
  prePrompt.value = state.pre_prompt
  localIsOpen.value = false
  emit('updatePrePrompt')
}

function readFile(event: Event) {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (!file)
    return
  const blob = new Blob([file], { type: file.type })
  savedFile.value.name = file.name
  savedFile.value.content = blob
}
</script>

<template>
  <CustomModal v-model:is-open="localIsOpen">
    <UForm :state="state" class="flex flex-col gap-y-5" @submit="updateSettings">
      <h2 class="text-center text-2xl font-light">
        Settings
      </h2>
      <UFormGroup label="Pre-prompt">
        <UTextarea
          v-model="state.pre_prompt"
          placeholder="You are a noice chatbot..."
          autofocus
          autoresize
        />
      </UFormGroup>
      <UFormGroup label="Context file">
        <UInput
          type="file"
          icon="material-symbols:lab-profile-outline"
          accept="text/*, application/pdf"
          @change="readFile"
        />
      </UFormGroup>
      <div class="flex justify-center gap-x-2">
        <UButton color="gray" title="Close" @click="localIsOpen = false">
          Close
        </UButton>
        <UButton type="submit" title="Save" icon="ic:outline-check">
          Save
        </UButton>
      </div>
    </UForm>
  </CustomModal>
</template>
