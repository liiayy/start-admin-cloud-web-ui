<script setup lang="ts">
import apiDemo from '@/api/modules/demo'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const editId = ref<number>()
const formRef = ref()

const formData = reactive({
  name: '',
})

const formRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
}

function openAdd() {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增演示数据'
  formData.name = ''
  visible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function openEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '修改演示数据'
  formData.name = row.name
  visible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

defineExpose({ openAdd, openEdit })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (isEdit.value) {
      await apiDemo.update(editId.value!, formData)
      faToast.success('修改成功')
    }
    else {
      await apiDemo.create(formData)
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
  <FaModal v-model="visible" :title="dialogTitle" class="max-w-md!">
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px" @submit.prevent>
      <ElFormItem label="名称" prop="name">
        <FaInput v-model="formData.name" placeholder="请输入演示名称" @keydown.enter="handleSubmit" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="flex gap-2 justify-end">
        <FaButton variant="outline" @click="visible = false">
          取消
        </FaButton>
        <FaButton :loading="formLoading" @click="handleSubmit">
          确定
        </FaButton>
      </div>
    </template>
  </FaModal>
</template>
