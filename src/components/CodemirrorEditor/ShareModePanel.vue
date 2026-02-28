<script setup lang="ts">
import { Bot, Upload, User, X } from 'lucide-vue-next'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import type { AssistantMessage, ChatMessage, UserMessage } from '@/utils/indexedDB'

interface Props {
  messages: ChatMessage[]
  selectedMessages: string[]
}

interface Emits {
  (e: 'toggleSelectAll'): void
  (e: 'exportSelected'): void
  (e: 'exitShareMode'): void
  (e: 'toggleMessageSelection', message: ChatMessage): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算属性：是否全选
const isAllSelected = computed(() => {
  return props.messages.length > 0 && props.messages.length === props.selectedMessages.length
})

// 获取消息通过ID
function getMessageById(id: string) {
  return props.messages.find(m => m.id === id)
}

// 切换全选状态
function toggleSelectAll() {
  emit('toggleSelectAll')
}

// 切换单个消息选择状态
function toggleMessageSelection(message: ChatMessage) {
  emit('toggleMessageSelection', message)
}

// 导出选中的消息
function exportSelectedMessages() {
  emit('exportSelected')
}

// Helper function to get content based on message type
function getContentForMessage(message: ChatMessage | undefined) {
  if (!message)
    return ''

  if (message.role === 'assistant') {
    return (message as AssistantMessage).content
  }
  else {
    // For user messages, return the raw content as stored
    // This matches how it's displayed in the main chat panel
    return (message as UserMessage).content
  }
}
</script>

<template>
  <div class="bg-background share-mode-panel border-t p-4">
    <!-- 顶部选择控件 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center">
        <input
          type="checkbox"
          :checked="isAllSelected"
          class="mr-2 h-4 w-4"
          @change="toggleSelectAll"
        >
        <span class="text-sm">
          全选 ({{ selectedMessages.length }}/{{ messages.length }})
        </span>
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          :disabled="selectedMessages.length === 0"
          @click="exportSelectedMessages"
        >
          <Upload class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('exitShareMode')"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- 选中的消息缩略图预览 -->
    <div v-if="selectedMessages.length > 0" class="space-y-2 max-h-60 flex-1 overflow-y-auto">
      <div
        v-for="messageId in selectedMessages"
        :key="messageId"
        class="hover:bg-accent flex cursor-pointer items-start gap-2 border rounded p-2 text-sm"
        @click="toggleMessageSelection(getMessageById(messageId)!)"
      >
        <User v-if="getMessageById(messageId) && getMessageById(messageId)?.role === 'user'" class="mt-0.5 h-4 w-4 flex-shrink-0" />
        <Bot v-else class="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span class="flex-1 break-words">
          {{ (getContentForMessage(getMessageById(messageId)) || '').substring(0, 100) }}{{ (getContentForMessage(getMessageById(messageId)) || '').length > 100 ? '...' : '' }}
        </span>
      </div>
    </div>

    <!-- 底部统计信息 -->
    <div class="text-muted-foreground mt-4 flex justify-between border-t pt-4 text-sm">
      <div>已选择 {{ selectedMessages.length }} 条消息</div>
      <div>共 {{ messages.length }} 条消息</div>
    </div>
  </div>
</template>

<style scoped>
</style>
