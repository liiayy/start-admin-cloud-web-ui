import api from '@/api'

export default {
  // 分页查询操作日志
  list: (params: any) => api.get('api/admin/system/oper-log/page', { params }),
  // 获取详情
  get: (id: string | number) => api.get(`api/admin/system/oper-log/${id}`),
  // 批量删除
  delete: (ids: string) => api.delete(`api/admin/system/oper-log/${ids}`),
  // 清空日志
  clean: () => api.post('api/admin/system/oper-log/clean'),
}
