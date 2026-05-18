<script setup lang="ts">
import { createPatch } from 'diff'
import { html } from 'diff2html'
import { onMounted, ref, watch } from 'vue'
import apiDataTracer from '@/api/modules/system/monitor/datatracer.ts'
import 'diff2html/bundles/css/diff2html.min.css'

defineOptions({ name: 'DataTracer' })

const props = defineProps({
  dataId: {
    type: [Number, String],
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
})

const loading = ref(false)
const list = ref<any[]>([])

// Diff dialog state
const dialogVisible = ref(false)
const diffHtmlContent = ref('')
const activeRecord = ref<any>(null)

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
    // Under standard API responses in this project, res contains list or res.data.list
    list.value = res.list || (res.data && res.data.list) || []
  }
  catch (error) {
    console.error('Failed to load data tracer logs:', error)
  }
  finally {
    loading.value = false
  }
}

function showDiff(row: any) {
  activeRecord.value = row
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

  dialogVisible.value = true
}

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

/* Custom dark mode tweaks for diff2html */
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
