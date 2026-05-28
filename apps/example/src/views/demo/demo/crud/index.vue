<script setup lang="ts">
import apiDemo from '@/api/modules/demo'
import { useTable } from '@/composables/useTable'
import DemoFormDialog from './components/DemoFormDialog.vue'

defineOptions({
  name: 'DemoCrud',
})

// === 使用 Hook 管理表格基础逻辑 ===
const {
  loading,
  list: dataList,
  total,
  pagination,
  searchParams,
  getList,
  handleSearch,
  handleReset,
} = useTable({
  api: apiDemo.page,
  defaultParams: {
    name: '',
  },
})

// 表格是否自适应高度
const tableAutoHeight = ref(true)

// 弹窗控制
const formDialogRef = ref<InstanceType<typeof DemoFormDialog>>()

function handleAdd() {
  formDialogRef.value?.openAdd()
}

function handleEdit(row: any) {
  formDialogRef.value?.openEdit(row)
}

function handleDelete(row: any) {
  useFaModal().confirm({
    title: '确认删除',
    content: `确认删除「${row.name}」吗？该操作不可撤销！`,
    onConfirm: async () => {
      await apiDemo.delete(row.id)
      faToast.success('删除成功')
      await getList()
    },
  })
}
</script>

<template>
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageHeader title="基础 CRUD 演示" class="mb-0">
      <template #description>
        <p>
          演示系统基础的数据库增删改查（CRUD）开发标准。包含后端分层架构（Controller -> Service -> Manager -> Mapper -> Entity）和前端 useTable / useFaModal 等最佳实践组件的使用。
        </p>
      </template>
    </FaPageHeader>

    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-4 items-center">
            <FaLabel label="产品名称">
              <FaInput
                v-model="searchParams.name"
                placeholder="请输入产品名称，支持模糊检索"
                clearable
                class="w-60"
                @keyup.enter="handleSearch"
                @clear="handleSearch"
              />
            </FaLabel>
            <div class="flex gap-2">
              <FaButton variant="outline" @click="handleReset">
                <FaIcon name="i-ri:refresh-line" />
                重置
              </FaButton>
              <FaButton type="primary" @click="handleSearch">
                <FaIcon name="i-ri:search-line" />
                查询
              </FaButton>
            </div>
          </div>
        </template>
      </FaSearchBar>

      <div class="mx--5 my-4 border-t border-t-dashed" />

      <!-- 工具栏 -->
      <div class="mb-4 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          演示数据来源于 PostgreSQL <code>demo</code> 表
        </div>
        <FaButton v-auth="'demo:product:create'" @click="handleAdd">
          <FaIcon name="i-ri:add-line" />
          新增演示数据
        </FaButton>
      </div>

      <!-- 表格 -->
      <ElTable v-loading="loading" :data="dataList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined" class="mb-4 w-full">
        <ElTableColumn prop="id" label="ID" width="100" align="center" />
        <ElTableColumn prop="name" label="名称" min-width="180" show-overflow-tooltip />
        <ElTableColumn prop="creator" label="创建人" width="150" align="center" />
        <ElTableColumn prop="createTime" label="创建时间" width="180" align="center" />
        <ElTableColumn prop="updater" label="更新人" width="150" align="center" />
        <ElTableColumn prop="updateTime" label="更新时间" width="180" align="center" />
        <ElTableColumn label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2 items-center justify-center">
              <FaButton v-auth="'demo:product:update'" variant="outline" size="icon-sm" @click="handleEdit(row)">
                <FaIcon name="i-ri:edit-line" />
              </FaButton>
              <FaDropdown
                :items="[
                  [
                    { label: '删除', icon: 'i-ri:delete-bin-line', variant: 'destructive', vAuth: 'demo:product:delete', handle: () => handleDelete(row) },
                  ],
                ]"
              >
                <FaButton variant="outline" size="icon-sm">
                  <FaIcon name="i-ri:more-line" />
                </FaButton>
              </FaDropdown>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <FaPagination
        v-model:page="pagination.pageNum"
        v-model:size="pagination.pageSize"
        :total="total"
        @page-change="getList"
        @size-change="getList"
      />
    </FaPageMain>

    <!-- 增改弹窗 -->
    <DemoFormDialog ref="formDialogRef" @success="getList" />
  </div>
</template>
