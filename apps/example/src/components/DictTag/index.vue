<script setup lang="ts">
import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import { computed, onMounted, ref, watch } from 'vue'
import { useDictStore } from '@/store/modules/app/dict'

const props = defineProps<{
  type?: string // 字典类型，传入此项将自动加载数据
  options?: DictDataInfo[] // 字典选项数组 (可选，若不传则根据 type 加载)
  value?: string | number | boolean // 当前绑定值，支持逗号分隔的多值
  placeholder?: string // 找不到时的占位内容
  size?: 'large' | 'default' | 'small' // Tag 尺寸
  effect?: 'dark' | 'light' | 'plain' // Tag 主题
}>()

const dictStore = useDictStore()
const innerOptions = ref<DictDataInfo[]>([])

// 获取最终使用的选项列表
const finalOptions = computed(() => {
  return props.options || innerOptions.value
})

async function loadDictData() {
  if (props.type && !props.options) {
    const res = await dictStore.getDicts([props.type])
    innerOptions.value = res[props.type] || []
  }
}

// 初始化加载
onMounted(loadDictData)

// 监听 type 变化
watch(() => props.type, loadDictData)

// 解析多值
const values = computed(() => {
  if (props.value === undefined || props.value === null || props.value === '') {
    return []
  }
  if (typeof props.value === 'string' && props.value.includes(',')) {
    return props.value.split(',').filter(v => v !== '')
  }
  return [props.value]
})

// 根据值获取对应的字典项
function getDictItem(val: any) {
  return finalOptions.value.find(item => String(item.value) === String(val))
}
</script>

<template>
  <div class="dict-tag-container flex flex-wrap gap-1">
    <template v-if="values.length > 0">
      <template v-for="(val, index) in values" :key="index">
        <el-tag
          v-if="getDictItem(val)"
          :type="getDictItem(val)?.colorType as any || ''"
          :class="getDictItem(val)?.cssClass || ''"
          :size="size"
          :effect="effect"
          disable-transitions
        >
          {{ getDictItem(val)?.label }}
        </el-tag>
        <span v-else class="text-sm text-gray-400">
          {{ val }}
        </span>
      </template>
    </template>
    <span v-else-if="placeholder" class="text-sm text-gray-400 italic">
      {{ placeholder }}
    </span>
  </div>
</template>

<style scoped>
.dict-tag-container {
  display: inline-flex;
  vertical-align: middle;
}
</style>
