<script setup lang="ts">
const props = defineProps<{ isOpen: boolean }>()

const emit = defineEmits(['confirm', 'update:isOpen'])

const modal = ref()

watch(
  () => props.isOpen,
  isOpen => (isOpen ? modal.value?.showModal() : modal.value?.close()),
  { immediate: true },
)

onMounted(() => {
  props.isOpen ? modal.value?.showModal() : modal.value?.close()
})

function handleClick(e: MouseEvent) {
  const modalDimensions = modal.value?.getBoundingClientRect()
  if (
    modalDimensions
    && (e.clientX < modalDimensions?.left
    || e.clientX > modalDimensions?.right
    || e.clientY < modalDimensions?.top
    || e.clientY > modalDimensions?.bottom)
  )
    emit('update:isOpen', false)
}

defineExpose({ close: () => modal.value?.close() })
</script>

<template>
  <dialog ref="modal" class="modal" @click="handleClick">
    <slot />
  </dialog>
</template>

<style lang="scss" scoped>
.modal {
  @apply px-7 py-5 border-t md:border md:rounded-xl shadow-xl;
  @apply mb-0 w-full mx-0 md:m-auto;
  @apply bg-slate-900 border-slate-800;
  @apply text-inherit max-w-none sm:max-w-md;

  &::backdrop {
    @apply bg-slate-800/30;
  }
}
</style>
