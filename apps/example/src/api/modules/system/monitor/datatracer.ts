import api from '@/api/index.ts'

export default {
  list: (params: any) => api.get('/api/admin/system/data-tracer/page', { params }),
  delete: (ids: string) => api.delete(`/api/admin/system/data-tracer/${ids}`),
  clean: () => api.delete('/api/admin/system/data-tracer/clean'),
}
