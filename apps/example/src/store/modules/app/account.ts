import apiUser from '@/api/modules/system/auth/auth'
import apiNotice from '@/api/modules/system/notice'
import { useWebSocket } from '@/composables/useWebSocket'
import router from '@/router'
import { useAppNotificationStore } from './notification'

export const useAppAccountStore = defineStore('appAccount', () => {
  const appSettingsStore = useAppSettingsStore()
  const appTabbarStore = useAppTabbarStore()
  const appRouteStore = useAppRouteStore()
  const appMenuStore = useAppMenuStore()

  // 账号信息
  const token = ref(localStorage.getItem('token') ?? '')
  const account = ref(localStorage.getItem('account') ?? '')
  const avatar = ref(localStorage.getItem('avatar') ?? '')
  const email = ref(localStorage.getItem('email') ?? '')

  // 获取 WebSocket 实例
  const { connect, disconnect, onMessage } = useWebSocket()

  // 监听强制下线消息
  onMessage('force_logout', (data) => {
    if (typeof window !== 'undefined' && 'ElMessageBox' in window) {
      // @ts-expect-error: ElMessageBox is global
      window.ElMessageBox.alert(data?.message || '您的账号已被管理员强制下线！', '下线通知', {
        confirmButtonText: '重新登录',
        type: 'warning',
        showClose: false,
        callback: () => {
          requestLogout()
        },
      })
    }
    else {
      console.error(data?.message || '您的账号已被管理员强制下线！')
      requestLogout()
    }
  })

  // 监听系统通知公告
  onMessage('system_notice', (data) => {
    const notificationStore = useAppNotificationStore()
    // data 是后端广播过来的 NoticeVO
    notificationStore.addMessage({
      type: 'info',
      title: data?.title || '系统通知',
      data: {
        message: data?.content || '您有一条新的系统公告',
        id: data?.id,
      },
      timestamp: Date.now(),
      read: false,
    })

    if (typeof window !== 'undefined' && 'ElNotification' in window) {
      // @ts-expect-error: ElNotification is global
      window.ElNotification({
        title: data?.title || '系统公告',
        message: data?.content || '您收到一条新的系统公告，请注意查阅。',
        type: 'info',
        duration: 0, // 不自动关闭
      })
    }
  })

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
    localStorage.setItem('email', res.email ?? '')
    account.value = res.username
    token.value = res.tokenValue
    avatar.value = res.avatar ?? ''
    email.value = res.email ?? ''

    // 登录成功后建立 WebSocket 连接
    connect()
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
    // 断开 WebSocket 连接
    disconnect()

    localStorage.removeItem('account')
    localStorage.removeItem('avatar')
    localStorage.removeItem('email')
    account.value = ''
    avatar.value = ''
    email.value = ''
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

    if (res.email) {
      email.value = res.email
      localStorage.setItem('email', res.email)
    }

    // 页面刷新或重新获取权限时建立 WebSocket 连接
    connect()

    // 获取未读公告同步至消息面板
    try {
      const unread = await apiNotice.getUnread()
      const notificationStore = useAppNotificationStore()
      notificationStore.clearAll() // 清理过期的假数据
      unread.forEach((item: any) => {
        notificationStore.addMessage({
          type: 'info',
          title: item.title || '系统通知',
          data: {
            message: item.content || '您有一条未读的系统公告',
            id: item.id,
          },
          timestamp: item.createTime ? new Date(item.createTime).getTime() : Date.now(),
          read: false,
        })
      })
    }
    catch (e) {
      console.error('Failed to fetch unread notices', e)
    }
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

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      const storagePrefix = import.meta.env.VITE_APP_STORAGE_PREFIX || ''
      if (event.key === `${storagePrefix}token` && !event.newValue) {
        requestLogout()
      }
    })
  }

  return {
    token,
    account,
    avatar,
    email,
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
