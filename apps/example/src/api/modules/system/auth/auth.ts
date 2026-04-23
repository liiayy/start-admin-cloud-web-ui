import request from '../../../index.ts'

export default {
  // 登录
  login: (data: { username: string, password: string, code?: string, uuid?: string }) => request.post('api/admin/system/auth/login', data),

  // 获取验证码
  getCaptcha: () => request.get<{ uuid: string, img: string, enabled: boolean }>('api/admin/system/auth/captcha'),

  // 登出
  logout: () => request.post('api/admin/system/auth/logout'),

  // 获取当前用户信息（包含角色和权限）
  getInfo: () => request.get('api/admin/system/auth/get-info'),

  // 修改密码
  passwordEdit: (data: { password: string, newPassword: string }) => request.put('api/admin/system/user/update-password', data),
}
