<script setup lang="ts">
import type { DeptTreeNode } from '@/api/modules/system/organization/dept.ts'
import type { PostFormData, PostInfo } from '@/api/modules/system/organization/post.ts'
import apiPost from '@/api/modules/system/organization/post.ts'

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
const editId = ref<number>()
const formRef = ref()

const formData = reactive<PostFormData>({
  deptId: null,
  code: '',
  name: '',
  sort: 0,
  status: 0,
  remark: '',
})

const formRules = {
  deptId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  code: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
}

// === 暴露出的供外部调用的方法 ===

/** 打开新增弹窗 */
function openAdd(deptId: number | null) {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增岗位'

  // 重置并赋初始值
  Object.assign(formData, {
    deptId,
    code: '',
    name: '',
    sort: 0,
    status: 0,
    remark: '',
  })

  // 确保重置之前的校验验证状态
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  visible.value = true
}

/** 打开编辑弹窗 */
async function openEdit(row: PostInfo) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑岗位'
  visible.value = true

  // 请求详情数据
  const detail = await apiPost.getById(row.id)
  Object.assign(formData, {
    deptId: detail.deptId,
    code: detail.code,
    name: detail.name,
    sort: detail.sort,
    status: detail.status,
    remark: detail.remark || '',
  })
}

defineExpose({
  openAdd,
  openEdit,
})

/** 提交表单 */
async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (isEdit.value) {
      await apiPost.update(editId.value!, formData)
      faToast.success('更新成功')
    }
    else {
      await apiPost.add(formData)
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
      <ElFormItem label="所属部门" prop="deptId">
        <ElTreeSelect
          v-model="formData.deptId"
          :data="deptTree"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          placeholder="请选择所属部门"
          check-strictly
          style="width: 100%;"
        />
      </ElFormItem>
      <ElFormItem label="岗位编码" prop="code">
        <ElInput v-model="formData.code" placeholder="请输入岗位编码" :disabled="isEdit" />
      </ElFormItem>
      <ElFormItem label="岗位名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入岗位名称" />
      </ElFormItem>
      <ElFormItem label="显示顺序" prop="sort">
        <ElInputNumber v-model="formData.sort" :min="0" controls-position="right" />
      </ElFormItem>
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
