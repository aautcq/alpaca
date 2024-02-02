<script setup lang="ts">
defineProps<{ showClearChatBtn: boolean }>()

const isSettingsMenuOpen = useState<boolean>('isSettingsMenuOpen')
const isClearModalOpen = useState<boolean>('isClearModalOpen')
</script>

<template>
  <header class="header">
    <div class="container flex items-center justify-between">
      <div>Alpaca</div>
      <div class="flex items-center justify-center gap-x-1">
        <Transition name="header-clear" mode="out-in">
          <UButton
            v-if="showClearChatBtn"
            icon="material-symbols:delete-outline-rounded"
            title="Clear chat"
            color="gray"
            size="sm"
            @click="isClearModalOpen = true"
          >
            Clear chat
          </UButton>
        </Transition>
        <UButton
          icon="material-symbols-light:settings-outline-rounded"
          title="Settings"
          color="gray"
          size="sm"
          @click="isSettingsMenuOpen = true"
        />
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  @apply w-full py-2 bg-slate-800 fixed top-0 inset-x-0 z-10;
}

.header-clear-enter-from,
.header-clear-leave-to {
  @apply opacity-0 -translate-y-2;
}
.header-clear-enter-active,
.header-clear-leave-active {
  @apply transition-all;
}
</style>
