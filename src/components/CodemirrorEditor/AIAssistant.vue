<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import AIInputDialog from '@/components/CodemirrorEditor/AIInputDialog.vue'
import { streamAIContent } from '@/services/ai'
import { useAIStore, useStore } from '@/stores'

// Props
const props = defineProps<{
  editor: any // CodeMirror editor instance
}>()

// Stores
const store = useStore()
const aiStore = useAIStore()

// State
const showAIInputDialog = ref(false)
const aiInputDialogRef = ref<InstanceType<typeof AIInputDialog> | null>(null)
const aiInitialContent = ref('')
const aiGeneratedContentRef = ref('') // 保存AI生成的内容，用于后续插入
const customAICursorStart = ref<any>(null) // 保存AI智能助手的起始光标位置
const customAICursorEnd = ref<any>(null) // 保存AI智能助手的结束光标位置
const customAISelectionMarker = ref<any>(null) // 保存AI智能助手的选中状态标记
const citations = ref<string[]>([]) // 保存多段引文
// 添加一个唯一标识符，用于区分不同的AI助手实例
const aiAssistantId = ref<string>(`ai-assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
const currentRequestId = ref<string | null>(null) // 用于跟踪当前的请求ID

// Watch for AI generation state changes
watch(() => aiStore.isGenerating, (isGenerating) => {
  if (!isGenerating && aiInputDialogRef.value) {
    // AI generation finished, enable insertion button
    aiInputDialogRef.value.enableInsertionButton()
  }
})

// Handle custom AI request
async function handleCustomAIRequest(fullPrompt: string | Array<{ role: string, content: string }>) {
  if (!props.editor) {
    showAIInputDialog.value = false
    return
  }

  // 生成唯一的请求ID，用于标识当前请求
  const requestId = `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  currentRequestId.value = requestId

  try {
    // 设置组件内部的生成状态
    if (aiInputDialogRef.value) {
      aiInputDialogRef.value.startGenerating()
    }

    // 构建包含引文的完整提示
    let finalPrompt: string | Array<{ role: string, content: string }> = fullPrompt

    // 如果是字符串形式的提示且有引文，则构建包含引文的提示
    if (typeof fullPrompt === 'string' && citations.value.length > 0) {
      const citationText = citations.value.map((citation, index) => `[引文${index + 1}]: ${citation}`).join('\n\n')
      finalPrompt = `${citationText}\n\n用户问题: ${fullPrompt}`
    }
    // 如果是消息数组形式且有引文，则在适当位置插入引文
    else if (Array.isArray(fullPrompt) && citations.value.length > 0) {
      const citationText = citations.value.map((citation, index) => `[引文${index + 1}]: ${citation}`).join('\n\n')
      // 在第一个用户消息之前插入引文
      const userMessageIndex = fullPrompt.findIndex(msg => msg.role === 'user')
      if (userMessageIndex !== -1) {
        const citationMessage = {
          role: 'system',
          content: `以下是相关的引文内容：\n\n${citationText}`,
        }
        fullPrompt.splice(userMessageIndex, 0, citationMessage)
      }
      finalPrompt = fullPrompt
    }

    // 显示生成状态
    aiStore.setGenerating(true)

    // 临时存储AI生成的内容
    let aiGeneratedContent = ''

    // 使用流式API获取AI响应并实时显示
    await streamAIContent({
      prompt: finalPrompt,
      onToken: (token) => {
        // 只有当前请求ID匹配时才更新UI，防止响应被发送到错误的实例
        if (currentRequestId.value === requestId) {
          aiGeneratedContent += token

          // 更新对话框中的AI输出显示
          if (aiInputDialogRef.value) {
            aiInputDialogRef.value.updateAIOutput(aiGeneratedContent)
          }
        }
      },
      onError: (error) => {
        // 只有当前请求ID匹配时才处理错误
        if (currentRequestId.value === requestId) {
          console.error('AI请求错误:', error)
          toast.error(`AI请求失败: ${error.message}`)
          aiStore.setGenerating(false)
          // 清空保存的光标位置和选中标记
          customAICursorStart.value = null
          customAICursorEnd.value = null
          if (customAISelectionMarker.value) {
            customAISelectionMarker.value.clear()
            customAISelectionMarker.value = null
          }
          // 清空引文
          citations.value = []
          // 通知对话框更新生成状态
          if (aiInputDialogRef.value) {
            aiInputDialogRef.value.finishGenerating()
            // 清空提示输入框
            aiInputDialogRef.value.clearPrompt()
          }
        }
      },
      onFinish: () => {
        // 只有当前请求ID匹配时才处理完成事件
        if (currentRequestId.value === requestId) {
          aiStore.setGenerating(false)

          // 保存AI生成的内容，等待用户确认后再插入
          aiGeneratedContentRef.value = aiGeneratedContent

          if (aiInputDialogRef.value) {
            aiInputDialogRef.value.enableInsertionButton()
            // 通知对话框更新生成状态
            aiInputDialogRef.value.finishGenerating()
            // 清空提示输入框
            aiInputDialogRef.value.clearPrompt()
          }

          // 刷新编辑器
          store.editorRefresh()
          // 注意：不清空引文，让用户可以在后续对话中继续使用
          // citations.value = []
          // 保持对话框打开，让用户可以预览内容后决定是否插入
          // 不清空保存的光标位置和选中标记，因为可能需要用于插入
        }
      },
    })
  }
  catch (error) {
    // 只有当前请求ID匹配时才处理异常
    if (currentRequestId.value === requestId) {
      console.error('处理自定义AI请求失败:', error)
      toast.error('处理请求失败，请重试')
      aiStore.setGenerating(false)
      showAIInputDialog.value = false
      // 清空保存的光标位置和选中标记
      customAICursorStart.value = null
      customAICursorEnd.value = null
      if (customAISelectionMarker.value) {
        customAISelectionMarker.value.clear()
        customAISelectionMarker.value = null
      }
      // 注意：不清空引文，让用户可以在后续对话中继续使用
      // citations.value = []
    }
  }
}

// Handle AI cancel operation (stop generation but keep dialog open)
function handleAICancel() {
  aiStore.setGenerating(false)
  // 清空当前请求ID，防止后续响应被处理
  currentRequestId.value = null
  // Clear saved cursor positions and selection marker
  customAICursorStart.value = null
  customAICursorEnd.value = null
  if (customAISelectionMarker.value) {
    customAISelectionMarker.value.clear()
    customAISelectionMarker.value = null
  }
  // 注意：不清空引文，让用户可以在后续对话中继续使用
  // citations.value = []
  // Finish generating state but keep dialog open
  if (aiInputDialogRef.value) {
    aiInputDialogRef.value.finishGenerating()
  }
}

// Handle closing the dialog
function closeDialog() {
  showAIInputDialog.value = false
  // Clear saved cursor positions and selection marker
  customAICursorStart.value = null
  customAICursorEnd.value = null
  if (customAISelectionMarker.value) {
    customAISelectionMarker.value.clear()
    customAISelectionMarker.value = null
  }
  // 同步清空引文，确保AIChatPanel关闭时也清空引文
  citations.value = []
  if (aiInputDialogRef.value && typeof aiInputDialogRef.value.clearCitations === 'function') {
    aiInputDialogRef.value.clearCitations()
  }
}

// AI functions
function customAIInputWithSelection() {
  // 只保存当前光标位置，不自动添加选中内容为引文
  if (props.editor) {
    const selection = props.editor.getSelection()
    // 保存光标位置信息
    customAICursorStart.value = selection ? props.editor.getCursor('from') : props.editor.getCursor()
    customAICursorEnd.value = selection ? props.editor.getCursor('to') : props.editor.getCursor()
    // 保存原始选中内容（如果有），但不自动添加为引文
    aiInitialContent.value = selection || ''
  }

  // 生成新的AI助手ID，确保这是一个独立的实例
  aiAssistantId.value = `ai-assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // 打开对话框
  showAIInputDialog.value = true
  // 等待组件渲染后设置引文
  nextTick(() => {
    if (aiInputDialogRef.value) {
      // 设置引文
      if (citations.value.length > 0) {
        aiInputDialogRef.value.setCitations([...citations.value])
      }
    }
  })
}

// 设置引文内容
function setCitations(citationArray: string[]) {
  citations.value = [...citationArray]
  // 同步到AIChatPanel（如果已打开）
  if (showAIInputDialog.value && aiInputDialogRef.value) {
    aiInputDialogRef.value.setCitations([...citationArray])
  }
}

// 添加单个引文
function addCitation(citation: string) {
  citations.value.push(citation)
  // 同步到AIChatPanel（如果已打开）
  if (showAIInputDialog.value && aiInputDialogRef.value) {
    aiInputDialogRef.value.addCitation(citation)
  }
}

// 清空所有引文
function clearCitations() {
  citations.value = []
  // 同步到AIChatPanel（如果已打开）
  if (showAIInputDialog.value && aiInputDialogRef.value) {
    aiInputDialogRef.value.clearCitations()
  }
}

// Handle insert content event from AIInputDialog
function handleInsertContent(content: string) {
  if (props.editor) {
    // 将内容插入到编辑器光标所在位置
    props.editor.replaceSelection(content, 'end')
    toast.success('内容已插入编辑器')

    // 自动关闭AI对话框
    showAIInputDialog.value = false

    // 清空保存的光标位置和选中标记
    customAICursorStart.value = null
    customAICursorEnd.value = null
    if (customAISelectionMarker.value) {
      customAISelectionMarker.value.clear()
      customAISelectionMarker.value = null
    }

    // 清空引文
    citations.value = []
    if (aiInputDialogRef.value && typeof aiInputDialogRef.value.clearCitations === 'function') {
      aiInputDialogRef.value.clearCitations()
    }
  }
}

// Expose functions to parent component
defineExpose({
  customAIInputWithSelection,
  showAIInputDialog,
  aiInitialContent,
  setCitations,
  addCitation,
  clearCitations,
  // 插入内容到编辑器
  insertContent: (content: string) => {
    if (props.editor) {
      // 将内容插入到编辑器光标所在位置
      props.editor.replaceSelection(content, 'end')
      toast.success('内容已插入编辑器')

      // 自动关闭AI对话框
      showAIInputDialog.value = false

      // 清空保存的光标位置和选中标记
      customAICursorStart.value = null
      customAICursorEnd.value = null
      if (customAISelectionMarker.value) {
        customAISelectionMarker.value.clear()
        customAISelectionMarker.value = null
      }

      // 清空引文
      citations.value = []
      if (aiInputDialogRef.value && typeof aiInputDialogRef.value.clearCitations === 'function') {
        aiInputDialogRef.value.clearCitations()
      }
    }
  },
  // 从AIChatPanel转发的方法
  extractCitations: (content: string) => {
    if (aiInputDialogRef.value && typeof aiInputDialogRef.value.extractCitations === 'function') {
      return aiInputDialogRef.value.extractCitations(content)
    }
    else {
      console.warn('extractCitations method not available on AIInputDialog')
      return []
    }
  },
  extractUserQuestion: (content: string) => {
    if (aiInputDialogRef.value && typeof aiInputDialogRef.value.extractUserQuestion === 'function') {
      return aiInputDialogRef.value.extractUserQuestion(content)
    }
    else {
      console.warn('extractUserQuestion method not available on AIInputDialog')
      return content
    }
  },
})

// 监听来自AIInputDialog的insertContent事件
</script>

<template>
  <div>
    <AIInputDialog
      ref="aiInputDialogRef"
      v-model:show="showAIInputDialog"
      @submit="handleCustomAIRequest"
      @cancel="handleAICancel"
      @close="closeDialog"
      @insert-content="handleInsertContent"
    />
  </div>
</template>
