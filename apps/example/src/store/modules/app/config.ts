import { defineStore } from 'pinia'
import apiConfig from '@/api/modules/system/config/config'

export const useConfigStore = defineStore('config', {
  state: () => ({
    /** 系统配置值缓存 */
    configValues: {} as Record<string, any>,
    /** 正在请求中的配置键名及其对应的 Promise */
    loadingPromises: {} as Record<string, Promise<any>>,
  }),

  actions: {
    /**
     * 获取单个配置值（优先从缓存获取）
     */
    async getConfig(key: string) {
      if (this.configValues[key] !== undefined) {
        return this.configValues[key]
      }
      const results = await this.getConfigs([key])
      return results[key]
    },

    /**
     * 批量获取配置值（自动去重、自动合并请求）
     */
    async getConfigs(keys: string[]): Promise<Record<string, any>> {
      if (!keys.length) {
        return {}
      }

      const results: Record<string, any> = {}
      const missingKeys: string[] = []

      // 1. 分类：已缓存、正在加载中、尚未请求
      for (const key of keys) {
        if (this.configValues[key] !== undefined) {
          results[key] = this.configValues[key]
        }
        else if (this.loadingPromises[key]) {
          missingKeys.push(key) // 依然标记为缺失，但不需要发起新请求，等 Promise
        }
        else {
          missingKeys.push(key)
        }
      }

      const uniqueMissingKeys = [...new Set(missingKeys)]
      if (uniqueMissingKeys.length === 0) {
        return results
      }

      // 2. 真正需要向后端发起的请求（排除掉那些 loadingPromises 中已经存在的）
      const keysToFetch = uniqueMissingKeys.filter(key => !this.loadingPromises[key])

      if (keysToFetch.length > 0) {
        // 创建一个新的 Promise 来执行批量获取
        const fetchPromise = (async () => {
          try {
            if (typeof apiConfig.listValues !== 'function') {
              console.error('[ConfigStore] CRITICAL: apiConfig.listValues is missing! apiConfig contains:', Object.keys(apiConfig))
              throw new Error('apiConfig.listValues is not a function')
            }
            const { data } = await apiConfig.listValues(keysToFetch)
            // 更新缓存并解析布尔/数字类型
            Object.keys(data).forEach((key) => {
              this.configValues[key] = this.parseValue(data[key])
            })
            // 对于请求了但后端没返回的（表示不存在或非公开），也需要标记为 null，防止重复请求
            keysToFetch.forEach((key) => {
              if (this.configValues[key] === undefined) {
                this.configValues[key] = null
              }
            })
          }
          finally {
            // 请求结束，清理 loadingPromises
            keysToFetch.forEach(key => delete this.loadingPromises[key])
          }
        })()

        // 记录正在进行的请求
        keysToFetch.forEach(key => this.loadingPromises[key] = fetchPromise)
      }

      // 3. 等待所有缺失键名的 Promise 完成
      const pendingPromises = uniqueMissingKeys
        .map(key => this.loadingPromises[key])
        .filter(p => !!p)

      await Promise.all(pendingPromises)

      // 4. 重组最终结果
      keys.forEach((key) => {
        results[key] = this.configValues[key]
      })

      return results
    },

    /**
     * 清除缓存
     */
    clearCache() {
      this.configValues = {}
      this.loadingPromises = {}
    },

    /**
     * 解析配置值（尝试转为布尔或数字）
     */
    parseValue(val: any): any {
      if (val === 'Y' || val === 'true' || val === true) {
        return true
      }
      if (val === 'N' || val === 'false' || val === false) {
        return false
      }
      if (!Number.isNaN(Number(val)) && val !== '' && typeof val === 'string') {
        return Number(val)
      }
      return val
    },
  },
})
