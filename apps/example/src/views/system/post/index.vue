<script setup lang="ts">
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import type { PostInfo } from '@/api/modules/system/organization/post.ts'

import apiDept from '@/api/modules/system/organization/dept.ts'
import apiPost from '@/api/modules/system/organization/post.ts'
import { useTable } from '@/composables/useTable.ts'

import PostFormDialog from './components/PostFormDialog.vue'

defineOptions({ name: 'SystemPost' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

// 字典数据会自动加载

// === 部门树 ===
const deptTree = ref<DeptTreeNode[]>([])
const defaultExpandedKeys = ref<number[]>([])
const deptTreeRef = ref()

async function getDeptTree() {
  deptTree.value = await apiDept.tree()
  defaultExpandedKeys.value = deptTree.value.map(node => node.id)
}

// === API 表格 Hook 实战 ===
const {
  loading,
  list: postList,
  total,
  pagination,
  searchParams,
  getList,
  handleSearch,
  handleReset,
  handleCurrentChange,
  handleSizeChange,
} = useTable({
  api: apiPost.page,
  defaultParams: {
    deptId: null as number | null,
    name: '',
    status: null as number | null,
  },
})

function handleDeptNodeClick(data: DeptTreeNode) {
  searchParams.value.deptId = data.id
  handleSearch()
}

// === 弹窗控制 ===
const postFormDialogRef = ref<InstanceType<typeof PostFormDialog>>()

function handleAdd() {
  postFormDialogRef.value?.openAdd(searchParams.value.deptId)
}

function handleEdit(row: PostInfo) {
  postFormDialogRef.value?.openEdit(row)
}

// === 单行操作 ===
function handleDelete(row: PostInfo) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除岗位「${row.name}」吗？`,
    onConfirm: async () => {
      await apiPost.delete(row.id)
      faToast.success('删除成功')
      await getList()
    },
  })
}

async function handleStatusChange(row: PostInfo) {
  const newStatus = row.status === 0 ? 1 : 0
  try {
    await apiPost.updateStatus(row.id, newStatus)
    faToast.success('状态更新成功')
    await getList()
  }
  catch {
    // 自动恢复由于其基于原始 model 返回，如果刷新页面状态依然可见，也可以手动重新 getList()。
  }
}

// === 初始化 ===
onMounted(() => {
  getDeptTree()
  // 注意：useTable() 中带有 immediate: true 默认属性，它会自动触发首次 getList()
})
</script>

<template>
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageHeader title="岗位管理" />
    <FaPageMain :class="{ 'flex-1 overflow-auto overflow-x-hidden': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto overflow-x-hidden': tableAutoHeight }">
      <div class="flex gap-4" :class="{ 'flex-1 overflow-auto overflow-x-hidden': tableAutoHeight }">
        <!-- 左：部门树 -->
        <div class="p-3 border rounded-lg shrink-0 w-[240px] flex flex-col">
          <div class="text-sm text-gray-600 font-semibold mb-2">
            部门列表
          </div>
          <div class="flex-1 overflow-auto">
            <ElTree
              ref="deptTreeRef"
              :data="deptTree"
              :props="{ label: 'name', children: 'children' }"
              node-key="id"
              highlight-current
              :default-expanded-keys="defaultExpandedKeys"
              :expand-on-click-node="false"
              @node-click="handleDeptNodeClick"
            />
          </div>
        </div>

        <!-- 右：搜索 + 表格 + 分页 -->
        <div class="flex-1 min-w-0 flex flex-col">
          <!-- 搜索栏 -->
          <FaSearchBar :show-toggle="false">
            <template #default>
              <div class="flex flex-wrap gap-3 items-center">
                <FaLabel label="岗位名称">
                  <FaInput v-model="searchParams.name" placeholder="请输入岗位名称" clearable class="w-44" @keyup.enter="handleSearch" />
                </FaLabel>
                <FaLabel label="所在部门">
                  <ElTreeSelect
                    v-model="searchParams.deptId"
                    :data="deptTree"
                    :props="{ label: 'name', value: 'id', children: 'children' }"
                    placeholder="请选择"
                    clearable
                    check-strictly
                    class="w-44"
                  />
                </FaLabel>
                <FaLabel label="状态">
                  <DictSelect v-model="searchParams.status" type="sys_status" value-type="number" placeholder="请选择" clearable class="w-32" />
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

          <div class="my-4 border-t border-t-dashed" />

          <div class="flex-center-between gap-2">
            <div class="flex gap-2" />
            <FaButton v-auth="'system:post:add'" @click="handleAdd">
              <FaIcon name="i-ri:add-line" />
              新增岗位
            </FaButton>
          </div>

          <!-- 表格 -->
          <ElTable v-loading="loading" class="my-4" :data="postList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined">
            <ElTableColumn prop="code" label="岗位编码" width="150" />
            <ElTableColumn prop="name" label="岗位名称" width="150" />
            <ElTableColumn prop="deptName" label="所属部门" width="150" />
            <ElTableColumn prop="sort" label="排序" width="80" align="center" />
            <ElTableColumn label="状态" width="100" align="center">
              <template #default="{ row }">
                <ElSwitch v-auth="'system:post:update'" :model-value="row.status === 0" @change="handleStatusChange(row)" />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="remark" label="备注" min-width="200" show-overflow-tooltip />
            <ElTableColumn label="创建时间" width="180" align="center">
              <template #default="{ row }">
                {{ row.createTime }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <div class="flex-center gap-2">
                  <FaButton v-auth="'system:post:update'" variant="outline" size="icon-sm" @click="handleEdit(row)">
                    <FaIcon name="i-ri:edit-line" />
                  </FaButton>
                  <FaDropdown
                    :items="[
                      [
                        { label: '删除', icon: 'i-ri:delete-bin-line', variant: 'destructive', vAuth: 'system:post:delete', handle: () => handleDelete(row) },
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
        </div>
      </div>
    </FaPageMain>

    <!-- 抽离出的 新增/编辑弹窗 -->
    <PostFormDialog ref="postFormDialogRef" :dept-tree="deptTree" @success="getList" />
  </div>
</template>
