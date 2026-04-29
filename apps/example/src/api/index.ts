import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'

/**
 * 后端统一 API 响应格式
 */
export interface ResponseDTO<T = any> {
  code: number // 对应后端 HttpStatus 常量
  msg: string // 响应消息
  data: T // 数据负载
}

// 请求重试配置
const MAX_RETRY_COUNT = 3 // 最大重试次数
const RETRY_DELAY = 1000 // 重试延迟时间（毫秒）

// 扩展 AxiosRequestConfig 类型
declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 是否显示成功提示 (默认 false) */
    showSuccessToast?: boolean
    /** 是否显示错误提示 (默认 true) */
    showErrorToast?: boolean
    /** 是否跳过响应拦截器的统一处理（直接返回原始 ResponseDTO） */
    skipResponseHandler?: boolean
    retry?: boolean
    retryCount?: number
    fake?: boolean
  }
}

/**
 * 状态码常量 (保持与后端 HttpStatus.java 一致)
 */
const HTTP_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BUSINESS_FAIL: 600, // 业务自定义失败
  VALIDATION_FAILED: 601, // 参数校验失败
} as const

const api = axios.create({
  baseURL: (import.meta.env.DEV && import.meta.env.VITE_ENABLE_PROXY) ? '/' : import.meta.env.VITE_APP_API_BASEURL,
  timeout: 1000 * 60,
  responseType: 'json',
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 默认配置初始化
    config.showSuccessToast = config.showSuccessToast ?? false
    config.showErrorToast = config.showErrorToast ?? true
    config.skipResponseHandler = config.skipResponseHandler ?? false

    // 如果设置了 fake 属性，强制使用 fake 的 baseURL
    if (config.fake) {
      config.baseURL = '/fake/'
    }

    // 注入 Token
    const appAccountStore = useAppAccountStore()
    if (appAccountStore.isLogin && appAccountStore.token) {
      config.headers = config.headers || {}
      config.headers.Token = appAccountStore.token
      config.headers.Authorization = `Bearer ${appAccountStore.token}`
    }

    if (config.headers) {
      config.headers['Accept-Language'] = 'zh-CN'
    }

    return config
  },
  error => Promise.reject(error),
)

// 处理错误信息的逻辑
function handleBusinessError(code: number, msg: string) {
  switch (code) {
    case 20007:
    case HTTP_STATUS.UNAUTHORIZED:
      faToast.error('身份验证失败', { description: '请重新登录' })
      useAppAccountStore().requestLogout()
      break
    case HTTP_STATUS.VALIDATION_FAILED:
      faToast.warning('数据格式错误', { description: msg })
      break
    case HTTP_STATUS.BUSINESS_FAIL:
      faToast.warning('温馨提示', { description: msg })
      break
    case HTTP_STATUS.FORBIDDEN:
      faToast.error('禁止访问', { description: '您没有该操作权限' })
      break
    default:
      faToast.error('警告', { description: msg || `未知错误(${code})` })
  }
}

api.interceptors.response.use(
  (response: AxiosResponse<ResponseDTO>) => {
    const { config, data: res } = response

    // 1. 如果配置了跳过拦截器处理
    if (config.skipResponseHandler) {
      return res
    }

    // 2. 处理非标准 JSON 响应
    if (typeof res !== 'object' || res === null) {
      return response
    }

    const { code, msg, data } = res

    // 3. 业务逻辑成功 (code === 200)
    if (code === HTTP_STATUS.SUCCESS) {
      if (config.showSuccessToast && msg) {
        faToast.success('操作成功', { description: msg })
      }
      // 自动映射分页字段 (records -> list, totalRow -> total)
      if (data && typeof data === 'object') {
        if (Array.isArray(data.records) && data.list === undefined) {
          data.list = data.records
        }
        if (typeof data.totalRow === 'number' && data.total === undefined) {
          data.total = data.totalRow
        }
      }
      return data
    }

    // 4. 业务逻辑失败处理
    if (config.showErrorToast) {
      handleBusinessError(code, msg)
    }

    return Promise.reject(res)
  },
  async (error) => {
    const config = error.config
    if (!config || !config.retry) {
      const status = error.response?.status
      if (status === HTTP_STATUS.UNAUTHORIZED) {
        useAppAccountStore().requestLogout()
      }
      else {
        faToast.error('Error', { description: error.message })
      }
      return Promise.reject(error)
    }

    config.retryCount = config.retryCount || 0
    if (config.retryCount >= MAX_RETRY_COUNT) {
      return Promise.reject(error)
    }

    config.retryCount += 1
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
    return api(config)
  },
)

export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get(url, config) as unknown as Promise<T>,

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.post(url, data, config) as unknown as Promise<T>,

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.put(url, data, config) as unknown as Promise<T>,

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete(url, config) as unknown as Promise<T>,

  raw: {
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ResponseDTO<T>> =>
      api.get(url, { ...config, skipResponseHandler: true }),

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ResponseDTO<T>> =>
      api.post(url, data, { ...config, skipResponseHandler: true }),
  },
}

export default request
export { api }
