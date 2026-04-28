<script setup lang="ts">
import { useAppNotificationStore } from '@/store/modules/app/notification'
import { useWebSocket } from '@/composables/useWebSocket'
import dayjs from 'dayjs'
import apiNotice from '@/api/modules/system/notice'

defineOptions({
  name: 'NotificationCenter',
})

const notificationStore = useAppNotificationStore()
const { onMessage } = useWebSocket()

// 注册 WebSocket 消息监听器，专门监听类型为 notification 的消息
onMounted(() => {
  const unsubscribe = onMessage('notification', (data, raw) => {
    notificationStore.addMessage(raw)

    // 触发通知提示框 (可选，利用 Element Plus 的 ElNotification)
    if (typeof window !== 'undefined' && 'ElNotification' in window) {
      // @ts-ignore
      ElNotification({
        title: raw.title || '新消息',
        message: data?.message || '',
        type: 'info',
        duration: 4500,
      })
    }
  })

  onUnmounted(() => {
    unsubscribe()
  })
})

/**
 * 格式化时间
 */
function formatTime(timestamp?: number) {
  if (!timestamp) return ''
  return dayjs(timestamp).format('MM-DD HH:mm')
}

/**
 * 标记单条为已读
 */
async function handleMarkAsRead(index: number, item: any) {
  notificationStore.markAsRead(index)
  if (item.data?.id) {
    try {
      await apiNotice.markRead(item.data.id)
    } catch (e) {
      console.error('Failed to mark notice as read', e)
    }
  }
}

/**
 * 全部标记为已读
 */
async function handleMarkAllAsRead() {
  const unreadItems = notificationStore.messages.filter(m => !m.read && m.data?.id)
  notificationStore.markAllAsRead()
  for (const item of unreadItems) {
    try {
      await apiNotice.markRead(item.data!.id)
    } catch (e) {
      console.error('Failed to mark notice as read', e)
    }
  }
}

/**
 * 清空所有消息
 */
async function handleClearAll() {
  // 在清空前将未读消息标为已读，防止刷新后重新拉取出来
  const unreadItems = notificationStore.messages.filter(m => !m.read && m.data?.id)
  notificationStore.clearAll()
  for (const item of unreadItems) {
    try {
      await apiNotice.markRead(item.data!.id)
    } catch (e) {
      console.error('Failed to mark notice as read', e)
    }
  }
}
</script>

<template>
  <div class="notification-center flex items-center">
    <el-popover
      placement="bottom-end"
      :width="320"
      trigger="click"
      popper-class="notification-popover"
    >
      <template #reference>
        <div class="flex items-center justify-center cursor-pointer">
          <el-badge
            :value="notificationStore.unreadCount"
            :max="99"
            :hidden="notificationStore.unreadCount === 0"
            class="badge-item"
          >
            <FaButton variant="ghost" size="icon-sm">
              <FaIcon name="i-ri:notification-3-line" class="size-5" />
            </FaButton>
          </el-badge>
        </div>
      </template>

      <div class="popover-content flex flex-col max-h-96">
        <!-- 头部 -->
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-b-[oklch(var(--border))]">
          <span class="text-sm font-bold text-foreground">通知中心 ({{ notificationStore.unreadCount }})</span>
          <div class="flex gap-2">
            <el-button
              v-if="notificationStore.messages.length > 0"
              type="primary"
              link
              size="small"
              @click="handleMarkAllAsRead"
            >
              全部已读
            </el-button>
            <el-button
              v-if="notificationStore.messages.length > 0"
              type="danger"
              link
              size="small"
              @click="handleClearAll"
            >
              清空
            </el-button>
          </div>
        </div>

        <!-- 列表 -->
        <div class="message-list flex-1 overflow-y-auto py-1 pr-1">
          <template v-if="notificationStore.messages.length > 0">
            <div
              v-for="(item, index) in notificationStore.messages"
              :key="index"
              class="message-item p-2 mb-1 rounded transition-colors cursor-pointer hover:bg-[oklch(var(--accent)/0.1)] relative flex flex-col gap-1"
              :class="{ 'unread': !item.read }"
              @click="handleMarkAsRead(index, item)"
            >
              <!-- 未读状态指示红点 -->
              <div v-if="!item.read" class="absolute size-2 rounded-full bg-destructive right-2 top-3" />

              <div class="message-title text-sm font-semibold text-foreground pr-4 truncate">
                {{ item.title || '通知' }}
              </div>
              <div class="message-body text-xs text-muted-foreground break-all">
                {{ item.data?.message || '' }}
              </div>
              <div class="message-time text-[10px] text-muted-foreground/60 text-right mt-1">
                {{ formatTime(item.timestamp) }}
              </div>
            </div>
          </template>
          <el-empty v-else description="暂无新通知" :image-size="60" class="py-4" />
        </div>
      </div>
    </el-popover>
  </div>
</template>

<style scoped>
.notification-center {
  height: var(--g-toolbar-height);
}

.popover-content {
  font-family: inherit;
}

.message-list {
  scrollbar-width: thin;
}

.unread .message-title {
  color: oklch(var(--primary));
}
.badge-item :deep(.el-badge__content) {
  transform: scale(0.75) translate(22px, -5px);
}
</style>
