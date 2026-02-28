<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  editor: any
}>()

const emit = defineEmits([
  'update:modelValue',
  'close',
])

const showSearchPanel = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const searchText = ref('')
const replaceText = ref('')
const matchCase = ref(false)
const useRegex = ref(false)
const showReplace = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const replaceInputRef = ref<HTMLInputElement | null>(null)

// 搜索结果统计
const searchResults = ref({
  count: 0,
  currentIndex: 0,
})

// 存储所有匹配项的位置
const allMatches = ref<Array<{ from: any, to: any }>>([])

// 存储当前高亮标记
const currentHighlightMarker = ref<any>(null)

// 监听搜索文本变化，自动搜索
watch(searchText, (newVal) => {
  if (newVal && props.editor) {
    performSearch()
  }
  else {
    clearSearchHighlight()
  }
})

// 监听面板显示状态，聚焦输入框
watch(showSearchPanel, (newVal) => {
  if (newVal) {
    // 重置替换框状态
    showReplace.value = false
    nextTick(() => {
      if (searchInputRef.value) {
        searchInputRef.value.focus()
        searchInputRef.value.select()
      }
    })
  }
})

// 清空搜索文本
function clearSearchText() {
  searchText.value = ''
  if (searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

// 清空替换文本
function clearReplaceText() {
  replaceText.value = ''
  if (replaceInputRef.value) {
    replaceInputRef.value.focus()
  }
}

// 切换替换面板显示
function toggleReplace() {
  showReplace.value = !showReplace.value
  nextTick(() => {
    if (showReplace.value && replaceInputRef.value) {
      replaceInputRef.value.focus()
    }
  })
}

// 切换大小写敏感
function toggleCaseSensitive() {
  matchCase.value = !matchCase.value
  if (searchText.value && props.editor) {
    performSearch()
  }
}

// 切换正则表达式
function toggleRegex() {
  useRegex.value = !useRegex.value
  if (searchText.value && props.editor) {
    performSearch()
  }
}

// 执行搜索
function performSearch() {
  if (!props.editor || !searchText.value)
    return

  try {
    // 清除之前的高亮
    clearSearchHighlight()

    // 设置搜索选项
    let query
    if (useRegex.value) {
      query = new RegExp(searchText.value, matchCase.value ? 'g' : 'gi')
    }
    else {
      // 转义特殊字符
      const escapedText = searchText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const flags = matchCase.value ? 'g' : 'gi'
      query = new RegExp(escapedText, flags)
    }

    const cm = props.editor
    const content = cm.getValue()

    const matches = []

    if (useRegex.value) {
      const globalRegex = new RegExp(query.source, `${query.flags.replace(/g/g, '')}g`)
      let match

      match = globalRegex.exec(content)
      while (match !== null) {
        const start = cm.posFromIndex(match.index)
        const end = cm.posFromIndex(match.index + match[0].length)
        matches.push({ from: start, to: end, index: match.index })

        // 防止零长度匹配导致的无限循环
        if (match.index === globalRegex.lastIndex) {
          globalRegex.lastIndex++
        }

        match = globalRegex.exec(content)
      }
    }
    else {
      // 将搜索文本中的连续空白（包括空格、换行）统一为 [\s]+ 模式，以匹配编辑器中的换行符
      const normalizedSearch = searchText.value.replace(/\s+/g, '\\s+')
      const searchRegex = new RegExp(normalizedSearch, matchCase.value ? 'g' : 'gi')

      let match = searchRegex.exec(content)
      while (match !== null) {
        const start = cm.posFromIndex(match.index)
        const end = cm.posFromIndex(match.index + match[0].length)
        matches.push({ from: start, to: end, index: match.index })

        // 防止零长度匹配导致的无限循环
        if (match.index === searchRegex.lastIndex) {
          searchRegex.lastIndex++
        }

        match = searchRegex.exec(content)
      }
    }

    // 存储所有匹配项
    allMatches.value = matches
    searchResults.value.count = matches.length
    searchResults.value.currentIndex = 0

    // 高亮显示第一个匹配项
    if (matches.length > 0) {
      highlightCurrentMatch(cm)
    }
  }
  catch (e) {
    console.error('搜索出错:', e)
  }
}

// 高亮当前匹配项
function highlightCurrentMatch(cm: any) {
  if (allMatches.value.length > 0 && searchResults.value.currentIndex < allMatches.value.length) {
    // 清除之前的高亮
    clearCurrentHighlight()

    const currentMatch = allMatches.value[searchResults.value.currentIndex]

    // 为当前匹配项创建高亮
    currentHighlightMarker.value = cm.markText(
      currentMatch.from,
      currentMatch.to,
      { className: 'search-current-highlight' },
    )

    // 滚动到当前匹配项
    cm.scrollIntoView({ from: currentMatch.from, to: currentMatch.to }, 100)
    // 选中当前匹配项
    cm.setSelection(currentMatch.from, currentMatch.to)
  }
}

// 执行上一个搜索
function performPrev() {
  if (!props.editor || !searchText.value || searchResults.value.count === 0)
    return

  const cm = props.editor

  // 移动到上一个匹配项（循环）
  searchResults.value.currentIndex
    = (searchResults.value.currentIndex - 1 + searchResults.value.count) % searchResults.value.count

  // 高亮当前匹配项
  highlightCurrentMatch(cm)
}

// 执行下一个搜索
function performNext() {
  if (!props.editor || !searchText.value || searchResults.value.count === 0)
    return

  const cm = props.editor

  // 移动到下一个匹配项（循环）
  searchResults.value.currentIndex = (searchResults.value.currentIndex + 1) % searchResults.value.count

  // 高亮当前匹配项
  highlightCurrentMatch(cm)
}

// 执行替换
function performReplace() {
  if (!props.editor || !searchText.value || searchResults.value.count === 0)
    return

  const cm = props.editor
  const currentMatch = allMatches.value[searchResults.value.currentIndex]

  // 替换当前选中文本
  cm.replaceRange(replaceText.value, currentMatch.from, currentMatch.to)

  // 重新执行搜索以更新匹配项位置
  performSearch()
}

// 执行全部替换
function performReplaceAll() {
  if (!props.editor || !searchText.value || searchResults.value.count === 0)
    return

  const cm = props.editor

  // 从后往前替换，避免位置变化影响替换
  for (let i = allMatches.value.length - 1; i >= 0; i--) {
    const match = allMatches.value[i]
    cm.replaceRange(replaceText.value, match.from, match.to)
  }

  // 清除高亮，清空输入框，但不关闭面板
  clearSearchHighlight()
  searchText.value = ''
  replaceText.value = ''
}

// 清除当前高亮
function clearCurrentHighlight() {
  if (currentHighlightMarker.value) {
    try {
      currentHighlightMarker.value.clear()
    }
    catch (e) {
      console.debug('当前高亮标记已清除', e)
    }
    currentHighlightMarker.value = null
  }
}

// 清除搜索高亮
function clearSearchHighlight() {
  if (props.editor) {
    const cm = props.editor

    // 清除当前高亮
    clearCurrentHighlight()

    // 清除所有搜索匹配项的高亮标记
    cm.operation(() => {
      // 获取所有标记
      const markers = cm.getAllMarks()
      // 清除所有与搜索相关的标记
      markers.forEach((marker: any) => {
        if (marker.className && marker.className.includes('search-')) {
          marker.clear()
        }
      })
    })

    // 重置状态
    searchResults.value.count = 0
    searchResults.value.currentIndex = 0
    allMatches.value = []
  }
}

// 关闭面板
function closePanel() {
  clearSearchHighlight()
  searchText.value = ''
  replaceText.value = ''
  showSearchPanel.value = false
  emit('close')
}
</script>

<template>
  <div v-if="showSearchPanel" class="search-panel bg-background border-border dark:bg-background dark:border-border z-50 w-full border-b p-2">
    <!-- 搜索行 -->
    <div class="mb-2 flex items-center">
      <!-- 搜索输入区 -->
      <div class="relative mr-2 flex-1">
        <input
          id="search-input"
          ref="searchInputRef"
          v-model="searchText"
          type="text"
          placeholder="查找..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          class="bg-background dark:bg-background border-input focus:ring-ring dark:border-input dark:text-foreground w-full border rounded-md py-2 pl-9 pr-8 focus:outline-none focus:ring-2"
          @keyup.enter="performNext"
          @keyup.esc="closePanel"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button
          v-if="searchText"
          class="text-muted-foreground hover:bg-accent hover:text-foreground absolute right-2 top-1/2 transform rounded-full p-0.5 -translate-y-1/2"
          title="清除搜索"
          @click="clearSearchText"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 选项按钮 -->
      <div class="space-x-1 mr-2 flex shrink-0 items-center">
        <button
          class="border rounded p-1.5" :class="[{ 'bg-accent border-accent-foreground dark:bg-accent dark:border-accent-foreground': matchCase, 'border-input dark:border-input': !matchCase }]"
          title="区分大小写"
          @click="toggleCaseSensitive"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <text x="6" y="16" font-size="14" font-weight="bold" fill="currentColor">Aa</text>
          </svg>
        </button>

        <button
          class="border rounded p-1.5" :class="[{ 'bg-accent border-accent-foreground dark:bg-accent dark:border-accent-foreground': useRegex, 'border-input dark:border-input': !useRegex }]"
          title="正则表达式"
          @click="toggleRegex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6h12M6 18h12M9 9l1.5 3L9 15m6-6l-1.5 3L15 15" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      <!-- 导航按钮 -->
      <div class="space-x-1 flex shrink-0 items-center">
        <button
          class="border-input dark:border-input hover:bg-accent dark:hover:bg-accent border rounded p-1.5 disabled:opacity-50"
          :disabled="searchResults.count === 0"
          title="上一个"
          @click="performPrev"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          class="border-input dark:border-input hover:bg-accent dark:hover:bg-accent border rounded p-1.5 disabled:opacity-50"
          :disabled="searchResults.count === 0"
          title="下一个"
          @click="performNext"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <span v-if="searchResults.count > 0" class="text-muted-foreground dark:text-muted-foreground mx-2 text-sm">
          {{ searchResults.currentIndex + 1 }} / {{ searchResults.count }}
        </span>
      </div>

      <!-- 右侧按钮组 -->
      <div class="space-x-1 ml-4 flex shrink-0 items-center">
        <button
          class="border-input dark:border-input hover:bg-accent dark:hover:bg-accent border rounded p-1.5"
          :title="showReplace ? '隐藏替换' : '显示替换'"
          @click="toggleReplace"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="!showReplace" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <button
          class="border-input dark:border-input hover:bg-accent dark:hover:bg-accent border rounded p-1.5"
          title="关闭"
          @click="closePanel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 替换行 -->
    <div v-if="showReplace" class="flex items-center">
      <!-- 替换输入区 -->
      <div class="relative mr-2 flex-1">
        <input
          id="replace-input"
          ref="replaceInputRef"
          v-model="replaceText"
          type="text"
          placeholder="替换为..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          class="border-input dark:border-input focus:ring-ring bg-background dark:bg-background dark:text-foreground w-full border rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2"
          @keyup.esc="closePanel"
        >
        <button
          v-if="replaceText"
          class="text-muted-foreground hover:text-foreground hover:bg-accent absolute right-2 top-1/2 transform rounded-full p-0.5 -translate-y-1/2"
          title="清除替换"
          @click="clearReplaceText"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 替换按钮 -->
      <div class="space-x-1 flex shrink-0 items-center">
        <button
          class="border-input dark:border-input hover:bg-accent dark:hover:bg-accent border rounded p-1.5 disabled:opacity-50"
          :disabled="searchResults.count === 0"
          title="替换"
          @click="performReplace"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <button
          class="border-input dark:border-input hover:bg-accent dark:hover:bg-accent border rounded p-1.5 disabled:opacity-50"
          :disabled="searchResults.count === 0"
          title="全部替换"
          @click="performReplaceAll"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18" />
          </svg>
        </button>
      </div>

      <!-- 占位空格，与搜索行右侧按钮宽度一致 -->
      <div class="ml-4 w-[135px] shrink-0" />
    </div>
  </div>
</template>

<style>
/* 当前搜索匹配项高亮样式 - 应用于编辑器内容 */
.CodeMirror .search-current-highlight,
.search-current-highlight {
  background-color: #ffeb3b !important;
  border-radius: 2px;
  padding: 0 2px;
  color: #000 !important;
}
</style>
