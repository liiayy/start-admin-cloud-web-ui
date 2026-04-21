<script setup lang="ts">
import apiDept from '@/api/modules/system/organization/dept.ts'

import DeptFormDialog from './components/DeptFormDialog.vue'

defineOptions({ name: 'SystemDept' })

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

function handleAdd(parentId = 0) {
  deptFormDialogRef.value?.openAdd(parentId)
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
  <div>
    <FaPageHeader title="部门管理" />
    <FaPageMain>
      <!-- 搜索栏 -->
      <div class="mb-4 flex flex-wrap gap-3 items-center">
        <ElInput
          v-model="searchName"
          placeholder="搜索部门名称"
          clearable
          class="w-60"
        />
        <FaButton variant="outline" @click="handleReset">
          <FaIcon name="i-ep:refresh" />
          重置
        </FaButton>
        <div class="flex-1" />
        <FaButton v-auth="'system:dept:add'" @click="handleAdd(0)">
          <FaIcon name="i-ep:plus" />
          新增部门
        </FaButton>
      </div>

      <!-- 树形表格 -->
      <ElTable
        v-loading="loading"
        :data="filteredTree"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all border
      >
        <ElTableColumn prop="name" label="部门名称" min-width="200" />
        <ElTableColumn prop="sort" label="排序" width="80" align="center" />
        <ElTableColumn prop="phone" label="联系电话" width="140" />
        <ElTableColumn prop="email" label="邮箱" width="180" />
        <ElTableColumn label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElSwitch v-auth="'system:dept:update'" :model-value="row.status === 0" @change="handleStatusChange(row)" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton v-auth="'system:dept:add'" link type="primary" size="small" @click="handleAdd(row.id)">
              新增
            </ElButton>
            <ElButton v-auth="'system:dept:update'" link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </ElButton>
            <ElButton v-auth="'system:dept:delete'" link type="danger" size="small" @click="handleDelete(row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </FaPageMain>

    <DeptFormDialog ref="deptFormDialogRef" :dept-tree="deptTree" @success="getTree" />
  </div>
</template>
