import request from '../index.ts'

export interface DemoVO {
  id: number
  name: string
  creator?: string
  createTime?: string
  updater?: string
  updateTime?: string
}

export interface DemoPageParams {
  name?: string
  pageNum: number
  pageSize: number
}

export default {
  // 基础 CRUD
  page: (params: DemoPageParams) => request.get<{ list: DemoVO[], total: number }>('api/admin/demo/product/page', { params }),
  get: (id: number) => request.get<DemoVO>(`api/admin/demo/product/${id}`),
  create: (data: { name: string }) => request.post('api/admin/demo/product/create', data),
  update: (id: number, data: { name: string }) => request.put(`api/admin/demo/product/${id}`, data),
  delete: (id: number) => request.delete(`api/admin/demo/product/${id}`),

  // 基座与高级特性
  testIdempotent: (data: string) => request.post<string>('api/admin/demo/feature/idempotent', null, { params: { data } }),
  testException: () => request.get<void>('api/admin/demo/feature/exception'),
  testSysException: () => request.get<void>('api/admin/demo/feature/sys-exception'),
  getCache: (id: number) => request.get<DemoVO>('api/admin/demo/feature/cache', { params: { id } }),
  evictCache: (id: number) => request.delete<void>('api/admin/demo/feature/cache', { params: { id } }),
  testLock: (lockKey: string) => request.post<string>('api/admin/demo/feature/lock', null, { params: { lockKey } }),
  testRpcUser: (id: number) => request.get<any>('api/admin/demo/feature/rpc/user', { params: { id } }),
  testSeata: (userId: number, nickname: string, demoName: string, throwEx: boolean) => request.post<void>('api/admin/demo/feature/seata', null, { params: { userId, nickname, demoName, throwEx } }),
  pushBroadcast: (title: string, message: string) => request.post<void>('api/admin/demo/feature/push/broadcast', null, { params: { title, message } }),
  pushToUser: (userId: number, title: string, message: string) => request.post<void>('api/admin/demo/feature/push/user', null, { params: { userId, title, message } }),
  getDictSystemDemo: (sex?: number, status?: string) => request.get<any>('api/admin/demo/feature/dict-system-demo', { params: { sex, status } }),
}
