import api from '../index'

export default {
  // 后端获取路由数据 (暂时指向 Mock，直到 Store 完成对接)
  routeList: () => api.get('app/route/list', {
    fake: true,
  }),

  // 登录
  login: (data: {
    username: string
    password: string
  }) => api.post('api/admin/system/auth/login', data),

  // 获取权限 (对应后端的 get-info)
  permission: () => api.get('api/admin/system/auth/get-info'),

  // 修改密码
  passwordEdit: (data: {
    password: string
    newPassword: string
  }) => api.post('app/account/password/edit', data, {
    fake: true,
  }),
}
