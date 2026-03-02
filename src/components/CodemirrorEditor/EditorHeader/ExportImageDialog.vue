<script setup lang="ts">
import html2canvas from 'html2canvas'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

defineProps<{
  show: boolean
}>()

const emit = defineEmits([`update:show`, `export`])

const imageQuality = ref<`1` | `2` | `3`>(`2`) // 1-普通，2-高清，3-超清
const imageFormat = ref<`png` | `jpeg` | `jpg`>(`png`)
const exportProgress = ref<number>(0)
const isExporting = ref(false)

async function handleExport() {
  isExporting.value = true
  exportProgress.value = 0

  try {
    // 获取整个预览 wrapper（包含背景色）
    const previewWrapper = document.querySelector(`.preview-wrapper`) as HTMLElement
    if (!previewWrapper) {
      throw new Error(`预览区域不存在`)
    }

    // 设置进度
    exportProgress.value = 30

    // 保存原始样式和状态
    const originalStyle = previewWrapper.style.cssText
    // 检查当前是否是 dark 模式
    const isDark = document.body.classList.contains(`dark`)

    try {
      // 获取预览区域的实际宽度
      const previewWidth = previewWrapper.offsetWidth

      // 临时修改样式以捕获完整内容
      previewWrapper.style.height = `auto`
      previewWrapper.style.overflow = `visible`

      // 配置 html2canvas 选项
      const scale = imageQuality.value === `1` ? 1 : imageQuality.value === `2` ? 2 : 3

      const canvas = await html2canvas(previewWrapper, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: isDark ? `#1a1a1a` : `#ffffff`,
        logging: false,
        // 使用预览区域的实际宽度
        width: previewWidth,
        windowHeight: previewWrapper.scrollHeight,
        // 在克隆的文档中应用 dark 类和样式
        onclone: (clonedDoc) => {
          // 复制原页面的所有 style 标签
          const styles = document.querySelectorAll(`style`)
          styles.forEach((style) => {
            const clonedStyle = clonedDoc.createElement(`style`)
            clonedStyle.textContent = style.textContent
            clonedDoc.head.appendChild(clonedStyle)
          })

          // 复制原页面的所有 link 标签（CSS 文件）
          const links = document.querySelectorAll(`link[rel="stylesheet"]`)
          links.forEach((link) => {
            const clonedLink = clonedDoc.createElement(`link`)
            clonedLink.rel = `stylesheet`
            clonedLink.href = (link as HTMLLinkElement).href
            clonedDoc.head.appendChild(clonedLink)
          })

          // 添加 dark 类到克隆的 body
          if (isDark) {
            clonedDoc.body.classList.add(`dark`)
          }
        },
      })

      exportProgress.value = 80

      // 转换为图片
      const imgData = canvas.toDataURL(`image/${imageFormat.value}`, 1.0)

      // 创建下载链接
      const link = document.createElement(`a`)
      link.download = `markdown_export_${Date.now()}.${imageFormat.value}`
      link.href = imgData
      link.click()

      exportProgress.value = 100
      setTimeout(() => {
        emit(`update:show`, false)
        isExporting.value = false
        exportProgress.value = 0
      }, 500)
    }
    finally {
      // 恢复原始状态
      previewWrapper.style.cssText = originalStyle
    }
  }
  catch (error) {
    console.error(`导出图片失败:`, error)
    isExporting.value = false
    exportProgress.value = 0
  }
}
</script>

<template>
  <Dialog :open="show" @update:open="(val) => emit('update:show', val)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>导出长图</DialogTitle>
        <DialogDescription>
          选择导出图片的质量和格式
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <label class="text-right">图片质量</label>
          <Select v-model="imageQuality" class="col-span-3">
            <SelectTrigger>
              <SelectValue placeholder="选择图片质量" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">
                普通
              </SelectItem>
              <SelectItem value="2">
                高清
              </SelectItem>
              <SelectItem value="3">
                超清
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <label class="text-right">图片格式</label>
          <Select v-model="imageFormat" class="col-span-3">
            <SelectTrigger>
              <SelectValue placeholder="选择图片格式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">
                PNG
              </SelectItem>
              <SelectItem value="jpeg">
                JPEG
              </SelectItem>
              <SelectItem value="jpg">
                JPG
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div v-if="isExporting" class="mt-2">
          <Progress :value="exportProgress" class="w-full" />
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <Button variant="outline" @click="emit('update:show', false)">
          取消
        </Button>
        <Button :disabled="isExporting" @click="handleExport">
          {{ isExporting ? '导出中...' : '导出' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
