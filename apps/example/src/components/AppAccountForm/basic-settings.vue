<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import userApi from '@/api/modules/system/auth/user.ts'
import { FormControl, FormField, FormItem, FormMessage } from '@/ui/shadcn/ui/form'

defineOptions({
  name: 'BasicSettingsForm',
})

const loading = ref(false)

const form = useForm({
  validationSchema: toTypedSchema(
    z.object({
      nickname: z.string().min(1, '请输入昵称'),
      mobile: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional().or(z.literal('')),
      email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
      sex: z.number().int().min(0).max(2),
    }),
  ),
  initialValues: {
    nickname: '',
    mobile: '',
    email: '',
    sex: 0,
  },
})

onMounted(async () => {
  try {
    const data = await userApi.getProfile()
    if (data) {
      form.setValues({
        nickname: data.nickname || '',
        mobile: data.mobile || '',
        email: data.email || '',
        sex: data.sex !== undefined ? data.sex : 0,
      })
    }
  }
  catch (error) {
    console.error('获取用户资料失败', error)
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true
  try {
    await userApi.updateProfile(values)
    faToast.success('资料保存成功')
  }
  catch (error) {
    console.error('修改用户资料失败', error)
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex-col-stretch-center w-full">
    <div class="mb-6 space-y-2">
      <h3 class="text-4xl font-bold">
        基本设置
      </h3>
      <p class="text-sm text-muted-foreground lg:text-base">
        完善您的个人资料，方便团队内部协作沟通
      </p>
    </div>
    <form @submit="onSubmit">
      <FormField v-slot="{ componentField, errors }" name="nickname">
        <FormItem class="pb-6 relative space-y-0">
          <FormControl>
            <FaInput placeholder="昵称" class="w-full" :class="{ 'border-destructive': errors.length }" v-bind="componentField">
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

      <FormField v-slot="{ componentField, errors }" name="mobile">
        <FormItem class="pb-6 relative space-y-0">
          <FormControl>
            <FaInput placeholder="手机号" class="w-full" :class="{ 'border-destructive': errors.length }" v-bind="componentField">
              <template #start>
                <FaIcon name="i-lucide:phone" />
              </template>
            </FaInput>
          </FormControl>
          <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
            <FormMessage class="text-xs bottom-1 absolute" />
          </Transition>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField, errors }" name="email">
        <FormItem class="pb-6 relative space-y-0">
          <FormControl>
            <FaInput placeholder="邮箱" class="w-full" :class="{ 'border-destructive': errors.length }" v-bind="componentField">
              <template #start>
                <FaIcon name="i-lucide:mail" />
              </template>
            </FaInput>
          </FormControl>
          <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
            <FormMessage class="text-xs bottom-1 absolute" />
          </Transition>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="sex">
        <FormItem class="pb-6 relative space-y-2">
          <FormControl>
            <el-radio-group v-bind="componentField" class="w-full">
              <el-radio :value="1">
                男
              </el-radio>
              <el-radio :value="2">
                女
              </el-radio>
              <el-radio :value="0">
                保密
              </el-radio>
            </el-radio-group>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FaButton :loading="loading" size="lg" class="mt-8 w-full" type="submit">
        保存
      </FaButton>
    </form>
  </div>
</template>
