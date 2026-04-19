import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import { defineStore } from 'pinia'
import apiDictData from '@/api/modules/system/dict/dictData.ts'

interface DictState {
  dictData: Record<string, DictDataInfo[]>
  promises: Record<string, Promise<DictDataInfo[]>>
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictData: {},
    promises: {},
  }),
  actions: {
    getDict(dictType: string): Promise<DictDataInfo[]> {
      // 1. 如果有缓存存在，直接秒回结果
      if (this.dictData[dictType]) {
        return Promise.resolve(this.dictData[dictType])
      }

      // 2. 如果之前有人申请过，但请求还在路上没有回来，返回同一个 Promise
      if (this.promises[dictType]) {
        return this.promises[dictType]
      }

      // 3. 开始异步获取数据，并存入 promise 缓存
      this.promises[dictType] = (async () => {
        try {
          const res = await apiDictData.listByType(dictType)
          this.dictData[dictType] = res
          return res
        }
        finally {
          // 清空 Promise 等待锁
          delete this.promises[dictType]
        }
      })()

      return this.promises[dictType]
    },
    // 主动清除某个字典类型的缓存
    removeDict(dictType: string) {
      delete this.dictData[dictType]
    },
    // 重置所有字典缓存
    cleanDict() {
      this.dictData = {}
      this.promises = {}
    },
  },
})
