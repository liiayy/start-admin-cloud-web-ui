<script setup lang="ts">
import apiDemo from '@/api/modules/demo'

defineOptions({
  name: 'DemoCache',
})

// 日志记录
const logs = ref<Array<{
  id: string
  title: string
  content: string
  time: string
  status: 'success' | 'warning' | 'error' | 'info'
}>>([])

function addLog(title: string, content: string, status: 'success' | 'warning' | 'error' | 'info' = 'info') {
  logs.value.unshift({
    id: Math.random().toString(36).substring(2),
    title,
    content,
    time: new Date().toLocaleTimeString(),
    status,
  })
}

// 1. 幂等性测试
const idempotentData = ref('Hello Antigravity')
const idempotentLoading = ref(false)

async function testIdempotentSingle() {
  idempotentLoading.value = true
  addLog('幂等测试', `发起单次请求，提交数据: "${idempotentData.value}"`, 'info')
  try {
    const res = await apiDemo.testIdempotent(idempotentData.value)
    addLog('幂等测试', `请求成功: ${res}`, 'success')
  }
  catch (err: any) {
    addLog('幂等测试', `请求失败: ${err.msg || err.message || '网络异常'} (Code: ${err.code || 500})`, 'error')
  }
  finally {
    idempotentLoading.value = false
  }
}

async function testIdempotentDouble() {
  idempotentLoading.value = true
  addLog('幂等测试', '模拟连续快速点击（100ms内连续发送2个相同请求）', 'info')

  // 发送第一个请求
  apiDemo.testIdempotent(idempotentData.value).then((res: any) => {
    addLog('幂等测试 - 请求1', `请求1成功: ${res}`, 'success')
  }).catch((err: any) => {
    addLog('幂等测试 - 请求1', `请求1失败: ${err.msg || err.message}`, 'error')
  })

  // 延时 80ms 发送第二个请求
  setTimeout(() => {
    apiDemo.testIdempotent(idempotentData.value).then((res: any) => {
      addLog('幂等测试 - 请求2', `请求2成功: ${res}`, 'success')
    }).catch((err: any) => {
      addLog('幂等测试 - 请求2', `请求2失败: ${err.msg || err.message} (符合预期，幂等拦截生效！)`, 'warning')
    })
    idempotentLoading.value = false
  }, 80)
}

// 2. 分布式锁测试
const lockKey = ref('product-stock-1')
const lockLoading = ref(false)
const rivalLoading = ref(false)

async function acquireLock() {
  lockLoading.value = true
  addLog('分布式锁', `开始执行加锁任务，锁Key: "demo:lock:${lockKey.value}" (耗时模拟 3 秒)...`, 'info')
  try {
    const res = await apiDemo.testLock(lockKey.value)
    addLog('分布式锁', `执行结果: ${res}`, 'success')
  }
  catch (err: any) {
    addLog('分布式锁', `执行失败: ${err.msg || err.message || '获取锁失败'}`, 'error')
  }
  finally {
    lockLoading.value = false
  }
}

async function competeLock() {
  rivalLoading.value = true
  addLog('分布式锁 - 竞争者', `立即尝试竞争相同的锁Key: "demo:lock:${lockKey.value}"...`, 'info')
  try {
    const res = await apiDemo.testLock(lockKey.value)
    addLog('分布式锁 - 竞争者', `竞争成功！执行结果: ${res}`, 'success')
  }
  catch (err: any) {
    addLog('分布式锁 - 竞争者', `竞争失败: ${err.msg || err.message} (符合预期，Redisson 锁保护生效！)`, 'warning')
  }
  finally {
    rivalLoading.value = false
  }
}

// 3. 缓存测试
const productId = ref(1)
const cacheLoading = ref(false)

async function queryWithCache() {
  cacheLoading.value = true
  const startTime = Date.now()
  addLog('数据缓存', `读取缓存数据，产品ID: ${productId.value}...`, 'info')
  try {
    const res = await apiDemo.getCache(productId.value)
    const duration = Date.now() - startTime
    addLog(
      '数据缓存',
      `查询成功！产品名称: "${res.name}"。耗时: ${duration} ms (耗时极低时说明命中了 Redis 缓存)`,
      duration > 15 ? 'success' : 'info',
    )
  }
  catch (err: any) {
    addLog('数据缓存', `查询失败: ${err.msg || err.message} (可能演示数据ID ${productId.value} 不存在，请先在基础 CRUD 页面创建ID为 ${productId.value} 的商品)`, 'error')
  }
  finally {
    cacheLoading.value = false
  }
}

async function clearCache() {
  cacheLoading.value = true
  addLog('数据缓存', `清除缓存数据，产品ID: ${productId.value}...`, 'info')
  try {
    await apiDemo.evictCache(productId.value)
    addLog('数据缓存', `缓存清除成功！下次查询将穿透至数据库。`, 'success')
  }
  catch (err: any) {
    addLog('数据缓存', `缓存清除失败: ${err.msg || err.message}`, 'error')
  }
  finally {
    cacheLoading.value = false
  }
}

// 4. 异常测试
const exceptionLoading = ref(false)

async function triggerException() {
  exceptionLoading.value = true
  addLog('异常捕获', `发起会触发后端业务异常的请求...`, 'info')
  try {
    await apiDemo.testException()
    addLog('异常捕获', `触发成功（这不符合预期）`, 'success')
  }
  catch (err: any) {
    addLog(
      '异常捕获',
      `捕获异常成功！错误信息: "${err.msg || err.message}" (Code: ${err.code || '未知'}, 符合预期，已被 GlobalExceptionHandler 全局捕获拦截！)`,
      'warning',
    )
  }
  finally {
    exceptionLoading.value = false
  }
}

const sysExceptionLoading = ref(false)

async function triggerSysException() {
  sysExceptionLoading.value = true
  addLog('异常捕获', `发起会触发后端系统致命异常的请求...`, 'info')
  try {
    await apiDemo.testSysException()
    addLog('异常捕获', `触发成功（这不符合预期）`, 'success')
  }
  catch (err: any) {
    addLog(
      '异常捕获',
      `捕获系统异常！错误: "${err.msg || err.message}" (Code: ${err.code || '未知'}, 符合预期，此 ServiceException 已在系统异常日志中自动记录审计！)`,
      'error',
    )
  }
  finally {
    sysExceptionLoading.value = false
  }
}

// 5. RPC 远程调用测试
const rpcUserId = ref(1)
const rpcLoading = ref(false)

async function triggerRpcUser() {
  rpcLoading.value = true
  addLog('Feign RPC', `发起微服务远程调用，请求用户ID: ${rpcUserId.value}...`, 'info')
  try {
    const res = await apiDemo.testRpcUser(rpcUserId.value)
    if (res) {
      addLog('Feign RPC', `RPC 调用成功！返回数据: [用户名: ${res.username}, 昵称: ${res.nickname}, 邮箱: ${res.email || '无'}]`, 'success')
    }
    else {
      addLog('Feign RPC', `RPC 调用成功，但未找到对应的用户信息。`, 'warning')
    }
  }
  catch (err: any) {
    addLog('Feign RPC', `RPC 调用失败: ${err.msg || err.message}`, 'error')
  }
  finally {
    rpcLoading.value = false
  }
}

// 6. Seata 分布式事务测试
const seataUserId = ref(1)
const seataNickname = ref('Seata测试昵称')
const seataDemoName = ref('Seata测试数据')
const seataLoading = ref(false)

async function triggerSeata(throwEx: boolean) {
  seataLoading.value = true
  addLog(
    'Seata 分布式事务',
    `准备发起分布式事务，参数: [用户ID: ${seataUserId.value}, 新昵称: "${seataNickname.value}", 本地记录名: "${seataDemoName.value}", 是否报错回滚: ${throwEx}]`,
    'info',
  )
  try {
    await apiDemo.testSeata(seataUserId.value, seataNickname.value, seataDemoName.value, throwEx)
    addLog(
      'Seata 分布式事务',
      `执行成功！本地记录 "${seataDemoName.value}" 已入库，远程用户 ${seataUserId.value} 昵称已变更为 "${seataNickname.value}"。`,
      'success',
    )
  }
  catch (err: any) {
    addLog(
      'Seata 分布式事务',
      `事务异常！错误: "${err.msg || err.message}"。验证效果：远程昵称已回滚，本地记录也未入库！`,
      'warning',
    )
  }
  finally {
    seataLoading.value = false
  }
}

// 7. 字典与系统参数演示
const { sys_user_sex, sys_status } = useDict('sys_user_sex', 'sys_status')
const { captchaEnabled: uiCaptchaEnabled, registerEnabled: uiRegisterEnabled } = useConfig(
  'sys.captcha.enabled',
  'sys.register.enabled',
)

// 定义字典/系统参数演示表单
const demoForm = ref({
  sex: 1,
  status: '0',
})

const backendDictResult = ref<any>(null)
const dictLoading = ref(false)

async function fetchDictSystemDemo() {
  dictLoading.value = true
  addLog(
    '字典与系统参数',
    `[Composables 演示] 当前前端内存已缓存性别选项 ${sys_user_sex.value.length} 个，状态选项 ${sys_status.value.length} 个。`,
    'info',
  )
  addLog(
    '字典与系统参数',
    `请求后端接口演示，传参: [性别Code: ${demoForm.value.sex}, 状态Code: ${demoForm.value.status}]`,
    'info',
  )
  try {
    const res = await apiDemo.getDictSystemDemo(demoForm.value.sex, demoForm.value.status)
    backendDictResult.value = res.data
    addLog(
      '字典与系统参数',
      `后端响应成功！翻译结果 -> 默认性别Label: "${res.data.sexLabel}"，指定状态Name: "${res.data.statusName}"，手动翻译性别: "${res.data.manualSexLabel}"。系统参数 -> 验证码开关: ${res.data.captchaEnabled}，默认密码: "${res.data.defaultPassword}"`,
      'success',
    )
  }
  catch (err: any) {
    addLog(
      '字典与系统参数',
      `调用失败: ${err.msg || err.message}`,
      'error',
    )
  }
  finally {
    dictLoading.value = false
  }
}
</script>

<template>
  <div>
    <FaPageHeader title="并发锁与缓存特性演示" class="mb-0">
      <template #description>
        <p>
          演示系统底层的基座能力，包含接口防重复提交（自定义 <code>@Idempotent</code> 注解）、基于 Redisson 的分布式锁、基于 Spring Cache + Redis 的二级缓存、以及统一异常拦截与自定义错误码等微服务开发最佳实践。
        </p>
      </template>
    </FaPageHeader>

    <FaPageMain>
      <div class="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <!-- 左侧功能卡片区域 -->
        <div class="space-y-6 lg:col-span-2">
          <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
            <!-- 1. 防重复提交 -->
            <ElCard shadow="never" class="border">
              <template #header>
                <div class="flex gap-2 items-center">
                  <FaIcon name="i-ri:spam-2-line" class="text-lg text-blue-500" />
                  <span class="font-bold">接口防重复提交 (@Idempotent)</span>
                </div>
              </template>
              <div class="space-y-4">
                <div class="text-xs text-gray-500">
                  后端方法标注了 <code>@Idempotent(time = 5)</code>，限制同一用户在 5 秒内不能提交相同参数的请求。
                </div>
                <FaLabel label="提交内容">
                  <FaInput v-model="idempotentData" placeholder="请输入测试内容" />
                </FaLabel>
                <div class="flex gap-2">
                  <FaButton :loading="idempotentLoading" class="flex-1 justify-center" @click="testIdempotentSingle">
                    单次提交
                  </FaButton>
                  <FaButton :loading="idempotentLoading" type="primary" class="flex-1 justify-center" @click="testIdempotentDouble">
                    <FaIcon name="i-ri:flashlight-line" />
                    模拟双击快速提交
                  </FaButton>
                </div>
              </div>
            </ElCard>

            <!-- 2. 分布式锁 -->
            <ElCard shadow="never" class="border">
              <template #header>
                <div class="flex gap-2 items-center">
                  <FaIcon name="i-ri:lock-password-line" class="text-lg text-red-500" />
                  <span class="font-bold">分布式并发锁 (Redisson)</span>
                </div>
              </template>
              <div class="space-y-4">
                <div class="text-xs text-gray-500">
                  使用 Redisson 锁客户端。尝试获取分布式锁（锁定期5s），加锁失败的并发请求将立即抛出异常，从而保障并发安全。
                </div>
                <FaLabel label="锁定资源Key">
                  <FaInput v-model="lockKey" placeholder="例如 product-stock-1" />
                </FaLabel>
                <div class="flex gap-2">
                  <FaButton :loading="lockLoading" type="danger" class="flex-1 justify-center" @click="acquireLock">
                    持有锁(模拟3s业务)
                  </FaButton>
                  <FaButton :loading="rivalLoading" :disabled="!lockLoading" variant="outline" class="flex-1 justify-center" @click="competeLock">
                    并发抢锁竞争
                  </FaButton>
                </div>
              </div>
            </ElCard>

            <!-- 3. 数据缓存 -->
            <ElCard shadow="never" class="border">
              <template #header>
                <div class="flex gap-2 items-center">
                  <FaIcon name="i-ri:database-2-line" class="text-lg text-green-500" />
                  <span class="font-bold">Spring Cache 与 Redis 缓存</span>
                </div>
              </template>
              <div class="space-y-4">
                <div class="text-xs text-gray-500">
                  基于 Spring Cache 机制。获取数据时自动写入 Redis 缓存；清除缓存后再次获取将重新查询数据库，能直观反映请求耗时差距。
                </div>
                <FaLabel label="产品 ID">
                  <ElInputNumber v-model="productId" :min="1" class="w-full" />
                </FaLabel>
                <div class="flex gap-2">
                  <FaButton :loading="cacheLoading" type="success" class="flex-1 justify-center" @click="queryWithCache">
                    获取数据(走缓存)
                  </FaButton>
                  <FaButton :loading="cacheLoading" variant="outline" class="flex-1 justify-center" @click="clearCache">
                    清除产品缓存
                  </FaButton>
                </div>
              </div>
            </ElCard>

            <!-- 4. 统一异常处理 -->
            <ElCard shadow="never" class="border">
              <template #header>
                <div class="flex gap-2 items-center">
                  <FaIcon name="i-ri:error-warning-line" class="text-lg text-yellow-500" />
                  <span class="font-bold">全局统一异常拦截</span>
                </div>
              </template>
              <div class="space-y-4">
                <div class="text-xs text-gray-500">
                  统一捕获并返回。<code>BusinessException</code>（业务预期异常）<strong>不记录</strong>审计日志；而 <code>ServiceException</code>（系统致命异常）会<strong>自动上报记录</strong>到数据库异常表中。
                </div>
                <div class="flex gap-2">
                  <FaButton :loading="exceptionLoading" type="warning" class="flex-1 justify-center" @click="triggerException">
                    <FaIcon name="i-ri:bug-line" />
                    触发业务异常
                  </FaButton>
                  <FaButton :loading="sysExceptionLoading" type="danger" class="flex-1 justify-center" @click="triggerSysException">
                    <FaIcon name="i-ri:close-circle-line" />
                    触发系统异常
                  </FaButton>
                </div>
              </div>
            </ElCard>

            <!-- 5. Feign 远程 RPC 调用 -->
            <ElCard shadow="never" class="border">
              <template #header>
                <div class="flex gap-2 items-center">
                  <FaIcon name="i-ri:route-line" class="text-lg text-indigo-500" />
                  <span class="font-bold">Feign 远程 RPC 调用 (Demo -> System)</span>
                </div>
              </template>
              <div class="space-y-4">
                <div class="text-xs text-gray-500">
                  基于 Spring Cloud OpenFeign 客户端。<code>demo-service</code> 会在后台远程调用 <code>system-service</code> 的用户 RPC 接口，查询对应的系统用户信息。
                </div>
                <FaLabel label="系统用户 ID">
                  <ElInputNumber v-model="rpcUserId" :min="1" class="w-full" />
                </FaLabel>
                <FaButton :loading="rpcLoading" type="primary" class="bg-indigo-600 w-full justify-center hover:bg-indigo-700" @click="triggerRpcUser">
                  <FaIcon name="i-ri:wireless-communication-line" />
                  发起远程 RPC 调用
                </FaButton>
              </div>
            </ElCard>

            <!-- 6. Seata 分布式事务 -->
            <ElCard shadow="never" class="border">
              <template #header>
                <div class="flex gap-2 items-center">
                  <FaIcon name="i-ri:git-merge-line" class="text-lg text-orange-500" />
                  <span class="font-bold">Seata 分布式事务 (AT 模式)</span>
                </div>
              </template>
              <div class="space-y-4">
                <div class="text-xs text-gray-500">
                  基于 Seata 协调器。<code>demo-service</code> 调用 <code>system-service</code> 修改用户昵称，同时本地库插入一条数据。验证在发生异常时两边数据同时回滚。
                </div>
                <div class="gap-2 grid grid-cols-2">
                  <FaLabel label="用户 ID">
                    <ElInputNumber v-model="seataUserId" :min="1" class="w-full" />
                  </FaLabel>
                  <FaLabel label="修改昵称">
                    <FaInput v-model="seataNickname" placeholder="新昵称" />
                  </FaLabel>
                </div>
                <FaLabel label="本地插入名称">
                  <FaInput v-model="seataDemoName" placeholder="本地写入 demo 表的数据名" />
                </FaLabel>
                <div class="flex gap-2">
                  <FaButton :loading="seataLoading" type="success" class="flex-1 justify-center" @click="triggerSeata(false)">
                    正常提交
                  </FaButton>
                  <FaButton :loading="seataLoading" type="danger" class="flex-1 justify-center" @click="triggerSeata(true)">
                    触发回滚
                  </FaButton>
                </div>
              </div>
            </ElCard>

            <!-- 7. 系统字典与系统参数 -->
            <ElCard shadow="never" class="border md:col-span-2">
              <template #header>
                <div class="flex gap-2 items-center">
                  <FaIcon name="i-ri:book-read-line" class="text-lg text-teal-500" />
                  <span class="font-bold">系统字典与系统参数 (Dict & Config)</span>
                </div>
              </template>
              <div class="space-y-6">
                <div class="text-xs text-gray-500">
                  演示前端 <code>useDict</code>、<code>useConfig</code> 机制及声明式专属组件 <code>&lt;DictSelect&gt;</code>、<code>&lt;DictRadio&gt;</code>、<code>&lt;DictTag&gt;</code>。同时展示后端 <code>@Dict</code> 零代码自动翻译。
                </div>

                <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <!-- 前端展示与表单绑定 -->
                  <div class="border-gray-100 space-y-4 md:pr-6 md:border-r">
                    <div class="text-sm text-teal-600 font-semibold flex gap-1 items-center">
                      <FaIcon name="i-ri:profile-line" /> 前端组件与Composables演示
                    </div>

                    <div class="text-xs text-gray-700 p-3 rounded bg-teal-50/50 space-y-1.5">
                      <div><strong>前端 useConfig 实时读取参数：</strong></div>
                      <div>
                        验证码是否启用 (sys.captcha.enabled): <el-tag size="small" :type="uiCaptchaEnabled ? 'success' : 'danger'">
                          {{ uiCaptchaEnabled }}
                        </el-tag>
                      </div>
                      <div>
                        注册是否启用 (sys.register.enabled): <el-tag size="small" :type="uiRegisterEnabled ? 'success' : 'danger'">
                          {{ uiRegisterEnabled }}
                        </el-tag>
                      </div>
                    </div>

                    <el-form :model="demoForm" label-width="120px" size="small" label-position="left">
                      <el-form-item label="性别 (DictSelect)">
                        <DictSelect v-model="demoForm.sex" type="sys_user_sex" value-type="number" class="w-full" />
                      </el-form-item>
                      <el-form-item label="状态 (DictRadio)">
                        <DictRadio v-model="demoForm.status" type="sys_status" button />
                      </el-form-item>
                    </el-form>

                    <div class="text-xs text-gray-600 space-y-1.5">
                      <div><strong>前端 DictTag 实时翻译展示：</strong></div>
                      <div class="flex gap-4">
                        <span>当前性别: <DictTag type="sys_user_sex" :value="demoForm.sex" /></span>
                        <span>当前状态: <DictTag type="sys_status" :value="demoForm.status" /></span>
                      </div>
                    </div>
                  </div>

                  <!-- 后端自动翻译结果 -->
                  <div class="space-y-4">
                    <div class="text-sm text-teal-600 font-semibold flex gap-1 items-center">
                      <FaIcon name="i-ri:server-line" /> 后端 @Dict 零代码自动翻译演示
                    </div>

                    <FaButton :loading="dictLoading" type="success" class="bg-teal-600 w-full justify-center hover:bg-teal-700" @click="fetchDictSystemDemo">
                      <FaIcon name="i-ri:send-plane-line" />
                      发起后端翻译与参数查询 RPC 请求
                    </FaButton>

                    <div v-if="backendDictResult" class="text-xs text-gray-700 p-3 border border-teal-200 rounded bg-teal-50 space-y-2">
                      <div class="font-bold mb-1 pb-1 border-b border-teal-200">
                        后端返回的 DemoDictVO 实体数据:
                      </div>
                      <div class="gap-y-1 grid grid-cols-2">
                        <div>原始 sex: <span class="text-blue-600 font-bold font-mono">{{ backendDictResult.sex }}</span></div>
                        <div>自动翻译 sexLabel: <span class="text-green-600 font-bold">{{ backendDictResult.sexLabel }}</span></div>

                        <div>原始 status: <span class="text-blue-600 font-bold font-mono">{{ backendDictResult.status }}</span></div>
                        <div>自定义 statusName: <span class="text-green-600 font-bold">{{ backendDictResult.statusName }}</span></div>

                        <div class="mt-1 pt-1.5 border-t border-teal-200 border-dashed col-span-2" />

                        <div>手动翻译 sex:</div>
                        <div class="text-indigo-600 font-bold">
                          {{ backendDictResult.manualSexLabel }}
                        </div>

                        <div class="mt-1 pt-1.5 border-t border-teal-200 border-dashed col-span-2">
                          <strong>后端 ConfigUtils 获取系统参数：</strong>
                        </div>

                        <div>
                          验证码开关: <el-tag size="small">
                            {{ backendDictResult.captchaEnabled }}
                          </el-tag>
                        </div>
                        <div>默认密码: <span class="font-bold font-mono">{{ backendDictResult.defaultPassword }}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ElCard>
          </div>
        </div>

        <!-- 右侧日志输出区域 -->
        <ElCard shadow="never" class="border flex flex-col h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">分布式基座调用日志</span>
              <FaButton variant="outline" size="sm" @click="logs = []">
                <FaIcon name="i-ri:delete-bin-line" />
                清空日志
              </FaButton>
            </div>
          </template>

          <div class="pr-2 flex-1 h-[690px] overflow-y-auto space-y-3">
            <div v-if="logs.length === 0" class="text-gray-400 flex flex-col h-full items-center justify-center">
              <FaIcon name="i-ri:terminal-box-line" class="text-4xl mb-2" />
              <span>暂无调用日志，请尝试点击左侧操作</span>
            </div>

            <TransitionGroup name="list" tag="div" class="space-y-3">
              <div
                v-for="log in logs"
                :key="log.id"
                class="text-xs font-mono p-3 border rounded-lg bg-gray-50 transition-all duration-300"
                :class="{
                  'border-l-4 border-l-blue-500': log.status === 'info',
                  'border-l-4 border-l-green-500': log.status === 'success',
                  'border-l-4 border-l-yellow-500': log.status === 'warning',
                  'border-l-4 border-l-red-500 border-red-200 bg-red-50': log.status === 'error',
                }"
              >
                <div class="mb-1 flex items-center justify-between">
                  <span
                    class="font-bold capitalize" :class="{
                      'text-blue-600': log.status === 'info',
                      'text-green-600': log.status === 'success',
                      'text-yellow-600': log.status === 'warning',
                      'text-red-600': log.status === 'error',
                    }"
                  >
                    {{ log.title }}
                  </span>
                  <span class="text-gray-400">{{ log.time }}</span>
                </div>
                <div class="text-gray-600 leading-relaxed break-all">
                  {{ log.content }}
                </div>
              </div>
            </TransitionGroup>
          </div>
        </ElCard>
      </div>
    </FaPageMain>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
