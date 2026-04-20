<script setup lang="ts">
import type { UserInfo } from '@/api/modules/system/auth/user.ts'
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import apiUser from '@/api/modules/system/auth/user.ts'
import apiDept from '@/api/modules/system/organization/dept.ts'
import { useDict } from '@/composables/useDict.ts'
import { useTable } from '@/composables/useTable.ts'
import { SecurityConstants } from '@/constants/SecurityConstants.ts'

import AssignRoleDialog from './components/AssignRoleDialog.vue'
import ResetPwdDialog from './components/ResetPwdDialog.vue'
import UserFormDialog from './components/UserFormDialog.vue'

defineOptions({ name: 'SystemUser' })

// 获取系统字典（例如性别）
// 字典数据会自动加载，无需手动 useDict

// ===== 侧边栏：部门树 =====
const deptTree = ref<DeptTreeNode[]>([])
const deptTreeRef = ref()
const searchDeptName = ref('')

async function loadDeptTree() {
  deptTree.value = await apiDept.tree()
}

// 树过滤逻辑
function filterDeptNode(value: string, data: DeptTreeNode) {
  if (!value)
    return true
  return data.name.includes(value)
}

watch(searchDeptName, (val) => {
  deptTreeRef.value?.filter(val)
})

// ===== 主列表：采用 Hook 管理 =====
const {
  loading,
  list: userList,
  total,
  pagination,
  searchParams,
  getList,
  handleSearch,
  handleReset,
  handleCurrentChange,
  handleSizeChange,
} = useTable({
  api: apiUser.page,
  defaultParams: {
    deptId: null as number | null,
    username: '',
    phone: '',
    status: null as number | null,
  },
})

function handleDeptNodeClick(data: DeptTreeNode) {
  searchParams.value.deptId = data.id
  handleSearch()
}

// ===== 抽取出的弹窗模块 =====
const userFormDialogRef = ref<InstanceType<typeof UserFormDialog>>()
const assignRoleDialogRef = ref<InstanceType<typeof AssignRoleDialog>>()
const resetPwdDialogRef = ref<InstanceType<typeof ResetPwdDialog>>()

function handleAdd() {
  userFormDialogRef.value?.openAdd(searchParams.value.deptId)
}

function handleEdit(row: UserInfo) {
  userFormDialogRef.value?.openEdit(row)
}

function handleAssignRole(row: UserInfo) {
  assignRoleDialogRef.value?.openAssign(row)
}

function handleResetPwd(row: UserInfo) {
  resetPwdDialogRef.value?.openReset(row)
}

function handleDelete(row: UserInfo) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除用户「${row.username}」吗？`,
    onConfirm: async () => {
      await apiUser.delete(row.id)
      faToast.success('删除成功')
      await getList()
    },
  })
}

async function handleStatusChange(row: UserInfo) {
  const newStatus = row.status === 0 ? 1 : 0
  try {
    await apiUser.updateStatus(row.id, newStatus)
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
    <FaPageHeader title="用户管理" />
    <FaPageMain>
      <div class="flex gap-4">
        <!-- 左：部门树 -->
        <div class="p-3 border rounded-lg shrink-0 w-[280px]">
          <div class="text-sm text-gray-600 font-semibold mb-2">
            部门组织
          </div>
          <ElInput v-model="searchDeptName" placeholder="过滤部门..." clearable size="default" class="mb-3">
            <template #prefix>
              <FaIcon name="i-ep:search" />
            </template>
          </ElInput>
          <ElTree
            ref="deptTreeRef"
            :data="deptTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            highlight-current
            default-expand-all
            :expand-on-click-node="false"
            :filter-node-method="filterDeptNode"
            @node-click="handleDeptNodeClick"
          />
        </div>

        <!-- 右：用户列表 -->
        <div class="flex-1 min-w-0">
          <div class="mb-4 flex flex-wrap gap-3 items-center">
            <ElInput v-model="searchParams.username" placeholder="用户名" clearable class="w-48" @keyup.enter="handleSearch" />
            <ElInput v-model="searchParams.phone" placeholder="手机号" clearable class="w-48" @keyup.enter="handleSearch" />
            <DictSelect v-model="searchParams.status" type="sys_status" placeholder="状态" clearable class="w-36" />
            <FaButton @click="handleSearch">
              <FaIcon name="i-ep:search" />
              搜索
            </FaButton>
            <FaButton variant="outline" @click="handleReset">
              <FaIcon name="i-ep:refresh" />
              重置
            </FaButton>
            <div class="flex-1" />
            <FaButton v-auth="'system:user:add'" @click="handleAdd">
              <FaIcon name="i-ep:plus" />
              新增用户
            </FaButton>
          </div>

          <ElTable v-loading="loading" :data="userList" border>
            <ElTableColumn prop="username" label="用户名" width="120" />
            <ElTableColumn prop="nickname" label="昵称" width="120" />
            <ElTableColumn prop="deptName" label="部门" width="150" />
            <ElTableColumn prop="phone" label="手机号码" width="140" />
            <ElTableColumn label="性别" width="70" align="center">
              <template #default="{ row }">
                <DictTag type="sys_user_sex" :value="row.sex" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="状态" width="100" align="center">
              <template #default="{ row }">
                <ElSwitch v-auth="'system:user:update'" :model-value="row.status === 0" @change="handleStatusChange(row)" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="创建时间" width="170" align="center">
              <template #default="{ row }">
                {{ row.createTime }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="280" align="center" fixed="right">
              <template #default="{ row }">
                <!-- 避免超级管理员由于默认值无意义被修改 -->
                <template v-if="row.id !== SecurityConstants.SUPER_ADMIN_ID">
                  <ElButton v-auth="'system:user:update'" link type="primary" size="small" @click="handleEdit(row)">
                    编辑
                  </ElButton>
                  <ElButton v-auth="'system:user:assign-role'" link type="primary" size="small" @click="handleAssignRole(row)">
                    分配角色
                  </ElButton>
                  <ElButton v-auth="'system:user:reset-password'" link type="warning" size="small" @click="handleResetPwd(row)">
                    重置密码
                  </ElButton>
                  <ElButton v-auth="'system:user:delete'" link type="danger" size="small" @click="handleDelete(row)">
                    删除
                  </ElButton>
                </template>
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
        </div>
      </div>
    </FaPageMain>

    <!-- ==== 组装抽离出去的各个弹窗 ==== -->
    <UserFormDialog ref="userFormDialogRef" :dept-tree="deptTree" @success="getList" />
    <AssignRoleDialog ref="assignRoleDialogRef" @success="getList" />
    <ResetPwdDialog ref="resetPwdDialogRef" />
  </div>
</template>
