<script setup lang="ts">
// @ts-expect-error - turndown module does not have proper type definitions
import TurndownService from 'turndown/lib/turndown.es.js'
import { onBeforeUnmount, ref, nextTick } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/composables/useToast'
import { useStore } from '@/stores'

interface CustomNode {
  nodeName: string
  nodeType: number
  textContent: string
  parentNode: CustomNode | null
  childNodes: CustomNode[]
  firstChild: CustomNode | null
  getAttribute: (name: string) => string | null
  hasAttribute: (name: string) => boolean
  style?: {
    textAlign?: string
  }
}

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits([`update:show`])
const store = useStore()
const url = ref(``)
const loading = ref(false)
const currentStep = ref(``)
const progress = ref(0)

const turndownService = new TurndownService({
  headingStyle: `atx`,
  codeBlockStyle: `fenced`,
  emDelimiter: `*`,
  bulletListMarker: `-`,
  hr: `---`,
})

// 添加自定义规则
turndownService.addRule(`centerAlignedImages`, {
  filter(node: CustomNode) {
    return (
      node.nodeName === `IMG`
      && node.parentNode?.style?.textAlign === `center`
    )
  },
  replacement(_content: string, node: CustomNode) {
    const src = node.getAttribute(`src`)
    return `\n\n<div align="center">\n\n![](${src})\n\n</div>\n\n`
  },
})

turndownService.addRule(`leftAlignedImages`, {
  filter(node: CustomNode) {
    return (
      node.nodeName === `IMG`
      && (!node.parentNode?.style?.textAlign || node.parentNode?.style?.textAlign === `left`)
    )
  },
  replacement(_content: string, node: CustomNode) {
    const src = node.getAttribute(`src`)
    return `\n\n![](${src})\n\n`
  },
})

// 添加代码块规则
turndownService.addRule(`codeBlock`, {
  filter: (node: CustomNode) => {
    const element = node as unknown as HTMLElement
    return element.nodeName === `PRE`
      && element.firstElementChild?.nodeName === `CODE`
  },
  replacement: (_content: string, node: CustomNode) => {
    const element = node as unknown as HTMLElement
    const code = element.textContent || ``
    const lang = element.firstElementChild?.className?.replace(`language-`, ``) || ``
    return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`
  },
})

async function tryFetch(url: string) {

  const proxyUrl = `https://cors.wjcly.com?target=${encodeURIComponent(url)}`
  console.log(`使用自定义 wxProxyConfig 代理获取文章:`, proxyUrl)

  const response = await fetch(proxyUrl)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.text()
}

function closeDialog() {
  url.value = ``
  currentStep.value = ``
  progress.value = 0
  loading.value = false
  emit(`update:show`, false)
}

function handleCancel() {
  if (loading.value)
    return
  closeDialog()
}

async function importFromWechat() {
  console.log(`开始导入...`)
  if (!url.value) {
    toast.error(`请输入公众号文章链接`)
    return
  }

  if (!url.value.includes(`mp.weixin.qq.com`)) {
    toast.error(`请输入正确的微信公众号文章链接`)
    return
  }

  loading.value = true
  progress.value = 0
  try {
    currentStep.value = `正在获取文章内容...`
    progress.value = 10
    const html = await tryFetch(url.value)
    console.log(`获取到原始内容`, html)
    console.log(`内容长度:`, html?.length)
    progress.value = 30

    currentStep.value = `正在解析文章...`
    // 创建一个临时的 div 来解析 HTML
    const div = document.createElement(`div`)
    div.innerHTML = html
    console.log(`解析 HTML 完成`)
    console.log(`HTML 内容预览:`, html.substring(0, 500))
    progress.value = 40

    currentStep.value = `正在清理文章格式...`
    // 清理一些不需要的元素
    const removeSelectors = [
      `script`,
      `style`,
      `link`,
      `meta`,
      `#js_pc_qr_code`,
      `#js_profile_qrcode`,
      `.rich_media_area_primary_tools`,
      `.rich_media_area_extra`,
    ]
    removeSelectors.forEach((selector) => {
      div.querySelectorAll(selector).forEach(el => el.remove())
    })
    console.log(`清理无用元素完成`)
    progress.value = 50

    // 获取文章标题
    const title = div.querySelector(`#activity-name`)?.textContent?.trim()
      || div.querySelector(`h1`)?.textContent?.trim()
      || `导入的文章`
    console.log(`获取到标题:`, title)

    currentStep.value = `正在查找文章内容...`
    // 获取文章内容 - 使用多个 fallback 选择器（增加更多选择器以兼容不同排版）
    let content: Element | null = div.querySelector(`#js_content`)
      || div.querySelector(`article`)
      || div.querySelector(`.rich_media_content`)
      || div.querySelector(`.rich_media_area_primary`)
      || div.querySelector(`#js_article`)

    // 如果仍然找不到，尝试查找包含大量内容的 div
    if (!content) {
      const allDivs = div.querySelectorAll(`div`)
      let maxContentLength = 0
      let bestDiv: Element | null = null
      for (const d of allDivs) {
        const textLen = d.textContent?.length || 0
        if (textLen > maxContentLength && textLen > 500) {
          maxContentLength = textLen
          bestDiv = d
        }
      }
      if (bestDiv) {
        content = bestDiv
      }
    }

    if (!content) {
      throw new Error(`无法找到文章内容，请确保链接正确且文章可访问`)
    }
    console.log(`获取到文章内容`)
    progress.value = 60

    currentStep.value = `正在处理图片...`
    const images = content.querySelectorAll(`img`)
    const totalImages = images.length
    let processedImages = 0

    for (const img of images) {
      const dataSrc = img.getAttribute(`data-src`)
      const originalSrc = img.getAttribute(`src`)

      let imgUrl = dataSrc || originalSrc || ``

      if (imgUrl.startsWith(`//`)) {
        imgUrl = `https:${imgUrl}`
      }

      if (imgUrl.includes(`mmbiz.qpic.cn`)) {
        imgUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imgUrl)}`
      }

      // 只更新 src，不修改原有样式
      if (imgUrl) {
        img.src = imgUrl
      }

      // 只移除微信特有的 data 属性，保留其他属性
      img.removeAttribute(`data-src`)
      img.removeAttribute(`data-type`)
      img.removeAttribute(`data-w`)
      img.removeAttribute(`data-ratio`)
      img.removeAttribute(`data-fail`)
      img.removeAttribute(`data-width`)
      img.removeAttribute(`data-height`)
      img.removeAttribute(`crossorigin`)

      processedImages++
      progress.value = 70 + Math.floor((processedImages / totalImages) * 15)
    }
    console.log(`处理图片完成`)

    currentStep.value = `正在生成 HTML 内容...`
    progress.value = 90

    // 生成 HTML 内容（使用标题和处理后的内容）
    const htmlContent = `<h1>${title}</h1>${content.innerHTML}`
    console.log(`生成 HTML 完成`)
    progress.value = 95

    currentStep.value = `正在更新编辑器...`
    // 确保编辑器实例存在
    if (!store.editor) {
      throw new Error(`编辑器未初始化，请刷新页面后重试`)
    }

    // 更新编辑器内容为 HTML
    try {
      // 先清空编辑器
      store.editor.setValue(``)
      // 等待下一个渲染周期
      await nextTick()
      // 重置编辑器状态
      store.editor.clearHistory()
      // 设置新内容为 HTML
      store.editor.setValue(htmlContent)
      // 移动光标到开始位置
      store.editor.setCursor(0, 0)
      // 刷新编辑器
      store.editor.refresh()
      // 更新存储的内容
      if (store._currentPost) {
        store._currentPost.content = htmlContent
      }
    }
    catch (error) {
      console.error(`更新编辑器内容时出错:`, error)
      throw new Error(`更新编辑器内容失败，请刷新页面后重试`)
    }

    console.log(`更新编辑器内容完成`)
    progress.value = 100

    closeDialog()
    toast.success(`导入成功`)
  }
  catch (error) {
    console.error(`导入失败:`, error)
    toast.error(`导入失败：${(error as Error).message}`)
  }
  finally {
    loading.value = false
    currentStep.value = ``
    progress.value = 0
  }
}

onBeforeUnmount(() => {
  url.value = ``
  currentStep.value = ``
  progress.value = 0
  loading.value = false
})

defineExpose({
  show: props.show,
  closeDialog,
})
</script>

<template>
  <Dialog :open="show" @update:open="(val) => emit('update:show', val)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>导入公众号文章</DialogTitle>
        <DialogDescription>
          请输入微信公众号文章链接
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <Input v-model="url" placeholder="请输入微信公众号文章链接（以 mp.weixin.qq.com 开头）" :disabled="loading" />

        <div v-if="loading" class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">{{ currentStep }}</span>
            <span class="text-muted-foreground">{{ progress }}%</span>
          </div>
          <Progress :value="progress" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="loading" @click="handleCancel">
          取消
        </Button>
        <Button :loading="loading" @click="importFromWechat">
          导入
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
