<script setup lang="ts">
import { Bot, Settings } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import AISwitchBox from '@/components/CodemirrorEditor/EditorHeader/AISwitchBox.vue'
import { MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'
import { useAIStore } from '@/stores'

const aiStore = useAIStore()

const {
  settingsDialogVisible,
} = storeToRefs(aiStore)
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      <Bot class="mr-2 size-4" />
      <div class="flex items-center">
        AI 助手
      </div>
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="settingsDialogVisible = true">
        <Settings class="mr-2 size-4" />
        AI 配置
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>

  <!-- AI配置穿梭框 -->
  <AISwitchBox />
</template>
