<script setup lang="ts">
import type { DictDataFormData, DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import apiDictData from '@/api/modules/system/dict/dictData.ts'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const formData = reactive<DictDataFormData & { id?: number }>({
  id: undefined,
  dictType: '',
  label: '',
  value: '',
  sort: 0,
  status: 0,
  colorType: '',
  cssClass: '',
  remark: '',
})

const formRules = {
  label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
}

function openAdd(dictType: string) {
  isEdit.value = false
  dialogTitle.value = '新增字典数据'
  Object.assign(formData, {
    id: undefined,
    dictType,
    label: '',
    value: '',
    sort: 0,
    status: 0,
    colorType: '',
    cssClass: '',
    remark: '',
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  visible.value = true
}

function openEdit(row: DictDataInfo) {
  isEdit.value = true
  dialogTitle.value = '编辑字典数据'
  Object.assign(formData, {
    id: row.id,
    dictType: row.dictType,
    label: row.label,
    value: row.value,
    sort: row.sort,
    status: row.status,
    colorType: row.colorType || '',
    cssClass: row.cssClass || '',
    remark: row.remark || '',
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  visible.value = true
}

defineExpose({ openAdd, openEdit })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (isEdit.value) {
      await apiDictData.update(formData.id!, formData)
      faToast.success('更新成功')
    }
    else {
      await apiDictData.add(formData)
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
  <FaModal v-model="visible" :title="dialogTitle" class="max-w-xl">
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="字典标签" prop="label">
            <ElInput v-model="formData.label" placeholder="请输入字典标签" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="字典键值" prop="value">
            <ElInput v-model="formData.value" placeholder="请输入字典键值" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="排序">
            <ElInputNumber v-model="formData.sort" :min="0" controls-position="right" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态">
            <ElRadioGroup v-model="formData.status">
              <ElRadio :value="0">
                正常
              </ElRadio>
              <ElRadio :value="1">
                停用
              </ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="颜色类型">
            <ElInput v-model="formData.colorType" placeholder="如 primary、success" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="CSS 样式">
            <ElInput v-model="formData.cssClass" placeholder="自定义 CSS 类名" />
          </ElFormItem>
        </ElCol>
      </ElRow>
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
