<script setup lang="ts">
import apiErrorLog from '@/api/modules/system/monitor/errorlog.ts'
import { useTable } from '@/composables/useTable.ts'
import DetailDialog from './components/DetailDialog.vue'

defineOptions({ name: 'MonitorErrorLog' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

const {
  loading,
  list: errorList,
  total,
  pagination,
  searchParams,
  selectedIds,
  getList,
  handleSearch,
  handleReset,
  handleSelectionChange,
} = useTable({
  api: apiErrorLog.list,
  defaultParams: {
    moduleName: '',
    errorType: '',
    handleStatus: null as number | null,
  },
})

const detailDialogRef = ref<InstanceType<typeof DetailDialog>>()

function handleDetail(row: any) {
  detailDialogRef.value?.open(row)
}

function handleDelete(row?: any) {
  const ids = row ? [row.id] : selectedIds.value
  useFaModal().confirm({
    title: '提示',
    content: `确认删除${row ? '该' : '选中的'}错误日志吗？`,
    onConfirm: async () => {
      await apiErrorLog.delete(ids)
      faToast.success('删除成功')
      await getList()
    },
  })
}

function handleClean() {
  useFaModal().confirm({
    title: '危险提示',
    content: '确认清空所有错误日志吗？该操作不可撤销！',
    onConfirm: async () => {
      await apiErrorLog.clean()
      faToast.success('清空成功')
      await getList()
    },
  })
}

async function handleUpdateStatus(row: any, status: number) {
  const statusName = status === 1 ? '已处理' : '已忽略'
  useFaModal().confirm({
    title: '提示',
    content: `确认将该错误标记为“${statusName}”吗？`,
    onConfirm: async () => {
      await apiErrorLog.updateStatus(row.id, status)
      faToast.success('操作成功')
      await getList()
    },
  })
}

async function handleTestError() {
  try {
    await apiErrorLog.triggerTestError()
  }
  catch {
    faToast.info('模拟异常已触发，请点击“搜索”刷新列表查看日志')
    getList()
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="模块名称">
              <FaInput v-model="searchParams.moduleName" placeholder="请输入模块名" clearable class="w-48" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="异常类型">
              <FaInput v-model="searchParams.errorType" placeholder="请输入异常类名" clearable class="w-48" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="处理状态">
              <DictSelect v-model="searchParams.handleStatus" type="sys_error_log_status" value-type="number" placeholder="请选择" clearable class="w-36" @change="handleSearch" />
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
        <div class="flex gap-2">
          <FaButton v-auth="'monitor:errorlog:remove'" type="danger" variant="outline" :disabled="!selectedIds.length" @click="handleDelete()">
            <FaIcon name="i-ri:delete-bin-line" />
            批量删除
          </FaButton>
        </div>
        <div class="flex gap-2">
          <FaButton v-auth="'monitor:errorlog:remove'" type="danger" @click="handleClean">
            <FaIcon name="i-ri:brush-line" />
            清空日志
          </FaButton>
          <FaButton type="warning" variant="outline" @click="handleTestError">
            <FaIcon name="i-ri:bug-line" />
            触发模拟异常
          </FaButton>
        </div>
      </div>

      <ElTable v-loading="loading" class="my-4" :data="errorList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined" @selection-change="handleSelectionChange">
        <ElTableColumn type="selection" width="55" align="center" />
        <ElTableColumn prop="moduleName" label="模块名称" width="150" align="center" />
        <ElTableColumn prop="errorType" label="异常类型" show-overflow-tooltip min-width="200" />
        <ElTableColumn prop="errorMessage" label="错误消息" show-overflow-tooltip min-width="300" />
        <ElTableColumn prop="occurrenceCount" label="次数" width="80" align="center">
          <template #default="{ row }">
            <ElTag v-if="row.occurrenceCount > 1" type="danger" effect="plain" size="small">
              {{ row.occurrenceCount }}
            </ElTag>
            <span v-else>{{ row.occurrenceCount }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="处理状态" prop="handleStatus" align="center" width="100">
          <template #default="{ row }">
            <DictTag :value="row.handleStatus" type="sys_error_log_status" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="userName" label="用户" width="100" align="center" />
        <ElTableColumn prop="lastTime" label="最后发生时间" width="170" align="center" />
        <ElTableColumn label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton variant="outline" size="icon-sm" title="详情" @click="handleDetail(row)">
                <FaIcon name="i-ri:eye-line" />
              </FaButton>
              <ElDropdown v-if="row.handleStatus === 0" trigger="click">
                <FaButton variant="outline" size="icon-sm" title="处理">
                  <FaIcon name="i-ri:checkbox-circle-line" />
                </FaButton>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem @click="handleUpdateStatus(row, 1)">
                      已解决
                    </ElDropdownItem>
                    <ElDropdownItem @click="handleUpdateStatus(row, 2)">
                      已忽略
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
              <FaButton v-auth="'monitor:errorlog:remove'" variant="outline" size="icon-sm" title="删除" @click="handleDelete(row)">
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

    <DetailDialog ref="detailDialogRef" @success="getList" />
  </div>
</template>
