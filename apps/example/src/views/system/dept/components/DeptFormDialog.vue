<script setup lang="ts">
import apiDept from '@/api/modules/system/organization/dept.ts'

const props = defineProps<{
  deptTree: any[]
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

// 字典数据会自动加载

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const editId = ref<number>()
const formRef = ref()

const formData = reactive({
  name: '',
  parentId: 0,
  sort: 0,
  leaderUserId: null as number | null,
  phone: '',
  email: '',
  status: 0,
  remark: '',
})

const formRules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
}

const cascaderOptions = computed(() => {
  return buildCascaderOptions(props.deptTree, isEdit.value ? editId.value : undefined)
})

function buildCascaderOptions(tree: any[], excludeId?: number): any[] {
  return tree
    .filter((node: any) => node.id !== excludeId)
    .map((node: any) => ({
      value: node.id,
      label: node.name,
      children: (node.children && node.children.length > 0) ? buildCascaderOptions(node.children, excludeId) : undefined,
    }))
}

function findPath(tree: any[], targetId: number, path: number[] = []): number[] {
  for (const node of tree) {
    if (node.id === targetId) {
      return [...path, node.id]
    }
    if (node.children && node.children.length > 0) {
      const result = findPath(node.children, targetId, [...path, node.id])
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
  return findPath(props.deptTree, formData.parentId)
}

function handleParentChange(value: any) {
  formData.parentId = value && value.length > 0 ? (value[value.length - 1] as number) : 0
}

function openCreate(parentId = 0) {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增部门'
  Object.assign(formData, {
    name: '',
    parentId,
    sort: 0,
    leaderUserId: null,
    phone: '',
    email: '',
    status: 0,
    remark: '',
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  visible.value = true
}

function openEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑部门'
  Object.assign(formData, {
    name: row.name,
    parentId: row.parentId || 0,
    sort: row.sort,
    leaderUserId: row.leaderUserId,
    phone: row.phone || '',
    email: row.email || '',
    status: row.status,
    remark: row.remark || '',
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  visible.value = true
}

defineExpose({ openCreate, openEdit })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (isEdit.value) {
      await apiDept.update(editId.value!, formData)
      faToast.success('更新成功')
    }
    else {
      await apiDept.create(formData)
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
  <FaModal v-model="visible" :title="dialogTitle" class="max-w-lg">
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <ElFormItem label="上级部门">
        <ElCascader
          :model-value="getParentCascaderValue()"
          :options="cascaderOptions"
          :props="{ checkStrictly: true, value: 'value', label: 'label', children: 'children' }"
          placeholder="顶级部门"
          clearable
          class="w-full"
          @change="handleParentChange"
        />
      </ElFormItem>
      <ElFormItem label="部门名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入部门名称" />
      </ElFormItem>
      <ElFormItem label="显示顺序" prop="sort">
        <ElInputNumber v-model="formData.sort" :min="0" controls-position="right" />
      </ElFormItem>
      <ElFormItem label="负责人">
        <ElInput v-model="formData.leaderUserId" placeholder="请输入负责人" />
      </ElFormItem>
      <ElFormItem label="联系电话">
        <ElInput v-model="formData.phone" placeholder="请输入联系电话" />
      </ElFormItem>
      <ElFormItem label="邮箱">
        <ElInput v-model="formData.email" placeholder="请输入邮箱" />
      </ElFormItem>
      <ElFormItem label="状态">
        <DictRadio v-model="formData.status" type="sys_status" value-type="number" />
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
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
