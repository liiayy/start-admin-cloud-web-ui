<script setup lang="ts">
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import type { RoleInfo } from '@/api/modules/system/permission/role.ts'

import apiDept from '@/api/modules/system/organization/dept.ts'
import apiRole from '@/api/modules/system/permission/role.ts'
import { useDict } from '@/composables/useDict.ts'
import { useTable } from '@/composables/useTable.ts'

import AssignPermDialog from './components/AssignPermDialog.vue'
import RoleFormDialog from './components/RoleFormDialog.vue'

defineOptions({ name: 'SystemRole' })

// 字典数据会自动加载

// === 使用封装好的 Table Hook ===
const {
  loading,
  list: roleList,
  total,
  pagination,
  searchParams,
  getList,
  handleSearch,
  handleReset,
  handleCurrentChange,
  handleSizeChange,
} = useTable({
  api: apiRole.page,
  defaultParams: {
    name: '',
    code: '',
    status: null as number | null,
  },
})

// === 部门树数据加载 (供字典表单使用) ===
const deptTree = ref<DeptTreeNode[]>([])
async function loadDeptTree() {
  try {
    deptTree.value = await apiDept.tree()
  }
  catch {}
}

const dataScopeMap: Record<number, string> = {
  1: '全部数据',
  2: '自定数据',
  3: '本部门数据',
  4: '本部门及以下',
}

// === 对接独立弹窗组件 ===
const formDialogRef = ref<InstanceType<typeof RoleFormDialog>>()
const permDialogRef = ref<InstanceType<typeof AssignPermDialog>>()

function handleAdd() {
  formDialogRef.value?.openAdd()
}

function handleEdit(row: RoleInfo) {
  formDialogRef.value?.openEdit(row)
}

function handleAssignPerm(row: RoleInfo) {
  permDialogRef.value?.openAssign(row)
}

// === 单行操作 ===
function handleDelete(row: RoleInfo) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除角色「${row.name}」吗？`,
    onConfirm: async () => {
      await apiRole.delete(row.id)
      faToast.success('删除成功')
      await getList()
    },
  })
}

async function handleStatusChange(row: RoleInfo) {
  const newStatus = row.status === 0 ? 1 : 0
  try {
    await apiRole.updateStatus(row.id, newStatus)
    faToast.success('状态更新成功')
    await getList()
  }
  catch {}
}

onMounted(() => {
  loadDeptTree()
})
</script>

<template>
  <div>
    <FaPageHeader title="角色管理" />
    <FaPageMain>
      <!-- 搜索栏 -->
      <div class="mb-4 flex flex-wrap gap-3 items-center">
        <ElInput
          v-model="searchParams.name"
          placeholder="角色名称"
          clearable
          class="w-48"
          @keyup.enter="handleSearch"
        />
        <ElInput
          v-model="searchParams.code"
          placeholder="角色编码"
          clearable
          class="w-48"
          @keyup.enter="handleSearch"
        />
        <DictSelect v-model="searchParams.status" type="sys_status" value-type="number" placeholder="状态" clearable class="w-36" />
        <FaButton @click="handleSearch">
          <FaIcon name="i-ep:search" />
          搜索
        </FaButton>
        <FaButton variant="outline" @click="handleReset">
          <FaIcon name="i-ep:refresh" />
          重置
        </FaButton>
        <div class="flex-1" />
        <FaButton v-auth="'system:role:add'" @click="handleAdd">
          <FaIcon name="i-ep:plus" />
          新增角色
        </FaButton>
      </div>

      <!-- 表格 -->
      <ElTable v-loading="loading" :data="roleList" border>
        <ElTableColumn prop="name" label="角色名称" width="150" />
        <ElTableColumn prop="code" label="角色编码" width="180" />
        <ElTableColumn prop="sort" label="排序" width="80" align="center" />
        <ElTableColumn label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElSwitch v-auth="'system:role:update'" :model-value="row.status === 0" @change="handleStatusChange(row)" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="数据范围" width="130" align="center">
          <template #default="{ row }">
            {{ dataScopeMap[row.dataScope] || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <ElTableColumn label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton v-auth="'system:role:update'" link type="primary" size="small" @click="handleAssignPerm(row)">
              分配权限
            </ElButton>
            <ElButton v-auth="'system:role:update'" link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </ElButton>
            <ElButton v-auth="'system:role:delete'" link type="danger" size="small" @click="handleDelete(row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
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

    <!-- 弹窗组件 -->
    <RoleFormDialog ref="formDialogRef" :dept-tree="deptTree" @success="getList" />
    <AssignPermDialog ref="permDialogRef" />
  </div>
</template>
