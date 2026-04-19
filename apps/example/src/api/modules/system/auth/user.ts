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
}

/** 用户新增请求 */
export interface UserAddFormData {
  username: string
  password: string
  nickname: string
  mobile: string
  email: string
  deptId: number | null
  postIds: number[]
  status: number
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
  page: (params: UserPageParam) => request.get<PageResult<UserInfo>>('api/system/auth/user/page', { params }),

  // 用户详情
  get: (id: number) => request.get<UserInfo>('api/system/auth/user/get', { params: { id } }),

  // 新增用户
  create: (data: UserAddFormData) => request.post('api/system/auth/user/create', data),

  // 更新用户
  update: (data: UserUpdateFormData) => request.put('api/system/auth/user/update', data),

  // 删除用户
  delete: (id: number) => request.delete('api/system/auth/user/delete', { params: { id } }),

  // 更新状态
  updateStatus: (id: number, status: number) =>
    request.put('api/system/auth/user/update-status', { id, status }),

  // 重置密码
  resetPassword: (id: number, newPassword: string) =>
    request.put('api/system/auth/user/reset-password', { id, newPassword }),

  // 分配角色
  assignRole: (userId: number, roleIds: number[]) =>
    request.post('api/system/auth/user/assign-role', { userId, roleIds }),
}
