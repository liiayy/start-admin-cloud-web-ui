<script setup lang="ts">
import type { UserInfo } from '@/api/modules/system/auth/user.ts'
import apiUser from '@/api/modules/system/auth/user.ts'

const visible = ref(false)
const formLoading = ref(false)
const formRef = ref()
const targetUserId = ref<number>()
const targetUserName = ref('')

const formData = ref({ password: '' })

const formRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

function openReset(row: UserInfo) {
  targetUserId.value = row.id
  targetUserName.value = row.username
  formData.value.password = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  visible.value = true
}

defineExpose({ openReset })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    await apiUser.resetPassword(targetUserId.value!, formData.value.password)
    faToast.success('密码重置成功')
    visible.value = false
  }
  finally {
    formLoading.value = false
  }
}
</script>

<template>
  <FaModal v-model="visible" :title="`重置密码 - ${targetUserName}`" class="max-w-sm">
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <ElFormItem label="新密码" prop="password">
        <ElInput v-model="formData.password" placeholder="请输入新密码" type="password" show-password />
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
