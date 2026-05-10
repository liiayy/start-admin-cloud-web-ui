import type { PageResult } from '../../../type/base.ts'
import request from '../../../index.ts'

/** 系统参数信息 */
export interface ConfigInfo {
  id: number
  name: string
  configKey: string
  configValue: string
  builtin: string
  isPublic: string
  remark: string
  createTime: string
}

/** 系统参数新增/编辑表单数据 */
export interface ConfigFormData {
  name: string
  configKey: string
  configValue: string
  builtin: string
  isPublic: string
  remark: string
}

/** 系统参数分页查询参数 */
export interface ConfigPageParam {
  pageNum?: number
  pageSize?: number
  name?: string
  configKey?: string
}

const configApi = {
  /** 系统参数分页 */
  page: (params: ConfigPageParam) => request.get<PageResult<ConfigInfo>>('api/admin/system/config/page', { params }),

  /** 系统参数详情 */
  get: (id: number) => request.get<ConfigInfo>('api/admin/system/config/get', { params: { id } }),

  /** 根据键名获取参数值 */
  getValue: (configKey: string) => request.get<string>('api/admin/system/config/value', { params: { configKey } }),

  /** 批量根据键名获取参数值 */
  listValues: (configKeys: string[]) => request.get<Record<string, string>>('api/admin/system/config/list-values', { params: { configKeys } }),

  /** 新增系统参数 */
  create: (data: ConfigFormData) => request.post('api/admin/system/config/create', data),

  /** 更新系统参数 */
  update: (id: number, data: ConfigFormData) => request.put('api/admin/system/config/update', data, { params: { id } }),

  /** 删除系统参数 */
  delete: (id: number) => request.delete('api/admin/system/config/delete', { params: { id } }),
}

export default configApi
