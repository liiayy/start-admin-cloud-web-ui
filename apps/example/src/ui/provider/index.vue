<script setup lang="ts">
import { zhCN } from './index'

const appSettingsStore = useAppSettingsStore()

// 跟随框架主题
const isSupportColorMix = CSS.supports('color', 'color-mix(in oklab, #fff, #000)')
if (isSupportColorMix) {
  const rootStyle = document.body.style
  rootStyle.setProperty('--el-bg-color', 'oklch(var(--background))')
  rootStyle.setProperty('--el-bg-color-overlay', 'oklch(var(--popover))')
  rootStyle.setProperty('--el-text-color-primary', 'oklch(var(--foreground))')
  rootStyle.setProperty('--el-text-color-regular', 'oklch(var(--foreground) / 0.85)')
  rootStyle.setProperty('--el-text-color-secondary', 'oklch(var(--muted-foreground))')
  rootStyle.setProperty('--el-border-color', 'oklch(var(--border))')
  rootStyle.setProperty('--el-border-color-light', 'oklch(var(--border) / 0.8)')
  rootStyle.setProperty('--el-border-color-lighter', 'oklch(var(--border) / 0.5)')
  rootStyle.setProperty('--el-fill-color-blank', 'oklch(var(--background))')
  rootStyle.setProperty('--el-fill-color-light', 'oklch(var(--muted))')
  rootStyle.setProperty('--el-fill-color-lighter', 'oklch(var(--muted) / 0.5)')
  rootStyle.setProperty('--el-color-primary', 'oklch(var(--primary))')
  rootStyle.setProperty('--el-color-danger', 'oklch(var(--destructive))')

  watch(() => appSettingsStore.currentColorScheme, (val) => {
    if (val === 'light') {
      for (let index = 1; index < 10; index++) {
        rootStyle.setProperty(`--el-color-primary-light-${index}`, `color-mix(in oklab, oklch(var(--primary)), #fff ${index * 10}%)`)
        rootStyle.setProperty(`--el-color-primary-dark-${index}`, `color-mix(in oklab, oklch(var(--primary)), #000 ${index * 10}%)`)
      }
    }
    else {
      for (let index = 1; index < 10; index++) {
        rootStyle.setProperty(`--el-color-primary-light-${index}`, `color-mix(in oklab, oklch(var(--primary)), #000 ${index * 10}%)`)
        rootStyle.setProperty(`--el-color-primary-dark-${index}`, `color-mix(in oklab, oklch(var(--primary)), #fff ${index * 10}%)`)
      }
    }
  }, {
    immediate: true,
  })
}
</script>

<template>
  <ElConfigProvider :locale="zhCN" :button="{ autoInsertSpace: true }">
    <slot />
  </ElConfigProvider>
</template>
