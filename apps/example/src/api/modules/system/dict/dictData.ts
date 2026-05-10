import type { PageResult } from '../../../type/base.ts'
import request from '../../../index.ts'

/** 字典数据信息 */
export interface DictDataInfo {
  id: number
  dictType: string
  label: string
  value: string
  sort: number
  status: number
  colorType: string
  cssClass: string
  remark: string
  createTime: string
}

/** 字典数据新增/编辑表单数据 */
export interface DictDataFormData {
  dictType: string
  label: string
  value: string
  sort: number
  status: number
  colorType: string
  cssClass: string
  remark: string
}

/** 字典数据分页查询参数 */
export interface DictDataPageParam {
  pageNum?: number
  pageSize?: number
  dictType?: string
  label?: string
  status?: number | null
}

export default {
  /** 根据类型获取字典数据列表 */
  listByType: (dictType: string) => request.get<DictDataInfo[]>('api/admin/system/dict-data/list-by-type', { params: { dictType } }),
  /** 根据类型列表批量获取字典数据 */
  listByTypes: (dictTypes: string[]) => request.get<Record<string, DictDataInfo[]>>('api/admin/system/dict-data/list-by-types', { params: { dictTypes: dictTypes.join(',') } }),

  /** 字典数据分页 */
  page: (params: DictDataPageParam) => request.get<PageResult<DictDataInfo>>('api/admin/system/dict-data/page', { params }),

  /** 字典数据详情 */
  get: (id: number) => request.get<DictDataInfo>('api/admin/system/dict-data/get', { params: { id } }),

  /** 新增字典数据 */
  create: (data: DictDataFormData) => request.post('api/admin/system/dict-data/create', data),

  /** 更新字典数据 */
  update: (id: number, data: DictDataFormData) => request.put('api/admin/system/dict-data/update', data, { params: { id } }),

  /** 删除字典数据 */
  delete: (id: number) => request.delete('api/admin/system/dict-data/delete', { params: { id } }),
}
