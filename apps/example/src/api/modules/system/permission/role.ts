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
export interface RoleAddFormData {
  name: string
  code: string
  sort: number
  status: number
  dataScope: number
  dataScopeDeptIds: string
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
  page: (params: RolePageParam) => request.get<PageResult<RoleInfo>>('api/system/permission/role/page', { params }),

  // 角色详情
  get: (id: number) => request.get<RoleInfo>('api/system/permission/role/get', { params: { id } }),

  // 新增角色
  add: (data: RoleAddFormData) => request.post('api/system/permission/role/add', data),

  // 更新角色
  update: (data: RoleUpdateFormData) => request.put('api/system/permission/role/update', data),

  // 删除角色
  delete: (id: number) => request.delete('api/system/permission/role/delete', { params: { id } }),

  // 更新角色状态
  updateStatus: (id: number, status: number) =>
    request.put('api/system/permission/role/update-status', { id, status }),

  // 分配菜单权限
  assignMenus: (roleId: number, menuIds: number[]) =>
    request.post('api/system/permission/role/assign-menus', menuIds, { params: { roleId } }),
}
