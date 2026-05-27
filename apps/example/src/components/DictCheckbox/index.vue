<script setup lang="ts">
import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import type { DictType } from '@/types/dict'
import { computed, onMounted, ref, watch } from 'vue'
import { useDictStore } from '@/store/modules/app/dict'

const props = defineProps<{
  modelValue?: any[]
  type: DictType // 字典类型
  valueType?: 'string' | 'number' // 值类型，默认为 string
  disabled?: boolean
  button?: boolean // 是否渲染为按钮样式
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
  get: () => props.modelValue || [],
  set: (v) => {
    let finalValue = v
    if (props.valueType === 'number') {
      finalValue = v.map(i => (i === null || i === undefined ? i : Number(i)))
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
  <el-checkbox-group v-model="val" :disabled="disabled" v-bind="$attrs">
    <template v-if="button">
      <el-checkbox-button
        v-for="item in options"
        :key="item.id"
        :value="getOptionValue(item.value)"
        :disabled="item.status === 1"
      >
        {{ item.label }}
      </el-checkbox-button>
    </template>
    <template v-else>
      <el-checkbox
        v-for="item in options"
        :key="item.id"
        :value="getOptionValue(item.value)"
        :disabled="item.status === 1"
      >
        {{ item.label }}
      </el-checkbox>
    </template>
  </el-checkbox-group>
</template>
