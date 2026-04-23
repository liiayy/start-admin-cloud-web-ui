<script setup lang="ts">
import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import type { DictTypeInfo } from '@/api/modules/system/dict/dictType.ts'

import apiDictData from '@/api/modules/system/dict/dictData.ts'
import apiDictType from '@/api/modules/system/dict/dictType.ts'
import { useTable } from '@/composables/useTable.ts'

import DictDataFormDialog from './components/DictDataFormDialog.vue'
import DictTypeFormDialog from './components/DictTypeFormDialog.vue'

defineOptions({ name: 'SystemDict' })

// 表格是否自适应高度
const tableAutoHeight = ref(true)

// 字典管理逻辑

// ===================== 左侧：字典类型 =====================
const leftLoading = ref(false)
const typeList = ref<DictTypeInfo[]>([])
const searchKeyword = ref('')
const selectedType = ref<DictTypeInfo | null>(null)

const typeDialogRef = ref<InstanceType<typeof DictTypeFormDialog>>()

async function getTypeList(showToast = false) {
  leftLoading.value = true
  try {
    typeList.value = await apiDictType.list()
    if (showToast) {
      faToast.success('刷新成功')
    }
  }
  finally {
    leftLoading.value = false
  }
}

const filteredTypeList = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  if (!keyword) {
    return typeList.value
  }
  return typeList.value.filter(item =>
    item.name.toLowerCase().includes(keyword) || item.type.toLowerCase().includes(keyword),
  )
})

function handleAddType() {
  typeDialogRef.value?.openAdd()
}

function handleEditType(row: DictTypeInfo) {
  typeDialogRef.value?.openEdit(row)
}

function handleDeleteType(row: DictTypeInfo) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除字典类型「${row.name}」吗？删除后不可恢复`,
    onConfirm: async () => {
      await apiDictType.delete(row.id)
      faToast.success('删除成功')
      if (selectedType.value?.id === row.id) {
        selectedType.value = null
      }
      getTypeList()
    },
  })
}

// ===================== 右侧：字典数据 =====================
const {
  loading: rightLoading,
  list: dataList,
  total: dataTotal,
  pagination,
  searchParams,
  getList,
  handleSearch,
} = useTable({
  api: apiDictData.page,
  defaultParams: { dictType: '', label: '' as string | undefined },
  immediate: false, // Wait until a type is selected
})

function handleTypeClick(row: DictTypeInfo) {
  selectedType.value = row
  // 切换类型时，重置右侧表格请求参数
  searchParams.value.dictType = row.type
  handleSearch()
}

const dataDialogRef = ref<InstanceType<typeof DictDataFormDialog>>()

function handleAddData() {
  if (!selectedType.value) {
    return faToast.warning('请先选择左侧字典类型')
  }
  dataDialogRef.value?.openAdd(selectedType.value.type)
}

function handleEditData(row: DictDataInfo) {
  dataDialogRef.value?.openEdit(row)
}

function handleDeleteData(row: DictDataInfo) {
  useFaModal().confirm({
    title: '提示',
    content: `确认删除字典数据「${row.label}」吗？`,
    onConfirm: async () => {
      await apiDictData.delete(row.id)
      faToast.success('删除成功')
      getList()
    },
  })
}

onMounted(() => {
  getTypeList()
})
</script>

<template>
  <div :class="{ 'absolute flex flex-col size-full': tableAutoHeight }">
    <FaPageMain :class="{ 'flex-1 overflow-auto overflow-x-hidden': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto overflow-x-hidden': tableAutoHeight }">
      <div class="flex gap-4" :class="{ 'flex-1 overflow-auto overflow-x-hidden': tableAutoHeight }">
        <!-- 左：字典类型列表 -->
        <div class="pr-3 pt-3 border-r flex shrink-0 flex-col w-[380px]">
          <div class="text-sm text-gray-600 font-semibold mb-2">
            字典类型
          </div>
          <div class="mb-3 flex gap-2">
            <FaInput v-model="searchKeyword" placeholder="搜索字典名称/类型..." clearable class="flex-1">
              <template #start>
                <FaIcon name="i-ri:search-line" />
              </template>
            </FaInput>
            <FaButton v-auth="'system:dict:add'" size="icon-sm" title="新增类型" @click="handleAddType">
              <FaIcon name="i-ri:add-line" />
            </FaButton>
            <FaButton variant="outline" size="icon-sm" title="刷新列表" @click="searchKeyword = ''; getTypeList(true)">
              <FaIcon name="i-ri:refresh-line" />
            </FaButton>
          </div>
          <div class="flex-1 overflow-auto">
            <ElTable
              v-loading="leftLoading"
              :data="filteredTypeList"
              :height="tableAutoHeight ? '100%' : 500"
              highlight-current-row
              @row-click="handleTypeClick"
            >
              <ElTableColumn prop="name" label="名称" min-width="120" show-overflow-tooltip />
              <ElTableColumn prop="type" label="类型" min-width="120" show-overflow-tooltip />
              <ElTableColumn label="操作" width="100" align="center">
                <template #default="{ row }">
                  <div class="flex-center gap-1">
                    <FaButton v-auth="'system:dict:update'" variant="outline" size="icon-sm" @click.stop="handleEditType(row)">
                      <FaIcon name="i-ri:edit-line" />
                    </FaButton>
                    <FaButton v-auth="'system:dict:delete'" variant="outline" size="icon-sm" @click.stop="handleDeleteType(row)">
                      <FaIcon name="i-ri:delete-bin-line" />
                    </FaButton>
                  </div>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </div>

        <!-- 右：字典数据 -->
        <div class="pt-3 flex flex-1 flex-col min-w-0">
          <!-- 搜索栏 -->
          <FaSearchBar :show-toggle="false">
            <template #default>
              <div class="flex flex-wrap gap-3 items-center">
                <FaLabel label="字典标签">
                  <FaInput
                    v-model="searchParams.label"
                    placeholder="请输入字典标签"
                    clearable
                    class="w-48"
                    @keyup.enter="handleSearch"
                  />
                </FaLabel>
                <FaButton @click="handleSearch">
                  <FaIcon name="i-ri:search-line" />
                  搜索
                </FaButton>
              </div>
            </template>
          </FaSearchBar>

          <div class="my-4 border-t border-t-dashed" />

          <div class="flex-center-between gap-2">
            <div class="flex gap-2" />
            <FaButton v-auth="'system:dict:add'" :disabled="!selectedType" @click="handleAddData">
              <FaIcon name="i-ri:add-line" />
              新增字典数据
            </FaButton>
          </div>

          <!-- 未选择时的空状态 -->
          <div v-if="!selectedType" class="text-gray-400 flex flex-1 items-center justify-center">
            请在左侧选择一个字典类型
          </div>

          <!-- 字典数据表格 -->
          <template v-else>
            <ElTable v-loading="rightLoading" class="my-4" :data="dataList" stripe highlight-current-row border :height="tableAutoHeight ? '100%' : undefined">
              <ElTableColumn prop="label" label="字典标签" width="150" />
              <ElTableColumn prop="value" label="字典键值" width="120" />
              <ElTableColumn prop="sort" label="排序" width="80" align="center" />
              <ElTableColumn label="状态" width="100" align="center">
                <template #default="{ row }">
                  <DictTag type="sys_status" :value="row.status" />
                </template>
              </ElTableColumn>
              <ElTableColumn label="颜色" prop="colorType" width="120" align="center">
                <template #default="{ row }">
                  <ElTag v-if="row.colorType" :type="row.colorType" effect="light">
                    {{ row.colorType }}
                  </ElTag>
                  <span v-else class="text-xs text-gray-400">-</span>
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
                    <FaButton v-auth="'system:dict:update'" variant="outline" size="icon-sm" @click="handleEditData(row)">
                      <FaIcon name="i-ri:edit-line" />
                    </FaButton>
                    <FaDropdown
                      :items="[
                        [
                          { label: '删除', icon: 'i-ri:delete-bin-line', variant: 'destructive', vAuth: 'system:dict:delete', handle: () => handleDeleteData(row) },
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
              :total="dataTotal"
              @page-change="getList"
              @size-change="getList"
            />
          </template>
        </div>
      </div>
    </FaPageMain>

    <!-- 抽离出的专属弹窗 -->
    <DictTypeFormDialog ref="typeDialogRef" @success="getTypeList" />
    <DictDataFormDialog ref="dataDialogRef" @success="getList" />
  </div>
</template>
