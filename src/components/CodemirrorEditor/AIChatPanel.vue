<script setup lang="ts">
import { Bot, Check, Copy, CornerDownLeft, Menu, Pencil, Plus, RotateCcw, Send, Share, Sparkles, Square, Trash2, User, X } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import AIChatExportImageDialog from '@/components/CodemirrorEditor/AIChatExportImageDialog.vue'
import PromptManager from '@/components/CodemirrorEditor/PromptManager.vue'
import ShareModePanel from '@/components/CodemirrorEditor/ShareModePanel.vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cancelAIRequest, streamAIContent } from '@/services/ai'
import { chatDB, type ChatMessage, type ChatSession } from '@/utils/indexedDB'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'submit': [value: string]
  'cancel': []
  'close': []
  'insertContent': [content: string]
}>()

// 状态管理
const sessions = ref<ChatSession[]>([])
const currentSessionId = ref<string | null>(null)
const prompt = ref('')
const generating = ref(false)
const waitingForAIResponse = ref(false)
const sidebarCollapsed = ref(false)
const copiedMessageId = ref<string | null>(null)
const insertionButtonEnabled = ref(true)
const editingMessageId = ref<string | null>(null)
const editingMessageContent = ref('')
const exportImageDialogOpen = ref(false)
const messagesToExport = ref<ChatMessage[]>([])
const selectedMessages = ref<string[]>([])
const isShareMode = ref(false)
const citations = ref<string[]>([])
const showPromptManager = ref(false)

const mainInputRef = ref<any>(null)

// 计算属性
const currentSession = computed(() => {
  return sessions.value.find((s: ChatSession) => s.id === currentSessionId.value)
})

const currentMessages = computed(() => {
  return currentSession.value?.messages || []
})

const isAllSelected = computed(() => {
  return currentMessages.value.length > 0 && currentMessages.value.length === selectedMessages.value.length
})

const correspondingAIMessage = computed(() => {
  if (!editingMessageId.value || !currentSession.value)
    return null

  const editingMessageIndex = currentSession.value.messages.findIndex(m => m.id === editingMessageId.value)
  if (editingMessageIndex === -1)
    return null

  for (let i = editingMessageIndex + 1; i < currentSession.value.messages.length; i++) {
    if (currentSession.value.messages[i].role === 'assistant') {
      return currentSession.value.messages[i]
    }
    if (currentSession.value.messages[i].role === 'user') {
      break
    }
  }

  return null
})

const showPanel = computed({
  get: () => props.show,
  set: (value: boolean) => {
    if (!value && props.show) {
      citations.value = []
      isShareMode.value = false
      selectedMessages.value = []
    }
    emit('update:show', value)
  },
})

// 工具函数
function resetChatState() {
  isShareMode.value = false
  selectedMessages.value = []
  citations.value = []
  prompt.value = ''
}

function stopAIRequest() {
  if (generating.value) {
    cancelAIRequest()
    generating.value = false
    waitingForAIResponse.value = false
  }
}

// 创建新会话
async function createNewSession() {
  stopAIRequest()

  const newSession: ChatSession = {
    id: `session-${Date.now()}`,
    title: '新对话',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  sessions.value.unshift(newSession)
  currentSessionId.value = newSession.id
  resetChatState()
  await saveSessions()
}

// 切换会话
function switchSession(sessionId: string) {
  stopAIRequest()
  currentSessionId.value = sessionId
  resetChatState()
}

// 删除会话
async function deleteSession(sessionId: string, event: Event) {
  event.stopPropagation()
  const index = sessions.value.findIndex((s: ChatSession) => s.id === sessionId)
  if (index > -1) {
    sessions.value.splice(index, 1)
    await chatDB.deleteSession(sessionId)
    if (currentSessionId.value === sessionId && sessions.value.length > 0) {
      currentSessionId.value = sessions.value[0].id
    }
  }
}

// 构建对话上下文
function buildContext(session: ChatSession, excludeMessageId?: string): string {
  let context = ''
  for (const msg of session.messages) {
    if (msg.id === excludeMessageId)
      continue

    const prefix = msg.role === 'user' ? '用户' : 'AI'
    context += `${prefix}: ${msg.content}\n`
  }
  return context
}

// 发送消息
async function sendMessage() {
  if (!prompt.value.trim() || generating.value || editingMessageId.value)
    return

  // 如果没有当前会话，创建新会话
  if (!currentSessionId.value) {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    sessions.value.unshift(newSession)
    currentSessionId.value = newSession.id
  }

  // 直接使用 find 获取会话，避免 computed 响应式延迟
  const session = sessions.value.find(s => s.id === currentSessionId.value)
  if (!session)
    return

  // 创建用户消息
  const userMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content: prompt.value,
    timestamp: Date.now(),
  }
  session.messages.push(userMessage)

  // 如果是第一条消息，更新标题
  if (session.messages.length === 1) {
    session.title = prompt.value.substring(0, 20) + (prompt.value.length > 20 ? '...' : '')
  }
  session.updatedAt = Date.now()

  // 构建对话上下文
  const fullContext = buildContext(session)

  // 清空输入框和引文
  prompt.value = ''
  citations.value = []

  // 开始生成 AI 回复
  generating.value = true
  waitingForAIResponse.value = true
  emit('submit', fullContext)
}

// 添加或更新 AI 回复
async function addAssistantMessage(content: string) {
  // 直接使用 find 获取会话，避免 computed 响应式延迟
  const session = sessions.value.find(s => s.id === currentSessionId.value)
  if (!session)
    return

  const lastMessage = session.messages[session.messages.length - 1]

  if (lastMessage && lastMessage.role === 'assistant' && generating.value) {
    lastMessage.content = content
  }
  else {
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: Date.now(),
    }
    session.messages.push(assistantMessage)
  }

  session.updatedAt = Date.now()
  await saveSessions()

  if (waitingForAIResponse.value) {
    waitingForAIResponse.value = false
  }
}

// 插入内容到编辑器
function insertContent(content: string) {
  emit('insertContent', content)
}

// 复制消息内容
async function copyMessage(message: ChatMessage) {
  try {
    await navigator.clipboard.writeText(message.content)
    copiedMessageId.value = message.id
    setTimeout(() => {
      copiedMessageId.value = null
    }, 2000)
  }
  catch (error) {
    console.error('复制失败:', error)
  }
}

// 保存会话
async function saveSessions() {
  try {
    await chatDB.saveSessions(sessions.value)
  }
  catch (error) {
    console.error('保存会话失败:', error)
  }
}

// 开始编辑消息
function startEditingMessage(message: ChatMessage) {
  editingMessageId.value = message.id
  editingMessageContent.value = message.content
  prompt.value = message.content

  if (message.role === 'user') {
    citations.value = [...extractCitations(message.content)]
  }
}

// 保存编辑的消息
async function saveEditedMessage() {
  if (!editingMessageId.value)
    return

  const session = sessions.value.find(s => s.id === currentSessionId.value)
  if (!session)
    return

  const messageIndex = session.messages.findIndex(m => m.id === editingMessageId.value)
  if (messageIndex === -1)
    return

  const editedMessage = session.messages[messageIndex]
  editedMessage.content = prompt.value || editingMessageContent.value
  session.updatedAt = Date.now()
  await saveSessions()

  if (editedMessage.role === 'user') {
    await regenerateResponseForEditedMessage(session, messageIndex, editedMessage)
    return
  }

  editingMessageId.value = null
  editingMessageContent.value = ''
  prompt.value = ''
  citations.value = []
  session.updatedAt = Date.now()
  saveSessions()
}

// 为编辑的用户消息重新生成 AI 响应
async function regenerateResponseForEditedMessage(
  session: ChatSession,
  messageIndex: number,
  editedMessage: ChatMessage,
) {
  let aiMessageIndex = -1
  if (messageIndex + 1 < session.messages.length) {
    const nextMessage = session.messages[messageIndex + 1]
    if (nextMessage.role === 'assistant') {
      aiMessageIndex = messageIndex + 1
    }
  }

  if (aiMessageIndex !== -1) {
    session.messages.splice(aiMessageIndex, 1)
  }

  const editedContent = prompt.value
  editingMessageId.value = null
  editingMessageContent.value = ''
  prompt.value = ''
  citations.value = []

  let fullContext = ''
  for (const msg of session.messages) {
    if (msg.id === editedMessage.id) {
      fullContext += `用户：${editedContent}\n`
      continue
    }
    if (msg.id === correspondingAIMessage.value?.id) {
      continue
    }
    const prefix = msg.role === 'user' ? '用户' : 'AI'
    fullContext += `${prefix}: ${msg.content}\n`
  }

  generating.value = true
  waitingForAIResponse.value = true

  try {
    let newAIContent = ''
    await streamAIContent({
      prompt: fullContext,
      onToken: (token) => {
        newAIContent += token
        if (waitingForAIResponse.value) {
          waitingForAIResponse.value = false
        }

        if (session.messages.length === messageIndex + 1
          || session.messages[messageIndex + 1]?.role !== 'assistant') {
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: newAIContent,
            timestamp: Date.now(),
          }
          session.messages.splice(messageIndex + 1, 0, assistantMessage)
        }
        else {
          session.messages[messageIndex + 1].content = newAIContent
        }
        saveSessions()
      },
      onError: async (error) => {
        console.error('AI 请求错误:', error)
        generating.value = false
        waitingForAIResponse.value = false

        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `错误：${error.message || 'AI 请求失败'}`,
          timestamp: Date.now(),
        }
        session.messages.splice(messageIndex + 1, 0, errorMessage)
        await saveSessions()
      },
      onFinish: async () => {
        generating.value = false
        waitingForAIResponse.value = false
        session.updatedAt = Date.now()
        await saveSessions()
      },
    })
  }
  catch (error) {
    console.error('生成 AI 回复失败:', error)
    generating.value = false
    waitingForAIResponse.value = false
  }
}

// 处理发送或保存
function handleSendOrSave() {
  if (editingMessageId.value) {
    saveEditedMessage()
  }
  else if (generating.value) {
    handleCancelAIRequest()
  }
  else {
    sendMessage()
  }
}

// 重新生成 AI 回复
async function regenerateAIResponse(message: ChatMessage) {
  if (!currentSessionId.value)
    return

  const session = sessions.value.find(s => s.id === currentSessionId.value)
  if (!session)
    return

  const latestAIMessages = session.messages
    .filter(m => m.role === 'assistant')
    .sort((a, b) => b.timestamp - a.timestamp)

  const latestAIMessage = latestAIMessages[0]
  if (!latestAIMessage || latestAIMessage.id !== message.id)
    return

  const messageIndex = session.messages.findIndex(m => m.id === message.id)
  if (messageIndex <= 0)
    return

  let userMessageIndex = -1
  for (let i = messageIndex - 1; i >= 0; i--) {
    if (session.messages[i].role === 'user') {
      userMessageIndex = i
      break
    }
  }

  if (userMessageIndex === -1)
    return

  const userMessage = session.messages[userMessageIndex]

  generating.value = true
  waitingForAIResponse.value = true

  let fullContext = buildContext(session, message.id)
  const userQuestion = extractUserQuestion(userMessage.content) || userMessage.content
  fullContext += `用户：${userQuestion}\n`

  try {
    let newAIContent = ''
    await streamAIContent({
      prompt: fullContext,
      onToken: (token) => {
        newAIContent += token
        if (waitingForAIResponse.value) {
          waitingForAIResponse.value = false
        }
        session.messages[messageIndex].content = newAIContent
        saveSessions()
      },
      onError: (error) => {
        console.error('AI 请求错误:', error)
        generating.value = false
        waitingForAIResponse.value = false
      },
      onFinish: () => {
        generating.value = false
        waitingForAIResponse.value = false
        saveSessions()
      },
    })
  }
  catch (error) {
    console.error('重新生成 AI 回复失败:', error)
    generating.value = false
    waitingForAIResponse.value = false
  }
}

// 判断是否是最新 AI 消息
function isLatestAIMessage(message: ChatMessage): boolean {
  if (message.role !== 'assistant')
    return false

  const assistantMessages = currentMessages.value
    .filter(m => m.role === 'assistant')
    .sort((a, b) => b.timestamp - a.timestamp)

  return assistantMessages[0]?.id === message.id
}

// 判断是否是最新用户消息
function isLatestUserMessage(message: ChatMessage): boolean {
  if (message.role !== 'user')
    return false

  const userMessages = currentMessages.value
    .filter(m => m.role === 'user')
    .sort((a, b) => b.timestamp - a.timestamp)

  return userMessages[0]?.id === message.id
}

// 选择/取消选择消息
function toggleSelectMessage(message: ChatMessage) {
  const index = selectedMessages.value.indexOf(message.id)
  if (index > -1) {
    selectedMessages.value.splice(index, 1)
  }
  else {
    selectedMessages.value.push(message.id)
  }
}

// 导出选中的消息为长图
function exportSelectedMessagesAsImage() {
  if (selectedMessages.value.length > 0) {
    const selectedMsgs = currentMessages.value.filter(msg =>
      selectedMessages.value.includes(msg.id),
    )
    messagesToExport.value = selectedMsgs
    exportImageDialogOpen.value = true
  }
}

// 全选或取消全选
function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedMessages.value = []
  }
  else {
    selectedMessages.value = currentMessages.value.map(msg => msg.id)
  }
}

// 切换分享模式
function toggleShareMode() {
  isShareMode.value = !isShareMode.value
  if (!isShareMode.value) {
    selectedMessages.value = []
  }
}

// 取消 AI 请求
function handleCancelAIRequest() {
  stopAIRequest()
  emit('cancel')
}

// 滚动到底部
const messagesContainerRef = ref<HTMLElement | null>(null)
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
    }
  })
}

watch(currentMessages, () => {
  scrollToBottom()
}, { deep: true })

function handleClearCitations() {
  citations.value = []
}

// 暴露方法给父组件
defineExpose({
  updateAIOutput: (content: string) => {
    addAssistantMessage(content)
  },
  clearAIOutput: () => {
    if (currentSessionId.value) {
      const session = sessions.value.find(s => s.id === currentSessionId.value)
      const lastMessage = session?.messages[session.messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content = ''
      }
    }
  },
  finishGenerating: () => {
    generating.value = false
  },
  startGenerating: () => {
    generating.value = true
  },
  clearPrompt: () => {
    prompt.value = ''
  },
  enableInsertionButton: () => {
    insertionButtonEnabled.value = true
  },
  disableInsertionButton: () => {
    insertionButtonEnabled.value = false
  },
  createNewSession: async () => {
    await createNewSession()
  },
  setCitations: (citationArray: string[]) => {
    citations.value = [...citationArray]
  },
  addCitation: (citation: string) => {
    citations.value.push(citation)
  },
  clearCitations: () => {
    citations.value = []
  },
  extractUserPart,
  extractCitations,
  extractUserQuestion,
})

// 初始化：加载历史会话
let hasLoadedSessions = false
async function initializeSessions() {
  if (hasLoadedSessions)
    return

  try {
    const loadedSessions = await chatDB.getAllSessions()
    // 合并加载的会话和现有会话，避免覆盖临时会话
    const existingIds = new Set(sessions.value.map(s => s.id))
    const newSessions = loadedSessions.filter(s => !existingIds.has(s.id))
    sessions.value = [...newSessions, ...sessions.value]
    console.log(`从 indexedDB 加载了 ${loadedSessions.length} 个会话`)
    hasLoadedSessions = true
  }
  catch (error) {
    console.error('加载会话失败:', error)
  }
}

// 监听显示状态变化
watch(() => props.show, async (newShow, oldShow) => {
  // 只在从隐藏变为显示时加载
  if (newShow && !oldShow) {
    await initializeSessions()
    stopAIRequest()
  }
}, { immediate: true })

onMounted(async () => {
  await initializeSessions()
})

function extractUserPart(content: string): string {
  return content
}

function extractCitations(content: string): string[] {
  const citationRegex = /\[引文 (\d+)\]:\s*([^\r\n]+)/g
  const citations: string[] = []

  for (const match of content.matchAll(citationRegex)) {
    citations.push(match[2].replace(/\r?\n/g, ' ').trim())
  }

  return citations
}

function extractUserQuestion(content: string): string {
  const userQuestionIndex = content.indexOf('用户问题:')
  if (userQuestionIndex !== -1) {
    let questionContent = content.substring(userQuestionIndex + 5).trim()
    if (questionContent.startsWith(':')) {
      questionContent = questionContent.substring(1).trim()
    }
    return questionContent
  }
  return ''
}

function parseMessageContent(content: string) {
  const userQuestionIndex = content.indexOf('用户问题:')
  if (userQuestionIndex !== -1) {
    const citationPart = content.substring(0, userQuestionIndex)
    const questionPart = content.substring(userQuestionIndex + 5)

    const parts: Array<{ type: 'citation' | 'text', text: string }> = []
    const citationRegex = /\[引文 (\d+)\]:\s*([^\r\n]+)/g
    let citationLastIndex = 0

    for (const citationMatch of citationPart.matchAll(citationRegex)) {
      if (citationMatch.index > citationLastIndex) {
        const textBefore = citationPart.slice(citationLastIndex, citationMatch.index)
        if (textBefore.trim()) {
          parts.push({ type: 'text', text: textBefore })
        }
      }

      parts.push({ type: 'citation', text: `[引文${citationMatch[1]}]` })

      if (citationMatch[2].trim()) {
        parts.push({ type: 'text', text: `${citationMatch[2]} ` })
      }

      citationLastIndex = citationMatch.index + citationMatch[0].length
    }

    if (citationLastIndex < citationPart.length) {
      const remainingText = citationPart.slice(citationLastIndex)
      if (remainingText.trim()) {
        parts.push({ type: 'text', text: remainingText })
      }
    }

    parts.push({ type: 'text', text: '用户问题：' })
    parts.push({ type: 'text', text: questionPart })

    return parts
  }
  else {
    const citationRegex = /\[引文 (\d+)\]:\s*([^\r\n]+)/g
    const parts: Array<{ type: 'citation' | 'text', text: string }> = []

    let lastIndex = 0

    for (const match of content.matchAll(citationRegex)) {
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index)
        if (textBefore) {
          parts.push({ type: 'text', text: textBefore })
        }
      }

      parts.push({ type: 'citation', text: `[引文${match[1]}]` })

      if (match[2].trim()) {
        parts.push({ type: 'text', text: `${match[2]} ` })
      }

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex)
      if (remainingText) {
        parts.push({ type: 'text', text: remainingText })
      }
    }

    if (parts.length === 0) {
      parts.push({ type: 'text', text: content })
    }

    return parts
  }
}

function handlePromptSelect(selectedPrompt: { content: string }) {
  prompt.value = selectedPrompt.content
  nextTick(() => {
    if (mainInputRef.value?.$el) {
      mainInputRef.value.$el.focus()
    }
    else if (mainInputRef.value) {
      (mainInputRef.value as any).focus()
    }
  })
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (editingMessageId.value) {
      saveEditedMessage()
    }
    else {
      sendMessage()
    }
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const isClickInsideInput = target.closest('.input-area-container') !== null
  const isClickOnEditButton = target.closest('[data-edit-button]') !== null

  if (!isClickInsideInput && !isClickOnEditButton && editingMessageId.value) {
    editingMessageId.value = null
    editingMessageContent.value = ''
    prompt.value = ''
    citations.value = []
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div v-if="showPanel" class="ai-chat-panel bg-background fixed inset-0 z-50 flex">
    <!-- 侧边栏 -->
    <div
      class="sidebar flex flex-col border-r transition-all duration-300"
      :class="sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'"
    >
      <!-- 侧边栏头部 -->
      <div class="flex items-center justify-between border-b p-3">
        <span v-if="!sidebarCollapsed" class="font-semibold">对话历史</span>
        <div class="flex gap-1">
          <Button v-if="!sidebarCollapsed" variant="ghost" size="sm" class="h-8 w-8 p-0" @click="createNewSession">
            <Plus class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="sidebarCollapsed = !sidebarCollapsed">
            <Menu class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- 会话列表 -->
      <div v-if="!sidebarCollapsed" class="flex-1 overflow-y-auto p-2">
        <div
          v-for="session in sessions" :key="session.id"
          class="group hover:bg-accent mb-1 flex cursor-pointer items-center justify-between rounded px-2 py-2"
          :class="currentSessionId === session.id ? 'bg-accent' : ''" @click="switchSession(session.id)"
        >
          <div class="flex-1 truncate text-sm">
            {{ session.title }}
          </div>
          <Button
            variant="ghost" size="sm" class="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            @click="deleteSession(session.id, $event)"
          >
            <Trash2 class="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="min-h-0 flex flex-1 flex-col">
      <!-- 顶部工具栏 -->
      <div class="flex shrink-0 items-center justify-between border-b p-3">
        <div class="flex items-center gap-2">
          <Button
            v-if="sidebarCollapsed" variant="ghost" size="sm" class="h-8 w-8 p-0"
            @click="sidebarCollapsed = false"
          >
            <Menu class="h-4 w-4" />
          </Button>
          <span class="font-semibold">AI 智能助手</span>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" @click="showPromptManager = true">
            <Sparkles class="mr-1 h-4 w-4" />
            提示词
          </Button>
          <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- 对话消息区域 -->
      <div ref="messagesContainerRef" class="min-h-0 flex-1 overflow-y-auto p-4">
        <div v-if="currentMessages.length === 0" class="text-muted-foreground h-full flex items-center justify-center">
          <div class="text-center">
            <Bot class="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>开始新的对话</p>
            <p class="text-sm">
              直接输入您的问题
            </p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="message in currentMessages" :key="message.id" class="flex items-start gap-3"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <!-- 选择复选框 -->
            <input
              v-if="currentMessages.length > 0 && isShareMode" type="checkbox" :checked="selectedMessages.includes(message.id)"
              class="mt-2" @change="toggleSelectMessage(message)"
            >

            <!-- 用户消息 -->
            <div v-if="message.role === 'user'" class="max-w-[80%] flex flex-row-reverse items-start gap-3">
              <div class="bg-secondary h-8 w-8 flex flex-shrink-0 items-center justify-center rounded-full">
                <User class="h-4 w-4" />
              </div>
              <div class="bg-secondary inline-block rounded-lg px-4 py-2">
                <div v-if="editingMessageId === message.id" class="whitespace-pre-wrap break-words text-sm opacity-50">
                  {{ message.content }}
                </div>
                <div v-else class="whitespace-pre-wrap break-words text-sm">
                  <div v-for="(part, index) in parseMessageContent(message.content)" :key="index" class="inline">
                    <span v-if="part.type === 'citation'" class="mr-1 text-blue-600 font-medium dark:text-blue-300">
                      {{ part.text }}
                    </span>
                    <span v-else>{{ part.text }}</span>
                  </div>
                </div>

                <!-- 用户消息操作按钮 -->
                <div class="mt-2 flex items-center gap-2 -ml-2">
                  <Button
                    v-if="isLatestUserMessage(message) && !editingMessageId"
                    variant="ghost"
                    size="sm"
                    class="h-6 px-2 text-xs"
                    data-edit-button
                    @click="startEditingMessage(message)"
                  >
                    <Pencil class="h-3 w-3" />
                    编辑
                  </Button>
                  <Button variant="ghost" size="sm" class="h-6 px-2 text-xs" @click="copyMessage(message)">
                    <Copy v-if="copiedMessageId !== message.id" class="h-3 w-3" />
                    <Check v-else class="h-3 w-3" />
                    {{ copiedMessageId === message.id ? '已复制' : '复制' }}
                  </Button>
                  <Button variant="ghost" size="sm" class="h-6 px-2 text-xs" @click="toggleShareMode">
                    <Share class="h-3 w-3" />
                    分享
                  </Button>
                </div>
              </div>
            </div>

            <!-- AI 消息 -->
            <div v-else class="max-w-[80%] flex items-start gap-3">
              <div class="bg-secondary h-8 w-8 flex flex-shrink-0 items-center justify-center rounded-full">
                <Bot class="h-4 w-4" />
              </div>
              <div
                class="bg-secondary inline-block rounded-lg px-4 py-2"
                :class="{ 'blur-sm hover:blur-none transition-all duration-300': correspondingAIMessage && correspondingAIMessage.id === message.id }"
              >
                <div class="whitespace-pre-wrap break-words text-sm">
                  {{ message.content }}
                  <span
                    v-if="generating && message === currentMessages[currentMessages.length - 1]"
                    class="blinking-cursor"
                  >|</span>
                </div>
                <!-- AI 消息操作按钮 -->
                <div class="mt-2 flex items-center gap-2 -ml-2">
                  <Button
                    v-if="isLatestAIMessage(message)" variant="ghost" size="sm" class="h-6 px-2 text-xs"
                    @click="regenerateAIResponse(message)"
                  >
                    <RotateCcw class="h-3 w-3" />
                    重新生成
                  </Button>
                  <Button variant="ghost" size="sm" class="h-6 px-2 text-xs" @click="copyMessage(message)">
                    <Copy v-if="copiedMessageId !== message.id" class="h-3 w-3" />
                    <Check v-else class="h-3 w-3" />
                    {{ copiedMessageId === message.id ? '已复制' : '复制' }}
                  </Button>
                  <Button variant="ghost" size="sm" class="h-6 px-2 text-xs" @click="toggleShareMode">
                    <Share class="h-3 w-3" />
                    分享
                  </Button>
                  <Button
                    variant="ghost" size="sm" class="h-6 px-2 text-xs" :disabled="!insertionButtonEnabled"
                    @click="insertContent(message.content)"
                  >
                    <CornerDownLeft class="h-3 w-3" />
                    插入
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- 等待 AI 响应的加载动画 -->
          <div
            v-if="waitingForAIResponse"
            class="flex items-start justify-start gap-3"
          >
            <div class="bg-secondary h-8 w-8 flex flex-shrink-0 items-center justify-center rounded-full">
              <Bot class="h-4 w-4" />
            </div>
            <div class="bg-secondary inline-block rounded-lg px-4 py-2">
              <div class="flex items-center">
                <div class="space-x-1 flex">
                  <div class="animate-bounce h-2 w-2 rounded-full bg-blue-500" style="animation-delay: 0ms;" />
                  <div class="animate-bounce h-2 w-2 rounded-full bg-blue-500" style="animation-delay: 150ms;" />
                  <div class="animate-bounce h-2 w-2 rounded-full bg-blue-500" style="animation-delay: 300ms;" />
                </div>
                <span class="text-muted-foreground ml-2 text-sm">AI 正在思考...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域和工具栏 -->
      <div class="input-area-container shrink-0">
        <!-- 分享模式组件 -->
        <ShareModePanel
          v-if="isShareMode"
          :messages="currentMessages"
          :selected-messages="selectedMessages"
          @toggle-message-selection="toggleSelectMessage"
          @toggle-select-all="toggleSelectAll"
          @export-selected="exportSelectedMessagesAsImage"
          @exit-share-mode="toggleShareMode"
        />

        <!-- 输入框和工具栏（仅在非分享模式下显示） -->
        <div v-else class="flex flex-col border-t">
          <!-- 引文显示区域 -->
          <div v-if="citations.length > 0" class="bg-muted border-b p-3">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium">引用内容 ({{ citations.length }})</span>
              <Button
                variant="ghost"
                size="sm"
                class="h-6 w-6 p-0"
                @click="handleClearCitations"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div
                v-for="(citation, index) in citations"
                :key="`current-citation-${index}`"
                class="bg-background border rounded-md p-2 text-xs"
              >
                <div class="flex items-start">
                  <span class="mr-2 text-xs text-blue-600 font-medium dark:text-blue-300">[引文{{ index + 1 }}]</span>
                  <span class="flex-1 break-words">{{ citation }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入框 -->
          <div class="flex-1">
            <Textarea
              ref="mainInputRef"
              v-model="prompt" placeholder="输入您的问题或需求..." :rows="2"
              class="w-full resize-none border-0 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              :disabled="generating" @keydown="handleKeyDown"
            />
          </div>

          <!-- 工具栏 -->
          <div class="space-x-2 flex justify-end px-4 pb-4">
            <Button
              variant="ghost" size="sm" class="h-8 w-8 p-0"
              :disabled="(!prompt.trim() && !generating && !editingMessageId) || (generating && !currentSessionId)"
              data-send-button
              @click="handleSendOrSave"
            >
              <Send v-if="!generating && !editingMessageId" class="h-4 w-4" />
              <Send v-else-if="!generating && editingMessageId" class="h-4 w-4" />
              <Square v-else class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出长图对话框 -->
    <AIChatExportImageDialog
      :show="exportImageDialogOpen"
      :messages="messagesToExport"
      :selected-message-ids="Array.from(selectedMessages)"
      @update:show="exportImageDialogOpen = $event"
    />

    <!-- 提示词管理器 -->
    <PromptManager
      :open="showPromptManager"
      @update:open="showPromptManager = $event"
      @select="handlePromptSelect"
    />
  </div>
</template>

<style scoped>
/* 闪烁光标 */
.blinking-cursor {
  display: inline-block;
  width: 1ch;
  animation: blink 1s infinite;
  vertical-align: baseline;
  background-color: currentColor;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

/* 分享模式遮罩 */
.share-overlay {
  position: absolute;
  z-index: 50;
  background-color: var(--background);
  backdrop-filter: blur(4px);
  padding: 1rem;
}

/* 加载动画 */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
