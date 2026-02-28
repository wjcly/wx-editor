<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RewriteConfig {
  level: string
  styles: string[]
  retains: string[]
  extras: string[]
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: `update:open`, value: boolean): void
  (e: `confirm`, config: RewriteConfig): void
}>()

// 改写程度选项
const selectedLevel = ref<string>(`medium`)

// 改写风格选项
const selectedStyles = ref<string[]>([`synonym`, `sentence`])
const styleOptions = [
  { label: `同义词替换`, value: `synonym` },
  { label: `句式重组`, value: `sentence` },
  { label: `内容扩充`, value: `expand` },
  { label: `语气调整`, value: `tone` },
]

// 保留原文选项
const selectedRetains = ref<string[]>([`quote`, `term`, `location`, `number`])
const retainOptions = [
  { label: `引用内容`, value: `quote` },
  { label: `专业术语`, value: `term` },
  { label: `人名地名`, value: `location` },
  { label: `数字数据`, value: `number` },
]

// 其他选项
const selectedExtras = ref<string[]>([`readability`])
const extraOptions = [
  { label: `优化SEO关键词`, value: `seo` },
  { label: `提升可读性`, value: `readability` },
  { label: `增加原创度`, value: `originality` },
]

function handleConfirm() {
  emit(`confirm`, {
    level: selectedLevel.value,
    styles: selectedStyles.value,
    retains: selectedRetains.value,
    extras: selectedExtras.value,
  })
  handleClose()
}

function handleClose() {
  emit(`update:open`, false)
}

function toggleOption(array: string[], value: string) {
  const index = array.indexOf(value)
  if (index === -1) {
    array.push(value)
  }
  else {
    array.splice(index, 1)
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleClose">
    <DialogContent class="rewrite-dialog sm:max-w-[500px]">
      <DialogHeader class="DialogHeader">
        <DialogTitle class="DialogTitle">
          AI 智能改写设置
        </DialogTitle>
        <DialogDescription class="DialogDescription">
          选择改写风格和程度，AI 将根据设置智能优化内容
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-6 py-2">
        <!-- 改写程度 -->
        <div class="grid gap-2">
          <div class="text-base">
            改写程度
          </div>
          <div class="flex gap-2">
            <Button
              v-for="level in ['light', 'medium', 'deep']"
              :key="level"
              :variant="selectedLevel === level ? 'default' : 'outline'"
              class="Button flex-1"
              @click="selectedLevel = level"
            >
              {{ {
                light: '轻度改写',
                medium: '中度改写',
                deep: '深度改写',
              }[level] }}
            </Button>
          </div>
        </div>

        <!-- 改写风格 -->
        <div class="grid gap-2">
          <div class="text-base">
            改写风格
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="option in styleOptions"
              :key="option.value"
              :variant="selectedStyles.includes(option.value) ? 'default' : 'outline'"
              class="Button min-w-20"
              @click="toggleOption(selectedStyles, option.value)"
            >
              {{ option.label }}
            </Button>
          </div>
        </div>

        <!-- 保留原文 -->
        <div class="grid gap-2">
          <div class="text-base">
            保留原文
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="option in retainOptions"
              :key="option.value"
              :variant="selectedRetains.includes(option.value) ? 'default' : 'outline'"
              class="Button min-w-20"
              @click="toggleOption(selectedRetains, option.value)"
            >
              {{ option.label }}
            </Button>
          </div>
        </div>

        <!-- 其他选项 -->
        <div class="grid gap-2">
          <div class="text-base">
            其他选项
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="option in extraOptions"
              :key="option.value"
              :variant="selectedExtras.includes(option.value) ? 'default' : 'outline'"
              class="Button min-w-20"
              @click="toggleOption(selectedExtras, option.value)"
            >
              {{ option.label }}
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter class="DialogFooter">
        <Button variant="outline" class="Button" @click="handleClose">
          取消
        </Button>
        <Button class="Button min-w-20" @click="handleConfirm">
          开始改写
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style lang="less" scoped>
.rewrite-dialog {
}

.hover\:bg-accent:hover {
  background-color: var(--accent);
  cursor: pointer;
}
</style>
