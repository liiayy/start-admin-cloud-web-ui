<script setup lang="ts">
import type { MenuTreeNode } from '@/api/modules/system/permission/menu.ts'

import apiMenu from '@/api/modules/system/permission/menu.ts'

import MenuFormDialog from './components/MenuFormDialog.vue'

defineOptions({ name: 'SystemMenu' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

const loading = ref(false)
const menuTree = ref<MenuTreeNode[]>([])
const searchName = ref('')

const typeMap: Record<number, string> = { 1: '目录', 2: '菜单', 3: '按钮' }
const typeTagType: Record<number, 'warning' | 'success' | 'info' | 'primary' | 'danger'> = { 1: 'warning', 2: 'success', 3: 'info' }

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
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageHeader title="菜单管理" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="菜单名称">
              <FaInput
                v-model="searchName"
                placeholder="请输入菜单名称"
                clearable
                class="w-60"
              />
            </FaLabel>
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
        <div class="flex gap-2">
          <FaButton v-auth="'system:menu:add'" @click="handleAdd(0, 1)">
            <FaIcon name="i-ri:folder-add-line" />
            新增目录
          </FaButton>
          <FaButton v-auth="'system:menu:add'" @click="handleAdd(0, 2)">
            <FaIcon name="i-ri:menu-add-line" />
            新增菜单
          </FaButton>
        </div>
      </div>

      <!-- 树形表格 -->
      <ElTable
        v-loading="loading"
        class="my-4"
        :data="filteredTree"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        stripe
        highlight-current-row
        border
        :height="tableAutoHeight ? '100%' : undefined"
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
        <ElTableColumn label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton v-auth="'system:menu:update'" variant="outline" size="icon-sm" @click="handleEdit(row)">
                <FaIcon name="i-ri:edit-line" />
              </FaButton>
              <FaDropdown
                :items="[
                  [
                    { label: '新增下级', icon: 'i-ri:add-line', hidden: row.type === 3, vAuth: 'system:menu:add', handle: () => handleAdd(row.id, row.type === 1 ? 2 : 3) },
                  ],
                  [
                    { label: '删除', icon: 'i-ri:delete-bin-line', variant: 'destructive', vAuth: 'system:menu:delete', handle: () => handleDelete(row) },
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

    <MenuFormDialog ref="menuFormDialogRef" :menu-tree="menuTree" @success="getTree" />
  </div>
</template>
