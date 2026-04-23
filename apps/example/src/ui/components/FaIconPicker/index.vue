<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useVModel } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

defineOptions({
  name: 'FaIconPicker',
})

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
}>(), {
  modelValue: '',
  placeholder: '点击选择图标',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const value = useVModel(props, 'modelValue', emit)

// 图标库配置 (同步自 src/iconify/index.json)
const collections = [
  { label: 'Element Plus', prefix: 'ep' },
  { label: 'Ant Design', prefix: 'ant-design' },
  { label: 'Material Design', prefix: 'mdi' },
  { label: 'Remix Icon', prefix: 'ri' },
  { label: 'IconPark', prefix: 'icon-park' },
  { label: 'Flagpack', prefix: 'flagpack' },
  { label: 'Logos', prefix: 'logos' },
  { label: 'Emoji', prefix: 'twemoji' },
  { label: 'VS Code', prefix: 'vscode-icons' },
]

const currentCollection = ref(collections[0].prefix)
const searchName = ref('')
const currentPage = ref(1)
const pageSize = 48 // 6x8 grid

const icons = ref<string[]>([])
const loading = ref(false)

async function fetchIcons() {
  loading.value = true
  try {
    const prefix = currentCollection.value
    const query = searchName.value

    if (query) {
      // 搜索接口返回的是 prefix:name，统一加上 i- 前缀以符合项目规范
      const res = await fetch(`https://api.iconify.design/search?query=${query}&prefixes=${prefix}&limit=120`)
      const data = await res.json()
      icons.value = (data.icons || []).map((icon: string) => `i-${icon}`)
    }
    else {
      const res = await fetch(`https://api.iconify.design/collection?prefix=${prefix}`)
      const data = await res.json()

      let list: string[] = data.uncategorized || []
      if (data.categories) {
        Object.values(data.categories).forEach((catIcons: any) => {
          list = list.concat(catIcons)
        })
      }

      // 拼接 i-prefix:name 格式
      icons.value = list.map(name => `i-${prefix}:${name}`)
    }
  }
  catch {
    icons.value = []
  }
  finally {
    loading.value = false
    currentPage.value = 1
  }
}

const pagedIcons = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return icons.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(icons.value.length / pageSize))

watch([currentCollection, searchName], () => {
  fetchIcons()
}, { immediate: true })

const visible = ref(false)

function handleSelect(icon: string) {
  // 保持项目标准的 i- 前缀格式
  value.value = icon
  visible.value = false
}

function handleClear() {
  value.value = ''
}
</script>

<template>
  <div class="w-full relative">
    <ElPopover
      v-model:visible="visible"
      placement="bottom-start"
      :width="500"
      trigger="click"
      popper-class="!p-0 !rounded-lg overflow-hidden"
    >
      <template #reference>
        <ElInput
          v-model="value"
          :placeholder="placeholder"
          :disabled="disabled"
          readonly
          class="cursor-pointer"
        >
          <template #prefix>
            <div v-if="value" class="p-1 flex items-center justify-center">
              <FaIcon :name="value.replace(/^i-/, '')" class="size-4" />
            </div>
            <div v-else class="p-1 opacity-50 flex items-center justify-center">
              <FaIcon name="ep:search" class="size-4" />
            </div>
          </template>
          <template #suffix>
            <div v-if="value && !disabled" class="opacity-50 cursor-pointer hover:opacity-100" @click.stop="handleClear">
              <FaIcon name="ep:circle-close" class="size-4" />
            </div>
          </template>
        </ElInput>
      </template>

      <div class="bg-white flex flex-col h-[500px] dark:bg-zinc-900">
        <!-- 搜索栏 -->
        <div class="px-4 py-3 border-b">
          <ElInput
            v-model="searchName"
            placeholder="搜索图标名称..."
            clearable
          >
            <template #prefix>
              <FaIcon name="ep:search" class="opacity-50 size-4" />
            </template>
          </ElInput>
        </div>

        <div class="flex flex-1 overflow-hidden">
          <!-- 左侧边栏 -->
          <div class="p-2 border-r bg-zinc-50/50 flex flex-col gap-1 w-32 overflow-y-auto dark:bg-zinc-950/20">
            <div
              v-for="item in collections"
              :key="item.prefix"
              class="text-xs px-3 py-2 rounded-md cursor-pointer transition-colors"
              :class="[
                currentCollection === item.prefix
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500',
              ]"
              @click="currentCollection = item.prefix"
            >
              {{ item.label }}
            </div>
          </div>

          <!-- 右侧内容区 -->
          <div class="flex flex-1 flex-col relative">
            <div v-loading="loading" class="p-3 flex-1 overflow-y-auto">
              <div v-if="icons.length > 0" class="gap-2 grid grid-cols-6">
                <div
                  v-for="icon in pagedIcons"
                  :key="icon"
                  class="group border border-transparent rounded flex aspect-square cursor-pointer transition-all items-center justify-center hover:border-primary hover:bg-primary/5"
                  :class="{ 'border-primary bg-primary/5': icon === value }"
                  :title="icon"
                  @click="handleSelect(icon)"
                >
                  <Icon :icon="icon.replace(/^i-/, '')" class="size-6 transition-transform group-hover:scale-110" />
                </div>
              </div>
              <div v-else-if="!loading" class="text-zinc-400 flex flex-col gap-2 h-full items-center justify-center">
                <div class="i-tdesign:image-error opacity-20 size-12" />
                <span class="text-xs">未找到相关图标</span>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="totalPages > 1" class="px-3 py-2 border-t flex items-center justify-between">
              <span class="text-[10px] text-zinc-400">共 {{ icons.length }} 个</span>
              <div class="flex gap-1 items-center">
                <button
                  :disabled="currentPage === 1"
                  type="button"
                  class="p-1 disabled:opacity-30"
                  @click="currentPage--"
                >
                  <FaIcon name="ep:arrow-left" class="size-3" />
                </button>
                <span class="text-xs">{{ currentPage }} / {{ totalPages }}</span>
                <button
                  :disabled="currentPage === totalPages"
                  type="button"
                  class="p-1 disabled:opacity-30"
                  @click="currentPage++"
                >
                  <FaIcon name="ep:arrow-right" class="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ElPopover>
  </div>
</template>
