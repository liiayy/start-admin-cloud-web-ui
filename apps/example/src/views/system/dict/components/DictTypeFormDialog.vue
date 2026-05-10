<script setup lang="ts">
import type { DictTypeFormData, DictTypeInfo } from '@/api/modules/system/dict/dictType.ts'
import apiDictType from '@/api/modules/system/dict/dictType.ts'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const formData = reactive<DictTypeFormData & { id?: number }>({
  id: undefined,
  name: '',
  type: '',
  status: 0,
  remark: '',
})

const formRules = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
}

function openCreate() {
  isEdit.value = false
  dialogTitle.value = '新增字典类型'
  Object.assign(formData, { id: undefined, name: '', type: '', status: 0, remark: '' })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  visible.value = true
}

function openEdit(row: DictTypeInfo) {
  isEdit.value = true
  dialogTitle.value = '编辑字典类型'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    type: row.type,
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
      await apiDictType.update(formData.id!, formData)
      faToast.success('更新成功')
    }
    else {
      await apiDictType.create(formData)
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
  <FaModal v-model="visible" :title="dialogTitle" class="max-w-md">
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <ElFormItem label="字典名称" prop="name">
        <FaInput v-model="formData.name" placeholder="请输入字典名称" />
      </ElFormItem>
      <ElFormItem label="字典类型" prop="type">
        <FaInput v-model="formData.type" placeholder="请输入字典类型" :disabled="isEdit" />
      </ElFormItem>
      <ElFormItem label="状态">
        <DictRadio v-model="formData.status" type="sys_status" value-type="number" />
      </ElFormItem>
      <ElFormItem label="备注">
        <FaTextarea v-model="formData.remark" placeholder="请输入备注" />
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
