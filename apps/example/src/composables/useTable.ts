import { onMounted, reactive, ref, toRaw } from 'vue'

export interface UseTableOptions<T = any, S = any> {
  /** 请求接口的方法 */
  api: (params: S) => Promise<{ list: T[], total: number }>
  /** 附加的默认搜索参数 */
  defaultParams?: Partial<S>
  /** 是否在 hook 初始化时立刻发起请求 */
  immediate?: boolean
  /** 请求成功后的回调函数 */
  onSuccess?: (res: { list: T[], total: number }) => void
}

/**
 * 表格/列表基础逻辑封装 Hook
 */
export function useTable<T = any, S = any>(options: UseTableOptions<T, S>) {
  const loading = ref(false)
  const list = ref<T[]>([])
  const total = ref(0)

  // 分页状态
  const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
  })

  // 搜索表单状态
  const searchParams = ref<Partial<S>>({ ...options.defaultParams }) as any

  /**
   * 核心加载列表方法
   */
  const getList = async () => {
    loading.value = true
    try {
      // 组装最终查询的参数：分页信息 + 搜索信息
      const finalParams = {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        ...toRaw(searchParams.value),
      } as S

      const res = await options.api(finalParams)
      list.value = res.list
      total.value = res.total

      if (options.onSuccess) {
        options.onSuccess(res)
      }
    }
    finally {
      loading.value = false
    }
  }

  /** 查询 (触发搜索将页码重置为 1) */
  const handleSearch = () => {
    pagination.pageNum = 1
    getList()
  }

  /** 重置 (清空查询参数，重置为1页) */
  const handleReset = () => {
    searchParams.value = { ...options.defaultParams }
    handleSearch()
  }

  /** 处理页改变 */
  const handleCurrentChange = (val: number) => {
    pagination.pageNum = val
    getList()
  }

  /** 处理页容量改变 */
  const handleSizeChange = (val: number) => {
    pagination.pageSize = val
    pagination.pageNum = 1
    getList()
  }

  if (options.immediate !== false) {
    onMounted(() => getList())
  }

  return {
    loading,
    list,
    total,
    pagination,
    searchParams,
    getList,
    handleSearch,
    handleReset,
    handleCurrentChange,
    handleSizeChange,
  }
}
