<script setup lang="ts">
import type { ConfigInfo } from '@/api/modules/system/config/config.ts'
import apiConfig from '@/api/modules/system/config/config.ts'
import { useTable } from '@/composables/useTable.ts'
import ConfigFormDialog from './components/ConfigFormDialog.vue'

defineOptions({ name: 'SystemConfig' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

// 字典数据会自动加载

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
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageHeader title="参数设置" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <!-- 搜索栏 -->
      <FaSearchBar :show-toggle="false">
        <template #default>
          <div class="flex flex-wrap gap-3 items-center">
            <FaLabel label="参数名称">
              <FaInput
                v-model="searchParams.name"
                placeholder="请输入参数名称"
                clearable
                class="w-48"
                @keyup.enter="handleSearch"
              />
            </FaLabel>
            <FaLabel label="参数键名">
              <FaInput
                v-model="searchParams.configKey"
                placeholder="请输入参数键名"
                clearable
                class="w-48"
                @keyup.enter="handleSearch"
              />
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

      <div class="mx--5 my-4 border-t border-t-dashed" />

      <div class="flex-center-between gap-2">
        <div class="flex gap-2" />
        <FaButton v-auth="'system:config:add'" @click="handleAdd">
          <FaIcon name="i-ri:add-line" />
          新增参数
        </FaButton>
      </div>

      <!-- 表格 -->
      <ElTable v-loading="loading" class="my-4" :data="configList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined">
        <ElTableColumn prop="name" label="参数名称" width="180" show-overflow-tooltip />
        <ElTableColumn prop="configKey" label="参数键名" width="200" show-overflow-tooltip />
        <ElTableColumn prop="configValue" label="参数键值" min-width="200" show-overflow-tooltip />
        <ElTableColumn label="系统内置" width="100" align="center">
          <template #default="{ row }">
            <DictTag type="sys_yes_no" :value="row.builtin" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="是否公开" width="100" align="center">
          <template #default="{ row }">
            <DictTag type="sys_yes_no" :value="row.isPublic" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <ElTableColumn label="创建时间" width="170" align="center">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex-center gap-2">
              <FaButton v-auth="'system:config:update'" variant="outline" size="icon-sm" @click="handleEdit(row)">
                <FaIcon name="i-ri:edit-line" />
              </FaButton>
              <FaDropdown
                :items="[
                  [
                    { label: '删除', icon: 'i-ri:delete-bin-line', variant: 'destructive', hidden: row.builtin === 'Y', vAuth: 'system:config:delete', handle: () => handleDelete(row) },
                  ],
                ]"
              >
                <FaButton variant="outline" size="icon-sm">
                  <FaIcon name="i-ri:more-line" />
                </FaButton>
              </FaDropdown>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <FaPagination
        v-model:page="pagination.pageNum"
        v-model:size="pagination.pageSize"
        :total="total"
        @page-change="getList"
        @size-change="getList"
      />
    </FaPageMain>

    <ConfigFormDialog ref="configFormDialogRef" @success="getList" />
  </div>
</template>
