/**
 * 系统参数常量定义
 *
 * 将高频使用的配置键名集中管理，杜绝魔法字符串。
 * 与后端 ConfigConstants.java 保持同步。
 */
export const ConfigConstants = {
  /** 用户初始密码 */
  USER_DEFAULT_PASSWORD: 'sys.user.defaultPassword',

  /** 验证码开关 */
  CAPTCHA_ENABLED: 'sys.captcha.enabled',

  /** 用户注册开关 */
  REGISTER_ENABLED: 'sys.register.enabled',

  /** 文件上传大小限制 (MB) */
  UPLOAD_MAX_SIZE_MB: 'sys.upload.maxSizeMB',

  /** 登录失败锁定次数 */
  LOGIN_MAX_RETRY_COUNT: 'sys.login.maxRetryCount',
} as const
