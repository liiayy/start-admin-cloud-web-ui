<script setup lang="ts">
import apiLoginLog from '@/api/modules/system/monitor/loginlog.ts'
import { useTable } from '@/composables/useTable.ts'

defineOptions({ name: 'MonitorLoginLog' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

// 字典数据会自动加载

const {
  loading,
  list: logList,
  total,
  pagination,
  searchParams,
  selectedIds,
  getList,
  handleSearch,
  handleReset,
  handleCurrentChange,
  handleSizeChange,
  handleSelectionChange,
} = useTable({
  api: apiLoginLog.list,
  defaultParams: {
    username: '',
    loginIp: '',
    status: null as number | null,
  },
})

function handleDelete(row?: any) {
  const ids = row ? row.id : selectedIds.value.join(',')
  useFaModal().confirm({
    title: '提示',
    content: `确认删除${row ? '该' : '选中的'}登录日志吗？`,
    onConfirm: async () => {
      await apiLoginLog.delete(ids)
      faToast.success('删除成功')
      await getList()
    },
  })
}

function handleClean() {
  useFaModal().confirm({
    title: '危险提示',
    content: '确认清空所有登录日志吗？该操作不可撤销！',
    onConfirm: async () => {
      await apiLoginLog.clean()
      faToast.success('清空成功')
      await getList()
    },
  })
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageHeader title="登录日志" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="用户账号">
              <FaInput v-model="searchParams.username" placeholder="请输入用户账号" clearable class="w-48" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="登录地址">
              <FaInput v-model="searchParams.loginIp" placeholder="请输入登录地址" clearable class="w-48" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="状态">
              <DictSelect v-model="searchParams.status" type="sys_common_status" value-type="number" placeholder="请选择" clearable class="w-36" />
            </FaLabel>
            <FaButton @click="handleSearch">
              <FaIcon name="i-ri:search-line" />
              搜索
            </FaButton>
            <FaButton variant="outline" @click="handleReset">
              <FaIcon name="i-ri:refresh-line" />
              重置
            </FaButton>
          </div>
        </template>
      </FaSearchBar>

      <div class="mx--5 my-4 border-t border-t-dashed" />

      <div class="flex-center-between gap-2">
        <div class="flex gap-2" />
        <div class="flex gap-2">
          <FaButton v-auth="'monitor:loginlog:remove'" type="danger" variant="outline" :disabled="!selectedIds.length" @click="handleDelete()">
            <FaIcon name="i-ri:delete-bin-line" />
            批量删除
          </FaButton>
          <FaButton v-auth="'monitor:loginlog:remove'" type="danger" @click="handleClean">
            <FaIcon name="i-ri:brush-line" />
            清空日志
          </FaButton>
        </div>
      </div>

      <ElTable v-loading="loading" class="my-4" :data="logList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined" @selection-change="handleSelectionChange">
        <ElTableColumn type="selection" width="55" align="center" />
        <ElTableColumn prop="id" label="ID" width="100" />
        <ElTableColumn prop="username" label="用户账号" width="120" />
        <ElTableColumn prop="loginIp" label="登录地址" width="130" />
        <ElTableColumn prop="loginLocation" label="登录地点" width="180" />
        <ElTableColumn prop="browser" label="浏览器" width="150" />
        <ElTableColumn prop="os" label="操作系统" width="120" />
        <ElTableColumn label="状态" width="100" align="center">
          <template #default="{ row }">
            <DictTag type="sys_common_status" :value="row.status" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="msg" label="提示消息" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="createTime" label="访问时间" width="170" align="center" />
        <ElTableColumn label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton v-auth="'monitor:loginlog:remove'" variant="outline" size="icon-sm" @click="handleDelete(row)">
                <FaIcon name="i-ri:delete-bin-line" />
              </FaButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>

      <FaPagination
        v-model:page="pagination.pageNum"
        v-model:size="pagination.pageSize"
        :total="total"
        @page-change="getList"
        @size-change="getList"
      />
    </FaPageMain>
  </div>
</template>
