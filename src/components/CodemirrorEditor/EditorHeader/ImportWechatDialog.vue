<script setup lang="ts">
// @ts-expect-error - turndown module does not have proper type definitions
import TurndownService from 'turndown/lib/turndown.es.js'
import { onBeforeUnmount, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/composables/useToast'
import { useStore } from '@/stores'
import { getWechatConfig } from '@/utils/wechatConfig'

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
  // 优先使用用户在微信配置中设置的代理域名（wxProxyConfig）
  const wechatConfig = getWechatConfig()
  let proxyUrl: string
  if (wechatConfig && wechatConfig.proxyOrigin) {
    // 假设代理服务接受 `?url=` 参数进行转发
    proxyUrl = `${wechatConfig.proxyOrigin}?url=${encodeURIComponent(url)}`
    console.log(`使用自定义 wxProxyConfig 代理获取文章:`, proxyUrl)
  }
  else {
    // 回退到 Vite 本地代理
    proxyUrl = `/api/wechat?url=${encodeURIComponent(url)}`
    console.log(`使用 Vite 本地代理获取文章:`, proxyUrl)
  }
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
    console.log(`获取到原始内容`)
    progress.value = 30

    currentStep.value = `正在解析文章...`
    // 创建一个临时的 div 来解析 HTML
    const div = document.createElement(`div`)
    div.innerHTML = html
    console.log(`解析HTML完成`)
    progress.value = 40

    currentStep.value = `正在格式化HTML内容...`
    // 引入并使用HTML格式化功能
    const { formatHtml } = await import(`@/utils/htmlFormatter`)
    const formattedHtml = formatHtml(html)
    div.innerHTML = formattedHtml
    console.log(`格式化HTML完成`)
    progress.value = 50

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
    progress.value = 60

    // 获取文章标题
    const title = div.querySelector(`#activity-name`)?.textContent?.trim()
      || div.querySelector(`h1`)?.textContent?.trim()
      || `导入的文章`
    console.log(`获取到标题:`, title)

    currentStep.value = `正在处理图片...`
    // 获取文章内容
    const content = div.querySelector(`#js_content`)
      || div.querySelector(`article`)
      || div.querySelector(`.rich_media_content`)
    if (!content) {
      throw new Error(`无法找到文章内容，请确保链接正确且文章可访问`)
    }
    console.log(`获取到文章内容`)
    progress.value = 70

    // 清理内容中的多余空白和特殊属性
    content.innerHTML = content.innerHTML
      .replace(/\n\s*\n/g, `\n`)
      .replace(/^\s+|\s+$/g, ``)
      .replace(/<p>\s*<\/p>/g, ``)
      .replace(/<div>\s*<\/div>/g, ``)
      // 移除可能影响选择的属性
      .replace(/contenteditable="[^"]*"/gi, ``)
      .replace(/unselectable="[^"]*"/gi, ``)
      .replace(/user-select:[^;"]*;?/gi, ``)
      .replace(/-webkit-user-select:[^;"]*;?/gi, ``)
      .replace(/-moz-user-select:[^;"]*;?/gi, ``)
      .replace(/-ms-user-select:[^;"]*;?/gi, ``)
      // 移除微信特有的属性
      .replace(/data-tools="[^"]*"/gi, ``)
      .replace(/data-brushtype="[^"]*"/gi, ``)
      .replace(/data-brushsize="[^"]*"/gi, ``)
      .replace(/data-tools-id="[^"]*"/gi, ``)
      // 移除事件处理器
      .replace(/on\w+="[^"]*"/gi, ``)

    // 保留元素的原始样式和类（微信端对大多数样式容忍，保持原样即可）
    // 如有特殊需求可在此处自行处理
    // 这里不再遍历并删除 user-select、class 等属性，以避免不必要的样式丢失

    // 处理图片
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

      img.src = imgUrl

      img.removeAttribute(`data-src`)
      img.removeAttribute(`data-type`)
      img.removeAttribute(`data-w`)
      img.removeAttribute(`data-ratio`)
      img.removeAttribute(`data-fail`)
      img.removeAttribute(`data-width`)
      img.removeAttribute(`data-height`)
      img.removeAttribute(`crossorigin`)

      img.style.visibility = `visible`
      img.style.display = `block`
      img.style.margin = `0 auto`
      img.style.maxWidth = `100%`

      processedImages++
      progress.value = 70 + Math.floor((processedImages / totalImages) * 15)
    }
    console.log(`处理图片完成`)

    currentStep.value = `正在生成HTML内容...`
    progress.value = 90

    // 生成 HTML 内容（使用标题和处理后的内容）
    const htmlContent = `<h1>${title}</h1>${content.innerHTML}`
    console.log(`生成HTML完成`)
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
    toast.error(`导入失败: ${(error as Error).message}`)
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
        <Input
          v-model="url"
          placeholder="请输入微信公众号文章链接（以 mp.weixin.qq.com 开头）"
          :disabled="loading"
        />

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
