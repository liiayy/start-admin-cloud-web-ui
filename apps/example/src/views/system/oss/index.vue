<script setup lang="ts">
import type { OssInfo } from '@/api/modules/system/oss.ts'
import apiOss from '@/api/modules/system/oss.ts'
import { useTable } from '@/composables/useTable.ts'
import { filesize } from 'filesize'
import OssConfigModal from './components/OssConfigModal.vue'
import OssUploadModal from './components/OssUploadModal.vue'

defineOptions({ name: 'SystemOss' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

// ===== 主列表：采用 Hook 管理 =====
const {
  loading,
  list: ossList,
  total,
  pagination,
  searchParams,
  getList,
  handleSearch,
  handleReset,
} = useTable({
  api: apiOss.page,
  defaultParams: {
    fileName: '',
    originalName: '',
    fileSuffix: '',
    service: '',
  },
})

// ===== 弹窗控制 =====
const ossConfigModalRef = ref<InstanceType<typeof OssConfigModal>>()
const ossUploadModalRef = ref<InstanceType<typeof OssUploadModal>>()

function handleConfig() {
  ossConfigModalRef.value?.open()
}

function handleUpload() {
  ossUploadModalRef.value?.open()
}

function handleUploadSuccess() {
  faToast.success('上传成功')
  getList()
}

function handleDelete(row: OssInfo) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除文件「${row.originalName}」吗？物理文件也将被移除。`,
    onConfirm: async () => {
      await apiOss.delete(row.id)
      faToast.success('删除成功')
      await getList()
    },
  })
}

async function handleCopy(row: OssInfo) {
  const url = getFullUrl(row.url)
  try {
    await navigator.clipboard.writeText(url)
    faToast.success('链接已复制到剪贴板')
  } catch (err) {
    faToast.error('复制失败，请手动复制')
  }
}

function handleDownload(row: OssInfo) {
  const url = getFullUrl(row.url)
  const downloadUrl = url.includes('?') ? `${url}&download=1` : `${url}?download=1`
  
  // 创建隐藏的 a 标签触发下载
  const link = document.createElement('a')
  link.href = downloadUrl
  link.setAttribute('download', row.originalName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** 判断是否为图片 */
function isImage(suffix: string) {
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(suffix.toLowerCase())
}

/** 获取完整 URL */
function getFullUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // 根据环境决定拼接方式
  // 开发环境下，如果是相对路径且需要走网关，拼接环境变量中的地址
  const baseUrl = import.meta.env.VITE_APP_API_BASEURL || ''
  return baseUrl.endsWith('/') && url.startsWith('/')
    ? baseUrl + url.substring(1)
    : baseUrl + url
}
</script>

<template>
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageHeader title="文件管理" description="集成策略模式的多平台文件管理系统" />
    
    <FaPageMain :class="{ 'flex-1 overflow-auto overflow-x-hidden': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto overflow-x-hidden': tableAutoHeight }">
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="名称">
              <FaInput v-model="searchParams.originalName" placeholder="原始文件名" clearable class="w-44" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="后缀">
              <FaInput v-model="searchParams.fileSuffix" placeholder="如: jpg" clearable class="w-32" @keyup.enter="handleSearch" />
            </FaLabel>
            <FaLabel label="平台">
              <DictSelect v-model="searchParams.service" type="sys_oss_service" placeholder="存储平台" clearable class="w-44" @change="handleSearch" />
            </FaLabel>
            <FaButton @click="handleSearch">
              <FaIcon name="i-ri:search-line" />
              搜索
            </FaButton>
            <FaButton variant="outline" @click="handleReset">
              <FaIcon name="i-ri:refresh-line" />
              重置
            </FaButton>
          </div>
        </template>
      </FaSearchBar>

      <div class="my-4 border-t border-t-dashed" />

      <div class="flex-center-between gap-2">
        <div class="flex gap-2">
          <FaButton variant="outline" v-auth="'system:oss:config'" @click="handleConfig">
            <FaIcon name="i-ri:settings-4-line" />
            配置管理
          </FaButton>
        </div>
        <FaButton v-auth="'system:oss:upload'" @click="handleUpload">
          <FaIcon name="i-ri:upload-cloud-2-line" />
          上传资源
        </FaButton>
      </div>

      <ElTable v-loading="loading" class="my-4" :data="ossList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined">
        <ElTableColumn label="预览" width="100" align="center">
          <template #default="{ row }">
            <div v-if="isImage(row.fileSuffix)" class="flex-center h-12">
              <ElImage :src="getFullUrl(row.url)" :preview-src-list="[getFullUrl(row.url)]" preview-teleported class="w-10 h-10 rounded border shadow-sm" fit="cover" />
            </div>
            <div v-else class="flex-center h-12 text-gray-400">
              <FaIcon name="i-ri:file-line" class="text-2xl" />
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="originalName" label="原文件名" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="fileSuffix" label="后缀" width="100" align="center">
          <template #default="{ row }">
             <ElTag size="small">{{ row.fileSuffix }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="大小" width="100" align="center">
          <template #default="{ row }">
            {{ filesize(row.size, { standard: 'jedec' }) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="service" label="存储平台" width="120" align="center">
          <template #default="{ row }">
            <DictTag type="sys_oss_service" :value="row.service" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="上传时间" width="170" align="center" />
        <ElTableColumn label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton variant="outline" size="icon-sm" title="复制链接" @click="handleCopy(row)">
                <FaIcon name="i-ri:file-copy-line" />
              </FaButton>
              <FaButton variant="outline" size="icon-sm" title="下载" @click="handleDownload(row)">
                <FaIcon name="i-ri:download-2-line" />
              </FaButton>
              <FaButton v-auth="'system:oss:delete'" variant="outline" size="icon-sm" class="text-red-500" title="删除" @click="handleDelete(row)">
                <FaIcon name="i-ri:delete-bin-line" />
              </FaButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>

      <FaPagination
        v-model:page="pagination.pageNum"
        v-model:size="pagination.pageSize"
        :total="total"
        @page-change="getList"
        @size-change="getList"
      />
    </FaPageMain>

    <!-- 配置弹窗 -->
    <OssConfigModal ref="ossConfigModalRef" />
    <!-- 上传弹窗 -->
    <OssUploadModal ref="ossUploadModalRef" @success="getList" />
  </div>
</template>
