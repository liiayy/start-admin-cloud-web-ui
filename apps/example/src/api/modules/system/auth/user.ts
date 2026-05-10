import type { PageResult } from '../../../type/base.ts'
import request from '../../../index.ts'

/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  deptId: number | null
  deptName: string
  postIds: number[]
  mobile: string
  email: string
  sex: number
  avatar: string
  status: number
  loginIp: string
  loginDate: string
  createTime: string
  roleIds: number[]
  remark?: string
}

/** 用户新增请求 */
export interface UserCreateFormData {
  username: string
  password: string
  nickname: string
  mobile: string
  email: string
  deptId: number | null
  postIds: number[]
  status: number
  sex: number
  avatar?: string
  remark?: string
}

/** 用户编辑请求 */
export interface UserUpdateFormData {
  id: number
  nickname: string
  mobile: string
  email: string
  deptId: number | null
  postIds: number[]
  sex: number
  avatar: string
  remark: string
}

/** 个人资料更新请求 */
export interface UserProfileUpdateFormData {
  nickname: string
  mobile: string
  email: string
  sex: number
}

/** 用户分页查询参数 */
export interface UserPageParam {
  pageNum?: number
  pageSize?: number
  username?: string
  mobile?: string
  status?: number | null
  deptId?: number | null
}

export default {
  // 用户分页
  page: (params: UserPageParam) => request.get<PageResult<UserInfo>>('api/admin/system/user/page', { params }),

  // 用户详情
  get: (id: number) => request.get<UserInfo>('api/admin/system/user/get', { params: { id } }),

  // 新增用户
  create: (data: UserCreateFormData) => request.post('api/admin/system/user/create', data),

  // 更新用户
  update: (data: UserUpdateFormData) => request.put('api/admin/system/user/update', data),

  // 删除用户
  delete: (id: number) => request.delete('api/admin/system/user/delete', { params: { id } }),

  // 更新状态
  updateStatus: (id: number, status: number) =>
    request.put('api/admin/system/user/update-status', { id, status }),

  // 重置密码
  resetPassword: (id: number, newPassword: string) =>
    request.put('api/admin/system/user/reset-password', { id, newPassword }),

  // 分配角色
  assignRole: (userId: number, roleIds: number[]) =>
    request.post('api/admin/system/user/assign-role', { userId, roleIds }),

  // 导出用户
  exportUser: (params: UserPageParam) =>
    request.post('api/admin/system/user/export', params, { responseType: 'blob', skipResponseHandler: true }),

  // 导入用户
  importUser: (data: FormData) =>
    request.post('api/admin/system/user/import', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // 导入模板
  importTemplate: () =>
    request.post('api/admin/system/user/import-template', {}, { responseType: 'blob', skipResponseHandler: true }),

  // 获取个人资料
  getProfile: () => request.get<UserInfo>('api/admin/system/user/profile'),

  // 更新个人资料
  updateProfile: (data: UserProfileUpdateFormData) => request.put('api/admin/system/user/profile', data),
}
