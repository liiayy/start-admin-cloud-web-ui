

<script setup lang="ts">
import type { DictDataInfo } from '@/api/modules/system/dict/dictData.ts'
import type { DictTypeInfo } from '@/api/modules/system/dict/dictType.ts'

import apiDictData from '@/api/modules/system/dict/dictData.ts'
import apiDictType from '@/api/modules/system/dict/dictType.ts'
import { useTable } from '@/composables/useTable.ts'


import DictDataFormDialog from './components/DictDataFormDialog.vue'
import DictTypeFormDialog from './components/DictTypeFormDialog.vue'

defineOptions({ name: 'SystemDict' })

// ===================== 左侧：字典类型 =====================
const leftLoading = ref(false)
const typeList = ref<DictTypeInfo[]>([])
const searchKeyword = ref('')
const selectedType = ref<DictTypeInfo | null>(null)

const typeDialogRef = ref<InstanceType<typeof DictTypeFormDialog>>()

async function getTypeList() {
  leftLoading.value = true
  try {
    typeList.value = await apiDictType.list()
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
  handleCurrentChange,
  handleSizeChange,
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
  <div>
    <FaPageHeader title="字典管理" />
    <FaPageMain>
      <div class="flex gap-4">
        <!-- 左：字典类型列表 -->
        <div class="w-[380px] shrink-0">
          <div class="border rounded-lg p-3">
            <div class="mb-2 text-sm text-gray-600 font-semibold">
              字典类型
            </div>
            <div class="mb-2">
              <ElInput v-model="searchKeyword" placeholder="字典名称 / 类型" clearable size="small" />
            </div>
            <div class="mb-2 flex gap-2">
              <FaButton v-auth="'system:dict:add'" size="sm" @click="handleAddType">
                <FaIcon name="i-ep:plus" />
                新增
              </FaButton>
              <FaButton variant="outline" size="sm" @click="searchKeyword = ''; getTypeList()">
                <FaIcon name="i-ep:refresh" />
                刷新
              </FaButton>
            </div>
            <ElTable
              v-loading="leftLoading"
              :data="filteredTypeList"
              :height="500"
              :highlight-current-row="true"
              @row-click="handleTypeClick"
            >
              <ElTableColumn prop="name" label="名称" min-width="80" show-overflow-tooltip />
              <ElTableColumn prop="type" label="类型" min-width="80" show-overflow-tooltip />
              <ElTableColumn label="操作" align="center">
                <template #default="{ row }">
                  <ElButton v-auth="'system:dict:update'" link type="primary" size="small" @click.stop="handleEditType(row)">
                    编辑
                  </ElButton>
                  <ElButton v-auth="'system:dict:delete'" link type="danger" size="small" @click.stop="handleDeleteType(row)">
                    删除
                  </ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </div>

        <!-- 右：字典数据 -->
        <div class="min-w-0 flex-1">
          <!-- 搜索栏 -->
          <div class="mb-4 flex flex-wrap items-center gap-3">
            <ElInput
              v-model="searchParams.label"
              placeholder="字典标签"
              clearable
              class="w-48"
              @keyup.enter="handleSearch"
            />
            <FaButton @click="handleSearch">
              <FaIcon name="i-ep:search" />
              搜索
            </FaButton>
            <div class="flex-1" />
            <FaButton v-auth="'system:dict:add'" :disabled="!selectedType" @click="handleAddData">
              <FaIcon name="i-ep:plus" />
              新增字典数据
            </FaButton>
          </div>

          <!-- 未选择时的空状态 -->
          <div v-if="!selectedType" class="py-20 text-center text-gray-400">
            请在左侧选择一个字典类型
          </div>

          <!-- 字典数据表格 -->
          <template v-else>
            <ElTable v-loading="rightLoading" :data="dataList" border>
              <ElTableColumn prop="label" label="字典标签" width="150" />
              <ElTableColumn prop="value" label="字典键值" width="120" />
              <ElTableColumn prop="sort" label="排序" width="80" align="center" />
              <ElTableColumn label="状态" width="80" align="center">
                <template #default="{ row }">
                  <ElTag :type="row.status === 0 ? 'success' : 'danger'" size="small">
                    {{ row.status === 0 ? '正常' : '停用' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="colorType" label="颜色" width="100" align="center" />
              <ElTableColumn prop="remark" label="备注" min-width="150" show-overflow-tooltip />
              <ElTableColumn label="创建时间" width="170" align="center">
                <template #default="{ row }">
                  {{ row.createTime }}
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="140" align="center" fixed="right">
                <template #default="{ row }">
                  <ElButton v-auth="'system:dict:update'" link type="primary" size="small" @click="handleEditData(row)">
                    编辑
                  </ElButton>
                  <ElButton v-auth="'system:dict:delete'" link type="danger" size="small" @click="handleDeleteData(row)">
                    删除
                  </ElButton>
                </template>
              </ElTableColumn>
            </ElTable>

            <!-- 分页对接 -->
            <div class="mt-4 flex justify-end">
              <ElPagination
                v-model:current-page="pagination.pageNum"
                v-model:page-size="pagination.pageSize"
                :total="dataTotal"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </template>
        </div>
      </div>
    </FaPageMain>

    <!-- 抽离出的专属弹窗 -->
    <DictTypeFormDialog ref="typeDialogRef" @success="getTypeList" />
    <DictDataFormDialog ref="dataDialogRef" @success="getList" />
  </div>
</template>
