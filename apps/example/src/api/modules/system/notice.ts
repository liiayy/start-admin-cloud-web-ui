import request from '../../index.ts'

export interface NoticeVO {
  id: number
  title: string
  type: number
  content: string
  status: number
  creator?: string
  createTime?: string
  isRead?: boolean
  targetType?: number
  targetDepts?: string
  targetRoles?: string
  targetPosts?: string
}

export interface NoticePageParams {
  title?: string
  type?: number
  status?: number
  pageNum: number
  pageSize: number
}

export default {
  // 分页查询
  page: (params: NoticePageParams) => request.post<{ list: NoticeVO[], total: number }>('api/admin/system/notice/page', params),

  // 详情
  get: (id: number) => request.get<NoticeVO>(`api/admin/system/notice/${id}`),

  // 新增
  create: (data: Partial<NoticeVO>) => request.post('api/admin/system/notice', data),

  // 修改
  update: (data: Partial<NoticeVO>) => request.put('api/admin/system/notice', data),

  // 删除
  delete: (id: number) => request.delete(`api/admin/system/notice/${id}`),

  // 发布/推送公告
  publish: (id: number) => request.post(`api/admin/system/notice/publish/${id}`),

  // 获取未读
  getUnread: () => request.get<NoticeVO[]>('api/admin/system/notice/unread'),

  // 标为已读
  markRead: (id: number) => request.post(`api/admin/system/notice/read/${id}`),
}
