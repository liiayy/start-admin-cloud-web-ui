<script setup lang="ts">
import type { MenuTreeNode } from '@/api/modules/system/permission/menu.ts'

import apiMenu from '@/api/modules/system/permission/menu.ts'

import MenuFormDialog from './components/MenuFormDialog.vue'

defineOptions({ name: 'SystemMenu' })

const loading = ref(false)
const menuTree = ref<MenuTreeNode[]>([])
const searchName = ref('')

const typeMap: Record<number, string> = { 1: '目录', 2: '菜单', 3: '按钮' }
const typeTagType: Record<number, string> = { 1: 'warning', 2: 'success', 3: 'info' }

const filteredTree = computed(() => {
  if (!searchName.value) {
    return menuTree.value
  }
  return filterTree(menuTree.value, searchName.value)
})

function filterTree(tree: MenuTreeNode[], keyword: string): any[] {
  return tree.map((node) => {
    const children = node.children?.length ? filterTree(node.children as MenuTreeNode[], keyword) : []
    if (node.name.includes(keyword) || children.length > 0) {
      return { ...node, children: children.length > 0 ? children : node.children }
    }
    return null
  }).filter(Boolean)
}

async function getTree() {
  loading.value = true
  try {
    menuTree.value = await apiMenu.tree()
  }
  finally {
    loading.value = false
  }
}

// === 弹窗 ===
const menuFormDialogRef = ref<InstanceType<typeof MenuFormDialog>>()

function handleAdd(parentId = 0, type = 2) {
  menuFormDialogRef.value?.openAdd(parentId, type)
}

function handleEdit(row: MenuTreeNode) {
  menuFormDialogRef.value?.openEdit(row)
}

function handleDelete(row: MenuTreeNode) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除菜单「${row.name}」吗？`,
    onConfirm: async () => {
      await apiMenu.delete(row.id)
      faToast.success('删除成功')
      await getTree()
    },
  })
}

function handleReset() {
  searchName.value = ''
}

onMounted(() => {
  getTree()
})
</script>

<template>
  <div>
    <FaPageHeader title="菜单管理" />
    <FaPageMain>
      <!-- 搜索栏 -->
      <div class="mb-4 flex flex-wrap gap-3 items-center">
        <ElInput
          v-model="searchName"
          placeholder="搜索菜单名称"
          clearable
          class="w-60"
        />
        <FaButton variant="outline" @click="handleReset">
          <FaIcon name="i-ep:refresh" />
          重置
        </FaButton>
        <div class="flex-1" />
        <div class="flex gap-2">
          <FaButton v-auth="'system:menu:add'" @click="handleAdd(0, 1)">
            <FaIcon name="i-ep:plus" />
            新增目录
          </FaButton>
          <FaButton v-auth="'system:menu:add'" @click="handleAdd(0, 2)">
            <FaIcon name="i-ep:plus" />
            新增菜单
          </FaButton>
        </div>
      </div>

      <!-- 树形表格 -->
      <ElTable
        v-loading="loading"
        :data="filteredTree"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
      >
        <ElTableColumn prop="name" label="菜单名称" min-width="180" />
        <ElTableColumn label="类型" width="80" align="center">
          <template #default="{ row }">
            <ElTag :type="typeTagType[row.type]" size="small">
              {{ typeMap[row.type] }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sort" label="排序" width="70" align="center" />
        <ElTableColumn prop="permission" label="权限标识" width="180" show-overflow-tooltip />
        <ElTableColumn prop="path" label="路由地址" width="160" show-overflow-tooltip />
        <ElTableColumn prop="component" label="组件路径" width="200" show-overflow-tooltip />
        <ElTableColumn label="状态" width="80" align="center">
          <template #default="{ row }">
            <DictTag type="sys_status" :value="row.status" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton v-if="row.type !== 3" v-auth="'system:menu:add'" link type="primary" size="small" @click="handleAdd(row.id, row.type === 1 ? 2 : 3)">
              新增
            </ElButton>
            <ElButton v-auth="'system:menu:update'" link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </ElButton>
            <ElButton v-auth="'system:menu:delete'" link type="danger" size="small" @click="handleDelete(row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </FaPageMain>

    <MenuFormDialog ref="menuFormDialogRef" :menu-tree="menuTree" @success="getTree" />
  </div>
</template>
