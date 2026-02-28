<script setup lang="ts">
import { FileText, Info, LifeBuoy } from 'lucide-vue-next'
import defaultMarkdown from '@/assets/example/markdown.md?raw'
import { useStore } from '@/stores'

defineEmits([`showAbout`])

const store = useStore()

// 显示默认文章内容到编辑器
function showDefaultArticle() {
  if (store.editor) {
    store.editor.setValue(defaultMarkdown)
    store.editor.clearHistory()
    store.editor.refresh()
    store.editor.focus()

    // 设置当前文章ID为null，表示不在文章列表中
    store.currentPostId = null

    // 更新输出预览
    store.editorRefresh()
  }
}
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      <LifeBuoy class="mr-2 size-4" />
      帮助
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="showDefaultArticle">
        <FileText class="mr-2 size-4" />
        默认文章
      </MenubarItem>
      <MenubarItem @click="$emit('showAbout')">
        <Info class="mr-2 size-4" />
        关于
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
