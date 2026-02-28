<script setup lang="ts">
import { Bold, ClipboardPaste, Code, Copy, FilePlus, Italic, Keyboard, Link, Moon, MousePointerClick, PanelLeftClose, PanelLeftOpen, Redo, RotateCcw, Save, Search, Settings, Sparkles, Sun, Underline } from 'lucide-vue-next'
import { ref } from 'vue'
import AboutDialog from '@/components/CodemirrorEditor/EditorHeader/AboutDialog.vue'
import AIDropdown from '@/components/CodemirrorEditor/EditorHeader/AIDropdown.vue'
import ExportImageDialog from '@/components/CodemirrorEditor/EditorHeader/ExportImageDialog.vue'
import HelpDropdown from '@/components/CodemirrorEditor/EditorHeader/HelpDropdown.vue'
import WechatDropdown from '@/components/CodemirrorEditor/EditorHeader/WechatDropdown.vue'
import Favicon from '@/components/Favicon.vue'
import { Toaster } from '@/components/ui/sonner'
import {
  altSign,
  ctrlKey,
  ctrlSign,
  shiftSign,
} from '@/config'
import { useStore } from '@/stores'

interface ShortcutItem {
  label: string
  kbd: string[]
  emitArgs: [string, string?] // 第一个参数是事件名，第二个是可选参数
  icon: any // 图标组件
}

const emit = defineEmits([`addFormat`, `formatContent`, `startCopy`, `endCopy`, `addPost`, `save`, `selectAll`, `undo`, `redo`, `find`, `copy`, `paste`, `cut`])

const showAboutDialog = ref(false)

const shortcutItems: ShortcutItem[] = [
  {
    label: `新建文章`,
    kbd: [ctrlSign, altSign, `N`],
    emitArgs: [`addPost`],
    icon: FilePlus,
  },
  {
    label: `行内代码`,
    kbd: [ctrlSign, `E`],
    emitArgs: [`addFormat`, `${ctrlKey}-E`],
    icon: Code,
  },
  {
    label: `删除线`,
    kbd: [ctrlSign, `D`],
    emitArgs: [`addFormat`, `${ctrlKey}-D`],
    icon: Underline,
  },
  {
    label: `超链接`,
    kbd: [ctrlSign, `K`],
    emitArgs: [`addFormat`, `${ctrlKey}-K`],
    icon: Link,
  },
  {
    label: `格式化`,
    kbd: [altSign, shiftSign, `F`],
    emitArgs: [`formatContent`],
    icon: Sparkles,
  },
  {
    label: `加粗`,
    kbd: [ctrlSign, `B`],
    emitArgs: [`addFormat`, `${ctrlKey}-B`],
    icon: Bold,
  },
  {
    label: `斜体`,
    kbd: [ctrlSign, `I`],
    emitArgs: [`addFormat`, `${ctrlKey}-I`],
    icon: Italic,
  },
  {
    label: `保存`,
    kbd: [ctrlSign, `S`],
    emitArgs: [`save`],
    icon: Save,
  },
  {
    label: `全选`,
    kbd: [ctrlSign, `A`],
    emitArgs: [`selectAll`],
    icon: MousePointerClick,
  },
  {
    label: `撤销`,
    kbd: [ctrlSign, `Z`],
    emitArgs: [`undo`],
    icon: RotateCcw,
  },
  {
    label: `重做`,
    kbd: [ctrlSign, `Y`],
    emitArgs: [`redo`],
    icon: Redo,
  },
  {
    label: `查找`,
    kbd: [ctrlSign, `F`],
    emitArgs: [`find`],
    icon: Search,
  },
  {
    label: `复制`,
    kbd: [ctrlSign, `C`],
    emitArgs: [`copy`],
    icon: Copy,
  },
  {
    label: `粘贴`,
    kbd: [ctrlSign, `V`],
    emitArgs: [`paste`],
    icon: ClipboardPaste,
  },
] as const

const store = useStore()

const { isDark, isOpenPostSlider } = storeToRefs(store)

const { toggleDark } = store

function handleShortcutClick(emitArgs: [string, string?]) {
  if (emitArgs[0] === `addFormat`) {
    emit(`addFormat`, emitArgs[1])
  }
  else {
    emit(emitArgs[0] as any) // 使用类型断言以避免类型检查问题
  }
}

const showExportImageDialog = ref(false)
</script>

<template>
  <header class="header-container h-15 flex items-center justify-between px-5">
    <div class="space-x-2 flex items-center">
      <!-- Logo 区域 -->
      <div class="logo-container mr-2 flex items-center">
        <Favicon class="logo-icon" />
      </div>

      <Menubar class="menubar">
        <FileDropdown />
        <AIDropdown />
        <MenubarMenu>
          <MenubarTrigger>
            <Keyboard class="mr-2 size-4" />
            快捷键
          </MenubarTrigger>
          <MenubarContent class="w-60" align="start">
            <MenubarItem
              v-for="{ label, kbd, emitArgs, icon } in shortcutItems" :key="label"
              @click="handleShortcutClick(emitArgs)"
            >
              <component :is="icon" class="mr-2 h-4 w-4" />
              <span class="flex-1">{{ label }}</span>
              <MenubarShortcut>
                <kbd v-for="item in kbd" :key="item" class="mx-1 bg-gray-2 dark:bg-stone-9">
                  {{ item }}
                </kbd>
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <StyleDropdown />
        <WechatDropdown />
        <HelpDropdown @show-about="showAboutDialog = true" />
      </Menubar>
    </div>

    <div class="space-x-2 flex">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline" @click="isOpenPostSlider = !isOpenPostSlider">
              <PanelLeftOpen v-show="!isOpenPostSlider" class="size-4" />
              <PanelLeftClose v-show="isOpenPostSlider" class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {{ isOpenPostSlider ? "关闭侧边栏" : "开启侧边栏" }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button variant="outline" @click="toggleDark()">
        <Moon v-show="isDark" class="size-4" />
        <Sun v-show="!isDark" class="size-4" />
      </Button>

      <PostInfo />

      <Button variant="outline" @click="store.isOpenRightSlider = !store.isOpenRightSlider">
        <Settings class="size-4" />
      </Button>

      <Toaster rich-colors position="top-center" />
    </div>

    <ExportImageDialog v-model:show="showExportImageDialog" />
    <AboutDialog :visible="showAboutDialog" @close="showAboutDialog = false" />
  </header>
</template>

<style lang="less" scoped>
.menubar {
  user-select: none;
}

kbd {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #a8a8a8;
  padding: 1px 4px;
  border-radius: 2px;
}

.logo-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
  background: transparent !important;
  filter: brightness(1);
  transition: filter 0.3s ease;
  border: none;
}
</style>
