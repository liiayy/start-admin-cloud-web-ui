<script setup lang="ts">
import BasicSettings from '@/components/AppAccountForm/basic-settings.vue'
import EditPassword from '@/components/AppAccountForm/edit-password.vue'
import LoginLog from '@/components/AppAccountForm/login-log.vue'

const active = ref(0)
const tabs = ref([
  {
    title: '基本设置',
  },
  {
    title: '安全设置',
  },
  {
    title: '登录日志',
  },
])
</script>

<template>
  <div class="min-h-full w-full">
    <div class="border-b border-e bg-background flex flex-row right-0 top-0 fixed z-1 overflow-auto md:(flex-col h-full w-30 inset-s-0 bottom-0)">
      <div v-for="(tab, index) in tabs" :key="index" class="px-4 py-3 flex-shrink-0 cursor-pointer transition-background-color space-y-2 hover-bg-accent/50" :class="{ 'bg-accent hover-bg-accent!': active === index }" @click="active = index">
        <div class="text-base text-accent-foreground leading-tight">
          {{ tab.title }}
        </div>
      </div>
    </div>
    <div class="p-10 pt-20 flex-col-stretch min-h-full md:(ms-30 pt-10)">
      <BasicSettings v-if="active === 0" />
      <EditPassword v-if="active === 1" />
      <LoginLog v-if="active === 2" />
    </div>
  </div>
</template>
