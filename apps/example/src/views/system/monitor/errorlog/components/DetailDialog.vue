<script setup lang="ts">
import apiErrorLog from '@/api/modules/system/monitor/errorlog.ts'

const visible = ref(false)
const loading = ref(false)
const form = ref<any>({})

function open(row: any) {
  visible.value = true
  fetchDetail(row.id)
}

async function fetchDetail(id: number) {
  loading.value = true
  try {
    const res = await apiErrorLog.detail(id)
    form.value = res || {}
  }
  finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <FaModal v-model="visible" title="异常日志详情" class="max-w-6xl!" :footer="false">
    <ElDescriptions v-loading="loading" :column="2" border>
      <ElDescriptionsItem label="模块名称">
        {{ form.moduleName }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="异常类型">
        {{ form.errorType }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="请求地址" :span="2">
        {{ form.requestUri }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="请求方式">
        {{ form.requestMethod }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="请求IP">
        {{ form.requestIp }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="操作人员">
        {{ form.userName || '未知' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="发生次数">
        {{ form.occurrenceCount }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="首次时间">
        {{ form.firstTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="最后时间">
        {{ form.lastTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="处理状态" :span="2">
        <DictTag v-if="form.handleStatus !== undefined" :value="form.handleStatus" type="sys_error_log_status" />
      </ElDescriptionsItem>
      <template v-if="form.handleStatus && form.handleStatus !== 0">
        <ElDescriptionsItem label="处理人">
          {{ form.handleBy }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="处理时间">
          {{ form.handleTime }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="处理备注" :span="2">
          {{ form.handleRemark }}
        </ElDescriptionsItem>
      </template>
      <ElDescriptionsItem label="请求参数" :span="2">
        <pre class="text-xs p-2 rounded bg-gray-100 max-h-40 whitespace-pre-wrap break-all overflow-auto">{{ form.requestParams }}</pre>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="错误消息" :span="2">
        <div class="text-red-500 font-bold break-all">
          {{ form.errorMessage }}
        </div>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="异常堆栈" :span="2">
        <div class="text-xs text-gray-100 leading-relaxed p-3 rounded bg-gray-900 max-h-70 overflow-auto">
          <pre class="m-0 whitespace-pre-wrap break-all">{{ form.errorStack }}</pre>
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
</style>
