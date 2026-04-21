<script setup lang="ts">
import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import { computed, onMounted, ref, watch } from 'vue'
import { useDictStore } from '@/store/modules/app/dict'

const props = defineProps<{
  modelValue?: any
  type: string // 字典类型，如 'sys_user_sex'
  valueType?: 'string' | 'number' // 值类型，默认为 string
  placeholder?: string
  multiple?: boolean
  clearable?: boolean
  disabled?: boolean
  collapseTags?: boolean
  collapseTagsTooltip?: boolean
  filterable?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const dictStore = useDictStore()
const options = ref<DictDataInfo[]>([])

async function loadDictData() {
  if (props.type) {
    const res = await dictStore.getDicts([props.type])
    options.value = res[props.type] || []
  }
}

onMounted(loadDictData)
watch(() => props.type, loadDictData)

const val = computed({
  get: () => props.modelValue,
  set: (v) => {
    let finalValue = v
    if (props.valueType === 'number') {
      if (Array.isArray(v)) {
        finalValue = v.map(i => (i === null || i === undefined ? i : Number(i)))
      }
      else {
        finalValue = (v === null || v === undefined ? v : Number(v))
      }
    }
    emit('update:modelValue', finalValue)
    emit('change', finalValue)
  },
})

function getOptionValue(itemValue: string) {
  return props.valueType === 'number' ? Number(itemValue) : itemValue
}
</script>

<template>
  <el-select
    v-model="val"
    :placeholder="placeholder || '请选择'"
    :multiple="multiple"
    :clearable="clearable"
    :disabled="disabled"
    :collapse-tags="collapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
    :filterable="filterable"
    v-bind="$attrs"
  >
    <el-option
      v-for="item in options"
      :key="item.id"
      :label="item.label"
      :value="getOptionValue(item.value)"
      :disabled="item.status === '1'"
    />
  </el-select>
</template>
