<script setup lang="ts">
import type { ConfigAddFormData, ConfigInfo, ConfigUpdateFormData } from '@/api/modules/system/config/config.ts'
import apiConfig from '@/api/modules/system/config/config.ts'
import { useDict } from '@/composables/useDict.ts'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const { sys_yes_no } = useDict('sys_yes_no')

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const formData = reactive<ConfigAddFormData & { id?: number }>({
  id: undefined,
  name: '',
  configKey: '',
  configValue: '',
  builtin: 'N',
  remark: '',
})

const formRules = {
  name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
  configKey: [{ required: true, message: '请输入参数键名', trigger: 'blur' }],
  configValue: [{ required: true, message: '请输入参数键值', trigger: 'blur' }],
}

function resetForm() {
  Object.assign(formData, {
    id: undefined,
    name: '',
    configKey: '',
    configValue: '',
    builtin: 'N',
    remark: '',
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function openAdd() {
  isEdit.value = false
  dialogTitle.value = '新增参数'
  resetForm()
  visible.value = true
}

function openEdit(row: ConfigInfo) {
  isEdit.value = true
  dialogTitle.value = '编辑参数'
  resetForm()
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    configKey: row.configKey,
    configValue: row.configValue,
    builtin: row.builtin || 'N',
    remark: row.remark || '',
  })
  visible.value = true
}

defineExpose({ openAdd, openEdit })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    const submitData = { ...formData }
    const id = submitData.id
    delete submitData.id

    if (isEdit.value && id) {
      await apiConfig.update(id, submitData as ConfigUpdateFormData)
      faToast.success('更新成功')
    }
    else {
      await apiConfig.add(submitData as ConfigAddFormData)
      faToast.success('新增成功')
    }
    visible.value = false
    emit('success')
  }
  catch (err) {
    // 错误已由拦截器处理
  }
  finally {
    formLoading.value = false
  }
}
</script>

<template>
  <FaModal v-model="visible" :title="dialogTitle" class="max-w-xl">
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <ElFormItem label="参数名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入参数名称" />
      </ElFormItem>
      <ElFormItem label="参数键名" prop="configKey">
        <ElInput v-model="formData.configKey" placeholder="请输入参数键名" :disabled="isEdit" />
      </ElFormItem>
      <ElFormItem label="参数键值" prop="configValue">
        <ElInput v-model="formData.configValue" placeholder="请输入参数键值" type="textarea" :rows="4" />
      </ElFormItem>
      <ElFormItem label="系统内置">
        <ElSelect v-model="formData.builtin" placeholder="请选择">
          <ElOption
            v-for="item in sys_yes_no"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
