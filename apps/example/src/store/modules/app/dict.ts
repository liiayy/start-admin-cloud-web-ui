import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import { defineStore } from 'pinia'
import apiDictData from '@/api/modules/system/dict/dictData.ts'

interface DictState {
  dictData: Record<string, DictDataInfo[] | undefined>
  promises: Record<string, Promise<DictDataInfo[]> | undefined>
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
        return this.promises[dictType] as Promise<DictDataInfo[]>
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

      return this.promises[dictType] as Promise<DictDataInfo[]>
    },
    async getDicts(dictTypes: string[]): Promise<Record<string, DictDataInfo[]>> {
      // 1. 过滤需要获取的类型（排除已缓存和正在加载中的）
      const typesToFetch = dictTypes.filter(type => !this.dictData[type] && !this.promises[type])

      if (typesToFetch.length > 0) {
        // 创建一个批量 Promise
        const batchPromise = (async () => {
          try {
            const res = await apiDictData.listByTypes(typesToFetch)
            Object.keys(res).forEach((type) => {
              this.dictData[type] = res[type]
            })
            return res
          }
          finally {
            typesToFetch.forEach(type => delete this.promises[type])
          }
        })()

        // 为这些类型占位 promises
        typesToFetch.forEach((type) => {
          this.promises[type] = batchPromise.then(res => res[type])
        })
      }

      // 2. 利用 getDict 的已有逻辑获取所有结果
      const results = await Promise.all(dictTypes.map(type => this.getDict(type)))
      return dictTypes.reduce((acc, type, index) => {
        acc[type] = results[index]
        return acc
      }, {} as Record<string, DictDataInfo[]>)
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
