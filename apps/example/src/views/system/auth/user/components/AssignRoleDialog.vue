<script setup lang="ts">
import type { UserInfo } from '@/api/modules/system/auth/user.ts'
import type { RoleInfo } from '@/api/modules/system/permission/role.ts'
import apiUser from '@/api/modules/system/auth/user.ts'
import apiRole from '@/api/modules/system/permission/role.ts'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const roleListAll = ref<RoleInfo[]>([])

const targetUserId = ref<number>()
const targetUserName = ref('')
const selectedRoleIds = ref<number[]>([])

async function openAssign(row: UserInfo) {
  targetUserId.value = row.id
  targetUserName.value = row.username
  dialogTitle.value = `分配角色 - ${row.username}`
  visible.value = true

  const [roleRes, userDetail] = await Promise.all([
    apiRole.page({ pageNum: 1, pageSize: 1000 }),
    apiUser.get(row.id),
  ])

  roleListAll.value = roleRes.list || []
  selectedRoleIds.value = (userDetail as any).roleIds || []
}

defineExpose({ openAssign })

async function handleSubmit() {
  formLoading.value = true
  try {
    await apiUser.assignRole(targetUserId.value!, selectedRoleIds.value)
    faToast.success('角色分配成功')
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
    <ElForm label-width="80px">
      <ElFormItem label="当前用户">
        <ElInput :model-value="targetUserName" disabled />
      </ElFormItem>
      <ElFormItem label="选择角色">
        <ElSelect v-model="selectedRoleIds" multiple placeholder="请选择角色" class="w-full">
          <ElOption
            v-for="role in roleListAll"
            :key="role.id"
            :label="role.name"
            :value="role.id"
            :disabled="role.status === 1"
          />
        </ElSelect>
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
