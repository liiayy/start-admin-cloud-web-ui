<script setup lang="ts">
import type { OnlineUserDetail } from '@/api/modules/system/monitor/websocket'
import dayjs from 'dayjs'
import apiWs from '@/api/modules/system/monitor/websocket'

defineOptions({ name: 'SystemOnline' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

const loading = ref(false)
const userCount = ref(0)
const sessionCount = ref(0)
const onlineUsers = ref<OnlineUserDetail[]>([])

// 搜索参数
const searchParams = ref({
  username: '',
  nickname: '',
})

// 重新加载列表
async function getList() {
  loading.value = true
  try {
    const res = await apiWs.getOnline()
    userCount.value = res.userCount
    sessionCount.value = res.sessionCount
    onlineUsers.value = res.userDetails || []
  }
  catch (error) {
    console.error('获取在线用户失败', error)
  }
  finally {
    loading.value = false
  }
}

// 前端本地模糊查询过滤
const filteredUsers = computed(() => {
  return onlineUsers.value.filter((user) => {
    const matchUsername = !searchParams.value.username || user.username.toLowerCase().includes(searchParams.value.username.toLowerCase())
    const matchNickname = !searchParams.value.nickname || (user.nickname && user.nickname.toLowerCase().includes(searchParams.value.nickname.toLowerCase()))
    return matchUsername && matchNickname
  })
})

// 重置搜索
function handleReset() {
  searchParams.value.username = ''
  searchParams.value.nickname = ''
}

// 强制踢出下线
function handleKickout(row: OnlineUserDetail) {
  useFaModal().confirm({
    title: '警告',
    content: `确认将用户「${row.nickname || row.username}」强制下线吗？`,
    onConfirm: async () => {
      await apiWs.kickout(row.userId)
      faToast.success('操作成功，已推送强制下线指令')
      await getList()
    },
  })
}

// 格式化日期时间
function formatTime(timeStr?: string) {
  if (!timeStr) {
    return '-'
  }
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 顶部统计面板 -->
      <div class="mb-6 shrink-0 gap-4 grid grid-cols-1 md:grid-cols-2">
        <div class="p-4 border rounded-lg bg-[oklch(var(--accent)/0.1)] flex gap-4 items-center">
          <div class="text-primary p-3 rounded-full bg-primary/10">
            <FaIcon name="i-ri:user-shared-2-line" class="size-6" />
          </div>
          <div>
            <div class="text-sm text-muted-foreground font-medium">
              当前在线用户数
            </div>
            <div class="text-2xl font-bold mt-1">
              {{ userCount }} 人
            </div>
          </div>
        </div>

        <div class="p-4 border rounded-lg bg-[oklch(var(--accent)/0.1)] flex gap-4 items-center">
          <div class="text-primary p-3 rounded-full bg-primary/10">
            <FaIcon name="i-ri:links-line" class="size-6" />
          </div>
          <div>
            <div class="text-sm text-muted-foreground font-medium">
              总会话连接数
            </div>
            <div class="text-2xl font-bold mt-1">
              {{ sessionCount }} 个
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false" class="shrink-0">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="用户名">
              <el-input v-model="searchParams.username" placeholder="请输入用户名" clearable class="w-48" />
            </FaLabel>
            <FaLabel label="用户昵称">
              <el-input v-model="searchParams.nickname" placeholder="请输入用户昵称" clearable class="w-48" />
            </FaLabel>
            <FaButton size="sm" @click="getList">
              <FaIcon name="i-ri:refresh-line" />
              刷新
            </FaButton>
            <FaButton size="sm" variant="outline" @click="handleReset">
              <FaIcon name="i-ri:delete-bin-line" />
              重置
            </FaButton>
          </div>
        </template>
      </FaSearchBar>

      <div class="mx--5 my-4 border-t border-t-dashed shrink-0" />

      <!-- 在线用户表格 -->
      <ElTable
        v-loading="loading"
        :data="filteredUsers"

        stripe highlight-current-row border
        class="flex-1"
        :height="tableAutoHeight ? '100%' : undefined"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn prop="username" label="用户名" min-width="120" />
        <ElTableColumn prop="nickname" label="用户昵称" min-width="120" />
        <ElTableColumn prop="loginIp" label="最后登录IP" min-width="140" align="center" />
        <ElTableColumn label="最后登录时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.loginDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sessionCount" label="当前多开连接数" width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="row.sessionCount > 1 ? 'warning' : 'success'" effect="dark">
              {{ row.sessionCount }}
            </el-tag>
          </template>
        </ElTableColumn>

        <!-- 操作列 -->
        <ElTableColumn label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <FaButton
              v-auth="'monitor:websocket:kickout'"
              variant="outline"
              size="icon-sm"
              title="强踢下线"
              @click="handleKickout(row)"
            >
              <FaIcon name="i-ri:logout-circle-r-line" />
            </FaButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </FaPageMain>
  </div>
</template>
