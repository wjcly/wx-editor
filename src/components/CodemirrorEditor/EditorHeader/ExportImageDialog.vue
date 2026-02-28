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

const imageQuality = ref<`1` | `2` | `3`>(`2`) // 1-普通, 2-高清, 3-超清
const imageFormat = ref<`png` | `jpeg`>(`png`)
const exportProgress = ref<number>(0)
const isExporting = ref(false)

async function handleExport() {
  isExporting.value = true
  exportProgress.value = 0

  try {
    // 获取预览区域元素
    const previewElement = document.querySelector(`#output`) as HTMLElement
    if (!previewElement) {
      throw new Error(`预览区域不存在`)
    }

    // 设置进度
    exportProgress.value = 30

    // 保存原始滚动位置和样式
    const originalScrollTop = previewElement.scrollTop
    const originalStyle = previewElement.style.cssText
    const originalHtml = previewElement.innerHTML

    try {
      // 临时修改样式以捕获完整内容
      previewElement.style.height = `auto`
      previewElement.style.overflow = `visible`

      // 处理表格样式
      const tables = previewElement.querySelectorAll(`table`)
      tables.forEach((table) => {
        const tableEl = table as HTMLElement
        tableEl.style.cssText = `
          width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          margin: 16px 0 !important;
        `

        // 处理表格单元格
        const cells = tableEl.querySelectorAll(`th, td`)
        cells.forEach((cell) => {
          const cellEl = cell as HTMLElement
          cellEl.style.cssText = `
            padding: 8px !important;
            border: 1px solid #dfdfdf !important;
            word-break: break-all !important;
            white-space: normal !important;
            text-align: left !important;
          `
        })
      })

      // 临时修改标题样式
      const titles = previewElement.querySelectorAll(`h1, h2`)
      titles.forEach((title) => {
        const titleEl = title as HTMLElement
        const computedStyle = window.getComputedStyle(titleEl)
        const backgroundColor = computedStyle.getPropertyValue(`background-color`)
        const isH1 = titleEl.tagName.toLowerCase() === `h1`

        titleEl.style.cssText = isH1
          ? `
            display: block !important;
            padding: 0.5em 1em !important;
            margin: 0 !important;
            color: hsl(var(--foreground)) !important;
            font-size: 1.2em !important;
            font-weight: bold !important;
            text-align: center !important;
            border-bottom: 2px solid var(--md-primary-color) !important;
          `
          : `
            display: block !important;
            padding: 0.5em 1em !important;
            margin: 2em auto !important;
            color: #fff !important;
            background: ${backgroundColor} !important;
            font-size: 1.2em !important;
            font-weight: bold !important;
            text-align: center !important;
            line-height: 1.5 !important;
            border-radius: 4px !important;
          `
      })

      // 配置html2canvas选项
      const scale = imageQuality.value === `1` ? 1 : imageQuality.value === `2` ? 2 : 3

      // 等待所有图片加载完成
      await Promise.all(Array.from(previewElement.getElementsByTagName(`img`)).map((img) => {
        return new Promise((resolve) => {
          const handleImage = () => {
            // 创建一个新的图片元素
            const newImg = new Image()
            newImg.crossOrigin = `anonymous`

            // 使用代理服务器URL
            const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(img.src)}`

            newImg.onload = () => {
              // 创建canvas来处理图片
              const canvas = document.createElement(`canvas`)
              canvas.width = newImg.width
              canvas.height = newImg.height
              const ctx = canvas.getContext(`2d`)
              ctx?.drawImage(newImg, 0, 0)

              // 将原图替换为base64格式
              try {
                img.src = canvas.toDataURL(`image/png`)
                resolve(null)
              }
              catch (e) {
                console.warn(`图片转换失败:`, e)
                // 如果转换失败，直接使用代理URL
                img.src = proxyUrl
                resolve(null)
              }
            }

            newImg.onerror = () => {
              console.warn(`图片加载失败，尝试使用代理: ${img.src}`)
              // 直接使用代理URL
              img.src = proxyUrl
              resolve(null)
            }

            // 尝试加载图片
            newImg.src = proxyUrl
          }

          if (img.complete) {
            handleImage()
          }
          else {
            img.onload = handleImage
            img.onerror = () => {
              console.warn(`图片加载失败: ${img.src}`)
              // 使用占位图作为最后的备选方案
              img.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%23ccc" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/%3E%3C/svg%3E`
              resolve(null)
            }
          }
        })
      }))

      const canvas = await html2canvas(previewElement, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: document.body.classList.contains(`dark`) ? `#1a1a1a` : `#ffffff`,
        logging: false,
        scrollY: -window.scrollY,
        windowWidth: previewElement.scrollWidth * scale,
        windowHeight: previewElement.scrollHeight * scale,
        imageTimeout: 30000, // 增加图片加载超时时间
        proxy: `https://images.weserv.nl/?url=`, // 设置全局代理
        onclone: (clonedDoc) => {
          // 确保克隆的元素也应用了相同的样式
          const clonedTitles = clonedDoc.querySelectorAll(`h1, h2`)
          clonedTitles.forEach((title) => {
            const titleEl = title as HTMLElement
            const computedStyle = window.getComputedStyle(titleEl)
            const backgroundColor = computedStyle.getPropertyValue(`background-color`)
            const isH1 = titleEl.tagName.toLowerCase() === `h1`

            titleEl.style.cssText = isH1
              ? `
                display: block !important;
                padding: 0.5em 1em !important;
                margin: 0 !important;
                color: hsl(var(--foreground)) !important;
                font-size: 1.2em !important;
                font-weight: bold !important;
                text-align: center !important;
                border-bottom: 2px solid var(--md-primary-color) !important;
              `
              : `
                display: block !important;
                padding: 0.5em 1em !important;
                margin: 2em auto !important;
                color: #fff !important;
                background: ${backgroundColor} !important;
                font-size: 1.2em !important;
                font-weight: bold !important;
                text-align: center !important;
                line-height: 1.5 !important;
                border-radius: 4px !important;
              `
          })
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
      previewElement.innerHTML = originalHtml
      previewElement.style.cssText = originalStyle
      previewElement.scrollTop = originalScrollTop
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
