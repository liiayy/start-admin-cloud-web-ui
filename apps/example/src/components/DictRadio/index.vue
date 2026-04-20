<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import { useDictStore } from '@/store/modules/app/dict'

const props = defineProps<{
  modelValue?: any
  type: string // 字典类型
  valueType?: 'string' | 'number' // 值类型，默认为 string
  disabled?: boolean
  button?: boolean // 是否渲染为按钮样式
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const dictStore = useDictStore()
const options = ref<DictDataInfo[]>([])

const loadDictData = async () => {
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
    const finalValue = props.valueType === 'number' ? (v === null || v === undefined ? v : Number(v)) : v
    emit('update:modelValue', finalValue)
    emit('change', finalValue)
  },
})

const getOptionValue = (itemValue: string) => {
  return props.valueType === 'number' ? Number(itemValue) : itemValue
}
</script>

<template>
  <el-radio-group v-model="val" :disabled="disabled" v-bind="$attrs">
    <template v-if="button">
      <el-radio-button
        v-for="item in options"
        :key="item.id"
        :value="getOptionValue(item.value)"
        :disabled="item.status === '1'"
      >
        {{ item.label }}
      </el-radio-button>
    </template>
    <template v-else>
      <el-radio
        v-for="item in options"
        :key="item.id"
        :value="getOptionValue(item.value)"
        :disabled="item.status === '1'"
      >
        {{ item.label }}
      </el-radio>
    </template>
  </el-radio-group>
</template>
