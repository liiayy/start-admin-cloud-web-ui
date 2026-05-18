export enum DataTracerTypeEnum {
  SYSTEM_CONFIG = 1,
  ROLE = 2,
  USER = 3,
  MENU = 4,
  DICT = 5,
}

export const DataTracerTypeDesc: Record<number, string> = {
  [DataTracerTypeEnum.SYSTEM_CONFIG]: '系统参数',
  [DataTracerTypeEnum.ROLE]: '角色管理',
  [DataTracerTypeEnum.USER]: '用户管理',
  [DataTracerTypeEnum.MENU]: '菜单管理',
  [DataTracerTypeEnum.DICT]: '字典管理',
}
