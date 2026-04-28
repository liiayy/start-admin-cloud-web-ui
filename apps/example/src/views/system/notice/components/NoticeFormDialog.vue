<script setup lang="ts">
import type { NoticeVO } from '@/api/modules/system/notice.ts'
import apiNotice from '@/api/modules/system/notice.ts'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const formData = reactive<Partial<NoticeVO>>({
  id: undefined,
  title: '',
  type: 1,
  content: '',
  status: 0,
})

const formRules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
}

function resetForm() {
  Object.assign(formData, {
    id: undefined,
    title: '',
    type: 1,
    content: '',
    status: 0,
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function openAdd() {
  isEdit.value = false
  dialogTitle.value = '新增公告'
  resetForm()
  visible.value = true
}

async function openEdit(row: NoticeVO) {
  isEdit.value = true
  dialogTitle.value = '编辑公告'
  resetForm()
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    type: row.type,
    content: row.content,
    status: row.status,
  })
  visible.value = true
}

defineExpose({ openAdd, openEdit })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (isEdit.value) {
      await apiNotice.update(formData)
      faToast.success('更新成功')
    }
    else {
      await apiNotice.add(formData)
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
      <ElFormItem label="公告标题" prop="title">
        <ElInput v-model="formData.title" placeholder="请输入公告标题" />
      </ElFormItem>

      <ElFormItem label="公告类型" prop="type">
        <ElRadioGroup v-model="formData.type">
          <ElRadio :value="1">
            通知
          </ElRadio>
          <ElRadio :value="2">
            公告
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="公告内容" prop="content">
        <ElInput
          v-model="formData.content"
          type="textarea"
          :rows="6"
          placeholder="请输入通告主体内容（支持极简纯文本）"
        />
      </ElFormItem>

      <ElFormItem label="公告状态">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :value="0">
            正常
          </ElRadio>
          <ElRadio :value="1">
            关闭
          </ElRadio>
        </ElRadioGroup>
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
