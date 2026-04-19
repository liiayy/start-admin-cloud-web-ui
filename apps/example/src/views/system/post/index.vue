<script setup lang="ts">
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import type { PostInfo } from '@/api/modules/system/organization/post.ts'

import apiDept from '@/api/modules/system/organization/dept.ts'
import apiPost from '@/api/modules/system/organization/post.ts'
import { useDict } from '@/composables/useDict.ts'
import { useTable } from '@/composables/useTable.ts'

import PostFormDialog from './components/PostFormDialog.vue'

defineOptions({ name: 'SystemPost' })

// 获取系统状态字典
const { sys_status } = useDict('sys_status')

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
  <div>
    <FaPageHeader title="岗位管理" />
    <FaPageMain>
      <div class="flex gap-4">
        <!-- 左：部门树 -->
        <div class="shrink-0 w-[280px]">
          <div class="p-3 border rounded-lg">
            <div class="text-sm text-gray-600 font-semibold mb-2">
              部门列表
            </div>
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
        <div class="flex-1 min-w-0">
          <!-- 搜索栏（直接双向绑定 searchParams） -->
          <div class="mb-4 flex flex-wrap gap-3 items-center">
            <ElInput
              v-model="searchParams.name"
              placeholder="岗位名称"
              clearable
              class="w-48"
              @keyup.enter="handleSearch"
            />
            <ElTreeSelect
              v-model="searchParams.deptId"
              :data="deptTree"
              :props="{ label: 'name', value: 'id', children: 'children' }"
              placeholder="所在部门"
              clearable
              check-strictly
              class="w-48"
            />
            <ElSelect v-model="searchParams.status" placeholder="岗位状态" clearable class="w-36">
              <ElOption
                v-for="dict in sys_status"
                :key="dict.value"
                :label="dict.label"
                :value="Number(dict.value)"
              />
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
            <FaButton v-auth="'system:post:add'" @click="handleAdd">
              <FaIcon name="i-ep:plus" />
              新增岗位
            </FaButton>
          </div>

          <!-- 表格 -->
          <ElTable v-loading="loading" :data="postList" border>
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
            <ElTableColumn label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <ElButton v-auth="'system:post:update'" link type="primary" size="small" @click="handleEdit(row)">
                  编辑
                </ElButton>
                <ElButton v-auth="'system:post:delete'" link type="danger" size="small" @click="handleDelete(row)">
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- 分页（对接 useTable 返回的属性与方法） -->
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
        </div>
      </div>
    </FaPageMain>

    <!-- 抽离出的 新增/编辑弹窗 -->
    <PostFormDialog ref="postFormDialogRef" :dept-tree="deptTree" @success="getList" />
  </div>
</template>
