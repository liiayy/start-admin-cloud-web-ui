import api from '@/api'

export default {
  // 分页查询登录日志
  list: (params: any) => api.get('api/admin/system/login-log/page', { params }),
  // 分页查询个人登录日志
  personalList: (params: any) => api.get('api/admin/system/login-log/personal', { params }),
  // 批量删除
  delete: (ids: string) => api.delete(`api/admin/system/login-log/${ids}`),
  // 清空日志
  clean: () => api.post('api/admin/system/login-log/clean'),
}
