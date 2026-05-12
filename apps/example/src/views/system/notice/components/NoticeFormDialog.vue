<script setup lang="ts">
import type { NoticeVO } from '@/api/modules/system/notice.ts'
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import type { PostInfo } from '@/api/modules/system/organization/post.ts'
import type { RoleInfo } from '@/api/modules/system/permission/role.ts'

import apiNotice from '@/api/modules/system/notice.ts'
import apiDept from '@/api/modules/system/organization/dept.ts'
import apiPost from '@/api/modules/system/organization/post.ts'
import apiRole from '@/api/modules/system/permission/role.ts'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const { sys_notice_type, sys_notice_status, sys_notice_target_type } = useDict(
  'sys_notice_type',
  'sys_notice_status',
  'sys_notice_target_type',
)

const visible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const deptListAll = ref<DeptTreeNode[]>([])
const roleListAll = ref<RoleInfo[]>([])
const postListAll = ref<PostInfo[]>([])

const targetDeptArray = ref<number[]>([])
const targetRoleArray = ref<number[]>([])
const targetPostArray = ref<number[]>([])

async function loadTargetOptions() {
  if (deptListAll.value.length === 0) {
    const [deptRes, roleRes, postRes] = await Promise.all([
      apiDept.tree(),
      apiRole.page({ pageNum: 1, pageSize: 1000 }),
      apiPost.list(),
    ])
    deptListAll.value = deptRes || []
    roleListAll.value = roleRes.list || []
    postListAll.value = postRes || []
  }
}

const formData = reactive<Partial<NoticeVO>>({
  id: undefined,
  title: '',
  type: 1,
  content: '',
  status: 0,
  targetType: 0,
  targetDepts: '',
  targetRoles: '',
  targetPosts: '',
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
    targetType: 0,
    targetDepts: '',
    targetRoles: '',
    targetPosts: '',
  })
  targetDeptArray.value = []
  targetRoleArray.value = []
  targetPostArray.value = []
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

async function openCreate() {
  isEdit.value = false
  dialogTitle.value = '新增公告'
  resetForm()
  await loadTargetOptions()
  visible.value = true
}

async function openEdit(row: NoticeVO) {
  isEdit.value = true
  dialogTitle.value = '编辑公告'
  resetForm()
  await loadTargetOptions()
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    type: row.type,
    content: row.content,
    status: row.status,
    targetType: row.targetType ?? 0,
    targetDepts: row.targetDepts ?? '',
    targetRoles: row.targetRoles ?? '',
    targetPosts: row.targetPosts ?? '',
  })

  targetDeptArray.value = row.targetDepts ? row.targetDepts.split(',').filter(Boolean).map(Number) : []
  targetRoleArray.value = row.targetRoles ? row.targetRoles.split(',').filter(Boolean).map(Number) : []
  targetPostArray.value = row.targetPosts ? row.targetPosts.split(',').filter(Boolean).map(Number) : []

  visible.value = true
}

defineExpose({ openCreate, openEdit })

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (formData.targetType === 1) {
      formData.targetDepts = targetDeptArray.value.join(',')
      formData.targetRoles = targetRoleArray.value.join(',')
      formData.targetPosts = targetPostArray.value.join(',')
    }
    else {
      formData.targetDepts = ''
      formData.targetRoles = ''
      formData.targetPosts = ''
    }

    if (isEdit.value) {
      await apiNotice.update(formData)
      faToast.success('更新成功')
    }
    else {
      await apiNotice.create(formData)
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
        <FaInput v-model="formData.title" placeholder="请输入公告标题" />
      </ElFormItem>

      <ElFormItem label="公告类型" prop="type">
        <ElRadioGroup v-model="formData.type">
          <ElRadio
            v-for="item in sys_notice_type"
            :key="item.value"
            :value="Number(item.value)"
          >
            {{ item.label }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="公告内容" prop="content">
        <FaTextarea
          v-model="formData.content"
          :rows="6"
          placeholder="请输入通告主体内容（支持极简纯文本）"
        />
      </ElFormItem>

      <ElFormItem label="公告状态">
        <ElRadioGroup v-model="formData.status">
          <ElRadio
            v-for="item in sys_notice_status"
            :key="item.value"
            :value="Number(item.value)"
          >
            {{ item.label }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="发布范围">
        <ElRadioGroup v-model="formData.targetType">
          <ElRadio
            v-for="item in sys_notice_target_type"
            :key="item.value"
            :value="Number(item.value)"
          >
            {{ item.label }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <template v-if="formData.targetType === 1">
        <ElFormItem label="指定部门">
          <ElTreeSelect
            v-model="targetDeptArray"
            :data="deptListAll"
            :props="{ label: 'name', value: 'id', children: 'children' } as any"
            placeholder="请选择指定部门"
            multiple
            collapse-tags
            collapse-tags-tooltip
            check-strictly
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="指定角色">
          <ElSelect v-model="targetRoleArray" multiple placeholder="请选择指定角色" class="w-full">
            <ElOption
              v-for="role in roleListAll"
              :key="role.id"
              :label="role.name"
              :value="role.id"
              :disabled="role.status === 1"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="指定岗位">
          <ElSelect v-model="targetPostArray" multiple placeholder="请选择指定岗位" class="w-full">
            <ElOption
              v-for="post in postListAll"
              :key="post.id"
              :label="post.name"
              :value="post.id"
              :disabled="post.status === 1"
            />
          </ElSelect>
        </ElFormItem>
      </template>
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
