<script setup lang="ts">
import type { ConfigInfo } from '@/api/modules/system/config/config.ts'
import apiConfig from '@/api/modules/system/config/config.ts'
import { useDict } from '@/composables/useDict.ts'
import { useTable } from '@/composables/useTable.ts'
import ConfigFormDialog from './components/ConfigFormDialog.vue'

defineOptions({ name: 'SystemConfig' })

const { sys_yes_no } = useDict('sys_yes_no')

// === 使用 Hook 管理表格基础逻辑 ===
const {
  loading,
  list: configList,
  total,
  pagination,
  searchParams,
  getList,
  handleSearch,
  handleReset,
  handleCurrentChange,
  handleSizeChange,
} = useTable({
  api: apiConfig.page,
  defaultParams: {
    name: '',
    configKey: '',
  },
})

// === 弹窗控制 ===
const configFormDialogRef = ref<InstanceType<typeof ConfigFormDialog>>()

function handleAdd() {
  configFormDialogRef.value?.openAdd()
}

function handleEdit(row: ConfigInfo) {
  configFormDialogRef.value?.openEdit(row)
}

function handleDelete(row: ConfigInfo) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除参数「${row.name}」吗？`,
    onConfirm: async () => {
      await apiConfig.delete(row.id)
      faToast.success('删除成功')
      await getList()
    },
  })
}
</script>

<template>
  <div>
    <FaPageHeader title="参数设置" />
    <FaPageMain>
      <!-- 搜索栏 -->
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <ElInput
          v-model="searchParams.name"
          placeholder="参数名称"
          clearable
          class="w-48"
          @keyup.enter="handleSearch"
        />
        <ElInput
          v-model="searchParams.configKey"
          placeholder="参数键名"
          clearable
          class="w-48"
          @keyup.enter="handleSearch"
        />
        <FaButton @click="handleSearch">
          <FaIcon name="i-ep:search" />
          搜索
        </FaButton>
        <FaButton variant="outline" @click="handleReset">
          <FaIcon name="i-ep:refresh" />
          重置
        </FaButton>
        <div class="flex-1" />
        <FaButton v-auth="'system:config:add'" @click="handleAdd">
          <FaIcon name="i-ep:plus" />
          新增参数
        </FaButton>
      </div>

      <!-- 表格 -->
      <ElTable v-loading="loading" :data="configList" border>
        <ElTableColumn prop="name" label="参数名称" width="180" show-overflow-tooltip />
        <ElTableColumn prop="configKey" label="参数键名" width="200" show-overflow-tooltip />
        <ElTableColumn prop="configValue" label="参数键值" min-width="200" show-overflow-tooltip />
        <ElTableColumn label="系统内置" width="100" align="center">
          <template #default="{ row }">
            <DictTag :options="sys_yes_no" :value="row.builtin" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="是否公开" width="100" align="center">
          <template #default="{ row }">
            <DictTag :options="sys_yes_no" :value="row.isPublic" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <ElTableColumn label="创建时间" width="170" align="center">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton v-auth="'system:config:update'" link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </ElButton>
            <ElButton
              v-if="row.builtin !== 'Y'"
              v-auth="'system:config:delete'"
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </FaPageMain>

    <ConfigFormDialog ref="configFormDialogRef" @success="getList" />
  </div>
</template>
