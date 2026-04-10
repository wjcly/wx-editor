<script setup lang="ts">
import { toPng } from 'html-to-image'
import mermaid from 'mermaid'
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
    const outputWrapper = document.querySelector(`#output-wrapper`) as HTMLElement
    if (!outputWrapper) {
      throw new Error(`预览区域不存在`)
    }

    exportProgress.value = 10

    const originalStyle = outputWrapper.style.cssText
    const isDark = document.body.classList.contains(`dark`)

    try {
      outputWrapper.style.height = `auto`
      outputWrapper.style.overflow = `visible`

      console.log(`步骤 1: 处理 Mermaid 图表...`)
      exportProgress.value = 20

      // 关键：重新渲染所有 Mermaid 图表为超高分辨率 PNG
      await convertAllMermaidToHighRes(outputWrapper)

      console.log(`步骤 2: 等待字体和图像加载...`)
      exportProgress.value = 40

      // 等待字体加载完成（参考 mermaid-plus-cli 的关键步骤）
      await document.fonts.ready
      await new Promise(resolve => setTimeout(resolve, 500))

      const outputWidth = outputWrapper.offsetWidth
      const outputHeight = outputWrapper.scrollHeight

      console.log(`步骤 3: 开始渲染，尺寸: ${outputWidth}x${outputHeight}`)
      exportProgress.value = 50

      const pixelRatio = imageQuality.value === `1` ? 2 : imageQuality.value === `2` ? 3 : 5

      const dataUrl = await toPng(outputWrapper, {
        pixelRatio,
        backgroundColor: isDark ? `#1a1a1a` : `#ffffff`,
        width: outputWidth,
        height: outputHeight,
        skipAutoScale: true,
        quality: 1.0,
      })

      console.log(`步骤 4: 下载图片...`)
      exportProgress.value = 90

      const link = document.createElement(`a`)
      link.download = `markdown_export_${Date.now()}.${imageFormat.value}`
      link.href = dataUrl
      link.click()

      exportProgress.value = 100
      console.log(`导出完成`)
      setTimeout(() => {
        emit(`update:show`, false)
        isExporting.value = false
        exportProgress.value = 0
      }, 500)
    }
    finally {
      outputWrapper.style.cssText = originalStyle
    }
  }
  catch (error) {
    console.error(`导出图片失败:`, error)
    isExporting.value = false
    exportProgress.value = 0
  }
}

/**
 * 将容器中所有 Mermaid 图表重新渲染为超高分辨率 PNG
 * 参考 mermaid-plus-cli 的实现方式
 */
async function convertAllMermaidToHighRes(container: HTMLElement): Promise<void> {
  const mermaidPres = container.querySelectorAll(`pre.mermaid`)
  const conversions: Array<Promise<void>> = []

  for (const pre of mermaidPres) {
    const mermaidCode = pre.textContent?.trim()
    if (!mermaidCode) continue

    conversions.push(convertMermaidToHighRes(pre, mermaidCode))
  }

  if (conversions.length > 0) {
    await Promise.all(conversions)
  }
}

/**
 * 将单个 Mermaid 图表转换为超高分辨率 PNG
 * 核心步骤：
 * 1. 使用 mermaid.render() 重新渲染为 SVG（确保字体和样式正确）
 * 2. 等待字体加载完成
 * 3. 使用 Canvas 以超高分辨率渲染 SVG
 * 4. 转换为 PNG 并替换原元素
 */
async function convertMermaidToHighRes(preElement: Element, mermaidCode: string): Promise<void> {
  try {
    // 生成唯一 ID
    const chartId = `mermaid-export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 重新渲染为 SVG（这是关键 - 不是使用已渲染的，而是重新渲染）
    const { svg } = await mermaid.render(chartId, mermaidCode)

    // 创建临时容器渲染 SVG
    const tempDiv = document.createElement(`div`)
    tempDiv.style.cssText = `position: absolute; left: -9999px; top: 0; visibility: hidden;`
    tempDiv.innerHTML = svg
    document.body.appendChild(tempDiv)

    // 等待字体加载（参考 mermaid-plus-cli 的 font-timeout 概念）
    await document.fonts.ready
    await new Promise(resolve => setTimeout(resolve, 300))

    const svgElement = tempDiv.querySelector(`svg`) as SVGElement
    if (!svgElement) {
      document.body.removeChild(tempDiv)
      return
    }

    // 获取 SVG 实际尺寸
    const rect = svgElement.getBoundingClientRect()
    const width = rect.width || 800
    const height = rect.height || 600

    // 确定输出分辨率（3x/5x/8x）
    const scale = imageQuality.value === `1` ? 3 : imageQuality.value === `2` ? 5 : 8

    console.log(`  Mermaid 图表: ${Math.round(width)}x${Math.round(height)} → ${Math.round(width * scale)}x${Math.round(height * scale)}`)

    // 创建超高分辨率 Canvas
    const canvas = document.createElement(`canvas`)
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const ctx = canvas.getContext(`2d`, { alpha: false })

    if (!ctx) {
      document.body.removeChild(tempDiv)
      return
    }

    // 白色背景
    ctx.fillStyle = `#ffffff`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 克隆 SVG 并设置明确尺寸
    const svgClone = svgElement.cloneNode(true) as SVGElement
    svgClone.setAttribute(`width`, String(width))
    svgClone.setAttribute(`height`, String(height))

    // 序列化并创建 Blob
    const svgData = new XMLSerializer().serializeToString(svgClone)
    const svgBlob = new Blob([svgData], { type: `image/svg+xml;charset=utf-8` })
    const url = URL.createObjectURL(svgBlob)

    // 加载 SVG 并绘制到 Canvas
    await new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = `high`
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        document.body.removeChild(tempDiv)
        resolve()
      }
      img.onerror = () => {
        console.error(`Failed to load SVG for conversion`)
        URL.revokeObjectURL(url)
        document.body.removeChild(tempDiv)
        resolve()
      }
      img.src = url
    })

    // 转换为 PNG Data URL
    const pngDataUrl = canvas.toDataURL(`image/png`, 1.0)

    // 创建 img 元素替换原元素
    const imgElement = document.createElement(`img`)
    imgElement.src = pngDataUrl
    imgElement.alt = `Mermaid Diagram`
    imgElement.style.cssText = `width: ${width}px; height: ${height}px; max-width: 100%; display: block; margin: 1em auto;`

    const wrapper = document.createElement(`div`)
    wrapper.style.cssText = `text-align: center; margin: 1em 0; padding: 10px;`
    wrapper.appendChild(imgElement)

    preElement.parentNode?.replaceChild(wrapper, preElement)
  }
  catch (error) {
    console.error(`转换 Mermaid 图表失败:`, error)
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
