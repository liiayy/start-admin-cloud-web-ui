/**
 * WebSocket 实时通讯 Composable
 *
 * 提供自动连接管理、心跳保活、指数退避断线重连、按类型消息监听等能力。
 *
 * @example
 * ```ts
 * const { status, isConnected, connect, disconnect, onMessage } = useWebSocket()
 *
 * // 监听特定类型的消息
 * onMessage('notification', (data) => {
 *   console.log('收到通知:', data)
 * })
 *
 * // 登录成功后建立连接
 * connect()
 * ```
 *
 * @author 木子软件
 */

/** WebSocket 连接状态 */
type WebSocketStatus = 'connecting' | 'connected' | 'disconnected'

/** 服务端消息格式约定 */
interface WebSocketMessage {
  type: string
  title?: string
  data?: any
  timestamp?: number
}

/** 消息回调函数类型 */
type MessageCallback = (data: any, raw: WebSocketMessage) => void

// ==================== 单例状态 ====================
// WebSocket 连接全局唯一，避免多个组件重复创建连接

let ws: WebSocket | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectCount = 0
let manualClose = false

const status = ref<WebSocketStatus>('disconnected')
const isConnected = computed(() => status.value === 'connected')

/** 按消息类型注册的回调集合 */
const messageListeners = new Map<string, Set<MessageCallback>>()

/** 全局消息回调（接收所有消息） */
const globalListeners = new Set<MessageCallback>()

// ==================== 配置常量 ====================
const HEARTBEAT_INTERVAL = 30_000 // 心跳间隔 30秒
const RECONNECT_BASE_DELAY = 1_000 // 重连基础延迟 1秒
const RECONNECT_MAX_DELAY = 30_000 // 重连最大延迟 30秒
const RECONNECT_MAX_COUNT = 20 // 最大重连次数

/**
 * 构建 WebSocket 连接地址
 */
function buildWsUrl(): string {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('未登录，无法建立 WebSocket 连接')
  }

  // 根据当前页面协议决定 ws/wss
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

  // 开发环境通过 Vite 代理
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_PROXY) {
    return `${protocol}//${window.location.host}/api/admin/system/websocket?token=${encodeURIComponent(token)}`
  }

  // 生产环境直接连接网关
  const baseUrl = import.meta.env.VITE_APP_API_BASEURL as string
  const wsBase = baseUrl
    .replace(/^https?:\/\//, '') // 去掉 http(s)://
    .replace(/\/$/, '') // 去掉末尾斜杠
  return `${protocol}//${wsBase}/api/admin/system/websocket?token=${encodeURIComponent(token)}`
}

/**
 * 启动心跳
 */
function startHeartbeat() {
  stopHeartbeat()
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('ping')
    }
  }, HEARTBEAT_INTERVAL)
}

/**
 * 停止心跳
 */
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

/**
 * 计算重连延迟（指数退避）
 */
function getReconnectDelay(): number {
  const delay = Math.min(
    RECONNECT_BASE_DELAY * 2 ** reconnectCount,
    RECONNECT_MAX_DELAY,
  )
  return delay
}

/**
 * 调度重连
 */
function scheduleReconnect() {
  if (manualClose || reconnectCount >= RECONNECT_MAX_COUNT) {
    console.warn(`[WebSocket] 停止重连（手动关闭=${manualClose}, 重试次数=${reconnectCount}）`)
    return
  }

  const delay = getReconnectDelay()
  console.log(`[WebSocket] 将在 ${delay}ms 后尝试第 ${reconnectCount + 1} 次重连...`)

  reconnectTimer = setTimeout(() => {
    reconnectCount++
    doConnect()
  }, delay)
}

/**
 * 取消重连调度
 */
function cancelReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

/**
 * 处理收到的消息
 */
function handleMessage(event: MessageEvent) {
  const raw = event.data as string

  // 过滤心跳回复
  if (raw === 'pong' || raw === '{"type":"pong"}') {
    return
  }

  try {
    const message: WebSocketMessage = JSON.parse(raw)

    // 触发按类型注册的回调
    if (message.type) {
      const callbacks = messageListeners.get(message.type)
      if (callbacks) {
        callbacks.forEach(cb => cb(message.data, message))
      }
    }

    // 触发全局回调
    globalListeners.forEach(cb => cb(message.data, message))
  }
  catch {
    console.warn('[WebSocket] 收到非 JSON 消息:', raw)
  }
}

/**
 * 执行连接
 */
function doConnect() {
  // 防止重复连接
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return
  }

  try {
    const url = buildWsUrl()
    status.value = 'connecting'
    ws = new WebSocket(url)

    ws.onopen = () => {
      status.value = 'connected'
      reconnectCount = 0
      cancelReconnect()
      startHeartbeat()
      console.log('[WebSocket] 连接已建立')
    }

    ws.onmessage = handleMessage

    ws.onclose = (event) => {
      status.value = 'disconnected'
      stopHeartbeat()
      ws = null
      console.log(`[WebSocket] 连接关闭: code=${event.code}, reason=${event.reason}`)

      // 非手动关闭时自动重连
      if (!manualClose) {
        scheduleReconnect()
      }
    }

    ws.onerror = (error) => {
      console.error('[WebSocket] 连接错误:', error)
      // onerror 之后会自动触发 onclose，由 onclose 处理重连
    }
  }
  catch (error) {
    console.error('[WebSocket] 创建连接失败:', error)
    status.value = 'disconnected'
    if (!manualClose) {
      scheduleReconnect()
    }
  }
}

// ==================== 公开 API ====================

export function useWebSocket() {
  /**
   * 建立 WebSocket 连接
   */
  function connect() {
    manualClose = false
    reconnectCount = 0
    cancelReconnect()
    doConnect()
  }

  /**
   * 断开 WebSocket 连接
   */
  function disconnect() {
    manualClose = true
    cancelReconnect()
    stopHeartbeat()

    if (ws) {
      ws.close(1000, '用户主动断开')
      ws = null
    }

    status.value = 'disconnected'
  }

  /**
   * 注册消息监听器（按类型）
   *
   * @param type 消息类型（对应服务端 WebSocketMessage.type）
   * @param callback 回调函数
   * @returns 取消监听的函数
   */
  function onMessage(type: string, callback: MessageCallback): () => void {
    if (!messageListeners.has(type)) {
      messageListeners.set(type, new Set())
    }
    messageListeners.get(type)!.add(callback)

    // 返回取消监听的函数
    return () => {
      const callbacks = messageListeners.get(type)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          messageListeners.delete(type)
        }
      }
    }
  }

  /**
   * 注册全局消息监听器（接收所有消息）
   *
   * @param callback 回调函数
   * @returns 取消监听的函数
   */
  function onAnyMessage(callback: MessageCallback): () => void {
    globalListeners.add(callback)
    return () => {
      globalListeners.delete(callback)
    }
  }

  return {
    /** 连接状态 */
    status: readonly(status),
    /** 是否已连接 */
    isConnected,
    /** 建立连接 */
    connect,
    /** 断开连接 */
    disconnect,
    /** 按类型监听消息 */
    onMessage,
    /** 监听所有消息 */
    onAnyMessage,
  }
}
