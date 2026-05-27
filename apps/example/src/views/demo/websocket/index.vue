<script setup lang="ts">
import apiDemo from '@/api/modules/demo'
import { useWebSocket } from '@/composables/useWebSocket'

defineOptions({
  name: 'DemoWebsocket',
})

const { isConnected, status, onAnyMessage } = useWebSocket()

// 消息列表
const logs = ref<Array<{
  id: string
  type: string
  title: string
  content: string
  time: string
}>>([])

// 发送消息表单
const pushForm = reactive({
  type: 'broadcast', // broadcast | user
  userId: 1,
  title: '温馨提示',
  message: '这是一条演示消息，来自 Demo 微服务的实时推送！',
})

// 监听任何消息并写入日志面板
let destroyListener: () => void

onMounted(() => {
  destroyListener = onAnyMessage((data: any, raw: any) => {
    logs.value.unshift({
      id: Math.random().toString(36).substring(2),
      type: raw.type || '未知类型',
      title: raw.title || '无标题',
      content: data?.message || JSON.stringify(data) || '无内容',
      time: new Date(raw.timestamp || Date.now()).toLocaleTimeString(),
    })
  })
})

onBeforeUnmount(() => {
  if (destroyListener) {
    destroyListener()
  }
})

// 触发推送
const sending = ref(false)
async function handleSend() {
  if (!pushForm.title || !pushForm.message) {
    faToast.warning('请输入标题和内容')
    return
  }
  sending.value = true
  try {
    if (pushForm.type === 'broadcast') {
      await apiDemo.pushBroadcast(pushForm.title, pushForm.message)
      faToast.success('广播推送成功！')
    }
    else {
      await apiDemo.pushToUser(pushForm.userId, pushForm.title, pushForm.message)
      faToast.success(`定向推送至用户 ${pushForm.userId} 成功！`)
    }
  }
  finally {
    sending.value = false
  }
}

function clearLogs() {
  logs.value = []
}
</script>

<template>
  <div>
    <FaPageHeader title="WebSocket 消息推送演示" class="mb-0">
      <template #description>
        <p>
          演示系统提供的分布式多实例 WebSocket 消息推送能力。消息发布到 Redis Pub/Sub 主题，再分发到匹配的在线用户端。当前页面采用 <code>useWebSocket</code> 智能监听，能够实时收集和渲染推送日志。
        </p>
      </template>
    </FaPageHeader>

    <FaPageMain>
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
        <!-- 消息推送控制器 -->
        <ElCard shadow="never" class="border">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">触发消息推送</span>
              <div class="flex gap-2 items-center">
                <span class="text-xs text-gray-400">连接状态:</span>
                <span
                  class="rounded-full h-2.5 w-2.5 inline-block"
                  :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
                />
                <span class="text-xs font-medium capitalize" :class="isConnected ? 'text-green-600' : 'text-red-500'">
                  {{ status }}
                </span>
              </div>
            </div>
          </template>

          <ElForm :model="pushForm" label-width="100px">
            <ElFormItem label="推送范围">
              <ElRadioGroup v-model="pushForm.type">
                <ElRadioButton label="broadcast">
                  全服广播 (Broadcast)
                </ElRadioButton>
                <ElRadioButton label="user">
                  定向用户 (To User)
                </ElRadioButton>
              </ElRadioGroup>
            </ElFormItem>

            <ElFormItem v-if="pushForm.type === 'user'" label="用户 ID">
              <ElInputNumber v-model="pushForm.userId" :min="1" placeholder="目标用户 ID" class="w-full" />
            </ElFormItem>

            <ElFormItem label="推送标题">
              <FaInput v-model="pushForm.title" placeholder="请输入通知标题" />
            </ElFormItem>

            <ElFormItem label="推送内容">
              <FaTextarea v-model="pushForm.message" :rows="4" placeholder="请输入通知内容" />
            </ElFormItem>

            <ElFormItem>
              <FaButton :loading="sending" type="primary" class="w-full justify-center" @click="handleSend">
                <FaIcon name="i-ri:send-plane-fill" />
                立即推送
              </FaButton>
            </ElFormItem>
          </ElForm>
        </ElCard>

        <!-- 实时日志面板 -->
        <ElCard shadow="never" class="border flex flex-col h-[400px]">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">WebSocket 接收日志</span>
              <FaButton variant="outline" size="sm" @click="clearLogs">
                <FaIcon name="i-ri:delete-bin-line" />
                清空日志
              </FaButton>
            </div>
          </template>

          <div class="pr-2 flex-1 h-[290px] overflow-y-auto space-y-3">
            <div v-if="logs.length === 0" class="text-gray-400 flex flex-col h-full items-center justify-center">
              <FaIcon name="i-ri:question-answer-line" class="text-4xl mb-2" />
              <span>暂未收到任何实时报文，请尝试在左侧点击发送</span>
            </div>

            <TransitionGroup name="list" tag="div" class="space-y-3">
              <div
                v-for="log in logs"
                :key="log.id"
                class="p-3 border rounded-lg bg-gray-50 transition-all duration-300 hover:border-blue-400"
              >
                <div class="text-xs mb-1 flex items-center justify-between">
                  <span class="font-mono px-2 py-0.5 rounded" :class="log.type === 'notification' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                    {{ log.type }}
                  </span>
                  <span class="text-gray-400">{{ log.time }}</span>
                </div>
                <div class="text-sm text-gray-800 font-bold mb-1">
                  {{ log.title }}
                </div>
                <div class="text-xs text-gray-600 font-mono break-all">
                  {{ log.content }}
                </div>
              </div>
            </TransitionGroup>
          </div>
        </ElCard>
      </div>
    </FaPageMain>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
