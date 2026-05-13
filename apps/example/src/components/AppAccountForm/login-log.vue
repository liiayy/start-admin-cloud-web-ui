<script setup lang="ts">
import apiLoginLog from '@/api/modules/system/monitor/loginlog.ts'
import { useTable } from '@/composables/useTable.ts'

const {
  loading,
  list: logList,
  total,
  pagination,
  getList,
} = useTable({
  api: apiLoginLog.personalList,
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <ElTable v-loading="loading" :data="logList" stripe highlight-current-row border>
      <ElTableColumn prop="loginIp" label="登录地址" width="140" />
      <ElTableColumn prop="loginLocation" label="登录地点" min-width="120" show-overflow-tooltip />
      <ElTableColumn prop="browser" label="浏览器" width="140" show-overflow-tooltip />
      <ElTableColumn label="状态" width="70" align="center">
        <template #default="{ row }">
          <DictTag type="sys_common_status" :value="row.status" />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createTime" label="访问时间" width="180" align="center" />
    </ElTable>

    <FaPagination
      v-model:page="pagination.pageNum"
      v-model:size="pagination.pageSize"
      :total="total"
      size="small"
      @page-change="getList"
      @size-change="getList"
    />
  </div>
</template>
