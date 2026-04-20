<script setup lang="ts">
const props = defineProps<{
  operTypeOptions: any[]
  statusOptions: any[]
}>()

const visible = ref(false)
const formData = ref<any>({})

function open(row: any) {
  formData.value = { ...row }
  visible.value = true
}

defineExpose({ open })
</script>

<template>
  <FaModal
    v-model="visible"
    title="操作日志详情"
    class="sm:max-w-2xl"
  >
    <ElForm :model="formData" label-width="100px" label-suffix="：">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="操作模块">
            <span class="text-gray-800 font-bold">{{ formData.title }}</span>
            <span class="text-gray-300 mx-2">/</span>
            <DictTag :options="props.operTypeOptions" :value="formData.businessType" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="操作人员">
            {{ formData.operName }}
            <span v-if="formData.deptName" class="text-xs text-gray-500 ml-1">({{ formData.deptName }})</span>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="操作地址">
            {{ formData.operIp }}
            <span v-if="formData.operLocation" class="text-xs text-gray-400 ml-2">[{{ formData.operLocation }}]</span>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="操作状态">
            <DictTag :options="props.statusOptions" :value="formData.status" />
            <span class="text-xs text-gray-500 ml-3">{{ formData.costTime }}ms</span>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="请求方式">
            <ElTag size="small" effect="plain">
              {{ formData.requestMethod }}
            </ElTag>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="请求地址">
            <span class="text-xs text-gray-600 break-all">{{ formData.operUrl }}</span>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="操作方法">
        <div class="text-xs text-gray-500 leading-relaxed font-mono break-all">
          {{ formData.method }}
        </div>
      </ElFormItem>

      <ElFormItem label="请求参数">
        <div class="code-box">
          {{ formData.operParam || '无' }}
        </div>
      </ElFormItem>

      <ElFormItem label="返回结果">
        <div class="code-box success">
          {{ formData.jsonResult || '无' }}
        </div>
      </ElFormItem>

      <ElFormItem v-if="formData.status === 1" label="错误消息">
        <div class="code-box danger">
          {{ formData.errorMsg }}
        </div>
      </ElFormItem>

      <ElFormItem label="操作时间">
        <span class="text-gray-600">{{ formData.createTime }}</span>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <FaButton variant="outline" @click="visible = false">
        关 闭
      </FaButton>
    </template>
  </FaModal>
</template>

<style scoped>
.code-box {
  width: 100%;
  max-height: 200px;
  padding: 12px;
  overflow-y: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #495057;
  word-break: break-all;
  white-space: pre-wrap;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.code-box.success {
  color: #389e0d;
  background-color: #f6ffed;
  border-color: #b7eb8f;
}

.code-box.danger {
  color: #cf1322;
  background-color: #fff1f0;
  border-color: #ffa39e;
}
</style>
