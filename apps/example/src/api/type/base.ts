export interface PageResult<T> {
  /**
   * 数据列表 (兼容后端)
   */
  records: T[]
  /**
   * 总行数 (兼容后端)
   */
  totalRow: number
  /**
   * 数据列表 (兼容前端 useTable)
   */
  list: T[]
  /**
   * 总行数 (兼容前端 useTable)
   */
  total: number
  /**
   * 当前页码
   */
  pageNum: number
  /**
   * 每页大小
   */
  pageSize: number
}
