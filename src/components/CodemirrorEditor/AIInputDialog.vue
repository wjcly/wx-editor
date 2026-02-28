<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import AIChatPanel from '@/components/CodemirrorEditor/AIChatPanel.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'submit': [value: string | Array<{ role: string, content: string }>]
  'cancel': []
  'close': []
  'insertContent': [value: string]
}>()

// 状态管理
const forceNewSession = ref(false)

// 处理插入内容事件
function handleInsertContent(content: string) {
  // 调用父组件的方法
  const parentComponent = getCurrentInstance()?.parent
  if (parentComponent && typeof parentComponent.exposed?.insertContent === 'function') {
    parentComponent.exposed.insertContent(content)
  }
  else {
    // 如果无法通过引用调用，使用emit方式
    emit('insertContent', content)
  }
}

// AIChatPanel 引用
const aiChatPanelRef = ref<InstanceType<typeof AIChatPanel> | null>(null)

// 定义计算属性，用于控制对话框显示状态
const showDialog = computed({
  get: () => props.show,
  set: (value: boolean) => {
    // 如果正在关闭对话框，清空引文
    if (!value && props.show) {
      if (aiChatPanelRef.value && typeof aiChatPanelRef.value.clearCitations === 'function') {
        aiChatPanelRef.value.clearCitations()
      }
    }
    emit('update:show', value)
  },
})

// 暴露方法给父组件
defineExpose({
  updateAIOutput: (content: string) => {
    // 转发给 AIChatPanel
    if (aiChatPanelRef.value) {
      aiChatPanelRef.value.updateAIOutput(content)
    }
  },
  clearAIOutput: () => {
    // 转发给 AIChatPanel
    if (aiChatPanelRef.value) {
      aiChatPanelRef.value.clearAIOutput()
    }
  },
  finishGenerating: () => {
    // 转发给 AIChatPanel
    if (aiChatPanelRef.value) {
      aiChatPanelRef.value.finishGenerating()
    }
  },
  startGenerating: () => {
    // 转发给 AIChatPanel
    if (aiChatPanelRef.value) {
      aiChatPanelRef.value.startGenerating()
    }
  },
  clearPrompt: () => {
    // 转发给 AIChatPanel
    if (aiChatPanelRef.value) {
      aiChatPanelRef.value.clearPrompt()
    }
  },
  enableInsertionButton: () => {
    // 转发给 AIChatPanel
    if (aiChatPanelRef.value) {
      aiChatPanelRef.value.enableInsertionButton()
    }
  },
  disableInsertionButton: () => {
    // 转发给 AIChatPanel
    if (aiChatPanelRef.value) {
      aiChatPanelRef.value.disableInsertionButton()
    }
  },
  createNewSession: () => {
    // 设置强制创建新会话标志
    forceNewSession.value = true
    // 转发给 AIChatPanel
    if (aiChatPanelRef.value && typeof aiChatPanelRef.value.createNewSession === 'function') {
      aiChatPanelRef.value.createNewSession()
    }
    else {
      console.warn('createNewSession method not available on AIChatPanel')
    }
  },
  setCitations: (citationsArray: string[]) => {
    if (aiChatPanelRef.value && typeof aiChatPanelRef.value.setCitations === 'function') {
      aiChatPanelRef.value.setCitations(citationsArray)
    }
    else {
      console.warn('setCitations method not available on AIChatPanel')
    }
  },
  addCitation: (citation: string) => {
    if (aiChatPanelRef.value && typeof aiChatPanelRef.value.addCitation === 'function') {
      aiChatPanelRef.value.addCitation(citation)
    }
    else {
      console.warn('addCitation method not available on AIChatPanel')
    }
  },
  clearCitations: () => {
    if (aiChatPanelRef.value && typeof aiChatPanelRef.value.clearCitations === 'function') {
      aiChatPanelRef.value.clearCitations()
    }
    else {
      console.warn('clearCitations method not available on AIChatPanel')
    }
  },
  extractCitations: (content: string) => {
    if (aiChatPanelRef.value && typeof aiChatPanelRef.value.extractCitations === 'function') {
      return aiChatPanelRef.value.extractCitations(content)
    }
    else {
      console.warn('extractCitations method not available on AIChatPanel')
      return []
    }
  },
  extractUserQuestion: (content: string) => {
    if (aiChatPanelRef.value && typeof aiChatPanelRef.value.extractUserQuestion === 'function') {
      return aiChatPanelRef.value.extractUserQuestion(content)
    }
    else {
      console.warn('extractUserQuestion method not available on AIChatPanel')
      return content
    }
  },
})
</script>

<template>
  <AIChatPanel
    ref="aiChatPanelRef"
    :show="showDialog"
    @update:show="showDialog = $event"
    @submit="(value) => emit('submit', value)"
    @cancel="emit('cancel')"
    @close="emit('close')"
    @insert-content="handleInsertContent($event)"
  />
</template>
