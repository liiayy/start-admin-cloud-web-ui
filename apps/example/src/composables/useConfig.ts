import { ref } from 'vue'
import apiConfig from '@/api/modules/system/config/config'

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
  const result: Record<string, any> = {}

  keys.forEach((key) => {
    // 将键名转换为小驼峰格式作为返回对象的 key
    // 例如 sys.captcha.enabled -> captchaEnabled
    const camelKey = key
      .split('.')
      .slice(1) // 去掉 'sys' 前缀
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join('')

    result[camelKey] = ref<any>(null)

    // 异步获取初始值
    apiConfig.getValue(key).then((res) => {
      let val: any = res.data
      // 类型转换处理
      if (val === 'true') { val = true }
      if (val === 'false') { val = false }
      if (!isNaN(Number(val)) && val !== '') { val = Number(val) }

      result[camelKey].value = val
    })
  })

  return result
}
