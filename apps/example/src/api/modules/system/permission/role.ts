import type { PageResult } from '../../../type/base.ts'
import request from '../../../index.ts'

/** 角色信息 */
export interface RoleInfo {
  id: number
  name: string
  code: string
  sort: number
  status: number
  dataScope: number | null
  dataScopeDeptIds: string | null
  type: number | null
  remark: string
  createTime: string
}

/** 角色新增请求参数 */
export interface RoleCreateFormData {
  name: string
  code: string
  sort: number
  status: number
  dataScope: number
  dataScopeDeptIds: string
  type: number
  remark: string
}

/** 角色编辑请求参数 */
export interface RoleUpdateFormData {
  id: number
  name: string
  code: string
  sort: number
  status: number
  dataScope: number
  dataScopeDeptIds: string
  remark: string
}

/** 角色分页查询参数 */
export interface RolePageParam {
  pageNum?: number
  pageSize?: number
  name?: string
  code?: string
  status?: number | null
}

export default {
  // 角色分页
  page: (params: RolePageParam) => request.get<PageResult<RoleInfo>>('api/admin/system/role/page', { params }),

  // 角色详情
  get: (id: number) => request.get<RoleInfo>('api/admin/system/role/get', { params: { id } }),

  // 新增角色
  create: (data: RoleCreateFormData) => request.post('api/admin/system/role/create', data),

  // 更新角色
  update: (data: RoleUpdateFormData) => request.put('api/admin/system/role/update', data),

  // 删除角色
  delete: (id: number) => request.delete('api/admin/system/role/delete', { params: { id } }),

  // 更新角色状态
  updateStatus: (id: number, status: number) =>
    request.put('api/admin/system/role/update-status', { id, status }),

  // 分配菜单权限
  assignMenus: (roleId: number, menuIds: number[]) =>
    request.post('api/admin/system/role/assign-menus', menuIds, { params: { roleId } }),
}
