import request from '../../../index.ts'

/** 部门信息 */
export interface DeptInfo {
  id: number
  name: string
  parentId: number
  sort: number
  leaderUserId: number | null
  phone: string
  email: string
  status: number
  remark: string
  createTime: string
}

/** 部门树节点 */
export interface DeptTreeNode extends DeptInfo {
  children: DeptTreeNode[]
}

/** 部门新增/编辑请求参数 */
export interface DeptFormData {
  name: string
  parentId: number
  sort: number
  leaderUserId: number | null
  phone: string
  email: string
  status: number
  remark: string
}

export default {
  // 部门列表
  list: () => request.get<DeptInfo[]>('api/system/organization/dept/list'),

  // 部门树
  tree: () => request.get<DeptTreeNode[]>('api/system/organization/dept/tree'),

  // 部门详情
  getById: (id: number) => request.get<DeptInfo>(`api/system/organization/dept/${id}`),

  // 新增部门
  add: (data: DeptFormData) => request.post('api/system/organization/dept/add', data),

  // 更新部门
  update: (id: number, data: DeptFormData) => request.put(`api/system/organization/dept/${id}`, data),

  // 删除部门
  delete: (id: number) => request.delete(`api/system/organization/dept/${id}`),

  // 更新部门状态
  updateStatus: (id: number, status: number) =>
    request.put('api/system/organization/dept/update-status', null, { params: { id, status } }),
}
