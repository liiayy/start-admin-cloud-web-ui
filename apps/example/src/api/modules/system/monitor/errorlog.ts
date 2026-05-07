import api from '@/api'

export default {
  // 分页查询错误日志
  list: (params: any) => api.get('api/admin/system/error-log/page', { params }),
  // 获取详情
  detail: (id: string | number) => api.get(`api/admin/system/error-log/${id}`),
  // 批量删除
  delete: (ids: (string | number)[]) => api.delete(`api/admin/system/error-log/${ids.join(',')}`),
  // 清空日志
  clean: () => api.post('api/admin/system/error-log/clean'),
  // 更新状态
  updateStatus: (id: string | number, status: number, remark?: string) => api.put('api/admin/system/error-log/update-status', null, {
    params: { id, status, remark },
  }),
  // 触发模拟测试异常
  triggerTestError: () => api.get('api/admin/system/error-log/test-error'),
}
