<script setup lang="ts">
import { BarChart3, ChevronRight, Code, Heading1, Image, Indent, Link, Monitor, Palette, RotateCcw, SwatchBook, Type } from 'lucide-vue-next'
import { shallowRef } from 'vue'
import PickColors, { type Format } from 'vue-pick-colors'
import {
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
  themeOptions,
} from '@/config'
import { useDisplayStore, useStore } from '@/stores'

const store = useStore()
const { toggleShowCssEditor } = useDisplayStore()

const {
  theme,
  fontFamily,
  fontSize,
  primaryColor,
  codeBlockTheme,
  legend,
  isMacCodeBlock,
  cssEditor,
  isCiteStatus,
  isCountStatus,
} = storeToRefs(store)

const {
  resetStyleConfirm,
  themeChanged,
  fontChanged,
  sizeChanged,
  colorChanged,
  codeBlockThemeChanged,
  legendChanged,
  macCodeBlockChanged,
  citeStatusChanged,
  countStatusChanged,
} = store

const colorPicker = ref<HTMLElement & { show: () => void } | null>(null)

function showPicker() {
  colorPicker.value?.show()
}

// 自定义CSS样式
function customStyle() {
  toggleShowCssEditor()
  setTimeout(() => {
    cssEditor.value!.refresh()
  }, 50)
}

const pickColorsContainer = shallowRef<HTMLElement | null>(null)
const format = ref<Format>(`rgb`)
const formatOptions = ref<Format[]>([`rgb`, `hex`, `hsl`, `hsv`])
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      <Palette class="mr-2 size-4" />
      样式
    </MenubarTrigger>
    <MenubarContent class="w-56" align="start">
      <StyleOptionMenu
        title="主题"
        :options="themeOptions"
        :current="theme"
        :change="themeChanged"
        :icon="SwatchBook"
      />
      <MenubarSeparator />
      <StyleOptionMenu
        title="字体"
        :options="fontFamilyOptions"
        :current="fontFamily"
        :change="fontChanged"
        :icon="Type"
      />
      <StyleOptionMenu
        title="字号"
        :options="fontSizeOptions"
        :current="fontSize"
        :change="sizeChanged"
        :icon="Heading1"
      />
      <StyleOptionMenu
        title="主题色"
        :options="colorOptions"
        :current="primaryColor"
        :change="colorChanged"
        :icon="Palette"
      />
      <StyleOptionMenu
        title="图注格式"
        :options="legendOptions"
        :current="legend"
        :change="legendChanged"
        :icon="Image"
      />
      <StyleOptionMenu
        title="代码块主题"
        :options="codeBlockThemeOptions"
        :current="codeBlockTheme"
        :change="codeBlockThemeChanged"
        :icon="Code"
      />
      <MenubarItem @click.self.prevent="showPicker">
        <Palette class="mr-2 h-4 w-4" />
        <span class="flex-1">自定义主题色</span>
        <HoverCard :open-delay="100">
          <HoverCardTrigger>
            <ChevronRight class="h-4 w-4" />
          </HoverCardTrigger>
          <HoverCardContent side="right" class="w-min">
            <div ref="pickColorsContainer">
              <PickColors
                v-model:value="primaryColor"
                show-alpha
                :format="format" :format-options="formatOptions"
                :theme="store.isDark ? 'dark' : 'light'"
                :popup-container="pickColorsContainer ?? undefined"
                @change="store.colorChanged"
              />
            </div>
          </HoverCardContent>
        </HoverCard>
      </MenubarItem>
      <MenubarItem @click="customStyle">
        <Code class="mr-2 h-4 w-4" />
        <span class="flex-1">自定义 CSS</span>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarCheckboxItem :checked="isCiteStatus" @click="citeStatusChanged">
        <Link class="mr-2 h-4 w-4" />
        微信外链转底部引用
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem :checked="isCountStatus" @click="countStatusChanged">
        <BarChart3 class="mr-2 h-4 w-4" />
        统计字数和阅读时间
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem :checked="isMacCodeBlock" @click="macCodeBlockChanged">
        <Monitor class="mr-2 h-4 w-4" />
        Mac 代码块
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem :checked="store.isUseIndent" @click="store.useIndentChanged">
        <Indent class="mr-2 h-4 w-4" />
        段落首行缩进
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarItem divided @click="resetStyleConfirm">
        <RotateCcw class="mr-2 h-4 w-4" />
        重置
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
