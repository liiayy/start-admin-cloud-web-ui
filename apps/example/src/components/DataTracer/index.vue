<script setup lang="ts">
/**
 * @file index.vue
 * @description 数据时光机时间轴展现组件 (集成在各种表单/详情卡片中展现数据变更流水)
 * @author StartAdmin Developer
 */

import { createPatch } from 'diff'
import { html } from 'diff2html'
import { onMounted, ref, watch } from 'vue'
import apiDataTracer from '@/api/modules/system/monitor/datatracer.ts'
import 'diff2html/bundles/css/diff2html.min.css'

defineOptions({ name: 'DataTracer' })

// ==========================================
// 属性与入参定义 (Props)
// ==========================================
const props = defineProps({
  /** 业务数据的主键 ID（如配置 ID、角色 ID） */
  dataId: {
    type: [Number, String],
    required: true,
  },
  /** 业务类型枚举值 (对应 DataTracerTypeEnum) */
  type: {
    type: Number,
    required: true,
  },
})

// ==========================================
// 状态与响应式变量 (States)
// ==========================================

/** 加载遮罩控制状态 */
const loading = ref(false)

/** 时间轴数据源列表 */
const list = ref<any[]>([])

/** 对比浮层显示控制状态 */
const dialogVisible = ref(false)

/** 差异比对生成的格式化 HTML 内容 */
const diffHtmlContent = ref('')

/** 当前活跃比对记录 */
const activeRecord = ref<any>(null)

// ==========================================
// 业务逻辑方法 (Methods)
// ==========================================

/**
 * 远程加载该业务数据的所有历史变更流水
 */
async function fetchList() {
  if (!props.dataId) {
    list.value = []
    return
  }
  loading.value = true
  try {
    const res = await apiDataTracer.list({
      dataId: props.dataId,
      type: props.type,
      page: 1,
      size: 100,
    })
    // 适配多层级响应数据结构，兼容 list 字段与 data.list 字段
    list.value = res.list || (res.data && res.data.list) || []
  }
  catch (error) {
    console.error('Failed to load data tracer logs:', error)
  }
  finally {
    loading.value = false
  }
}

/**
 * 展示两版本差异的高亮比对浮层
 * @param {any} row 变更数据行
 */
function showDiff(row: any) {
  activeRecord.value = row
  const oldText = row.diffOld || ''
  const newText = row.diffNew || ''
  const patchTitle = row.content || '数据变更对比'

  // 1. 调用 diff 算法库生成 Unified Patch 格式补丁
  const diffPatch = createPatch(patchTitle, oldText, newText, '', '')

  // 2. 将 Unified Patch 转化为 Git Diff 样式的 side-by-side 两侧对比 HTML
  diffHtmlContent.value = html(diffPatch, {
    drawFileList: false,
    matching: 'lines',
    outputFormat: 'side-by-side',
    rawTemplates: {
      'tag-insert': '<span class="d2h-tag d2h-ins">ADD</span>',
      'tag-delete': '<span class="d2h-tag d2h-del">DEL</span>',
    },
  })

  // 3. 展现弹窗浮层
  dialogVisible.value = true
}

// 侦听业务数据 ID 变化，触发流水自动重载
watch(() => props.dataId, () => {
  fetchList()
}, { immediate: true })

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div v-loading="loading" class="datatracer-timeline-container">
    <el-empty v-if="!list || list.length === 0" description="暂无变更记录" :image-size="80" />

    <el-timeline v-else class="m-t-4">
      <el-timeline-item
        v-for="(item, index) in list"
        :key="item.id || index"
        :timestamp="item.createTime"
        placement="top"
        type="primary"
      >
        <el-card class="timeline-card">
          <div class="card-header flex items-center justify-between">
            <span class="text-coolgray-800 dark:text-coolgray-200 text-14 font-bold">
              {{ item.content }}
            </span>
            <el-button
              v-if="item.diffOld || item.diffNew"
              size="small"
              type="primary"
              plain
              @click="showDiff(item)"
            >
              查看比对
            </el-button>
          </div>

          <div class="card-meta text-coolgray-500 text-12 m-t-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>操作人: <span class="text-coolgray-700 dark:text-coolgray-300 font-medium">{{ item.operName }}</span></span>
            <span>IP: {{ item.operIp }} ({{ item.operLocation || '未知' }})</span>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <!-- Git Diff Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="变更详情对比"
      width="75%"
      destroy-on-close
      append-to-body
      class="diff-dialog"
    >
      <div v-if="activeRecord" class="diff-meta bg-coolgray-50 dark:bg-coolgray-900 border-coolgray-200 dark:border-coolgray-800 text-13 m-b-4 p-3 border rounded-6 border-solid flex flex-wrap gap-x-6 gap-y-2">
        <div><span class="text-coolgray-500">业务ID:</span> <span class="font-mono font-semibold">{{ activeRecord.dataId }}</span></div>
        <div><span class="text-coolgray-500">操作时间:</span> <span>{{ activeRecord.createTime }}</span></div>
        <div><span class="text-coolgray-500">操作人员:</span> <span class="font-medium">{{ activeRecord.operName }}</span></div>
        <div><span class="text-coolgray-500">操作地址:</span> <span>{{ activeRecord.operIp }} ({{ activeRecord.operLocation }})</span></div>
        <div class="text-coolgray-500 w-full truncate" :title="activeRecord.userAgent">
          <span>UserAgent:</span> <span class="text-12 font-mono">{{ activeRecord.userAgent }}</span>
        </div>
      </div>

      <div class="diff-html-wrapper" v-html="diffHtmlContent" />
    </el-dialog>
  </div>
</template>

<style scoped>
.datatracer-timeline-container {
  max-height: 500px;
  padding: 10px;
  overflow-y: auto;
}

.timeline-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);
}

.card-header {
  min-height: 24px;
}

.diff-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}

.diff-html-wrapper {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
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
  color: #ffa198;
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
  color: #7ee787;
}

.dark .diff-html-wrapper :deep(.d2h-addition del),
.dark .diff-html-wrapper :deep(.d2h-ins del) {
  color: #7ee787;
  text-decoration: none;
  background-color: #2a5c3a;
}

/* ---- Changed lines highlight within del/ins ---- */
.dark .diff-html-wrapper :deep(.d2h-change) {
  background-color: #2a2520;
}

/* Borders around the whole file block */
.dark .diff-html-wrapper :deep(.d2h-file-wrapper) {
  overflow: hidden;
  border: 1px solid #30363d;
  border-radius: 6px;
}
</style>
