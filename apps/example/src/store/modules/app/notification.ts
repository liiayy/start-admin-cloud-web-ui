import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WebSocketMessage {
  type: string
  title?: string
  data?: {
    message?: string
    [key: string]: any
  }
  timestamp?: number
  read?: boolean
}

export const useAppNotificationStore = defineStore('appNotification', () => {
  const messages = ref<WebSocketMessage[]>([])

  /**
   * 添加新消息
   */
  function addMessage(msg: WebSocketMessage) {
    messages.value.unshift({
      ...msg,
      read: false,
      timestamp: msg.timestamp || Date.now(),
    })
  }

  /**
   * 标记所有为已读
   */
  function markAllAsRead() {
    messages.value.forEach((msg) => {
      msg.read = true
    })
  }

  /**
   * 标记单个消息为已读
   */
  function markAsRead(index: number) {
    if (messages.value[index]) {
      messages.value[index].read = true
    }
  }

  /**
   * 获取未读消息数
   */
  const unreadCount = computed(() => {
    return messages.value.filter(msg => !msg.read).length
  })

  /**
   * 清空所有消息
   */
  function clearAll() {
    messages.value = []
  }

  return {
    messages,
    unreadCount,
    addMessage,
    markAllAsRead,
    markAsRead,
    clearAll,
  }
})
