<script setup lang="ts">
import apiOperLog from '@/api/modules/system/monitor/operlog.ts'
import { useTable } from '@/composables/useTable.ts'
import DetailDialog from './components/DetailDialog.vue'

defineOptions({ name: 'MonitorOperLog' })

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
  <div>
    <FaPageHeader title="操作日志" />
    <FaPageMain>
      <div class="mb-4 flex flex-wrap gap-3 items-center">
        <ElInput v-model="searchParams.title" placeholder="系统模块" clearable class="w-48" @keyup.enter="handleSearch" />
        <ElInput v-model="searchParams.operName" placeholder="操作人员" clearable class="w-48" @keyup.enter="handleSearch" />
        <DictSelect v-model="searchParams.businessType" type="sys_oper_type" value-type="number" placeholder="业务类型" clearable class="w-36" />
        <DictSelect v-model="searchParams.status" type="sys_common_status" value-type="number" placeholder="操作状态" clearable class="w-36" />
        <FaButton @click="handleSearch">
          <FaIcon name="i-ep:search" />
          搜索
        </FaButton>
        <FaButton variant="outline" @click="handleReset">
          <FaIcon name="i-ep:refresh" />
          重置
        </FaButton>
        <div class="flex-1" />
        <FaButton v-auth="'monitor:operlog:remove'" type="danger" variant="outline" :disabled="!selectedIds.length" @click="handleDelete()">
          <FaIcon name="i-ep:delete" />
          批量删除
        </FaButton>
        <FaButton v-auth="'monitor:operlog:remove'" type="danger" @click="handleClean">
          <FaIcon name="i-ep:brush" />
          清空日志
        </FaButton>
      </div>

      <ElTable v-loading="loading" :data="logList" border @selection-change="handleSelectionChange">
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
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="handleDetail(row)">
              详情
            </ElButton>
            <ElButton v-auth="'monitor:operlog:remove'" link type="danger" size="small" @click="handleDelete(row)">
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

    <DetailDialog ref="detailDialogRef" />
  </div>
</template>
