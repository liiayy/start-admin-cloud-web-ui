<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import apiAuth from '@/api/modules/system/auth/auth'
import { useConfig } from '@/composables/useConfig'
import { ConfigConstants } from '@/constants/ConfigConstants'
import { FormControl, FormField, FormItem, FormMessage } from '@/ui/shadcn/ui/form'

defineOptions({
  name: 'LoginForm',
})

const props = defineProps<{
  username?: string
}>()

const emits = defineEmits<{
  onLogin: [username?: string]
  onRegister: [username?: string]
  onResetPassword: [username?: string]
}>()

const appAccountStore = useAppAccountStore()

const title = import.meta.env.VITE_APP_TITLE
const loading = ref(false)

// 登录方式，default 账号密码登录，qrcode 扫码登录
const type = ref<'default' | 'qrcode'>('default')

const { captchaEnabled } = useConfig(ConfigConstants.CAPTCHA_ENABLED)
const captchaImg = ref('')

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    username: z.string().min(1, '请输入用户名'),
    password: z.string().min(1, '请输入密码'),
    code: z.string().optional(),
    uuid: z.string().optional(),
    remember: z.boolean(),
  }).refine((data) => {
    if (captchaEnabled.value && !data.code) {
      return false
    }
    return true
  }, {
    message: '请输入验证码',
    path: ['code'],
  })),
  initialValues: {
    username: props.username ?? localStorage.getItem('login_username') ?? '',
    password: '',
    code: '',
    uuid: '',
    remember: localStorage.getItem('login_username') !== null,
  },
})

async function getCaptcha() {
  if (!captchaEnabled.value) {
    return
  }
  const res = await apiAuth.getCaptcha()
  captchaImg.value = res.img
  form.setFieldValue('uuid', res.uuid)
}

watch(captchaEnabled, (val) => {
  if (val) {
    getCaptcha()
  }
}, { immediate: true })

const onSubmit = form.handleSubmit((values) => {
  loading.value = true
  appAccountStore.login(values).then(() => {
    if (values.remember) {
      localStorage.setItem('login_username', values.username)
    }
    else {
      localStorage.removeItem('login_username')
    }
    emits('onLogin', values.username)
  }).catch(() => {
    // 登录失败重刷验证码
    getCaptcha()
  }).finally(() => {
    loading.value = false
  })
})

function testAccount(account: string) {
  form.setFieldValue('username', account)
  form.setFieldValue('password', '123456')
  onSubmit()
}
</script>

<template>
  <div class="p-12 flex-col-stretch-center min-h-500px w-full">
    <div class="mb-6 space-y-2">
      <h3 class="text-4xl font-bold">
        欢迎使用 👋🏻
      </h3>
      <p class="text-sm text-muted-foreground lg:text-base">
        {{ title }}
      </p>
    </div>
    <div class="mb-4">
      <FaTabs
        v-model="type" :list="[
          { label: '账号密码登录', value: 'default' },
          // { label: '扫码登录', value: 'qrcode' },
        ]" class="inline-flex"
      />
    </div>
    <div v-show="type === 'default'">
      <form @submit="onSubmit">
        <FormField v-slot="{ componentField, errors }" name="username">
          <FormItem class="pb-6 relative space-y-0">
            <FormControl>
              <FaInput type="text" placeholder="用户名" class="w-full" :class="{ 'border-destructive': errors.length }" v-bind="componentField">
                <template #start>
                  <FaIcon name="i-lucide:user" />
                </template>
              </FaInput>
            </FormControl>
            <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
              <FormMessage class="text-xs bottom-1 absolute" />
            </Transition>
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField, errors }" name="password">
          <FormItem class="pb-6 relative space-y-0">
            <FormControl>
              <FaInput type="password" placeholder="密码" class="w-full" :class="{ 'border-destructive': errors.length }" v-bind="componentField">
                <template #start>
                  <FaIcon name="i-lucide:lock" />
                </template>
              </FaInput>
            </FormControl>
            <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
              <FormMessage class="text-xs bottom-1 absolute" />
            </Transition>
          </FormItem>
        </FormField>
        <FormField v-if="captchaEnabled" v-slot="{ componentField, errors }" name="code">
          <FormItem class="pb-6 relative space-y-0">
            <div class="flex gap-2">
              <FormControl class="flex-1">
                <FaInput type="text" placeholder="验证码" :class="{ 'border-destructive': errors.length }" v-bind="componentField">
                  <template #start>
                    <FaIcon name="i-lucide:shield-check" />
                  </template>
                </FaInput>
              </FormControl>
              <div class="border rounded-md shrink-0 h-9 w-28 cursor-pointer overflow-hidden" @click="getCaptcha">
                <img v-if="captchaImg" :src="captchaImg" class="h-full w-full object-cover">
              </div>
            </div>
            <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
              <FormMessage class="text-xs bottom-1 absolute" />
            </Transition>
          </FormItem>
        </FormField>
        <div class="mb-4 flex-center-between">
          <div class="flex-center-start">
            <FormField v-slot="{ componentField }" type="checkbox" name="remember">
              <FormItem>
                <FormControl>
                  <FaCheckbox v-bind="componentField">
                    记住我
                  </FaCheckbox>
                </FormControl>
              </FormItem>
            </FormField>
          </div>
          <!--          <FaButton variant="link" class="p-0 h-auto" type="button" @click="emits('onResetPassword', form.values.username)"> -->
          <!--            忘记密码了? -->
          <!--          </FaButton> -->
        </div>
        <FaButton :loading="loading" size="lg" class="w-full" type="submit">
          登录
        </FaButton>
        <!--        <div class="text-sm mt-4 flex-center gap-2"> -->
        <!--          <span class="text-secondary-foreground op-50">还没有帐号?</span> -->
        <!--          <FaButton variant="link" class="p-0 h-auto" type="button" @click="emits('onRegister', form.values.username)"> -->
        <!--            注册新帐号 -->
        <!--          </FaButton> -->
        <!--        </div> -->
      </form>
      <div class="mt-4 text-center -mb-4">
        <FaDivider>演示账号一键登录</FaDivider>
        <div class="space-x-2">
          <FaButton variant="default" size="sm" plain @click="testAccount('admin')">
            admin
          </FaButton>
          <FaButton variant="outline" size="sm" plain @click="testAccount('test')">
            test
          </FaButton>
        </div>
      </div>
    </div>
    <div v-show="type === 'qrcode'">
      <div class="flex-col-center">
        <img src="https://s2.loli.net/2024/04/26/GsahtuIZ9XOg5jr.png" class="h-[250px] w-[250px]">
        <div class="text-sm text-secondary-foreground mt-2 op-50">
          请使用微信扫码登录
        </div>
      </div>
    </div>
  </div>
</template>
