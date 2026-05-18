<script setup lang="ts">
import { onMounted, ref } from 'vue'
import apiDataTracer from '@/api/modules/system/monitor/datatracer.ts'
import { DataTracerTypeDesc } from '@/components/DataTracer/DataTracerTypeEnum.ts'
import { useTable } from '@/composables/useTable.ts'
import DetailDialog from './components/DetailDialog.vue'

defineOptions({ name: 'MonitorDataTracer' })

const tableAutoHeight = ref(true)
const dateRange = ref<[string, string] | []>([])

const {
  loading,
  list: logList,
  total,
  pagination,
  searchParams,
  selectedIds,
  getList,
  handleSearch,
  handleReset: baseHandleReset,
  handleSelectionChange,
} = useTable({
  api: apiDataTracer.list,
  defaultParams: {
    dataId: null as number | null,
    type: null as number | null,
    operName: '',
    beginTime: '',
    endTime: '',
  },
})

const detailDialogRef = ref<InstanceType<typeof DetailDialog>>()

function handleDateRangeChange(val: any) {
  if (val) {
    searchParams.value.beginTime = val[0]
    searchParams.value.endTime = val[1]
  }
  else {
    searchParams.value.beginTime = ''
    searchParams.value.endTime = ''
  }
}

function handleReset() {
  dateRange.value = []
  baseHandleReset()
}

function handleDetail(row: any) {
  detailDialogRef.value?.open(row)
}

function handleDelete(row?: any) {
  const ids = row ? row.id : selectedIds.value.join(',')
  useFaModal().confirm({
    title: '提示',
    content: `确认删除${row ? '该' : '选中的'}变更记录吗？`,
    onConfirm: async () => {
      await apiDataTracer.delete(ids)
      faToast.success('删除成功')
      await getList()
    },
  })
}

function handleClean() {
  useFaModal().confirm({
    title: '危险提示',
    content: '确认清空所有变更记录吗？该操作不可撤销！',
    onConfirm: async () => {
      await apiDataTracer.clean()
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
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="业务ID">
              <el-input-number v-model="searchParams.dataId" placeholder="请输入业务ID" :controls="false" clearable class="!w-44" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="业务类型">
              <el-select v-model="searchParams.type" placeholder="请选择" clearable class="!w-44" @change="handleSearch">
                <el-option
                  v-for="(label, value) in DataTracerTypeDesc"
                  :key="value"
                  :label="label"
                  :value="Number(value)"
                />
              </el-select>
            </FaLabel>
            <FaLabel label="操作人员">
              <el-input v-model="searchParams.operName" placeholder="请输入操作人员" clearable class="!w-44" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="操作时间">
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="!w-80"
                @change="handleDateRangeChange"
              />
            </FaLabel>
            <FaButton size="sm" @click="handleSearch">
              <FaIcon name="i-ri:search-line" />
              搜索
            </FaButton>
            <FaButton size="sm" variant="outline" @click="handleReset">
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
          <FaButton v-auth="'system:datatracer:remove'" type="danger" variant="outline" :disabled="!selectedIds.length" @click="handleDelete()">
            <FaIcon name="i-ri:delete-bin-line" />
            批量删除
          </FaButton>
          <FaButton v-auth="'system:datatracer:remove'" type="danger" @click="handleClean">
            <FaIcon name="i-ri:brush-line" />
            清空记录
          </FaButton>
        </div>
      </div>

      <ElTable v-loading="loading" class="my-4" :data="logList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined" @selection-change="handleSelectionChange">
        <ElTableColumn type="selection" width="55" align="center" />
        <ElTableColumn prop="id" label="记录编号" width="100" />
        <ElTableColumn label="业务类型" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'primary' : row.type === 2 ? 'success' : row.type === 3 ? 'warning' : row.type === 4 ? 'danger' : 'info'" effect="light">
              {{ DataTracerTypeDesc[row.type] || row.type }}
            </el-tag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="content" label="操作内容" show-overflow-tooltip />
        <ElTableColumn prop="operName" label="操作人员" width="120" />
        <ElTableColumn prop="operIp" label="操作地址" width="130" />
        <ElTableColumn prop="operLocation" label="操作地点" width="150" show-overflow-tooltip />
        <ElTableColumn prop="createTime" label="操作时间" width="170" align="center" />
        <ElTableColumn label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton variant="outline" size="icon-sm" @click="handleDetail(row)">
                <FaIcon name="i-ri:eye-line" />
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
