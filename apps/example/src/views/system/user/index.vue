<script setup lang="ts">
import type { UserInfo } from '@/api/modules/system/auth/user.ts'
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import apiUser from '@/api/modules/system/auth/user.ts'
import apiDept from '@/api/modules/system/organization/dept.ts'
import { useTable } from '@/composables/useTable.ts'
import { SecurityConstants } from '@/constants/SecurityConstants.ts'

import AssignRoleDialog from './components/AssignRoleDialog.vue'
import ResetPwdDialog from './components/ResetPwdDialog.vue'
import UserFormDialog from './components/UserFormDialog.vue'

defineOptions({ name: 'SystemUser' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

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
function filterDeptNode(value: string, data: any) {
  if (!value) {
    return true
  }
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
} = useTable({
  api: apiUser.page,
  defaultParams: {
    deptId: null as number | null,
    username: '',
    mobile: '',
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
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageMain :class="{ 'flex-1 overflow-auto overflow-x-hidden': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto overflow-x-hidden': tableAutoHeight }">
      <div class="flex gap-4" :class="{ 'flex-1 overflow-auto overflow-x-hidden': tableAutoHeight }">
        <!-- 左：部门树 -->
        <div class="p-3 border rounded-lg flex shrink-0 flex-col w-[240px]">
          <div class="text-sm text-gray-600 font-semibold mb-2">
            部门组织
          </div>
          <FaInput v-model="searchDeptName" placeholder="过滤部门..." clearable class="mb-3">
            <template #start>
              <FaIcon name="i-ri:search-line" />
            </template>
          </FaInput>
          <div class="flex-1 overflow-auto">
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
        </div>

        <!-- 右：用户列表 -->
        <div class="flex flex-1 flex-col min-w-0">
          <FaSearchBar :show-toggle="false">
            <template #default>
              <div class="flex flex-wrap gap-3 items-center">
                <FaLabel label="用户名">
                  <FaInput v-model="searchParams.username" placeholder="请输入用户名" clearable class="w-44" @keyup.enter="handleSearch" />
                </FaLabel>
                <FaLabel label="手机号">
                  <FaInput v-model="searchParams.mobile" placeholder="请输入手机号" clearable class="w-44" @keyup.enter="handleSearch" />
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
            <FaButton v-auth="'system:user:add'" @click="handleAdd">
              <FaIcon name="i-ri:add-line" />
              新增用户
            </FaButton>
          </div>

          <ElTable v-loading="loading" class="my-4" :data="userList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined">
            <ElTableColumn prop="username" label="用户名" min-width="120" />
            <ElTableColumn prop="nickname" label="昵称" min-width="120" />
            <ElTableColumn prop="deptName" label="部门" width="150" />
            <ElTableColumn prop="mobile" label="手机号码" width="140" />
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
            <ElTableColumn label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <div class="flex-center gap-2">
                  <template v-if="row.id !== SecurityConstants.SUPER_ADMIN_ID">
                    <FaButton v-auth="'system:user:update'" variant="outline" size="icon-sm" @click="handleEdit(row)">
                      <FaIcon name="i-ri:edit-line" />
                    </FaButton>
                    <FaDropdown
                      :items="[
                        [
                          { label: '分配角色', icon: 'i-ri:user-settings-line', vAuth: 'system:user:assign-role', handle: () => handleAssignRole(row) },
                          { label: '重置密码', icon: 'i-ri:lock-password-line', vAuth: 'system:user:reset-password', handle: () => handleResetPwd(row) },
                        ],
                        [
                          { label: '删除', icon: 'i-ri:delete-bin-line', variant: 'destructive', vAuth: 'system:user:delete', handle: () => handleDelete(row) },
                        ],
                      ]"
                    >
                      <FaButton variant="outline" size="icon-sm">
                        <FaIcon name="i-ri:more-line" />
                      </FaButton>
                    </FaDropdown>
                  </template>
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
        </div>
      </div>
    </FaPageMain>

    <!-- ==== 组装抽离出去的各个弹窗 ==== -->
    <UserFormDialog ref="userFormDialogRef" :dept-tree="deptTree" @success="getList" />
    <AssignRoleDialog ref="assignRoleDialogRef" @success="getList" />
    <ResetPwdDialog ref="resetPwdDialogRef" />
  </div>
</template>
