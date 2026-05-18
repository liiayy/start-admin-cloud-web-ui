<script setup lang="ts">
import { createPatch } from 'diff'
import { html } from 'diff2html'
import { ref } from 'vue'
import { DataTracerTypeDesc } from '@/components/DataTracer/DataTracerTypeEnum.ts'
import 'diff2html/bundles/css/diff2html.min.css'

const visible = ref(false)
const formData = ref<any>({})
const diffHtmlContent = ref('')

function open(row: any) {
  formData.value = { ...row }

  const oldText = row.diffOld || ''
  const newText = row.diffNew || ''
  const patchTitle = row.content || '数据变更对比'

  // Generate unified patch string
  const diffPatch = createPatch(patchTitle, oldText, newText, '', '')

  // Format HTML
  diffHtmlContent.value = html(diffPatch, {
    drawFileList: false,
    matching: 'lines',
    outputFormat: 'side-by-side',
    rawTemplates: {
      'tag-insert': '<span class="d2h-tag d2h-ins">ADD</span>',
      'tag-delete': '<span class="d2h-tag d2h-del">DEL</span>',
    },
  })

  visible.value = true
}

defineExpose({ open })
</script>

<template>
  <FaModal
    v-model="visible"
    title="数据变更详情对比"
    class="max-w-6xl!"
    :footer="false"
  >
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="记录编号">
        {{ formData.id }}
      </ElDescriptionsItem>

      <ElDescriptionsItem label="业务类型">
        <el-tag :type="formData.type === 1 ? 'primary' : formData.type === 2 ? 'success' : formData.type === 3 ? 'warning' : formData.type === 4 ? 'danger' : 'info'" size="small">
          {{ DataTracerTypeDesc[formData.type] || formData.type || '未知' }}
        </el-tag>
      </ElDescriptionsItem>

      <ElDescriptionsItem label="操作人员">
        <span class="text-gray-800 font-medium dark:text-gray-200">{{ formData.operName }}</span>
      </ElDescriptionsItem>

      <ElDescriptionsItem label="操作时间">
        {{ formData.createTime }}
      </ElDescriptionsItem>

      <ElDescriptionsItem label="操作IP">
        {{ formData.operIp }}
      </ElDescriptionsItem>

      <ElDescriptionsItem label="操作地点">
        {{ formData.operLocation || '未知' }}
      </ElDescriptionsItem>

      <ElDescriptionsItem label="操作内容" :span="2">
        <span class="text-gray-900 font-bold dark:text-gray-100">{{ formData.content }}</span>
      </ElDescriptionsItem>

      <ElDescriptionsItem label="UserAgent" :span="2">
        <div class="ua-box">
          {{ formData.userAgent }}
        </div>
      </ElDescriptionsItem>

      <ElDescriptionsItem label="变更对比" :span="2">
        <div class="diff-container">
          <div class="diff-html-wrapper" v-html="diffHtmlContent" />
        </div>
      </ElDescriptionsItem>
    </ElDescriptions>
  </FaModal>
</template>

<style scoped>
:deep(.el-descriptions__label) {
  width: 120px !important;
  min-width: 120px;
  max-width: 120px;
  white-space: nowrap;
}

.ua-box {
  width: 100%;
  padding: 8px 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: #6b7280;
  word-break: break-all;
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 4px;
}

.diff-container {
  width: 100%;
}

.diff-html-wrapper {
  max-height: 480px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}

/* Custom dark mode overrides */
.dark .ua-box {
  color: #9ca3af;
  background-color: #1f2937;
  border-color: #374151;
}

.dark .diff-html-wrapper :deep(.d2h-wrapper) {
  color: #c9d1d9;
  background-color: #1a1a1a;
}

.dark .diff-html-wrapper :deep(.d2h-file-header) {
  background-color: #21262d;
  border-bottom: 1px solid #30363d;
}

.dark .diff-html-wrapper :deep(.d2h-file-name) {
  color: #c9d1d9;
}

.dark .diff-html-wrapper :deep(.d2h-code-line-ctn) {
  color: #c9d1d9;
}

.dark .diff-html-wrapper :deep(.d2h-code-side-line) {
  background-color: #161b22;
}

.dark .diff-html-wrapper :deep(.d2h-code-side-emptyplaceholder) {
  background-color: #161b22;
}

.dark .diff-html-wrapper :deep(.d2h-emptyplaceholder) {
  background-color: #161b22;
}
</style>
