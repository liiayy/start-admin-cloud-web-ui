import request from '../../../index.ts'

/** 菜单树节点 */
export interface MenuTreeNode {
  id: number
  name: string
  permission: string
  type: number // 1=目录 2=菜单 3=按钮
  parentId: number
  sort: number
  path: string
  component: string
  componentName: string
  icon: string
  status: number
  visible: boolean
  keepAlive: boolean
  alwaysShow: boolean
  createTime: string
  children: MenuTreeNode[]
}

/** 菜单新增请求参数 */
export interface MenuAddFormData {
  name: string
  permission: string
  type: number
  parentId: number
  sort: number
  path: string
  component: string
  componentName: string
  icon: string
  status: number
  visible: boolean
  keepAlive: boolean
  alwaysShow: boolean
}

/** 菜单编辑请求参数 */
export interface MenuUpdateFormData {
  id: number
  name: string
  permission: string
  type: number
  parentId: number
  sort: number
  path: string
  component: string
  componentName: string
  icon: string
  status: number
  visible: boolean
  keepAlive: boolean
  alwaysShow: boolean
}

const apiMenu = {
  // 获取全量菜单树（管理用）
  tree: () => request.get<MenuTreeNode[]>('api/system/permission/menu/tree'),

  // 获取当前用户菜单树（路由用）
  userTree: () => request.get<MenuTreeNode[]>('api/system/permission/menu/user-tree'),

  // 菜单详情
  get: (id: number) => request.get<MenuTreeNode>('api/system/permission/menu/get', { params: { id } }),

  // 新增菜单
  add: (data: MenuAddFormData) => request.post('api/system/permission/menu/add', data),

  // 更新菜单
  update: (data: MenuUpdateFormData) => request.put('api/system/permission/menu/update', data),

  // 删除菜单
  delete: (id: number) => request.delete('api/system/permission/menu/delete', { params: { id } }),

  // 根据角色获取菜单
  listByRole: (roleIds: number[]) =>
    request.get<number[]>('api/system/permission/menu/list-by-role', { params: { roleIds: roleIds.join(',') } }),
}

export default apiMenu
