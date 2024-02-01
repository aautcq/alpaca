<script setup lang="ts">
import type { ContextFile } from '~/types'

defineProps<{ file: ContextFile }>()

const emit = defineEmits(['deleteFile'])

function getFileIcon(type: string) {
  switch (type) {
    case 'text/plain':
      return 'mdi:file-document-outline'
    case 'application/pdf':
      return 'mdi:file-pdf-outline'
    default:
      return 'mdi:file-alert-outline'
  }
}
</script>

<template>
  <UPopover
    mode="hover"
    :popper="{ placement: 'bottom' }"
    :open-delay="1000"
  >
    <div class="file-tag">
      <UIcon :name="getFileIcon(file.content.type)" class="text-3xl" />
      <div class="font-light text-sm text-center break-all">
        {{ file.name }}
      </div>
      <UButton
        title="Delete file"
        icon="iconamoon:sign-times"
        color="gray"
        size="2xs"
        square
        :padded="false"
        class="file-tag__delete"
        @click.stop.prevent="emit('deleteFile')"
      />
    </div>
    <template #panel>
      <div class="text-xs font-thin px-3 py-2">
        <div>
          {{ useFormatFileType(file.content.type) }}
          &middot;
          {{ useFileSizeFormat(file.size) }}
        </div>
        <div>{{ useFormatDate(file.last_modified) }}</div>
      </div>
    </template>
  </UPopover>
</template>

<style lang="scss" scoped>
.file-tag {
  & > button.file-tag__delete {
    @apply absolute -top-2 -right-2 opacity-0 transition-opacity;
  }

  &:hover > button.file-tag__delete {
    @apply opacity-100;
  }
}
</style>
