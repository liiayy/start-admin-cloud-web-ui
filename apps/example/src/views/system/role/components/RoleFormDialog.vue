<script setup lang="ts">
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import type { RoleCreateFormData, RoleInfo, RoleUpdateFormData } from '@/api/modules/system/permission/role.ts'
import apiRole from '@/api/modules/system/permission/role.ts'

defineProps<{
  deptTree: DeptTreeNode[]
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const deptTreeRef = ref()

const formData = reactive<RoleCreateFormData & { id?: number }>({
  id: undefined,
  name: '',
  code: '',
  sort: 0,
  status: 0,
  dataScope: 1,
  dataScopeDeptIds: '',
  type: 0,
  remark: '',
})

const formRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
}

const dataScopeOptions = [
  { label: '全部数据权限', value: 1 },
  { label: '自定数据权限', value: 2 },
  { label: '本部门数据权限', value: 3 },
  { label: '本部门及以下数据权限', value: 4 },
]

function resetForm() {
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    sort: 0,
    status: 0,
    dataScope: 1,
    dataScopeDeptIds: '',
    type: 0,
    remark: '',
  })
  if (deptTreeRef.value) {
    deptTreeRef.value.setCheckedKeys([])
  }
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function openCreate() {
  isEdit.value = false
  dialogTitle.value = '新增角色'
  resetForm()
  visible.value = true
}

async function openEdit(row: RoleInfo) {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  resetForm()
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    sort: row.sort,
    status: row.status,
    dataScope: row.dataScope || 1,
    dataScopeDeptIds: row.dataScopeDeptIds || '',
    type: row.type ?? 0,
    remark: row.remark || '',
  })

  visible.value = true

  if (formData.dataScope === 2 && formData.dataScopeDeptIds) {
    try {
      const ids: number[] = JSON.parse(formData.dataScopeDeptIds)
      await nextTick()
      deptTreeRef.value?.setCheckedKeys(ids)
    }
    catch {}
  }
}

defineExpose({ openCreate, openEdit })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    let deptIds = ''
    if (formData.dataScope === 2) {
      const checkedKeys = deptTreeRef.value?.getCheckedKeys() || []
      deptIds = JSON.stringify(checkedKeys)
    }

    if (isEdit.value) {
      const data: RoleUpdateFormData = {
        id: formData.id!,
        name: formData.name,
        code: formData.code,
        sort: formData.sort,
        status: formData.status,
        dataScope: formData.dataScope,
        dataScopeDeptIds: deptIds,
        type: formData.type,
        remark: formData.remark,
      }
      await apiRole.update(data)
      faToast.success('更新成功')
    }
    else {
      const data: RoleCreateFormData = {
        name: formData.name,
        code: formData.code,
        sort: formData.sort,
        status: formData.status,
        dataScope: formData.dataScope,
        dataScopeDeptIds: deptIds,
        remark: formData.remark,
      }
      await apiRole.create(data)
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
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="角色名称" prop="name">
            <FaInput v-model="formData.name" placeholder="请输入角色名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="角色编码" prop="code">
            <FaInput v-model="formData.code" placeholder="请输入角色编码" :disabled="isEdit" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="显示顺序" prop="sort">
            <FaNumberField v-model="formData.sort" :min="0" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态">
            <DictRadio v-model="formData.status" type="sys_status" value-type="number" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElFormItem label="数据范围">
        <ElSelect v-model="formData.dataScope" placeholder="请选择数据范围" class="w-full">
          <ElOption
            v-for="item in dataScopeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem v-if="formData.dataScope === 2" label="选择部门">
        <ElTree
          ref="deptTreeRef"
          :data="deptTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          show-checkbox
          check-strictly
          default-expand-all
          :expand-on-click-node="false"
          class="p-2 border rounded max-h-60 w-full overflow-auto"
        />
      </ElFormItem>
      <ElFormItem label="备注">
        <FaTextarea v-model="formData.remark" :rows="3" placeholder="请输入备注" />
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
