import type { PageResult } from '../../../type/base.ts'
import request from '../../../index.ts'

/** 岗位信息 */
export interface PostInfo {
  id: number
  deptId: number | null
  deptName: string
  code: string
  name: string
  sort: number
  status: number
  remark: string
  createTime: string
}

/** 岗位新增/编辑请求参数 */
export interface PostFormData {
  deptId: number | null
  code: string
  name: string
  sort: number
  status: number
  remark: string
}

/** 岗位分页查询参数 */
export interface PostPageParam {
  pageNum?: number
  pageSize?: number
  deptId?: number | null
  name?: string
  status?: number | null
}

export default {
  // 岗位分页
  page: (params: PostPageParam) => request.get<PageResult<PostInfo>>('api/system/organization/post/page', { params }),

  // 岗位列表
  list: () => request.get<PostInfo[]>('api/system/organization/post/list'),

  // 岗位详情
  getById: (id: number) => request.get<PostInfo>(`api/system/organization/post/${id}`),

  // 新增岗位
  add: (data: PostFormData) => request.post('api/system/organization/post/add', data),

  // 更新岗位
  update: (id: number, data: PostFormData) => request.put(`api/system/organization/post/${id}`, data),

  // 删除岗位
  delete: (id: number) => request.delete(`api/system/organization/post/${id}`),

  // 更新岗位状态
  updateStatus: (id: number, status: number) =>
    request.put('api/system/organization/post/update-status', null, { params: { id, status } }),
}
