<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    © {{ currentYear }} Adrien Autricque
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  @apply fixed inset-x-0 bottom-0 py-0.5 text-center text-[10px] font-light;
  @apply text-slate-600;
}
</style>
