import type { Ref } from 'vue'
import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import { ref } from 'vue'
import { useDictStore } from '@/store/modules/app/dict'

/**
 * 通用字典拉取钩子
 * @param args 任意多个字典 type，如 'sys_user_sex', 'sys_status'
 */
export function useDict(...args: string[]): Record<string, Ref<DictDataInfo[]>> {
  const dictStore = useDictStore()
  const result: Record<string, Ref<DictDataInfo[]>> = {}

  args.forEach((dictType) => {
    // 提供一个干净的空数组用于页面初次挂载，避免 undefined
    result[dictType] = ref<DictDataInfo[]>([])
  })

  // 批量获取字典数据
  dictStore.getDicts(args).then((res) => {
    Object.keys(res).forEach((type) => {
      if (result[type]) {
        result[type].value = res[type]
      }
    })
  })

  return result

  return result
}
