<script setup lang="ts">
import html2canvas from 'html2canvas'
import { computed, nextTick, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ChatMessage } from '@/utils/indexedDB'

interface Props {
  show: boolean
  messages?: ChatMessage[]
  selectedMessageIds?: string[] // 新增：明确指定要导出的消息ID列表
}

const props = withDefaults(defineProps<Props>(), {
  messages: () => [],
  selectedMessageIds: () => [],
})

const emit = defineEmits(['update:show', 'export'])

const imageQuality = ref<'1' | '2' | '3'>('2') // 1-普通, 2-高清, 3-超清
const imageFormat = ref<'png' | 'jpeg'>('png')
const exportProgress = ref<number>(0)
const isExporting = ref(false)

// 根据选中的消息ID过滤消息
const selectedMessages = computed(() => {
  if (props.selectedMessageIds.length > 0) {
    return props.messages.filter(msg => props.selectedMessageIds.includes(msg.id))
  }
  return props.messages
})

async function handleExport() {
  isExporting.value = true
  exportProgress.value = 0

  try {
    // 获取实际的聊天容器元素来克隆样式
    const chatContainer = document.querySelector('.ai-chat-panel .space-y-4')

    if (!chatContainer && selectedMessages.value.length === 0) {
      throw new Error('没有找到要导出的消息')
    }

    // 创建用于导出的容器
    const exportContainer = document.createElement('div')
    exportContainer.id = 'ai-chat-export-container-temp'
    exportContainer.className = 'space-y-4 bg-background text-foreground p-4'
    exportContainer.style.position = 'absolute'
    exportContainer.style.left = '-9999px'
    exportContainer.style.top = '0'
    exportContainer.style.width = '800px'
    exportContainer.style.minHeight = '500px'
    exportContainer.style.boxSizing = 'border-box'
    exportContainer.style.overflow = 'hidden'

    // 如果能找到实际的聊天容器，尝试复制样式
    if (chatContainer) {
      // 复制容器的基本样式
      const computedStyle = window.getComputedStyle(chatContainer)
      exportContainer.style.backgroundColor = computedStyle.backgroundColor
      exportContainer.style.color = computedStyle.color
      exportContainer.style.fontFamily = computedStyle.fontFamily
      exportContainer.style.fontSize = computedStyle.fontSize
      exportContainer.style.lineHeight = computedStyle.lineHeight
    }

    // 为每个选中的消息创建元素
    for (const message of selectedMessages.value) {
      // 创建消息容器
      const messageDiv = document.createElement('div')
      messageDiv.className = `flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`
      if (message.role === 'user') {
        messageDiv.classList.add('flex-row-reverse') // For user messages, reverse the flex direction
      }

      // 创建头像容器
      const avatarDiv = document.createElement('div')
      avatarDiv.className = 'bg-secondary h-8 w-8 flex flex-shrink-0 items-center justify-center rounded-full'

      // 创建头像图标
      const iconSvg = message.role === 'user'
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>'

      avatarDiv.innerHTML = iconSvg

      // 创建消息内容容器
      const contentDiv = document.createElement('div')
      contentDiv.className = 'bg-secondary inline-block rounded-lg px-4 py-2 max-w-[80%]'

      // 创建消息文本容器
      const textDiv = document.createElement('div')
      textDiv.className = 'whitespace-pre-wrap break-words text-sm'

      // 根据消息类型设置内容
      if (message.role === 'user') {
        // For user messages, use the same parsing as in the main chat panel
        const content = message.content

        // First check if content contains "用户问题:"
        const userQuestionIndex = content.indexOf('用户问题:')
        if (userQuestionIndex !== -1) {
          // Separate citation part and user question part
          const citationPart = content.substring(0, userQuestionIndex)
          const questionPart = content.substring(userQuestionIndex + 5) // 5 is length of '用户问题:'

          let contentHtml = ''

          // Process citation part
          const citationRegex = /\[引文(\d+)\]:\s*([^\r\n]+)/g
          let citationLastIndex = 0
          let citationMatch

          // eslint-disable-next-line no-cond-assign
          while ((citationMatch = citationRegex.exec(citationPart)) !== null) {
            // Add text before citation
            if (citationMatch.index > citationLastIndex) {
              const textBefore = citationPart.slice(citationLastIndex, citationMatch.index)
              if (textBefore.trim()) {
                contentHtml += `<span>${textBefore}</span>`
              }
            }

            // Add citation part
            const citationNumber = citationMatch[1]
            const citationContent = citationMatch[2]
            contentHtml += `<span class="mr-1 text-blue-600 font-medium">[引文${citationNumber}]</span>`

            // Add citation content
            if (citationContent.trim()) {
              contentHtml += `<span>${citationContent} </span>`
            }

            citationLastIndex = citationMatch.index + citationMatch[0].length
          }

          // Add remaining citation text
          if (citationLastIndex < citationPart.length) {
            const remainingText = citationPart.slice(citationLastIndex)
            if (remainingText.trim()) {
              contentHtml += `<span>${remainingText}</span>`
            }
          }

          // Add "用户问题:" text
          contentHtml += `<span>用户问题: </span>`

          // Add question part
          contentHtml += `<span>${questionPart}</span>`

          textDiv.innerHTML = contentHtml
        }
        else {
          // If no "用户问题:", process as before
          const citationRegex = /\[引文(\d+)\]:\s*([^\r\n]+)/g
          const parts = []

          let lastIndex = 0
          let match

          // eslint-disable-next-line no-cond-assign
          while ((match = citationRegex.exec(content)) !== null) {
            // Add text before citation
            if (match.index > lastIndex) {
              const textBefore = content.slice(lastIndex, match.index)
              if (textBefore) {
                parts.push({ type: 'text', text: textBefore })
              }
            }

            // Add citation part
            const citationNumber = match[1]
            const citationContent = match[2]
            parts.push({ type: 'citation', text: `[引文${citationNumber}]` })

            // Add citation content
            if (citationContent.trim()) {
              parts.push({ type: 'text', text: `${citationContent} ` })
            }

            lastIndex = match.index + match[0].length
          }

          // Add remaining text
          if (lastIndex < content.length) {
            const remainingText = content.slice(lastIndex)
            if (remainingText) {
              parts.push({ type: 'text', text: remainingText })
            }
          }

          // If no citations found, just return the whole content as text
          if (parts.length === 0) {
            parts.push({ type: 'text', text: content })
          }

          // Build HTML with proper formatting
          let contentHtml = ''
          parts.forEach((part) => {
            if (part.type === 'citation') {
              contentHtml += `<span class="mr-1 text-blue-600 font-medium">${part.text}</span>`
            }
            else {
              contentHtml += `<span>${part.text}</span>`
            }
          })

          textDiv.innerHTML = contentHtml
        }
      }
      else {
        // For AI messages, just use the content directly
        textDiv.textContent = message.content
      }

      // 组装消息元素
      contentDiv.appendChild(textDiv)
      if (message.role === 'user') {
        messageDiv.appendChild(contentDiv)
        messageDiv.appendChild(avatarDiv)
      }
      else {
        messageDiv.appendChild(avatarDiv)
        messageDiv.appendChild(contentDiv)
      }

      // 添加到导出容器
      exportContainer.appendChild(messageDiv)
    }

    // 添加到文档中以便html2canvas可以渲染
    document.body.appendChild(exportContainer)

    // 等待DOM更新
    await nextTick()

    const scale = imageQuality.value === '1' ? 1 : imageQuality.value === '2' ? 2 : 3

    // 使用html2canvas截取内容
    const canvas = await html2canvas(exportContainer, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Use transparent background to preserve theme
      logging: false,
      imageTimeout: 30000,
      width: exportContainer.scrollWidth,
      height: exportContainer.scrollHeight,
    })

    exportProgress.value = 80

    // 转换为图片
    const imgData = canvas.toDataURL(`image/${imageFormat.value}`, imageFormat.value === 'jpeg' ? 0.9 : 1.0)

    // 创建下载链接
    const link = document.createElement('a')
    link.download = `ai_chat_export_${Date.now()}.${imageFormat.value}`
    link.href = imgData
    link.click()

    exportProgress.value = 100

    // 清理临时元素
    document.body.removeChild(exportContainer)

    setTimeout(() => {
      emit('update:show', false)
      isExporting.value = false
      exportProgress.value = 0
    }, 500)
  }
  catch (error) {
    console.error('导出图片失败:', error)
    // 清理临时元素（如果存在）
    const tempContainer = document.getElementById('ai-chat-export-container-temp')
    if (tempContainer) {
      document.body.removeChild(tempContainer)
    }
    isExporting.value = false
    exportProgress.value = 0
  }
}
</script>

<template>
  <Dialog :open="show" @update:open="(val) => emit('update:show', val)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>导出AI对话长图</DialogTitle>
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
