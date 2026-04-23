<script setup lang="ts">
const emits = defineEmits<{
  success: []
}>()
const visible = ref(false)
const fileList = ref<any[]>([])

function open() {
  visible.value = true
  fileList.value = [] // 每次打开清空上次状态
}

const accountStore = useAppAccountStore()
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${accountStore.token}`,
  Token: accountStore.token,
}))

// 修复：防止双斜杠产生
const baseUrl = import.meta.env.VITE_APP_API_BASEURL || ''
const uploadAction = baseUrl.endsWith('/')
  ? `${baseUrl}api/system/resource/oss/upload`
  : `${baseUrl}/api/system/resource/oss/upload`

// 计算当前是否正在上传
const isUploading = computed(() => fileList.value.some(file => file.status === 'uploading'))
// 计算总进度 (取平均值)
const uploadPercent = computed(() => {
  const uploadingFiles = fileList.value.filter(file => file.status === 'uploading')
  if (uploadingFiles.length === 0) {
    return 0
  }
  const totalProgress = uploadingFiles.reduce((acc, file) => acc + (file.progress || 0), 0)
  return Math.round(totalProgress / uploadingFiles.length)
})

function handleSuccess() {
  faToast.success('上传资源成功')
  emits('success')
}

defineExpose({ open })
</script>

<template>
  <FaModal v-model="visible" title="上传资源" confirm-button-text="完成" class="max-w-xl">
    <div class="p-2">
      <!-- 显眼的进度条展示 -->
      <Transition name="fade">
        <div v-if="isUploading" class="mb-4">
          <div class="text-xs text-primary font-medium mb-1 flex justify-between">
            <span>正在上传并同步到云端...</span>
            <span>{{ uploadPercent }}%</span>
          </div>
          <div class="rounded-full bg-primary/10 h-2 w-full overflow-hidden">
            <div
              class="bg-primary h-full transition-all duration-300 ease-out relative"
              :style="{ width: `${uploadPercent}%` }"
            >
              <div class="bg-white/20 inset-0 absolute animate-[pulse_1.5s_infinite]" />
            </div>
          </div>
        </div>
      </Transition>

      <FaFileUpload
        v-model="fileList"
        :action="uploadAction"
        :headers="uploadHeaders"
        :after-upload="(res) => res.data.url"
        :size="20 * 1024 * 1024"
        @on-success="handleSuccess"
      >
        <template #default>
          <div class="py-8 flex flex-col items-center justify-center" :class="{ 'opacity-50 pointer-events-none': isUploading }">
            <FaIcon name="i-ri:upload-cloud-2-line" class="text-4xl text-gray-400 mb-4" />
            <div class="text-lg font-medium mb-1">
              点击或拖拽文件到此处上传
            </div>
            <div class="text-sm text-gray-400 px-4 text-center">
              支持上传图片、文档等各类文件，单文件不超过 20MB
            </div>
          </div>
        </template>
      </FaFileUpload>
    </div>
  </FaModal>
</template>

<style scoped>
.fade-enter-active,
 .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
 .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
