<script setup lang="ts">
import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import { computed } from 'vue'

const props = defineProps<{
  options: DictDataInfo[] // 字典选项数组 (由 useDict 拿到)
  value?: string | number | boolean // 当前后台返回的绑定值
}>()

const currentDict = computed(() => {
  if (props.value === undefined || props.value === null) {
    return null
  }
  return props.options.find(item => String(item.value) === String(props.value)) || null
})

const tagLabel = computed(() => {
  return currentDict.value ? currentDict.value.label : props.value
})

const tagType = computed(() => {
  return currentDict.value ? (currentDict.value.colorType || '') : ''
})

const tagClass = computed(() => {
  return currentDict.value ? (currentDict.value.cssClass || '') : ''
})
</script>

<template>
  <el-tag
    v-if="value !== undefined && value !== null"
    :type="tagType as any"
    :class="tagClass"
    disable-transitions
  >
    {{ tagLabel }}
  </el-tag>
</template>
