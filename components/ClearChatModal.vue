<script setup lang="ts">
const props = defineProps<{ isOpen: boolean }>()

const emit = defineEmits(['confirm', 'update:isOpen'])

const localIsOpen = computed({
  get: () => props.isOpen,
  set: val => emit('update:isOpen', val),
})

function clearChat() {
  emit('confirm')
  localIsOpen.value = false
}
</script>

<template>
  <UModal v-model="localIsOpen">
    <div class="flex flex-col gap-y-5 px-10 py-5">
      <h2 class="text-center text-2xl font-light">
        Are you sure?
      </h2>
      <p>All your conversation will be lost in time like tears in rain.</p>
      <div class="flex justify-center gap-x-2">
        <UButton color="gray" title="Cancel" @click="localIsOpen = false">
          Cancel
        </UButton>
        <UButton
          color="primary"
          title="Clear chat"
          icon="material-symbols:delete-outline-rounded"
          @click="clearChat"
        >
          Clear chat
        </UButton>
      </div>
    </div>
  </UModal>
</template>
