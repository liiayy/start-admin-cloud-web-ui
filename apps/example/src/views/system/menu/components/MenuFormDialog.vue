<script setup lang="ts">
import type { MenuAddFormData, MenuTreeNode, MenuUpdateFormData } from '@/api/modules/system/permission/menu.ts'

import apiMenu from '@/api/modules/system/permission/menu.ts'
import FaIconPicker from '@/ui/components/FaIconPicker/index.vue'

const props = defineProps<{
  menuTree: MenuTreeNode[]
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const formData = reactive<MenuAddFormData & { id?: number }>({
  id: undefined,
  name: '',
  permission: '',
  type: 2,
  parentId: 0,
  sort: 0,
  path: '',
  component: '',
  componentName: '',
  icon: '',
  status: 0,
  visible: true,
  keepAlive: false,
  alwaysShow: false,
})

const formRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  sort: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
}

// 构建上级菜单级联选项
function buildParentOptions(tree: MenuTreeNode[], excludeId?: number): any[] {
  return tree
    .filter(node => node.type !== 3 && node.id !== excludeId)
    .map(node => ({
      value: node.id,
      label: node.name,
      children: node.children?.length
        ? buildParentOptions(node.children as MenuTreeNode[], excludeId)
        : undefined,
    }))
}

function findPathInTree(tree: MenuTreeNode[], targetId: number, path: number[] = []): number[] {
  for (const node of tree) {
    if (node.id === targetId) {
      return [...path, node.id]
    }
    if (node.children && node.children.length > 0) {
      const result = findPathInTree(node.children as MenuTreeNode[], targetId, [...path, node.id])
      if (result.length > 0) {
        return result
      }
    }
  }
  return []
}

function getParentCascaderValue(): number[] {
  if (!formData.parentId || formData.parentId === 0) {
    return []
  }
  return findPathInTree(props.menuTree, formData.parentId)
}

function handleParentChange(value: number[]) {
  formData.parentId = value.length > 0 ? value.at(-1) : 0
}

function resetForm() {
  Object.assign(formData, {
    id: undefined,
    name: '',
    permission: '',
    type: 2,
    parentId: 0,
    sort: 0,
    path: '',
    component: '',
    componentName: '',
    icon: '',
    status: 0,
    visible: true,
    keepAlive: false,
    alwaysShow: false,
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function openAdd(parentId = 0, type = 2) {
  isEdit.value = false
  dialogTitle.value = '新增菜单'
  resetForm()
  formData.parentId = parentId
  formData.type = type
  visible.value = true
}

function openEdit(row: MenuTreeNode) {
  isEdit.value = true
  dialogTitle.value = '编辑菜单'
  resetForm()
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    permission: row.permission || '',
    type: row.type,
    parentId: row.parentId || 0,
    sort: row.sort,
    path: row.path || '',
    component: row.component || '',
    componentName: row.componentName || '',
    icon: row.icon || '',
    status: row.status,
    visible: row.visible ?? true,
    keepAlive: row.keepAlive ?? false,
    alwaysShow: row.alwaysShow ?? false,
  })
  visible.value = true
}

defineExpose({ openAdd, openEdit })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (isEdit.value) {
      await apiMenu.update(formData as MenuUpdateFormData)
      faToast.success('更新成功')
    }
    else {
      await apiMenu.add(formData as MenuAddFormData)
      faToast.success('新增成功')
    }
    visible.value = false
    emit('success')
  }
  finally {
    formLoading.value = false
  }
}
</script>

<template>
  <FaModal v-model="visible" :title="dialogTitle" class="max-w-3xl!">
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="上级菜单">
            <ElCascader
              :model-value="getParentCascaderValue()"
              :options="buildParentOptions(menuTree, isEdit ? formData.id : undefined)"
              :props="{ checkStrictly: true, value: 'value', label: 'label', children: 'children' }"
              placeholder="顶级菜单"
              clearable
              style="width: 100%;"
              @change="handleParentChange"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="菜单类型" prop="type">
            <ElRadioGroup v-model="formData.type" :disabled="isEdit">
              <ElRadio :value="1">
                目录
              </ElRadio>
              <ElRadio :value="2">
                菜单
              </ElRadio>
              <ElRadio :value="3">
                按钮
              </ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="菜单名称" prop="name">
            <FaInput v-model="formData.name" placeholder="请输入菜单名称" />
          </ElFormItem>
        </ElCol>

        <!-- 按钮类型 -->
        <template v-if="formData.type === 3">
          <ElCol :span="12">
            <ElFormItem label="权限标识">
              <FaInput v-model="formData.permission" placeholder="如 system:user:add" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="显示排序" prop="sort">
              <FaNumberField v-model="formData.sort" :min="0" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="状态">
              <DictRadio v-model="formData.status" type="sys_status" value-type="number" />
            </ElFormItem>
          </ElCol>
        </template>

        <!-- 目录/菜单类型 -->
        <template v-if="formData.type !== 3">
          <ElCol :span="12">
            <ElFormItem label="路由地址">
              <FaInput v-model="formData.path" :placeholder="formData.type === 1 ? '如 /system' : '如 user'" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="formData.type === 2" :span="12">
            <ElFormItem label="组件路径">
              <FaInput v-model="formData.component" placeholder="如 system/user/index" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="formData.type === 2" :span="12">
            <ElFormItem label="组件名称">
              <FaInput v-model="formData.componentName" placeholder="如 SystemUser" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="菜单图标">
              <FaIconPicker v-model="formData.icon" placeholder="点击选择图标" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="权限标识">
              <FaInput v-model="formData.permission" placeholder="如 system:user:view" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="显示排序" prop="sort">
              <FaNumberField v-model="formData.sort" :min="0" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="状态">
              <DictRadio v-model="formData.status" type="sys_status" value-type="number" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="formData.type === 2" :span="12">
            <ElFormItem label="是否缓存">
              <FaSwitch v-model="formData.keepAlive" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="formData.type === 2" :span="12">
            <ElFormItem label="是否可见">
              <FaSwitch v-model="formData.visible" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="formData.type === 1" :span="12">
            <ElFormItem label="总是显示">
              <FaSwitch v-model="formData.alwaysShow" />
            </ElFormItem>
          </ElCol>
        </template>
      </ElRow>
    </ElForm>
    <template #footer>
      <FaButton variant="outline" @click="visible = false">
        取消
      </FaButton>
      <FaButton :loading="formLoading" @click="handleSubmit">
        确定
      </FaButton>
    </template>
  </FaModal>
</template>
