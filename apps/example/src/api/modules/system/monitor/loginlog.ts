import api from '@/api'

export default {
  // 分页查询登录日志
  list: (params: any) => api.get('api/system/monitor/loginlog/page', { params }),
  // 批量删除
  delete: (ids: string) => api.delete(`api/system/monitor/loginlog/${ids}`),
  // 清空日志
  clean: () => api.post('api/system/monitor/loginlog/clean'),
}
