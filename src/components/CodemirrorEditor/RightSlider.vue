<script setup lang="ts">
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useStore } from '@/stores'

const store = useStore()

// 目录相关状态
const tocItems = ref<TocItem[]>([]) // 目录项列表
const expandedLevels = ref<Set<number>>(new Set([1, 2, 3])) // 默认展开所有层级

// 目录项接口
interface TocItem {
  id: string
  text: string
  level: number
  indent: number
}

// 获取当前编辑器内容
function getCurrentContent(): string {
  if (store.editor) {
    return store.editor.getValue()
  }
  return ''
}

// 从 Markdown 内容中提取标题生成目录
function parseTocFromMarkdown(markdown: string): TocItem[] {
  const lines = markdown.split('\n')
  const items: TocItem[] = []

  for (const line of lines) {
    // 匹配 Markdown 标题语法：# 标题
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      // 生成唯一 ID（用于跳转）
      const id = `heading-${items.length}`

      items.push({
        id,
        text,
        level,
        indent: level - 1,
      })
    }
  }

  return items
}

// 更新目录
function updateToc() {
  const content = getCurrentContent()
  tocItems.value = parseTocFromMarkdown(content)
}

// 切换层级展开/收起
function toggleLevel(level: number) {
  if (expandedLevels.value.has(level)) {
    expandedLevels.value.delete(level)
  }
  else {
    expandedLevels.value.add(level)
  }
  expandedLevels.value = new Set(expandedLevels.value)
}

// 检查层级是否展开
function isLevelExpanded(level: number): boolean {
  return expandedLevels.value.has(level)
}

// 判断某一项是否应该显示（检查所有父级是否都展开）
function shouldShowItem(item: TocItem, index: number): boolean {
  // 如果是顶级标题（h1），始终显示
  if (item.level === 1) {
    return true
  }
  
  // 检查所有父级是否都展开
  for (let i = index - 1; i >= 0; i--) {
    const parentItem = tocItems.value[i]
    // 找到最近的父级（级别比当前项小的第一项）
    if (parentItem.level < item.level) {
      // 如果这个父级是 h1 或 h2，检查对应的层级是否展开
      if (parentItem.level <= 2) {
        if (!expandedLevels.value.has(parentItem.level + 1)) {
          return false
        }
      }
      // 递归检查更高级的父级
      if (parentItem.level > 1) {
        return shouldShowItem(parentItem, i)
      }
      break
    }
  }
  
  return true
}

// 跳转到指定标题
function scrollToHeading(index: number) {
  if (!store.editor) return

  const targetItem = tocItems.value[index]
  if (!targetItem) return

  // 在编辑器中查找对应的标题行
  const content = getCurrentContent()
  const lines = content.split('\n')

  let headingIndex = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      if (headingIndex === index) {
        // 滚动到该行
        const coords = store.editor.charCoords({ line: i, ch: 0 }, 'local')
        store.editor.scrollTo(null, coords.top - 50)

        // 高亮显示
        store.editor.setSelection({ line: i, ch: 0 }, { line: i, ch: line.length })
        store.editor.focus()
        break
      }
      headingIndex++
    }
  }
}

// 监听编辑器内容变化，更新目录
watch(() => store.editor, () => {
  if (store.editor) {
    updateToc()

    // 监听编辑器变化
    store.editor.on('change', () => {
      updateToc()
    })
  }
}, { immediate: true })

// 监听当前文章切换，更新目录
watch(() => store.currentPostId, () => {
  setTimeout(() => {
    updateToc()
  }, 100)
})

// 获取有内容的层级
const hasContent = computed(() => tocItems.value.length > 0)
</script>

<template>
  <div class="bg-background/20 overflow-hidden transition-width duration-300" :class="{
    'w-0': !store.isOpenRightSlider,
    'w-100': store.isOpenRightSlider,
  }">
    <div class="h-full overflow-auto p-4 transition-transform" :class="{
    'translate-x-0': store.isOpenRightSlider,
    'translate-x-full': !store.isOpenRightSlider,
  }">
      <!-- 目录列表 -->
      <div class="space-y-2">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-base font-semibold">
            目录
          </h2>
        </div>
        <div class="border-border rounded-md border bg-card p-3">
          <div v-if="hasContent" class="space-y-1">
            <div v-for="(item, index) in tocItems" :key="item.id"
              class="toc-item hover:bg-muted/50 cursor-pointer rounded px-2 py-1.5 text-sm transition-colors"
              :style="{ paddingLeft: `${item.indent * 12 + 8}px` }" @click="scrollToHeading(index)">
              <div class="flex items-center gap-1">
                <button v-if="shouldShowItem(item, index) && item.level <= 2 && tocItems[index + 1]?.level > item.level"
                  class="text-muted-foreground hover:text-foreground flex h-4 w-4 items-center justify-center rounded transition-colors"
                  @click.stop="toggleLevel(item.level + 1)">
                  <ChevronDown v-if="isLevelExpanded(item.level + 1)" class="h-3 w-3" />
                  <ChevronRight v-else class="h-3 w-3" />
                </button>
                <span class="truncate" :class="{
    'text-muted-foreground': item.level > 3,
  }" v-show="shouldShowItem(item, index)">
                  {{ item.text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.toc-item {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: 0;
    background-color: var(--primary);
    border-radius: 0 3px 3px 0;
    transition: height 0.2s ease;
  }

  &:hover {
    &::before {
      height: 70%;
    }
  }
}
</style>
