import { onMounted, ref } from 'vue'
import { useConfigStore } from '@/store/modules/app/config'

/**
 * 获取系统配置的 Hook
 *
 * @param keys 需要获取的配置键名列表
 * @returns 包含响应式配置值的对象
 *
 * @example
 * const { captchaEnabled, registerEnabled } = useConfig('sys.captcha.enabled', 'sys.register.enabled')
 */
export function useConfig(...keys: string[]) {
  const configStore = useConfigStore()
  const result: Record<string, any> = {}

  // 1. 初始化结果对象，并将键名转换为驼峰兼容格式
  keys.forEach((key) => {
    // 例如 sys.captcha.enabled -> captchaEnabled
    const camelKey = key
      .split('.')
      .slice(1) // 去掉 'sys' 前缀
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join('')

    // 初始化为当前缓存中的值（可能为 undefined）
    const initialValue = configStore.configValues[key]
    result[camelKey] = ref<any>(initialValue ?? null)

    // 给结果对象附加原始 Key 映射，方便后续更新
    result[`__meta_${camelKey}`] = key
  })

  // 2. 批量拉取数据
  onMounted(async () => {
    const configData = await configStore.getConfigs(keys)

    // 更新响应式数据
    Object.keys(result).forEach((camelKey) => {
      if (camelKey.startsWith('__meta_')) {
        return
      }
      const originalKey = result[`__meta_${camelKey}`]
      result[camelKey].value = configData[originalKey]
    })
  })

  return result
}
