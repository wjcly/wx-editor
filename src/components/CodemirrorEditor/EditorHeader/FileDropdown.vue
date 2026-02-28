<script setup lang="ts">
import { ArrowUpDown, Download, File, FileCode, FileText, FileType, Image, Moon, Newspaper, PanelLeft, Plus, Upload } from 'lucide-vue-next'
import { ref } from 'vue'
import ExportImageDialog from '@/components/CodemirrorEditor/EditorHeader/ExportImageDialog.vue'
import ImportWechatDialog from '@/components/CodemirrorEditor/EditorHeader/ImportWechatDialog.vue'
import MarkdownTemplateDialog from '@/components/CodemirrorEditor/EditorHeader/MarkdownTemplateDialog.vue'
import { toast } from '@/composables/useToast'
import { exportToWord } from '@/services/export'
import { useStore } from '@/stores'

const store = useStore()

const {
  isDark,
  isEditOnLeft,
  isSyncScroll,
} = storeToRefs(store)

const {
  exportEditorContent2HTML,
  exportEditorContent2MD,
  importMarkdownContent,
} = store

const showImportDialog = ref(false)
const showExportDialog = ref(false)
const showTemplateDialog = ref(false)

function showImportWechatDialog() {
  showImportDialog.value = true
}

function handleExportImage() {
  showExportDialog.value = true
}

// 添加新文章
function addPost() {
  store.addPost(`新文章`)
  // 切换到新创建的文章（addPost已经设置currentPostId为新文章的ID）
  toast.success(`文章新增成功`)
}

async function exportWord() {
  try {
    if (store._currentPost) {
      const content = store._currentPost.content
      const title = store._currentPost.title || `Markdown Export`
      await exportToWord(content, {
        title,
        author: `MD Editor`,
        subject: `从 Markdown 导出的文档`,
      })
      toast.success(`Word文档导出成功`)
    }
    else {
      throw new Error(`当前文章不存在`)
    }
  }
  catch (error) {
    console.error(`导出Word文档失败:`, error)
    toast.error(`导出失败：${error instanceof Error ? error.message : `未知错误`}`)
  }
}
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      <File class="mr-2 size-4" />
      文件
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="addPost">
        <Plus class="mr-2 size-4" />
        新建文章
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="importMarkdownContent()">
        <Upload class="mr-2 size-4" />
        导入 .md
      </MenubarItem>
      <MenubarItem @click="showImportWechatDialog">
        <Newspaper class="mr-2 size-4" />
        导入公众号文章
      </MenubarItem>
      <MenubarItem @click="showTemplateDialog = true">
        <FileType class="mr-2 size-4" />
        插入模板
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="exportEditorContent2MD()">
        <Download class="mr-2 size-4" />
        导出 .md
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2HTML()">
        <FileCode class="mr-2 size-4" />
        导出 .html
      </MenubarItem>
      <MenubarItem @click="exportWord">
        <FileText class="mr-2 size-4" />
        导出 .docx
      </MenubarItem>
      <MenubarItem @click="handleExportImage">
        <Image class="mr-2 size-4" />
        导出长图
      </MenubarItem>
      <MenubarSeparator />
      <MenubarCheckboxItem v-model:checked="isDark">
        <Moon class="mr-2 h-4 w-4" />
        深色模式
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem v-model:checked="isEditOnLeft">
        <PanelLeft class="mr-2 h-4 w-4" />
        左侧编辑
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem v-model:checked="isSyncScroll">
        <ArrowUpDown class="mr-2 h-4 w-4" />
        同步滚动
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>

  <ImportWechatDialog v-model:show="showImportDialog" />
  <ExportImageDialog v-model:show="showExportDialog" />
  <MarkdownTemplateDialog v-model:show="showTemplateDialog" />
</template>
