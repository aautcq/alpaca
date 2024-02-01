<script setup lang="ts">
defineProps<{ icon: string, content?: string }>()
</script>

<template>
  <div class="placeholder">
    <UIcon :name="icon" class="text-4xl" />
    <h1 class="text-2xl font-light">
      {{ content }}
      <slot />
    </h1>
  </div>
</template>

<style lang="scss" scoped>
.placeholder {
  @apply flex flex-col gap-y-5 items-center justify-center absolute inset-0;
}
</style>
