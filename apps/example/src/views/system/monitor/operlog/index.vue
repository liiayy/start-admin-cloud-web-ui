<script setup lang="ts">
import apiOperLog from '@/api/modules/system/monitor/operlog.ts'
import { useTable } from '@/composables/useTable.ts'
import DetailDialog from './components/DetailDialog.vue'

defineOptions({ name: 'MonitorOperLog' })

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
  handleSelectionChange,
} = useTable({
  api: apiOperLog.list,
  defaultParams: {
    title: '',
    operName: '',
    businessType: null as number | null,
    status: null as number | null,
  },
})

const detailDialogRef = ref<InstanceType<typeof DetailDialog>>()

function handleDetail(row: any) {
  detailDialogRef.value?.open(row)
}

function handleDelete(row?: any) {
  const ids = row ? row.id : selectedIds.value.join(',')
  useFaModal().confirm({
    title: '提示',
    content: `确认删除${row ? '该' : '选中的'}操作日志吗？`,
    onConfirm: async () => {
      await apiOperLog.delete(ids)
      faToast.success('删除成功')
      await getList()
    },
  })
}

function handleClean() {
  useFaModal().confirm({
    title: '危险提示',
    content: '确认清空所有操作日志吗？该操作不可撤销！',
    onConfirm: async () => {
      await apiOperLog.clean()
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
    <FaPageHeader title="操作日志" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="系统模块">
              <FaInput v-model="searchParams.title" placeholder="请输入系统模块" clearable class="w-48" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="操作人员">
              <FaInput v-model="searchParams.operName" placeholder="请输入操作人员" clearable class="w-48" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="业务类型">
              <DictSelect v-model="searchParams.businessType" type="sys_oper_type" value-type="number" placeholder="请选择" clearable class="w-36" />
            </FaLabel>
            <FaLabel label="操作状态">
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
          <FaButton v-auth="'monitor:operlog:remove'" type="danger" variant="outline" :disabled="!selectedIds.length" @click="handleDelete()">
            <FaIcon name="i-ri:delete-bin-line" />
            批量删除
          </FaButton>
          <FaButton v-auth="'monitor:operlog:remove'" type="danger" @click="handleClean">
            <FaIcon name="i-ri:brush-line" />
            清空日志
          </FaButton>
        </div>
      </div>

      <ElTable v-loading="loading" class="my-4" :data="logList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined" @selection-change="handleSelectionChange">
        <ElTableColumn type="selection" width="55" align="center" />
        <ElTableColumn prop="id" label="日志编号" width="100" />
        <ElTableColumn prop="title" label="系统模块" />
        <ElTableColumn label="业务类型" width="100" align="center">
          <template #default="{ row }">
            <DictTag type="sys_oper_type" :value="row.businessType" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="operName" label="操作人员" width="120" />
        <ElTableColumn prop="operIp" label="操作地址" width="130" />
        <ElTableColumn prop="operLocation" label="操作地点" width="150" show-overflow-tooltip />
        <ElTableColumn label="操作状态" width="100" align="center">
          <template #default="{ row }">
            <DictTag type="sys_common_status" :value="row.status" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="操作时间" width="170" align="center" />
        <ElTableColumn prop="costTime" label="消耗时间" width="110" align="center">
          <template #default="{ row }">
            {{ row.costTime }}毫秒
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton variant="outline" size="icon-sm" @click="handleDetail(row)">
                <FaIcon name="i-ri:eye-line" />
              </FaButton>
              <FaButton v-auth="'monitor:operlog:remove'" variant="outline" size="icon-sm" @click="handleDelete(row)">
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

    <DetailDialog ref="detailDialogRef" />
  </div>
</template>
