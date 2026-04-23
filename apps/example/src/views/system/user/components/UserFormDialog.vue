<script setup lang="ts">
import type { UserAddFormData, UserInfo } from '@/api/modules/system/auth/user.ts'
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import type { PostInfo } from '@/api/modules/system/organization/post.ts'
import apiUser from '@/api/modules/system/auth/user.ts'
import apiPost from '@/api/modules/system/organization/post.ts'

defineProps<{
  deptTree: DeptTreeNode[]
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

// 字典数据会自动加载

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const postListAll = ref<PostInfo[]>([])
const editId = ref<number>()

const formData = reactive<UserAddFormData & { id?: number, postIds?: number[] }>({
  id: undefined,
  username: '',
  password: '',
  nickname: '',
  deptId: null as any,
  postIds: [],
  email: '',
  mobile: '',
  sex: 0,
  avatar: '',
  status: 0,
  remark: '',
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
}

function resetForm() {
  Object.assign(formData, {
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    deptId: null,
    postIds: [],
    email: '',
    mobile: '',
    sex: 0,
    avatar: '',
    status: 0,
    remark: '',
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

/** 获取全部可用岗位 (供分配使用) */
async function loadPostList() {
  if (postListAll.value.length === 0) {
    postListAll.value = await apiPost.list()
  }
}

async function openAdd(deptId: number | null) {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增用户'
  resetForm()
  formData.deptId = deptId
  await loadPostList()
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  visible.value = true
}

async function openEdit(row: UserInfo) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑用户'
  resetForm()
  await loadPostList()

  const detail = await apiUser.get(row.id)
  Object.assign(formData, {
    id: row.id,
    username: detail.username,
    nickname: detail.nickname,
    deptId: detail.deptId,
    postIds: detail.postIds || [],
    email: detail.email || '',
    mobile: detail.mobile || '',
    sex: detail.sex || 0,
    avatar: detail.avatar || '',
    status: detail.status,
    remark: detail.remark || '',
  })

  visible.value = true
}

defineExpose({ openAdd, openEdit })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (isEdit.value) {
      await apiUser.update(formData as any)
      faToast.success('更新成功')
    }
    else {
      await apiUser.create(formData as UserAddFormData)
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
  <FaModal v-model="visible" :title="dialogTitle" class="max-w-2xl">
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="用户名" prop="username">
            <ElInput v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
          </ElFormItem>
        </ElCol>
        <ElCol v-if="!isEdit" :span="12">
          <ElFormItem label="密码" prop="password">
            <ElInput v-model="formData.password" placeholder="请输入密码" type="password" show-password />
          </ElFormItem>
        </ElCol>
        <ElCol :span="isEdit ? 24 : 12">
          <ElFormItem label="昵称" prop="nickname">
            <ElInput v-model="formData.nickname" placeholder="请输入昵称" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="归属部门" prop="deptId">
            <ElTreeSelect
              v-model="formData.deptId"
              :data="deptTree"
              :props="{ label: 'name', value: 'id', children: 'children' } as any"
              placeholder="请选择"
              check-strictly
              class="w-full"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="岗位分配" prop="postIds">
            <ElSelect v-model="formData.postIds" multiple placeholder="请选择" class="w-full">
              <ElOption
                v-for="post in postListAll"
                :key="post.id"
                :label="post.name"
                :value="post.id"
                :disabled="post.status === 1"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="手机号码" prop="mobile">
            <ElInput v-model="formData.mobile" placeholder="请输入手机号码" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="邮箱" prop="email">
            <ElInput v-model="formData.email" placeholder="请输入邮箱" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="性别">
            <DictSelect v-model="formData.sex" type="sys_user_sex" value-type="number" placeholder="请选择" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态">
            <DictRadio v-model="formData.status" type="sys_status" value-type="number" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="备注">
            <ElInput v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
          </ElFormItem>
        </ElCol>
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
