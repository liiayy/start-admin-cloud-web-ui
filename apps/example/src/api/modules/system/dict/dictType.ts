import type { PageResult } from '../../../type/base.ts'
import request from '../../../index.ts'

/** 字典类型信息 */
export interface DictTypeInfo {
  id: number
  name: string
  type: string
  status: number
  remark: string
  createTime: string
}

/** 字典类型新增/编辑表单数据 */
export interface DictTypeFormData {
  name: string
  type: string
  status: number
  remark: string
}

/** 字典类型分页查询参数 */
export interface DictTypePageParam {
  pageNum?: number
  pageSize?: number
  name?: string
  type?: string
  status?: number | null
}

export default {
  /** 字典类型列表 */
  list: () => request.get<DictTypeInfo[]>('api/system/system/dict-type/list'),

  /** 字典类型分页 */
  page: (params: DictTypePageParam) => request.get<PageResult<DictTypeInfo>>('api/system/system/dict-type/page', { params }),

  /** 字典类型详情 */
  get: (id: number) => request.get<DictTypeInfo>('api/system/dict-type/system/get', { params: { id } }),

  /** 新增字典类型 */
  add: (data: DictTypeFormData) => request.post('api/system/system/dict-type/add', data),

  /** 更新字典类型 */
  update: (id: number, data: DictTypeFormData) => request.put('api/system/system/dict-type/update', data, { params: { id } }),

  /** 删除字典类型 */
  delete: (id: number) => request.delete('api/system/system/dict-type/delete', { params: { id } }),
}
