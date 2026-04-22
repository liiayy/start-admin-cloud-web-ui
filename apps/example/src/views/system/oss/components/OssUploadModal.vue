<script setup lang="ts">
const visible = ref(false)

const emits = defineEmits<{
  success: []
}>()

function open() {
  visible.value = true
}

const accountStore = useAppAccountStore()
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${accountStore.token}`,
  Token: accountStore.token,
}))

function handleSuccess() {
  // 不立即关闭，让用户看到上传成功的状态
  faToast.success('上传资源成功')
  emits('success')
}

defineExpose({ open })
</script>

<template>
  <FaModal v-model="visible" title="上传资源" confirm-button-text="完成" class="max-w-xl">
    <div class="p-2">
      <FaFileUpload
        action="/proxy/api/system/resource/oss/upload"
        :headers="uploadHeaders"
        :after-upload="(res) => res.data.url"
        @on-success="handleSuccess"
      >
        <template #default>
          <div class="flex flex-col items-center justify-center py-8">
            <FaIcon name="i-ri:upload-cloud-2-line" class="text-4xl text-gray-400 mb-4" />
            <div class="text-lg font-medium mb-1">点击或拖拽文件到此处上传</div>
            <div class="text-sm text-gray-400 text-center px-4">
              支持上传图片、文档等各类文件，单张不超过 10MB
            </div>
          </div>
        </template>
      </FaFileUpload>
    </div>
  </FaModal>
</template>
