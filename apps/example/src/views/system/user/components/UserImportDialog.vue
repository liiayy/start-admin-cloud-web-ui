<script setup lang="ts">
import apiUser from '@/api/modules/system/auth/user.ts'
import { downloadFile } from '@/utils/index.ts'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const uploading = ref(false)
const updateSupport = ref(false)
const fileList = ref<any[]>([])

function reset() {
  fileList.value = []
  updateSupport.value = false
}

function open() {
  reset()
  visible.value = true
}

defineExpose({ open })

async function handleDownloadTemplate() {
  const data = await apiUser.importTemplate()
  downloadFile(data, `用户导入模板_${Date.now()}.xlsx`)
}

async function handleUpload() {
  if (fileList.value.length === 0) {
    faToast.warning('请先选择文件')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', fileList.value[0].raw)
    formData.append('updateSupport', String(updateSupport.value))

    const result = await apiUser.importUser(formData)
    faToast.success('导入成功', { description: String(result) })
    visible.value = false
    emit('success')
  }
  finally {
    uploading.value = false
  }
}

function onChange(file: any) {
  fileList.value = [file]
}
</script>

<template>
  <FaModal v-model="visible" title="用户导入" class="max-w-md">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500">第一步：下载模板并填写数据</span>
        <FaButton variant="outline" size="sm" @click="handleDownloadTemplate">
          <FaIcon name="i-ri:download-line" />
          下载模板
        </FaButton>
      </div>

      <div class="space-y-2">
        <span class="text-sm text-gray-500">第二步：上传填写好的文件</span>
        <ElUpload
          drag
          action="#"
          :auto-upload="false"
          :file-list="fileList"
          :limit="1"
          accept=".xlsx, .xls"
          class="w-full"
          @change="onChange"
        >
          <div class="py-4 flex flex-col items-center">
            <FaIcon name="i-ri:upload-cloud-2-line" class="text-4xl text-gray-400 mb-2" />
            <div class="el-upload__text text-sm">
              将文件拖到此处，或<em class="text-primary italic">点击上传</em>
            </div>
          </div>
          <template #tip>
            <div class="text-xs text-gray-400 mt-2">
              仅允许导入 xls、xlsx 格式文件。
            </div>
          </template>
        </ElUpload>
      </div>

      <div class="mt-4 flex gap-2 items-center">
        <ElCheckbox v-model="updateSupport" label="是否更新已经存在的用户数据" />
      </div>
    </div>

    <template #footer>
      <FaButton variant="outline" @click="visible = false">
        取消
      </FaButton>
      <FaButton :loading="uploading" :disabled="fileList.length === 0" @click="handleUpload">
        确定导入
      </FaButton>
    </template>
  </FaModal>
</template>

<style scoped>
:deep(.el-upload-dragger) {
  padding: 0;
}
</style>
