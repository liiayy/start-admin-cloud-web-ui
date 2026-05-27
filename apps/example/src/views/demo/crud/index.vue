<script setup lang="ts">
import apiDemo from '@/api/modules/demo'
import DemoFormDialog from './components/DemoFormDialog.vue'

defineOptions({
  name: 'DemoCrud',
})

const { pagination, onSizeChange, onCurrentChange } = usePagination()
const loading = ref(false)
const dataList = ref([])

// 搜索条件
const search = ref({
  name: '',
})

function searchReset() {
  search.value.name = ''
  currentChange()
}

function getDataList() {
  loading.value = true
  const params = {
    pageNum: pagination.value.page,
    pageSize: pagination.value.size,
    name: search.value.name || undefined,
  }
  apiDemo.page(params).then((res: any) => {
    loading.value = false
    dataList.value = res.list
    pagination.value.total = res.total
  }).catch(() => {
    loading.value = false
  })
}

// 每页数量切换
function sizeChange(size: number) {
  onSizeChange(size).then(() => getDataList())
}

// 当前页码切换
function currentChange(page = 1) {
  onCurrentChange(page).then(() => getDataList())
}

onMounted(() => {
  getDataList()
})

// 弹窗控制
const formDialogRef = ref<InstanceType<typeof DemoFormDialog>>()

function onCreate() {
  formDialogRef.value?.openAdd()
}

function onEdit(row: any) {
  formDialogRef.value?.openEdit(row)
}

function onDel(row: any) {
  useFaModal().confirm({
    title: '确认删除',
    content: `确认删除「${row.name}」吗？该操作不可撤销！`,
    onConfirm: () => {
      apiDemo.delete(row.id).then(() => {
        faToast.success('删除成功')
        getDataList()
      })
    },
  })
}
</script>

<template>
  <div>
    <FaPageHeader title="基础 CRUD 演示" class="mb-0">
      <template #description>
        <p>
          演示系统基础的数据库增删改查（CRUD）开发标准。包含后端分层架构（Controller -> Service -> Manager -> Mapper -> Entity）和前端 usePagination / useFaModal 等最佳实践组件的使用。
        </p>
      </template>
    </FaPageHeader>

    <FaPageMain>
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-4 items-center">
            <FaLabel label="产品名称">
              <FaInput
                v-model="search.name"
                placeholder="请输入产品名称，支持模糊检索"
                clearable
                class="w-60"
                @keydown.enter="currentChange()"
                @clear="currentChange()"
              />
            </FaLabel>
            <div class="flex gap-2">
              <FaButton variant="outline" @click="searchReset">
                <FaIcon name="i-ri:refresh-line" />
                重置
              </FaButton>
              <FaButton type="primary" @click="currentChange()">
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
        <FaButton v-auth="'demo:product:create'" @click="onCreate">
          <FaIcon name="i-ri:add-line" />
          新增演示数据
        </FaButton>
      </div>

      <!-- 表格 -->
      <ElTable v-loading="loading" :data="dataList" stripe highlight-current-row border class="mb-4 w-full">
        <ElTableColumn prop="id" label="ID" width="100" align="center" />
        <ElTableColumn prop="name" label="名称" min-width="180" show-overflow-tooltip />
        <ElTableColumn prop="creator" label="创建人" width="150" align="center" />
        <ElTableColumn prop="createTime" label="创建时间" width="180" align="center" />
        <ElTableColumn prop="updater" label="更新人" width="150" align="center" />
        <ElTableColumn prop="updateTime" label="更新时间" width="180" align="center" />
        <ElTableColumn label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2 items-center justify-center">
              <FaButton v-auth="'demo:product:update'" variant="outline" size="icon-sm" @click="onEdit(row)">
                <FaIcon name="i-ri:edit-line" />
              </FaButton>
              <FaDropdown
                :items="[
                  [
                    { label: '删除', icon: 'i-ri:delete-bin-line', variant: 'destructive', vAuth: 'demo:product:delete', handle: () => onDel(row) },
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
        :page="pagination.page"
        :size="pagination.size"
        :total="pagination.total"
        @page-change="currentChange"
        @size-change="sizeChange"
      />
    </FaPageMain>

    <!-- 增改弹窗 -->
    <DemoFormDialog ref="formDialogRef" @success="getDataList" />
  </div>
</template>
