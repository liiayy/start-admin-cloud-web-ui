<script setup lang="ts">
import type { MenuTreeNode } from '@/api/modules/system/permission/menu.ts'
import type { RoleInfo } from '@/api/modules/system/permission/role.ts'
import apiMenu from '@/api/modules/system/permission/menu.ts'
import apiRole from '@/api/modules/system/permission/role.ts'

const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const targetRoleId = ref<number>()
const targetRoleName = ref('')
const menuTree = ref<MenuTreeNode[]>([])
const menuTreeRef = ref()

async function openAssign(row: RoleInfo) {
  targetRoleId.value = row.id
  targetRoleName.value = row.name
  visible.value = true
  loading.value = true

  try {
    const [tree, menus] = await Promise.all([
      apiMenu.tree(),
      apiMenu.listByRole([row.id]),
    ])
    menuTree.value = tree

    const menuIds: number[] = Array.isArray(menus) ? menus.map((m: any) => m.id ?? m) : []
    const parentIds = new Set<number>()

    function collectParentIds(nodes: any[]) {
      for (const node of nodes) {
        if (node.children?.length) {
          parentIds.add(node.id)
          collectParentIds(node.children)
        }
      }
    }
    collectParentIds(tree)

    const leafIds = menuIds.filter((id: number) => !parentIds.has(id))
    await nextTick()
    menuTreeRef.value?.setCheckedKeys(leafIds)
  }
  finally {
    loading.value = false
  }
}

defineExpose({ openAssign })

async function handleSubmit() {
  saving.value = true
  try {
    const checkedKeys = menuTreeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() || []
    const allKeys = [...checkedKeys, ...halfCheckedKeys]

    await apiRole.assignMenus(targetRoleId.value!, allKeys)
    faToast.success('权限分配成功')
    visible.value = false
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <FaModal v-model="visible" :title="`分配权限 - ${targetRoleName}`" class="max-w-lg">
    <div v-loading="loading">
      <ElTree
        ref="menuTreeRef"
        :data="menuTree"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        show-checkbox
        :expand-on-click-node="false"
      />
    </div>
    <template #footer>
      <FaButton variant="outline" @click="visible = false">
        取消
      </FaButton>
      <FaButton :loading="saving" @click="handleSubmit">
        确定
      </FaButton>
    </template>
  </FaModal>
</template>
