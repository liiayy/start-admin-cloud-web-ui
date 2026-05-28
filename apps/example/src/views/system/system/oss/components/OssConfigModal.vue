<script setup lang="ts">
import type { OssConfig } from '@/api/modules/system/oss.ts'
import apiOss from '@/api/modules/system/oss.ts'

const visible = ref(false)
const loading = ref(false)
const list = ref<OssConfig[]>([])

const formVisible = ref(false)
const formLoading = ref(false)
const testLoading = ref(false)
const formRef = ref()
const formData = reactive<OssConfig>({
  id: undefined,
  configKey: '',
  service: 'local',
  accessKey: '',
  secretKey: '',
  bucketName: '',
  prefix: '',
  endpoint: '',
  domain: '',
  region: '',
  isHttps: false,
  accessPolicy: 1,
  status: 1,
  remark: '',
})

const rules = {
  configKey: [{ required: true, message: '请输入唯一标识', trigger: 'blur' }],
  service: [{ required: true, message: '请选择存储平台', trigger: 'change' }],
  bucketName: [{ required: true, message: '请输入桶名称', trigger: 'blur' }],
  endpoint: [{ required: true, message: '请输入服务端点/根目录', trigger: 'blur' }],
}

async function getList() {
  loading.value = true
  try {
    list.value = await apiOss.configList()
  }
  finally {
    loading.value = false
  }
}

function open() {
  visible.value = true
  getList()
}

defineExpose({ open })

function handleCreate() {
  Object.assign(formData, {
    id: undefined,
    configKey: '',
    service: 'local',
    accessKey: '',
    secretKey: '',
    bucketName: '',
    prefix: '',
    endpoint: '',
    domain: '',
    region: '',
    isHttps: false,
    accessPolicy: 1,
    status: 1,
    remark: '',
  })
  formVisible.value = true
}

function handleEdit(row: OssConfig) {
  Object.assign(formData, { ...row })
  formVisible.value = true
}

async function handleDelete(row: OssConfig) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除配置「${row.configKey}」吗？`,
    onConfirm: async () => {
      await apiOss.configDelete(row.id!)
      faToast.success('删除成功')
      getList()
    },
  })
}

async function handleReload(row: OssConfig) {
  await apiOss.configReload(row.configKey)
  faToast.success('配置已热加载')
}

async function handleSubmit() {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    await apiOss.configSave(formData)
    faToast.success('保存成功')
    formVisible.value = false
    getList()
  }
  finally {
    formLoading.value = false
  }
}

function handleServiceChange(val: any) {
  // 仅在新增模式下自动填充标识
  if (!formData.id) {
    formData.configKey = val
  }
}

async function handleTest() {
  await formRef.value?.validate()
  testLoading.value = true
  try {
    await apiOss.configTest(formData)
    faToast.success('测试连接成功，上传正常')
  }
  catch (e: any) {
    console.error(e)
  }
  finally {
    testLoading.value = false
  }
}
</script>

<template>
  <FaModal v-model="visible" title="存储配置管理" class="max-w-4xl!">
    <div class="mb-4 flex justify-end">
      <FaButton @click="handleCreate">
        <FaIcon name="i-ri:add-line" />
        新增配置
      </FaButton>
    </div>

    <ElTable v-loading="loading" :data="list" stripe border>
      <ElTableColumn prop="configKey" label="配置标识" width="120" />
      <ElTableColumn prop="bucketName" label="桶名称" width="120" />
      <ElTableColumn prop="endpoint" label="端点/根目录" min-width="150" show-overflow-tooltip />
      <ElTableColumn label="权限" width="100" align="center">
        <template #default="{ row }">
          <DictTag type="sys_oss_access_policy" :value="row.accessPolicy" />
        </template>
      </ElTableColumn>
      <ElTableColumn label="状态" width="100" align="center">
        <template #default="{ row }">
          <DictTag type="sys_status" :value="row.status" />
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <div class="flex-center gap-1">
            <FaButton variant="outline" size="icon-sm" title="编辑" @click="handleEdit(row)">
              <FaIcon name="i-ri:edit-line" />
            </FaButton>
            <FaButton variant="outline" size="icon-sm" title="热重载" @click="handleReload(row)">
              <FaIcon name="i-ri:refresh-line" />
            </FaButton>
            <FaButton variant="outline" size="icon-sm" class="text-red-500" title="删除" @click="handleDelete(row)">
              <FaIcon name="i-ri:delete-bin-line" />
            </FaButton>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 子弹窗：新增/编辑 -->
    <FaModal v-model="formVisible" :title="formData.id ? '编辑配置' : '新增配置'" class="max-w-2xl!" append-to-body>
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="存储平台" prop="service">
              <DictSelect v-model="formData.service" type="sys_oss_service" placeholder="选择平台" @change="handleServiceChange" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="配置名称" prop="configKey">
              <ElInput v-model="formData.configKey" placeholder="如: aliyun, minio" :disabled="!!formData.id" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow v-if="formData.service !== 'local'" :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="桶名称" prop="bucketName">
              <ElInput v-model="formData.bucketName" placeholder="Bucket Name" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="区域(Region)" prop="region">
              <ElInput v-model="formData.region" placeholder="cn-hangzhou" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow v-if="formData.service !== 'local'" :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="AccessKey" prop="accessKey">
              <ElInput v-model="formData.accessKey" placeholder="Access Key" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="SecretKey" prop="secretKey">
              <ElInput v-model="formData.secretKey" placeholder="Secret Key" type="password" show-password />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem label="端点(Endpoint)" prop="endpoint">
          <ElInput v-model="formData.endpoint" :placeholder="formData.service === 'local' ? '本地存储根路径，如 f:/upload' : '例如 oss-cn-hangzhou.aliyuncs.com'" />
        </ElFormItem>

        <ElFormItem label="展示域名" prop="domain">
          <ElInput v-model="formData.domain" placeholder="例如: https://cdn.example.com" />
        </ElFormItem>

        <ElFormItem label="路径前缀" prop="prefix">
          <ElInput v-model="formData.prefix" placeholder="例如: upload/" />
        </ElFormItem>

        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="访问策略">
              <DictSelect v-model="formData.accessPolicy" type="sys_oss_access_policy" value-type="number" placeholder="请选择" class="w-full" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="状态">
              <ElSwitch v-model="formData.status" :active-value="0" :inactive-value="1" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="formData.service !== 'local'" :span="6">
            <ElFormItem label="HTTPS">
              <ElSwitch v-model="formData.isHttps" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="备注">
          <ElInput v-model="formData.remark" type="textarea" :rows="2" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <FaButton variant="outline" @click="formVisible = false">
            取消
          </FaButton>
          <FaButton v-if="formData.service !== 'local'" variant="outline" :loading="testLoading" @click="handleTest">
            测试连接
          </FaButton>
          <FaButton :loading="formLoading" @click="handleSubmit">
            确定
          </FaButton>
        </div>
      </template>
    </FaModal>
  </FaModal>
</template>
