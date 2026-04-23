import type { PageResult } from '@/api/type/base.ts'
import request from '@/api/index.ts'

/** OSS记录信息 */
export interface OssInfo {
  id: number
  fileName: string
  originalName: string
  fileSuffix: string
  url: string
  size: number
  service: string
  contentType: string
  createTime: string
}

/** OSS配置信息 */
export interface OssConfig {
  id?: number
  configKey: string
  service: string
  accessKey: string
  secretKey: string
  bucketName: string
  prefix: string
  endpoint: string
  domain: string
  region: string
  isHttps: boolean
  accessPolicy: number
  status: number
  remark: string
}

/** OSS分页查询参数 */
export interface OssPageParam {
  pageNum?: number
  pageSize?: number
  fileName?: string
  originalName?: string
  fileSuffix?: string
  service?: string
}

const apiOss = {
  // --- OSS 资源管理 ---

  // 分页获取资源列表
  page: (params: OssPageParam) => request.get<PageResult<OssInfo>>('api/admin/system/oss/page', { params }),

  // 删除资源
  delete: (id: string | number) => request.delete('api/admin/system/oss/delete', { params: { id } }),

  // --- OSS 配置管理 ---

  // 获取所有配置列表
  configList: () => request.get<OssConfig[]>('api/admin/system/oss-config/list'),

  // 保存或更新配置
  configSave: (data: OssConfig) => request.post('api/admin/system/oss-config/save', data),

  // 删除配置
  configDelete: (id: string | number) => request.delete('api/admin/system/oss-config/delete', { params: { id } }),

  // 刷新客户端
  configReload: (configKey: string) => request.post('api/admin/system/oss-config/reload', null, { params: { configKey } }),

  // 测试配置
  configTest: (data: OssConfig) => request.post('api/admin/system/oss-config/test', data),
}

export default apiOss
