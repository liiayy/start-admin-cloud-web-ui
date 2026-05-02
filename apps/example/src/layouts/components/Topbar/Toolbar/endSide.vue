<script setup lang="ts">
import { useSlots } from '@/slots'
import Tools from './tools.vue'

defineOptions({
  name: 'ToolbarRightSide',
})
</script>

<template>
  <div class="flex gap-1 items-center">
    <Tools mode="right-side" />
    <NotificationCenter />
    <Component :is="useSlots('toolbar-end')" />
  </div>
</template>
