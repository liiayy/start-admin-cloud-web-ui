<script setup lang="ts">
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import type { RoleInfo } from '@/api/modules/system/permission/role.ts'

import apiDept from '@/api/modules/system/organization/dept.ts'
import apiRole from '@/api/modules/system/permission/role.ts'
import { useTable } from '@/composables/useTable.ts'

import AssignPermDialog from './components/AssignPermDialog.vue'
import RoleFormDialog from './components/RoleFormDialog.vue'

defineOptions({ name: 'SystemRole' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

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

function handleCreate() {
  formDialogRef.value?.openCreate()
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
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="角色名称">
              <el-input v-model="searchParams.name" placeholder="请输入角色名称" clearable class="w-48" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="角色编码">
              <el-input v-model="searchParams.code" placeholder="请输入角色编码" clearable class="w-48" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="状态">
              <DictSelect v-model="searchParams.status" type="sys_status" value-type="number" placeholder="请选择" clearable class="w-36" />
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
        <FaButton v-auth="'system:role:create'" @click="handleCreate">
          <FaIcon name="i-ri:add-line" />
          新增角色
        </FaButton>
      </div>

      <!-- 表格 -->
      <ElTable v-loading="loading" class="my-4" :data="roleList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined">
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
        <ElTableColumn label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton v-auth="'system:role:update'" variant="outline" size="icon-sm" @click="handleEdit(row)">
                <FaIcon name="i-ri:edit-line" />
              </FaButton>
              <FaDropdown
                :items="[
                  [
                    { label: '分配权限', icon: 'i-ri:shield-keyhole-line', vAuth: 'system:role:update', handle: () => handleAssignPerm(row) },
                  ],
                  [
                    { label: '删除', icon: 'i-ri:delete-bin-line', variant: 'destructive', vAuth: 'system:role:delete', handle: () => handleDelete(row) },
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

    <!-- 弹窗组件 -->
    <RoleFormDialog ref="formDialogRef" :dept-tree="deptTree" @success="getList" />
    <AssignPermDialog ref="permDialogRef" />
  </div>
</template>
