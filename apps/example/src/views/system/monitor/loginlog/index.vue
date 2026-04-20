<script setup lang="ts">
import apiLoginLog from '@/api/modules/system/monitor/loginlog.ts'
import { useDict } from '@/composables/useDict.ts'
import { useTable } from '@/composables/useTable.ts'

defineOptions({ name: 'MonitorLoginLog' })

const { sys_common_status } = useDict('sys_common_status')

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
  <div>
    <FaPageHeader title="登录日志" />
    <FaPageMain>
      <div class="mb-4 flex flex-wrap gap-3 items-center">
        <ElInput v-model="searchParams.username" placeholder="用户账号" clearable class="w-48" @keyup.enter="handleSearch" />
        <ElInput v-model="searchParams.loginIp" placeholder="登录地址" clearable class="w-48" @keyup.enter="handleSearch" />
        <ElSelect v-model="searchParams.status" placeholder="状态" clearable class="w-36">
          <ElOption v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="Number(dict.value)" />
        </ElSelect>
        <FaButton @click="handleSearch">
          <FaIcon name="i-ep:search" />
          搜索
        </FaButton>
        <FaButton variant="outline" @click="handleReset">
          <FaIcon name="i-ep:refresh" />
          重置
        </FaButton>
        <div class="flex-1" />
        <FaButton v-auth="'monitor:loginlog:remove'" type="danger" variant="outline" :disabled="!selectedIds.length" @click="handleDelete()">
          <FaIcon name="i-ep:delete" />
          批量删除
        </FaButton>
        <FaButton v-auth="'monitor:loginlog:remove'" type="danger" @click="handleClean">
          <FaIcon name="i-ep:brush" />
          清空日志
        </FaButton>
      </div>

      <ElTable v-loading="loading" :data="logList" border @selection-change="handleSelectionChange">
        <ElTableColumn type="selection" width="55" align="center" />
        <ElTableColumn prop="id" label="ID" width="100" />
        <ElTableColumn prop="username" label="用户账号" width="120" />
        <ElTableColumn prop="loginIp" label="登录地址" width="130" />
        <ElTableColumn prop="loginLocation" label="登录地点" width="180" />
        <ElTableColumn prop="browser" label="浏览器" width="150" />
        <ElTableColumn prop="os" label="操作系统" width="120" />
        <ElTableColumn label="状态" width="100" align="center">
          <template #default="{ row }">
            <DictTag :options="sys_common_status" :value="row.status" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="msg" label="提示消息" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="createTime" label="访问时间" width="170" align="center" />
        <ElTableColumn label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton v-auth="'monitor:loginlog:remove'" link type="danger" size="small" @click="handleDelete(row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </FaPageMain>
  </div>
</template>
