<script setup lang="ts">
import type { NoticeVO } from '@/api/modules/system/notice.ts'
import apiNotice from '@/api/modules/system/notice.ts'
import { useTable } from '@/composables/useTable.ts'
import NoticeFormDialog from './components/NoticeFormDialog.vue'

defineOptions({ name: 'SystemNotice' })

// 表格自适应高度
const tableAutoHeight = ref(true)

const {
  loading,
  list: noticeList,
  total,
  pagination,
  searchParams,
  getList,
  handleSearch,
  handleReset,
} = useTable({
  api: apiNotice.page,
  defaultParams: {
    title: '',
    type: undefined as number | undefined,
    status: undefined as number | undefined,
  },
})

const formDialogRef = ref<InstanceType<typeof NoticeFormDialog>>()

function handleAdd() {
  formDialogRef.value?.openAdd()
}

function handleEdit(row: NoticeVO) {
  formDialogRef.value?.openEdit(row)
}

// 删除操作
function handleDelete(row: NoticeVO) {
  useFaModal().confirm({
    title: '警告',
    content: `确认删除公告「${row.title}」吗？`,
    onConfirm: async () => {
      await apiNotice.delete(row.id)
      faToast.success('删除成功')
      await getList()
    },
  })
}

// 推送发布公告
function handlePublish(row: NoticeVO) {
  const isTargeted = row.targetType === 1
  useFaModal().confirm({
    title: isTargeted ? '定向推送提示' : '广播提示',
    content: isTargeted
      ? `确定要定向推送通知「${row.title}」给指定范围内的用户吗？`
      : `确定要全员广播推送通知「${row.title}」吗？`,
    onConfirm: async () => {
      await apiNotice.publish(row.id)
      faToast.success(isTargeted ? '定向推送成功' : '广播推送成功')
      await getList()
    },
  })
}
</script>

<template>
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="公告标题">
              <FaInput v-model="searchParams.title" placeholder="请输入标题" clearable class="w-48" @keyup.enter="handleSearch" />
            </FaLabel>

            <FaLabel label="公告类型">
              <ElSelect v-model="searchParams.type" placeholder="请选择" clearable class="w-36">
                <ElOption label="通知" :value="1" />
                <ElOption label="公告" :value="2" />
              </ElSelect>
            </FaLabel>

            <FaLabel label="状态">
              <ElSelect v-model="searchParams.status" placeholder="请选择" clearable class="w-36">
                <ElOption label="正常" :value="0" />
                <ElOption label="关闭" :value="1" />
              </ElSelect>
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
        <FaButton v-auth="'system:notice:add'" @click="handleAdd">
          <FaIcon name="i-ri:add-line" />
          新增通知公告
        </FaButton>
      </div>

      <!-- 表格内容 -->
      <ElTable
        v-loading="loading"
        class="my-4"
        :data="noticeList"
        stripe
        highlight-current-row
        border
        :height="tableAutoHeight ? '100%' : undefined"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn prop="title" label="公告标题" min-width="200" show-overflow-tooltip />

        <ElTableColumn prop="type" label="公告类型" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="row.type === 1 ? 'primary' : 'success'">
              {{ row.type === 1 ? '通知' : '公告' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === 0 ? 'success' : 'info'">
              {{ row.status === 0 ? '正常' : '关闭' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="targetType" label="发布范围" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="row.targetType === 1 ? 'warning' : 'info'">
              {{ row.targetType === 1 ? '指定' : '全部' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="creator" label="创建人" width="120" align="center" />

        <ElTableColumn prop="createTime" label="创建时间" width="180" align="center" />

        <!-- 操作 -->
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton v-auth="'system:notice:update'" variant="outline" size="icon-sm" title="编辑" @click="handleEdit(row)">
                <FaIcon name="i-ri:edit-line" />
              </FaButton>

              <FaButton
                v-if="row.status === 0"
                v-auth="'system:notice:publish'"
                variant="outline"
                size="icon-sm"
                title="推送发布"
                @click="handlePublish(row)"
              >
                <FaIcon name="i-ri:send-plane-fill" />
              </FaButton>

              <FaButton v-auth="'system:notice:delete'" variant="outline" size="icon-sm" title="删除" @click="handleDelete(row)">
                <FaIcon name="i-ri:delete-bin-line" />
              </FaButton>
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

    <!-- 编辑弹窗 -->
    <NoticeFormDialog ref="formDialogRef" @success="getList" />
  </div>
</template>
