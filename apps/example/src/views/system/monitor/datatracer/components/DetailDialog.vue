<script setup lang="ts">
/**
 * @file DetailDialog.vue
 * @description 数据变更详情比对弹窗组件 (数据时光机 - 变更比对视窗)
 * @author StartAdmin Developer
 */

import { createPatch } from 'diff'
import { html } from 'diff2html'
import { ref } from 'vue'
import { DataTracerTypeDesc } from '@/components/DataTracer/DataTracerTypeEnum.ts'
import 'diff2html/bundles/css/diff2html.min.css'

// ==========================================
// 状态定义 (States)
// ==========================================

/** 弹窗显示控制状态 */
const visible = ref(false)

/** 变更行详情表单数据 */
const formData = ref<any>({})

/** 格式化后的差异比对 HTML 内容 */
const diffHtmlContent = ref('')

// ==========================================
// 业务逻辑处理 (Methods)
// ==========================================

/**
 * 打开比对弹窗并初始化数据
 * @param {any} row 变更记录数据行，需包含新旧数据文本快照
 */
function open(row: any) {
  formData.value = { ...row }

  const oldText = row.diffOld || ''
  const newText = row.diffNew || ''
  const patchTitle = row.content || '数据变更对比'

  // 1. 生成统一的补丁 (diff patch) 文本字符串
  const diffPatch = createPatch(patchTitle, oldText, newText, '', '')

  // 2. 使用 diff2html 渲染并格式化 HTML（配置为双栏对比渲染格式）
  diffHtmlContent.value = html(diffPatch, {
    drawFileList: false,
    matching: 'lines',
    outputFormat: 'side-by-side',
    rawTemplates: {
      'tag-insert': '<span class="d2h-tag d2h-ins">ADD</span>',
      'tag-delete': '<span class="d2h-tag d2h-del">DEL</span>',
    },
  })

  // 3. 唤起弹窗展示
  visible.value = true
}

// 暴露组件 API 供父组件或外部表格模板调用
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

/* ===== Dark Mode: UA Box ===== */
.dark .ua-box {
  color: #9ca3af;
  background-color: #1f2937;
  border-color: #374151;
}

/* ===== Dark Mode: diff2html full overrides ===== */

/* Outer wrapper */
.dark .diff-html-wrapper :deep(.d2h-wrapper) {
  color: #c9d1d9;
  background-color: #0d1117;
}

/* File header bar */
.dark .diff-html-wrapper :deep(.d2h-file-header) {
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
}

.dark .diff-html-wrapper :deep(.d2h-file-name) {
  color: #8b949e;
}

.dark .diff-html-wrapper :deep(.d2h-tag) {
  color: #c9d1d9;
  background-color: #21262d;
  border-color: #30363d;
}

/* Code table base */
.dark .diff-html-wrapper :deep(.d2h-diff-table) {
  color: #c9d1d9;
  background-color: #0d1117;
}

.dark .diff-html-wrapper :deep(.d2h-files-diff) {
  background-color: #0d1117;
}

.dark .diff-html-wrapper :deep(.d2h-file-diff) {
  background-color: #0d1117;
}

/* Table cells - side by side */
.dark .diff-html-wrapper :deep(.d2h-code-side-line) {
  color: #c9d1d9;
  background-color: #0d1117;
  border-color: #21262d;
}

/* Line numbers column */
.dark .diff-html-wrapper :deep(.d2h-code-side-linenumber) {
  color: #484f58;
  background-color: #0d1117;
  border-right-color: #21262d;
  border-left-color: #21262d;
}

/* Info / hunk header (@@ ... @@) */
.dark .diff-html-wrapper :deep(.d2h-info) {
  color: #8b949e;
  background-color: #161b22;
  border-color: #21262d;
}

/* Empty placeholder (unchanged side in side-by-side) */
.dark .diff-html-wrapper :deep(.d2h-code-side-emptyplaceholder) {
  background-color: #161b22;
  border-color: #21262d;
}

.dark .diff-html-wrapper :deep(.d2h-emptyplaceholder) {
  background-color: #161b22;
  border-color: #21262d;
}

/* Code content text */
.dark .diff-html-wrapper :deep(.d2h-code-line-ctn) {
  color: #c9d1d9;
}

/* ---- Deleted lines (red) ---- */
.dark .diff-html-wrapper :deep(.d2h-del) {
  color: #ffa198;
  background-color: #3d1f1e;
  border-color: #6e2c2c;
}

.dark .diff-html-wrapper :deep(.d2h-del .d2h-code-side-linenumber) {
  color: #c9d1d9;
  background-color: #3d1f1e;
  border-right-color: #6e2c2c;
}

.dark .diff-html-wrapper :deep(.d2h-del .d2h-code-line-ctn) {
  color: #fff;
}

.dark .diff-html-wrapper :deep(.d2h-del .d2h-code-side-line) {
  background-color: #3d1f1e;
}

.dark .diff-html-wrapper :deep(.d2h-deletion ins),
.dark .diff-html-wrapper :deep(.d2h-del ins) {
  color: #ffa198;
  text-decoration: none;
  background-color: #6e2c2c;
}

/* ---- Inserted lines (green) ---- */
.dark .diff-html-wrapper :deep(.d2h-ins) {
  color: #7ee787;
  background-color: #1a3323;
  border-color: #2a5c3a;
}

.dark .diff-html-wrapper :deep(.d2h-ins .d2h-code-side-linenumber) {
  color: #c9d1d9;
  background-color: #1a3323;
  border-right-color: #2a5c3a;
}

.dark .diff-html-wrapper :deep(.d2h-ins .d2h-code-line-ctn) {
  color: #fff;
}

.dark .diff-html-wrapper :deep(.d2h-addition del),
.dark .diff-html-wrapper :deep(.d2h-ins del) {
  color: #7ee787;
  text-decoration: none;
  background-color: #2a5c3a;
}

.dark .diff-html-wrapper :deep(.d2h-ins .d2h-code-side-line) {
  background-color: #1a3323;
}

/* Borders around the whole file block */
.dark .diff-html-wrapper :deep(.d2h-file-wrapper) {
  overflow: hidden;
  border: 1px solid #30363d;
  border-radius: 6px;
}
</style>
