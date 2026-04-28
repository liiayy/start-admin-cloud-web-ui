import api from '@/api'

export interface OnlineUserDetail {
  userId: number
  username: string
  nickname: string
  loginIp: string
  loginDate: string
  sessionCount: number
}

export interface WebSocketOnlineVO {
  userCount: number
  sessionCount: number
  onlineUserIds: number[]
  userDetails: OnlineUserDetail[]
}

export default {
  // 获取在线用户列表
  getOnline: () => api.get<WebSocketOnlineVO>('api/admin/system/websocket/online'),
  
  // 强踢下线
  kickout: (userId: number) => api.delete(`api/admin/system/websocket/online/${userId}`),
}
