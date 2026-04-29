<script setup lang="ts">
import logo from '@/assets/images/logo.svg'

const versionType = ref('basic')
watch(versionType, (val) => {
  if (val === 'pro') {
    location.href = `${location.origin}${location.pathname}`.replace('basic-example', 'pro-example')
  }
})

const useCases = ref([
  { title: '小型公司', description: '让后端开发人员能在短时间内转型成为全栈开发' },
  { title: '中小型公司', description: '提高项目开发效率，减轻前端开发人员工作压力' },
  { title: '项目型公司', description: '应对绝大部分甲方需求，实现高度定制化' },
  { title: '产品型公司', description: '完善的开发文档和代码注释，为产品保驾护航' },
])

function open(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="bg-background size-full absolute overflow-auto">
    <div class="mx-auto px-4 py-6 max-w-7xl md-px-8 md-py-10">
      <!-- Top Bar -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex gap-3 items-center">
          <FaIcon :name="logo" class="p-1 border rounded-lg size-10" />
          <span class="tracking-tight font-semibold">StartAdmin</span>
        </div>
      </div>

      <!-- Hero: Asymmetric split -->
      <div class="mb-6 gap-4 grid items-stretch md-grid-cols-[3fr_2fr]">
        <!-- Left: Title & CTA -->
        <div class="hero-enter p-6 border rounded-xl relative overflow-hidden md-p-8">
          <div class="text-xs text-muted-foreground tracking-widest font-medium mb-3 uppercase">
            Spring Cloud · MyBatis-Flex · Vue 3 · Vite
          </div>
          <h1 class="text-2xl leading-tight tracking-tight font-semibold mb-3 md-text-3xl">
            欢迎使用
            <div class="text-4xl tracking-tight font-semibold md-text-6xl">
              StartAdmin
            </div>
          </h1>
          <p class="text-sm text-muted-foreground leading-relaxed mb-6 max-w-prose md-text-base">
            这是一款基于 <span class="text-foreground font-medium">Spring Cloud</span> + <span class="text-foreground font-medium">Vue3</span> 的微服务中后台企业级云架构。
          </p>
          <div class="flex flex-wrap gap-3">
            <FaButton size="lg" @click="open('https://github.com/muziseo')">
              木子软件开源主页
            </FaButton>
          </div>
        </div>

        <!-- Right: Stats -->
        <div class="gap-4 grid grid-rows-2">
          <div class="stat-enter border rounded-xl bg-neutral-950/[.012] dark:bg-white/5" :style="{ animationDelay: '100ms' }">
            <div class="p-5 flex flex-col h-full justify-between">
              <div class="text-xs text-muted-foreground tracking-widest font-medium uppercase">
                稳定运行
              </div>
              <div>
                <div class="text-3xl tracking-tight font-semibold mb-1 md-text-4xl">
                  1000+
                </div>
                <div class="text-sm text-muted-foreground">
                  个项目稳定运行
                </div>
              </div>
            </div>
          </div>
          <div class="stat-enter border rounded-xl bg-neutral-950/[.012] dark:bg-white/5" :style="{ animationDelay: '200ms' }">
            <div class="p-5 flex flex-col h-full justify-between">
              <div class="text-xs text-muted-foreground tracking-widest font-medium uppercase">
                持续维护
              </div>
              <div>
                <div class="text-3xl tracking-tight font-semibold mb-1 md-text-4xl">
                  5年
                </div>
                <div class="text-sm text-muted-foreground flex flex-wrap gap-1 items-center">
                  <span>已在</span>
                  <span class="text-foreground font-semibold">电商、直播、OA、CRM、ERP</span>
                  <span>等多个领域提供技术支持</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Use Cases -->
      <div class="mb-6">
        <div class="mb-3 flex gap-2 items-center">
          <div class="rounded-full bg-primary h-4 w-0.5" />
          <h2 class="text-xs text-muted-foreground tracking-widest font-semibold uppercase">
            应用场景
          </h2>
        </div>
        <div class="gap-3 grid grid-cols-2 md-grid-cols-4">
          <div
            v-for="(useCase, i) in useCases"
            :key="useCase.title"
            class="card-enter border rounded-xl bg-neutral-950/[.012] dark:bg-white/5"
            :style="{ animationDelay: `${i * 60}ms` }"
          >
            <div class="p-5">
              <div class="text-sm font-semibold mb-2">
                {{ useCase.title }}
              </div>
              <div class="text-xs text-muted-foreground leading-relaxed">
                {{ useCase.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-enter {
  animation: slide-up 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.stat-enter {
  animation: slide-up 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.card-enter {
  animation: fade-up 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.active-scale-98:active {
  transform: scale(0.98);
}
</style>
