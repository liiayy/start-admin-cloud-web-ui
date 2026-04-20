import api from '@/api'

export default {
  // 分页查询操作日志
  list: (params: any) => api.get('api/system/monitor/operlog/page', { params }),
  // 获取详情
  get: (id: string | number) => api.get(`api/system/monitor/operlog/${id}`),
  // 批量删除
  delete: (ids: string) => api.delete(`api/system/monitor/operlog/${ids}`),
  // 清空日志
  clean: () => api.post('api/system/monitor/operlog/clean'),
}
