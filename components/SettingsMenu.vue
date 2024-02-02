<script setup lang="ts">
import { v4 as uuidV4 } from 'uuid'
import type { ContextFile, LLMModel } from '~/types'

const props = defineProps<{ isOpen: boolean }>()

const emit = defineEmits(['confirm', 'update:isOpen', 'updateSettings'])

const availableModels = useState<LLMModel[]>('models')
const model = useState<LLMModel>('model')

const inputFile = ref()

const toast = useToast()

// maximum context file size is 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

const localIsOpen = computed({
  get: () => props.isOpen,
  set: val => emit('update:isOpen', val),
})

const prePrompt = useState<string>('prePromt')
const savedFiles = useState<ContextFile[]>('files')

const state = reactive({
  pre_prompt: useState<string>('prePromt'),
})

function updateSettings() {
  prePrompt.value = state.pre_prompt
  localIsOpen.value = false
  emit('updateSettings')
}

function readFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    toast.add({
      id: 'context_file_too_big',
      title: 'File too big!',
      description: 'Context file size must be less than 5MB.',
      icon: 'mdi:file-alert-outline',
      timeout: 5000,
    })
    return
  }
  const newFile = {
    id: uuidV4(),
    name: file.name,
    size: file.size,
    last_modified: new Date(file.lastModified),
    content: new Blob([file], { type: file.type }),
  }
  savedFiles.value.push(newFile)
}

function readFiles(event: Event) {
  const files = (event.target as HTMLInputElement)?.files
  if (!files || !files.length) {
    toast.add({
      id: 'error_reading_files',
      title: 'Oops!',
      description: 'An error occurred while reading the files.',
      icon: 'mdi:file-alert-outline',
      timeout: 5000,
    })
    return
  }
  Array.from(files).forEach(file => readFile(file))
}

function deleteFile(id: string) {
  savedFiles.value = savedFiles.value.filter(file => file.id !== id)
}

// dirty fix for transition-group not working with flex/grid
function beforeLeave(el: Element) {
  const { marginLeft, marginTop, width, height } = window.getComputedStyle(el)
  const htmlEl = el as HTMLElement
  htmlEl.style.left = `${htmlEl.offsetLeft - Number.parseFloat(marginLeft)}px`
  htmlEl.style.top = `${htmlEl.offsetTop - Number.parseFloat(marginTop)}px`
  htmlEl.style.width = width
  htmlEl.style.height = height
}
</script>

<template>
  <USlideover v-model="localIsOpen">
    <UForm :state="state" class="flex flex-col gap-y-5 px-5 py-10" @submit="updateSettings">
      <h2 class="text-2xl font-light">
        Settings
      </h2>
      <UAlert
        icon="material-symbols:notifications-outline"
        color="primary"
        variant="soft"
        title="Heads up!"
        description="You can customize your Matey experience here by setting a pre-promt and context files."
      />
      <UFormGroup v-if="availableModels.length > 1" label="LLM">
        <USelectMenu v-model="model" option-attribute="name" :options="availableModels">
          <template #option="{ option: model }">
            <span>{{ model.name }}</span>
            <span class="text-xs font-thin ml-3 text-slate-400">
              {{ model.nb_parameters }} params
              &middot;
              {{ useFormatDate(model.updated_at) }}
            </span>
          </template>
        </USelectMenu>
      </UFormGroup>
      <UFormGroup label="Pre-prompt">
        <UTextarea
          v-model="state.pre_prompt"
          placeholder="You are a noice chatbot..."
          autofocus
          autoresize
        />
      </UFormGroup>
      <UFormGroup
        label="Context files"
        description="Only PDF and plain text files are supported"
      >
        <UInput
          ref="inputFile"
          type="file"
          class="hidden"
          accept="text/*, application/pdf"
          multiple
          @change="readFiles"
        />
        <TransitionGroup
          tag="ul"
          name="files-list"
          class="flex gap-x-1 flex-wrap"
          @before-leave="beforeLeave"
        >
          <li key="add">
            <UButton
              color="black"
              variant="soft"
              :padded="false"
              class="file-tag"
              title="Add files"
              @click.stop.prevent="inputFile.input.click()"
            >
              <UIcon name="mdi:file-plus-outline" class="text-3xl" />
              <div class="font-light text-sm text-center break-all">
                Add files
              </div>
            </UButton>
          </li>
          <li v-for="file in savedFiles" :key="file.name">
            <FileTag :file="file" @delete-file="deleteFile(file.id)" />
          </li>
        </TransitionGroup>
      </UFormGroup>
      <div class="flex justify-end gap-x-3">
        <UButton color="gray" title="Close" @click="localIsOpen = false">
          Close
        </UButton>
        <UButton type="submit" title="Save" icon="ic:outline-check">
          Save
        </UButton>
      </div>
    </UForm>
  </USlideover>
</template>

<style lang="scss" scoped>
.files-list-move, /* apply transition to moving elements */
.files-list-enter-active,
.files-list-leave-active {
  @apply transition-all;
}

.files-list-enter-from,
.files-list-leave-to {
  @apply opacity-0 -translate-y-2;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.files-list-leave-active {
  @apply absolute;
}
</style>
