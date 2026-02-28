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
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { generateCssRewritePrompt, streamAIContent } from '@/services/ai'
import { useStore } from '@/stores'

const _props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: `update:show`, value: boolean): void
}>()

const store = useStore()

// 优化选项
const selectedStyles = ref<string[]>([`optimize`, `readability`])
const styleOptions = [
  { label: `优化结构`, value: `optimize` },
  { label: `提高可读性`, value: `readability` },
  { label: `简化代码`, value: `simplify` },
  { label: `添加注释`, value: `comment` },
]

// 保留选项
const selectedRetains = ref<string[]>([`selectors`, `important`])
const retainOptions = [
  { label: `选择器`, value: `selectors` },
  { label: `!important`, value: `important` },
  { label: `媒体查询`, value: `media` },
  { label: `动画`, value: `animation` },
]

// 自定义提示词
const customPrompt = ref(``)

const isProcessing = ref(false)
const progress = ref(0)

function toggleOption(array: string[], value: string) {
  const index = array.indexOf(value)
  if (index === -1)
    array.push(value)
  else
    array.splice(index, 1)
}

async function handleApplyStyle() {
  try {
    if (!store.cssEditor)
      return

    isProcessing.value = true
    progress.value = 0

    const cssContent = store.cssEditor.getValue()
    const prompt = generateCssRewritePrompt({
      styles: selectedStyles.value,
      retains: selectedRetains.value,
      css: cssContent,
      customPrompt: customPrompt.value,
    })

    let processedContent = ``
    await streamAIContent({
      prompt,
      onToken: (token: string) => {
        processedContent += token
        progress.value = Math.min(90, progress.value + 10)
      },
    })

    if (!processedContent.trim()) {
      console.warn(`处理后的内容为空，保持原内容不变`)
      return
    }

    // 更新编辑器内容
    const doc = store.cssEditor.getDoc()
    const lastLine = doc.lastLine()
    const lastCh = doc.getLine(lastLine).length
    doc.replaceRange(processedContent, { line: 0, ch: 0 }, { line: lastLine, ch: lastCh })
    store.cssEditor.refresh()

    progress.value = 100

    // 完成后关闭对话框
    setTimeout(() => {
      emit(`update:show`, false)
      isProcessing.value = false
      progress.value = 0
    }, 500)
  }
  catch (error) {
    console.error(`应用样式失败:`, error)
    isProcessing.value = false
    progress.value = 0
  }
}
</script>

<template>
  <Dialog :open="_props.show" @update:open="(val) => emit('update:show', val)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>AI优化CSS</DialogTitle>
        <DialogDescription>
          选择优化选项,AI将智能优化CSS代码
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <!-- 优化选项 -->
        <div class="grid gap-2">
          <div class="text-base">
            优化选项
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="option in styleOptions"
              :key="option.value"
              :variant="selectedStyles.includes(option.value) ? 'default' : 'outline'"
              class="min-w-20"
              @click="toggleOption(selectedStyles, option.value)"
            >
              {{ option.label }}
            </Button>
          </div>
        </div>

        <!-- 保留选项 -->
        <div class="grid gap-2">
          <div class="text-base">
            保留选项
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="option in retainOptions"
              :key="option.value"
              :variant="selectedRetains.includes(option.value) ? 'default' : 'outline'"
              class="min-w-20"
              @click="toggleOption(selectedRetains, option.value)"
            >
              {{ option.label }}
            </Button>
          </div>
        </div>

        <!-- 自定义提示词 -->
        <div class="grid gap-2">
          <div class="text-base">
            自定义要求 (可选)
          </div>
          <Input
            v-model="customPrompt"
            placeholder="输入额外的优化要求..."
            :disabled="isProcessing"
          />
        </div>

        <!-- 进度条 -->
        <div v-if="isProcessing" class="mt-2">
          <Progress :value="progress" class="w-full" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:show', false)">
          取消
        </Button>
        <Button
          :disabled="isProcessing || selectedStyles.length === 0"
          @click="handleApplyStyle"
        >
          {{ isProcessing ? '处理中...' : '应用样式' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style lang="less" scoped>
</style>
