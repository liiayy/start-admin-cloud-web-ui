<script setup lang="ts">
import apiDept from '@/api/modules/system/organization/dept.ts'

import DeptFormDialog from './components/DeptFormDialog.vue'

defineOptions({ name: 'SystemDept' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

const loading = ref(false)
const deptTree = ref<any[]>([])
const searchName = ref('')

const filteredTree = computed(() => {
  if (!searchName.value) {
    return deptTree.value
  }
  return filterTree(deptTree.value, searchName.value)
})

function filterTree(tree: any[], keyword: string): any[] {
  return tree.map((node: any) => {
    const children = node.children ? filterTree(node.children, keyword) : []
    if (node.name.includes(keyword) || children.length > 0) {
      return { ...node, children: children.length > 0 ? children : node.children }
    }
    return null
  }).filter(Boolean)
}

async function getTree() {
  loading.value = true
  try {
    deptTree.value = await apiDept.tree()
  }
  finally {
    loading.value = false
  }
}

// === 弹窗控制 ===
const deptFormDialogRef = ref<InstanceType<typeof DeptFormDialog>>()

function handleCreate(parentId = 0) {
  deptFormDialogRef.value?.openCreate(parentId)
}

function handleEdit(row: any) {
  deptFormDialogRef.value?.openEdit(row)
}

// === 操作 ===
function handleDelete(row: any) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除部门「${row.name}」吗？`,
    onConfirm: async () => {
      await apiDept.delete(row.id)
      faToast.success('删除成功')
      await getTree()
    },
  })
}

function handleReset() {
  searchName.value = ''
}

async function handleStatusChange(row: any) {
  const newStatus = row.status === 0 ? 1 : 0
  try {
    await apiDept.updateStatus(row.id, newStatus)
    faToast.success('状态更新成功')
    await getTree()
  }
  catch {}
}

onMounted(() => {
  getTree()
})
</script>

<template>
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false" class="mb-4">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="部门名称">
              <el-input
                v-model="searchName"
                placeholder="请输入部门名称"
                clearable
                class="w-60"
              />
            </FaLabel>
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
        <FaButton v-auth="'system:dept:create'" @click="handleCreate(0)">
          <FaIcon name="i-ri:add-line" />
          新增部门
        </FaButton>
      </div>

      <!-- 树形表格 -->
      <ElTable
        v-loading="loading"
        class="my-4"
        :data="filteredTree"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
        stripe
        highlight-current-row
        border
        :height="tableAutoHeight ? '100%' : undefined"
      >
        <ElTableColumn prop="name" label="部门名称" min-width="200" />
        <ElTableColumn prop="sort" label="排序" width="80" align="center" />
        <ElTableColumn prop="phone" label="联系电话" width="140" />
        <ElTableColumn prop="email" label="邮箱" width="180" />
        <ElTableColumn label="状态" width="100" align="center">
          <template #default="{ row }">
            <FaSwitch v-auth="'system:dept:update'" :model-value="row.status === 0" @update:model-value="handleStatusChange(row)" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton v-auth="'system:dept:update'" variant="outline" size="icon-sm" @click="handleEdit(row)">
                <FaIcon name="i-ri:edit-line" />
              </FaButton>
              <FaDropdown
                :items="[
                  [
                    { label: '新增下级', icon: 'i-ri:add-line', vAuth: 'system:dept:create', handle: () => handleCreate(row.id) },
                  ],
                  [
                    { label: '删除', icon: 'i-ri:delete-bin-line', variant: 'destructive', vAuth: 'system:dept:delete', handle: () => handleDelete(row) },
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
    </FaPageMain>

    <DeptFormDialog ref="deptFormDialogRef" :dept-tree="deptTree" @success="getTree" />
  </div>
</template>
