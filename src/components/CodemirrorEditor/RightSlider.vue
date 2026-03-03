<script setup lang="ts">
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useStore } from '@/stores'

const store = useStore()

// 目录相关状态
const tocItems = ref<TocItem[]>([]) // 目录项列表
const expandedMap = ref<Map<string, boolean>>(new Map()) // 默认展开所有层级（undefined 表示未设置，默认为展开）

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
  
  // 初始化展开状态：保留已有状态
  const newExpandedMap = new Map<string, boolean>()
  tocItems.value.forEach((item) => {
    if (expandedMap.value.has(item.id)) {
      newExpandedMap.set(item.id, expandedMap.value.get(item.id)!)
    }
  })
  expandedMap.value = newExpandedMap
}

// 获取某项的父级索引
function getParentIndex(index: number): number {
  if (index < 0 || index >= tocItems.value.length) {
    return -1
  }
  const currentItem = tocItems.value[index]
  // 从当前项往前找，找到第一个级别比当前项小的项
  for (let i = index - 1; i >= 0; i--) {
    const prevItem = tocItems.value[i]
    if (prevItem && prevItem.level < currentItem.level) {
      return i
    }
  }
  return -1 // 没有父级
}

// 切换某项的展开/收起状态
function toggleItem(index: number) {
  if (index < 0 || index >= tocItems.value.length) return
  const itemId = tocItems.value[index].id
  const isExpanded = expandedMap.value.get(itemId) ?? true // 默认展开
  expandedMap.value.set(itemId, !isExpanded)
  expandedMap.value = new Map(expandedMap.value)
}

// 检查某项是否展开
function isItemExpanded(index: number): boolean {
  if (index < 0 || index >= tocItems.value.length) return true
  const itemId = tocItems.value[index].id
  return expandedMap.value.get(itemId) ?? true // 默认展开
}

// 判断某一项是否应该显示（检查所有父级是否都展开）
function shouldShowItem(item: TocItem, index: number): boolean {
  // 安全检查
  if (!item || index < 0 || index >= tocItems.value.length) {
    return false
  }

  // 如果是顶级标题（h1），始终显示
  if (item.level === 1) {
    return true
  }

  // 收集所有父级索引
  const parentIndices: number[] = []
  let currentIndex = index

  while (true) {
    const parentIndex = getParentIndex(currentIndex)
    if (parentIndex === -1) {
      break
    }
    parentIndices.push(parentIndex)
    currentIndex = parentIndex
  }

  // 检查所有父级是否都展开（默认展开）
  for (const parentIndex of parentIndices) {
    const parentItemId = tocItems.value[parentIndex].id
    const isExpanded = expandedMap.value.get(parentItemId) ?? true
    if (!isExpanded) {
      return false
    }
  }

  return true
}

// 判断某项是否有子项（后面有级别比它大的项）
function hasChildren(index: number): boolean {
  if (index < 0 || index >= tocItems.value.length - 1) return false
  const currentItem = tocItems.value[index]
  // 检查下一项的级别是否比当前项大
  return tocItems.value[index + 1]?.level > currentItem.level
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
            <template v-for="(item, index) in tocItems" :key="item.id">
              <div v-if="shouldShowItem(item, index)"
                class="toc-item hover:bg-muted/50 cursor-pointer rounded px-2 py-1.5 text-sm transition-colors"
                :style="{ paddingLeft: `${item.indent * 12 + 8}px` }" @click="scrollToHeading(index)">
                <div class="flex items-center gap-1">
                  <button v-if="hasChildren(index)"
                    class="text-muted-foreground hover:text-foreground flex h-4 w-4 items-center justify-center rounded transition-colors"
                    @click.stop="toggleItem(index)">
                    <ChevronDown v-if="isItemExpanded(index)" class="h-3 w-3" />
                    <ChevronRight v-else class="h-3 w-3" />
                  </button>
                  <span class="truncate" :class="{
    'text-muted-foreground': item.level > 3,
  }">
                    {{ item.text }}
                  </span>
                </div>
              </div>
            </template>
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
