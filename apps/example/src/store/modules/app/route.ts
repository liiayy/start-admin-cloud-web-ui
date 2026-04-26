import type { RouteRecordMainRaw } from '@fantastic-admin/types'
import type { RouteRecordRaw, RouterMatcher } from 'vue-router'
import { cloneDeep } from 'es-toolkit'
import { createRouterMatcher } from 'vue-router'
import apiMenu from '@/api/modules/system/permission/menu' // [MIGRATED]
import { systemRoutes as systemRoutesRaw } from '@/router/routes'

export const useAppRouteStore = defineStore(
  'appRoute',
  () => {
    const isGenerate = ref(false)
    // 原始路由
    const routesRaw = ref<RouteRecordMainRaw[]>([])
    // 已注册的路由，用于登出时删除路由
    const currentRemoveRoutes = ref<(() => void)[]>([])

    // 实际路由
    const routes = computed(() => {
      const returnRoutes: RouteRecordRaw[] = []
      if (routesRaw.value) {
        routesRaw.value.forEach((item) => {
          const tmpRoutes = cloneDeep(item.children) as RouteRecordRaw[]
          tmpRoutes.map((v) => {
            if (!v.meta) {
              v.meta = {}
            }
            v.meta.auth = item.meta?.auth ?? v.meta?.auth
            return v
          })
          returnRoutes.push(...tmpRoutes)
        })
        returnRoutes.forEach((item) => {
          if (item.children) {
            item.children = deleteMiddleRouteComponent(item.children)
          }
          return item
        })
      }
      return returnRoutes
    })
    // 系统路由
    const systemRoutes = computed(() => {
      const routes = [...systemRoutesRaw]
      routes.forEach((item) => {
        if (item.children) {
          item.children = deleteMiddleRouteComponent(item.children)
        }
      })
      return routes
    })
    // 删除路由中间层级对应的组件
    function deleteMiddleRouteComponent(routes: RouteRecordRaw[]) {
      const res: RouteRecordRaw[] = []
      routes.forEach((route) => {
        if (route.children?.length) {
          delete route.component
          route.children = deleteMiddleRouteComponent(route.children)
        }
        else {
          delete route.children
        }
        res.push(route)
      })
      return res
    }

    // 路由匹配器
    const routesMatcher = ref<RouterMatcher>()
    // 根据路径获取匹配的路由
    function getRouteMatchedByPath(path: string) {
      return routesMatcher.value?.resolve({ path }, undefined!)?.matched ?? []
    }

    // 路由排序，sort 越大越靠前
    function sortAsyncRoutes<T extends RouteRecordMainRaw[] | RouteRecordRaw[]>(routes: T): T {
      routes.sort((a, b) => (b.meta?.sort ?? 0) - (a.meta?.sort ?? 0))
      routes.forEach((route) => {
        if (route.children) {
          route.children = sortAsyncRoutes(route.children)
        }
      })
      return routes
    }

    // 生成路由（前端生成）
    function generateRoutesAtFront(asyncRoutes: RouteRecordMainRaw[]) {
      // 设置 routes 数据
      routesRaw.value = sortAsyncRoutes(cloneDeep(asyncRoutes) as any)
      // 创建路由匹配器
      const routes: RouteRecordRaw[] = []
      routesRaw.value.forEach((route) => {
        if (route.children) {
          routes.push(...route.children)
        }
      })
      routesMatcher.value = createRouterMatcher(routes, {})
      isGenerate.value = true
    }
    // 格式化后端路由数据
    function formatBackRoutes(routes: any, views = import.meta.glob('@/views/**/*.vue')): RouteRecordMainRaw[] {
      return routes.map((route: any) => {
        switch (route.component) {
          case 'Layout':
            route.component = () => import('@/layouts/index.vue')
            break
          default:
            if (route.component) {
              const component = route.component as string
              route.component = views[`/src/views/${component}.vue`] || views[`/src/views/${component}/index.vue`]
              if (!route.component) {
                console.warn(`[Fantastic-admin] 路由组件定位失败: ${component}`)
              }
            }
            else {
              delete route.component
            }
        }
        if (route.children) {
          route.children = formatBackRoutes(route.children, views)
        }
        return route
      })
    }

    // 转换后端菜单为框架路由格式
    function transformMenuToRoute(menus: any[]): any[] {
      return menus.map((menu) => {
        let path = menu.path || ''
        // 路径规范化：如果不是外部链接且不以 / 开头，则补全 /
        if (path && !/^(?:https?:|mailto:|tel:)/.test(path) && !path.startsWith('/')) {
          path = `/${path}`
        }
        const route: any = {
          path,
          name: menu.componentName || `Menu_${menu.id}`,
          component: menu.component,
          meta: {
            title: menu.name,
            icon: menu.icon ? menu.icon.replace(/^i-/, '') : '',
            auth: menu.permission ? [menu.permission] : [],
            keepAlive: menu.keepAlive,
            menu: menu.visible,
            sort: menu.sort,
          },
        }
        // 如果是目录且没有组件，默认使用 Layout (只有一级目录需要 Layout，其他由于 deleteMiddleRouteComponent 会处理)
        if (menu.type === 1 && !route.component) {
          route.component = 'Layout'
        }
        if (menu.children && menu.children.length > 0) {
          // 过滤掉按钮类型
          const children = menu.children.filter((item: any) => item.type !== 3)
          if (children.length > 0) {
            route.children = transformMenuToRoute(children)
          }
        }
        return route
      })
    }

    // 生成路由（后端获取）
    async function generateRoutesAtBack() {
      // 1. 获取当前用户路由树（已按权限过滤）
      const res = await apiMenu.userTree()

      // 2. 将后端菜单树包装成框架要求的 RouteRecordMainRaw 结构
      const transformedData = (res || []).map((menu: any) => {
        if (menu.type === 1) {
          // 顶级目录作为主导航 (Main Navigation)
          return {
            meta: {
              title: menu.name,
              icon: menu.icon ? menu.icon.replace(/^i-/, '') : '',
              auth: menu.permission ? [menu.permission] : [],
            },
            // 次级导航必须包裹在 Layout 中，才能在框架内渲染
            children: [
              {
                path: menu.path || `/${menu.id}`,
                component: 'Layout',
                meta: {
                  title: menu.name,
                  icon: menu.icon ? menu.icon.replace(/^i-/, '') : '',
                },
                children: transformMenuToRoute(menu.children || []),
              },
            ],
          }
        }
        else {
          // 顶级菜单包装一个匿名主导航项
          return {
            meta: {
              title: menu.name,
              icon: menu.icon ? menu.icon.replace(/^i-/, '') : '',
            },
            children: [
              {
                path: '/',
                component: 'Layout',
                children: transformMenuToRoute([menu]),
              },
            ],
          }
        }
      })

      // 3. 格式化并排序
      routesRaw.value = sortAsyncRoutes(formatBackRoutes(transformedData) as any)

      // 4. 创建路由匹配器
      const routes: RouteRecordRaw[] = []
      routesRaw.value.forEach((route) => {
        if (route.children) {
          routes.push(...route.children)
        }
      })
      routesMatcher.value = createRouterMatcher(routes, {})
      isGenerate.value = true
    }
    function setCurrentRemoveRoutes(routes: (() => void)[]) {
      currentRemoveRoutes.value = routes
    }
    // 清空动态路由
    function removeRoutes() {
      isGenerate.value = false
      routesRaw.value = []
      currentRemoveRoutes.value.forEach((removeRoute) => {
        removeRoute()
      })
      currentRemoveRoutes.value = []
    }

    return {
      isGenerate,
      routesRaw,
      currentRemoveRoutes,
      routes,
      systemRoutes,
      getRouteMatchedByPath,
      generateRoutesAtFront,
      generateRoutesAtBack,
      setCurrentRemoveRoutes,
      removeRoutes,
    }
  },
)
