import apiUser from '@/api/modules/system/auth/auth'
import router from '@/router'

export const useAppAccountStore = defineStore('appAccount', () => {
  const appSettingsStore = useAppSettingsStore()
  const appTabbarStore = useAppTabbarStore()
  const appRouteStore = useAppRouteStore()
  const appMenuStore = useAppMenuStore()

  // 账号信息
  const token = ref(localStorage.getItem('token') ?? '')
  const account = ref(localStorage.getItem('account') ?? '')
  const avatar = ref(localStorage.getItem('avatar') ?? '')

  // 权限信息
  const permissions = ref<string[]>([])

  // 登录状态
  const isLogin = computed(() => {
    if (token.value) {
      return true
    }
    return false
  })

  // 登录
  async function login(data: {
    username: string
    password: string
  }) {
    const res = await apiUser.login(data)
    localStorage.setItem('account', res.username)
    localStorage.setItem('token', res.tokenValue)
    localStorage.setItem('avatar', res.avatar ?? '')
    account.value = res.username
    token.value = res.tokenValue
    avatar.value = res.avatar ?? ''
  }

  // 手动登出
  async function logout(redirect = router.currentRoute.value.fullPath) {
    // 调用后端登出接口（不等待结果）
    await apiUser.logout()
    // 清除本地状态
    localStorage.removeItem('token')
    token.value = ''
    router.push({
      name: 'login',
      query: {
        ...(redirect !== appSettingsStore.settings.app.home.fullPath && router.currentRoute.value.name !== 'login' && { redirect }),
      },
    }).then(logoutCleanStatus)
  }

  // 请求登出
  function requestLogout() {
    localStorage.removeItem('token')
    token.value = ''
    router.push({
      name: 'login',
      query: {
        ...(
          router.currentRoute.value.fullPath !== appSettingsStore.settings.app.home.fullPath
          && router.currentRoute.value.name !== 'login'
          && {
            redirect: router.currentRoute.value.fullPath,
          }
        ),
      },
    }).then(logoutCleanStatus)
  }

  // 登出后清除状态
  function logoutCleanStatus() {
    localStorage.removeItem('account')
    localStorage.removeItem('avatar')
    account.value = ''
    avatar.value = ''
    permissions.value = []
    appSettingsStore.updateSettings({}, true)
    appTabbarStore.clean()
    appRouteStore.removeRoutes()
    appMenuStore.setActived(0)
  }

  // 获取权限
  async function getPermissions() {
    const res = await apiUser.getInfo()
    permissions.value = [...(res.permissions ?? [])]
  }

  // 修改密码
  async function editPassword(data: {
    password: string
    newPassword: string
  }) {
    await apiUser.passwordEdit(data)
  }

  // 锁屏
  function lock() {
    localStorage.removeItem('token')
  }

  // 解锁
  function unlock() {
    localStorage.setItem('token', token.value)
  }

  return {
    token,
    account,
    avatar,
    permissions,
    isLogin,
    login,
    logout,
    requestLogout,
    getPermissions,
    editPassword,
    lock,
    unlock,
  }
})
