<script setup lang="ts">
import { ChevronLeft, ChevronRight, Ellipsis, Search, Trash } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { toast } from '@/composables/useToast'
import { useStore } from '@/stores'
import type { Post, TabConfig, WechatDraft } from '@/types/post'
import { PostGroup } from '@/types/post'

const store = useStore()

const searchQuery = ref(``)
const editTarget = ref<number>(-1)
const isOpenDelPostConfirmDialog = ref(false)
const wechatDraftsCache = ref<WechatDraft[]>([]) // 缓存微信公众号草稿
const activeTab = ref<PostGroup>(PostGroup.DEFAULT) // 添加tab状态，默认显示默认分组
const deleteTargetPost = ref<Post | WechatDraft | null>(null) // 保存要删除的文章对象
// 分页相关信息
const wechatCurrentPage = ref<number>(0) // 微信公众号草稿当前页码
const wechatTotalPages = ref<number>(1) // 微信公众号草稿总页数
const wechatTotalCount = ref<number>(0) // 微信公众号草稿总数
const searchResults = ref<(Post | WechatDraft)[]>([]) // 存储搜索结果
const jumpPageInput = ref<string>(`1`) // 跳转页面输入框，默认值为1

// 记录每个tab的页码状态
const tabPageStates = ref<Record<PostGroup, number>>({
  [PostGroup.DEFAULT]: 0,
  [PostGroup.WECHAT]: 0,
})

// Tab配置
const tabConfig: Record<PostGroup, TabConfig> = {
  [PostGroup.DEFAULT]: {
    name: `默认分组`,
    groupName: PostGroup.DEFAULT,
    getArticles: () => store.posts.filter((post) => {
      const group = post.group || PostGroup.DEFAULT
      return group === PostGroup.DEFAULT
    }) as Post[],
    searchArticles: (query: string) => store.posts.filter((post) => {
      const group = post.group || PostGroup.DEFAULT
      if (group !== PostGroup.DEFAULT)
        return false

      if (post.title.toLowerCase().includes(query.toLowerCase())) {
        return true
      }

      return false
    }) as Post[],
    switchArticle: (post: Post) => {
      console.log(`Switching to article:`, post)
      // 对于默认分组的文章，直接切换到对应的文章
      store.currentPostId = post.id || null
    },
    // 默认分组不需要分页
    hasNextPage: () => false,
    hasPrevPage: () => false,
    nextPage: () => {},
    prevPage: () => {},
  },
  [PostGroup.WECHAT]: {
    name: `微信公众号`,
    groupName: PostGroup.WECHAT,
    getArticles: () => wechatDraftsCache.value,
    searchArticles: (query: string) => wechatDraftsCache.value.filter((draft: WechatDraft) => {
      if (draft.title.toLowerCase().includes(query.toLowerCase())) {
        return true
      }

      return false
    }),
    switchArticle: async (post: WechatDraft) => {
      // 检查当前是否是微信公众号tab
      if (activeTab.value === PostGroup.WECHAT) {
        // 存储当前选中的微信草稿数据到全局变量
        if ((window as any).currentWechatDraft) {
          (window as any).currentWechatDraft = post
        }
        // 使用store方法显示微信草稿内容
        await store.setWechatDraftContent(post)
        // 设置当前文章ID为微信文章的ID（即mediaId）
        store.currentPostId = post.id || null
      }
      else {
        // 默认分组的文章，直接切换到对应的文章
        store.currentPostId = post.id || null
      }
    },
    // 微信公众号草稿支持分页
    hasNextPage: () => wechatCurrentPage.value < wechatTotalPages.value - 1,
    hasPrevPage: () => wechatCurrentPage.value > 0,
    nextPage: () => {
      if (wechatCurrentPage.value < wechatTotalPages.value - 1) {
        loadWechatDrafts(wechatCurrentPage.value + 1)
      }
    },
    prevPage: () => {
      if (wechatCurrentPage.value > 0) {
        loadWechatDrafts(wechatCurrentPage.value - 1)
      }
    },
  },
}

// 监听tab切换
watch(activeTab, async (newTab, oldTab) => {
  console.log(`Tab changed from`, oldTab, `to`, newTab)
  // 切换tab时，重置搜索查询以确保显示所有对应分组的文章
  searchQuery.value = ``

  // 切换到微信公众号tab时，加载对应页码的数据
  if (newTab === PostGroup.WECHAT) {
    console.log(`Loading wechat drafts...`)
    // 获取要加载的页码
    const targetPage = tabPageStates.value[PostGroup.WECHAT]
    // 更新输入框的值
    jumpPageInput.value = (targetPage + 1).toString()
    await loadWechatDrafts(targetPage)
  }
})

// 监听刷新微信草稿数据事件
onMounted(() => {
  const refreshHandler = () => {
    if (activeTab.value === PostGroup.WECHAT) {
      loadWechatDrafts(wechatCurrentPage.value)
    }
  }

  document.addEventListener(`refresh-wechat-drafts`, refreshHandler)

  // 清理事件监听器
  onUnmounted(() => {
    document.removeEventListener(`refresh-wechat-drafts`, refreshHandler)
  })
})

// 加载微信公众号草稿（支持分页，每页5条）
async function loadWechatDrafts(page: number = 0) {
  console.log(`Loading wechat drafts page ${page}...`)
  try {
    // 获取微信配置
    const { getWechatConfig } = await import(`@/utils/wechatConfig`)
    const config = getWechatConfig()
    if (!config) {
      console.log(`No wechat config found`)
      return
    }

    // 获取access_token
    const { WechatPostService } = await import(`@/utils/wechatPostService`)
    const accessToken = await WechatPostService.getAccessToken(
      config.appID,
      config.appsecret,
      config.proxyOrigin,
    )

    if (!accessToken) {
      console.log(`Failed to get access token`)
      return
    }

    // 获取草稿列表（每页20条）
    console.log(`Fetching drafts with access token`)
    const result = await WechatPostService.getDrafts(accessToken, config.proxyOrigin, page * 20, 20, false)
    console.log(`Drafts result:`, result)

    if (result && result.item) {
      // 处理草稿数据
      const processedDrafts = result.item.map((draft: any) => {
        // 从news_item中获取标题
        let title = `无标题`
        let content = ``
        let author = ``
        let digest = ``
        let thumbMediaId = ``
        let needOpenComment = true
        let onlyFansCanComment = false

        if (draft.content && draft.content.news_item && draft.content.news_item.length > 0) {
          const firstNewsItem = draft.content.news_item[0]
          title = firstNewsItem.title || `无标题`
          content = firstNewsItem.content || ``
          author = firstNewsItem.author || ``
          digest = firstNewsItem.digest || ``
          thumbMediaId = firstNewsItem.thumb_media_id || ``
          needOpenComment = firstNewsItem.need_open_comment !== undefined ? firstNewsItem.need_open_comment === 1 : true
          onlyFansCanComment = firstNewsItem.only_fans_can_comment !== undefined ? firstNewsItem.only_fans_can_comment === 1 : false
        }
        else if (draft.content && draft.content.title) {
          // 备用方案：直接从content获取标题
          title = draft.content.title || `无标题`
        }

        return {
          id: draft.media_id, // 使用微信媒体ID作为文章ID
          title,
          content,
          author,
          digest,
          thumbMediaId,
          needOpenComment,
          onlyFansCanComment,
          group: PostGroup.WECHAT,
          mediaId: draft.media_id,
          updateTime: draft.update_time,
        } as WechatDraft
      })

      // 更新缓存（每次都替换整个缓存，只保留当前页的数据）
      wechatDraftsCache.value = processedDrafts

      // 更新页码信息
      wechatCurrentPage.value = page
      tabPageStates.value[PostGroup.WECHAT] = page // 更新tab页码状态
      jumpPageInput.value = (page + 1).toString() // 更新输入框的值为当前页码
      if (result.total_count) {
        wechatTotalCount.value = result.total_count
        wechatTotalPages.value = Math.ceil(result.total_count / 20)
      }

      console.log(`Updated wechat drafts cache: page ${page}, total ${processedDrafts.length} items`)

      // 更新全局缓存
      const globalCache = (window as any).wechatDraftsCache
      if (globalCache) {
        globalCache.value = wechatDraftsCache.value
      }

      // 更新搜索结果
      if (searchQuery.value.trim()) {
        searchResults.value = tabConfig[PostGroup.WECHAT].searchArticles(searchQuery.value)
      }
      else {
        searchResults.value = wechatDraftsCache.value
      }
    }
  }
  catch (error) {
    console.error(`获取微信草稿失败:`, error)
  }
}

// 处理跳转页面输入
function handleJumpPage() {
  const page = Number.parseInt(jumpPageInput.value)
  if (!Number.isNaN(page) && page >= 1 && page <= wechatTotalPages.value) {
    // 页面索引从0开始
    loadWechatDrafts(page - 1)
  }
  else {
    // 输入无效页码时给出提示
    console.log(`请输入有效的页码`)
  }
}

// 监听搜索查询变化
watch(searchQuery, (newQuery) => {
  const currentTab = tabConfig[activeTab.value]

  if (!newQuery.trim()) {
    searchResults.value = currentTab.getArticles()
    return
  }

  searchResults.value = currentTab.searchArticles(newQuery)
})

// 搜索过滤的文章列表
const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) {
    return tabConfig[activeTab.value].getArticles()
  }

  return searchResults.value
})

// 生成唯一键
function getUniqueKey(post: Post | WechatDraft, index: number) {
  // 使用文章的唯一ID，如果没有ID则使用标题+索引
  return post.id ? post.id : `${post.title}-${index}`
}

// 获取文章在store.posts中的索引
function getPostIndex(post: Post | WechatDraft) {
  // 现在所有文章（包括微信文章）都有ID，所以返回索引
  return store.posts.findIndex((p) => {
    // 使用ID进行精确匹配
    return post.id && p.id === post.id
  })
}

// 检查某篇文章是否为当前选中项
function isCurrentPost(post: Post | WechatDraft): boolean {
  // 统一使用ID来判断是否为当前选中项，无论是默认分组还是微信公众号文章
  return store.currentPostId !== null && post.id !== undefined && store.currentPostId === post.id
}

// 切换到指定文章，如果文章来自微信公众号草稿，则新建文章并复制内容

// 开始删除文章（通过文章对象）
function startDelPostByPost(post: Post | WechatDraft) {
  const index = getPostIndex(post)
  if (index !== -1 || post.group === PostGroup.WECHAT) {
    editTarget.value = index
    // 保存要删除的文章对象，以便在确认删除时使用
    deleteTargetPost.value = post
    isOpenDelPostConfirmDialog.value = true
  }
}

// 确认删除
async function delPost() {
  const post = deleteTargetPost.value
  // 检查是否是微信草稿
  if (post && post.group === PostGroup.WECHAT) {
    // 删除微信草稿
    try {
      // 获取微信配置
      const { getWechatConfig } = await import(`@/utils/wechatConfig`)
      const config = getWechatConfig()
      if (!config) {
        toast.error(`未配置微信公众号`)
        isOpenDelPostConfirmDialog.value = false
        return
      }

      // 获取access_token
      const { WechatPostService } = await import(`@/utils/wechatPostService`)
      const accessToken = await WechatPostService.getAccessToken(
        config.appID,
        config.appsecret,
        config.proxyOrigin,
      )

      if (!accessToken) {
        toast.error(`获取微信访问令牌失败`)
        isOpenDelPostConfirmDialog.value = false
        return
      }

      // 调用微信删除草稿API
      const result = await WechatPostService.deleteDraft(
        accessToken,
        (post as WechatDraft).mediaId!,
        config.proxyOrigin,
      )

      if (result.errcode === 0) {
        toast.success(`微信草稿删除成功`)
        // 重新加载草稿列表
        await loadWechatDrafts(wechatCurrentPage.value)
      }
      else {
        toast.error(`微信草稿删除失败: ${result.errmsg}`)
      }
    }
    catch (error) {
      console.error(`删除微信草稿失败:`, error)
      toast.error(`删除微信草稿失败`)
    }
  }
  else {
    // 删除本地文章
    store.delPost(editTarget.value)
    toast.success(`文章删除成功`)
  }

  isOpenDelPostConfirmDialog.value = false
  // 清除临时存储的删除目标
  deleteTargetPost.value = null
}
</script>

<template>
  <div
    class="backdrop-blur-sm from-background/50 to-muted/50 post-slider bg-gradient-to-b border-border/40 supports-[backdrop-filter]:bg-background/60 relative h-full flex flex-shrink-0 flex-grow-0 transform-gpu overflow-hidden border-r transition-all duration-300 ease-in-out"
    :class="[
      store.isOpenPostSlider ? 'w-[240px]' : 'w-0',
      { isOpen: store.isOpenPostSlider },
    ]"
  >
    <nav
      class="space-y-3 box-border h-full w-full flex flex-col overflow-x-hidden overflow-y-auto p-3 transition-transform duration-300"
      :class="[
        store.isOpenPostSlider ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Tab栏 -->
      <div class="border-border flex flex-shrink-0 overflow-hidden border rounded-md">
        <button
          class="flex-1 py-2 text-sm font-medium transition-colors"
          :class="[
            activeTab === PostGroup.DEFAULT
              ? 'bg-muted ring-1 ring-border'
              : 'bg-background hover:bg-muted hover:ring-1 hover:ring-border',
          ]"
          @click="activeTab = PostGroup.DEFAULT"
        >
          {{ tabConfig[PostGroup.DEFAULT].name }}
        </button>
        <button
          class="flex-1 py-2 text-sm font-medium transition-colors"
          :class="[
            activeTab === PostGroup.WECHAT
              ? 'bg-muted ring-1 ring-border'
              : 'bg-background hover:bg-muted hover:ring-1 hover:ring-border',
          ]"
          @click="activeTab = PostGroup.WECHAT"
        >
          {{ tabConfig[PostGroup.WECHAT].name }}
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="relative">
        <Search class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          v-model="searchQuery"
          placeholder="搜索文章..."
          class="py-2 pl-10 pr-4 shadow-sm"
        />
      </div>

      <!-- 搜索结果或文章列表 -->
      <div class="space-y-1.5 flex flex-grow flex-col">
        <div
          v-for="(post, index) in filteredPosts"
          :key="getUniqueKey(post, index)"
          class="group relative mx-1 flex items-center rounded-md transition-all duration-200"
          :class="[
            isCurrentPost(post)
              ? 'bg-muted ring-1 ring-border'
              : 'hover:bg-muted hover:ring-1 hover:ring-border',
          ]"
        >
          <button
            class="h-9 flex flex-1 items-center overflow-hidden px-3 text-sm font-medium transition-transform duration-200 group-hover:translate-x-1"
            @click="tabConfig[activeTab].switchArticle(post)"
          >
            <span class="overflow-hidden whitespace-nowrap">{{ post.title.length > 12 ? post.title.substring(0, 11) : post.title }}</span>
          </button>
          <div
            class="absolute right-2 flex items-center opacity-0 transition-all duration-200 group-hover:opacity-100"
          >
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  size="icon"
                  variant="ghost"
                  class="h-7 w-7"
                >
                  <Ellipsis class="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  class="text-destructive gap-2 dark:text-red-400"
                  @click="startDelPostByPost(post)"
                >
                  <Trash class="size-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <!-- 暂无文章提示 -->
        <div
          v-if="filteredPosts.length === 0"
          class="text-muted-foreground flex flex-1 items-center justify-center py-10 text-center"
        >
          <div>
            <p class="text-sm">
              暂无文章
            </p>
          </div>
        </div>
      </div>

      <!-- 分页控件（仅在微信公众号tab且未搜索时显示，并固定在底部） -->
      <div v-if="activeTab === PostGroup.WECHAT && !searchQuery && filteredPosts.length > 0" class="border-border mt-auto border-t pt-2">
        <div class="flex items-center justify-center px-2">
          <div class="space-x-2 flex items-center">
            <span class="text-muted-foreground text-xs">第</span>
            <div class="relative">
              <Button
                size="icon"
                variant="outline"
                class="absolute left-0 top-0 h-6 w-5 rounded-r-none p-0 text-xs"
                :disabled="!tabConfig[PostGroup.WECHAT].hasPrevPage()"
                @click="tabConfig[PostGroup.WECHAT].prevPage()"
              >
                <ChevronLeft class="size-4" />
              </Button>
              <Input
                v-model="jumpPageInput"
                type="number"
                min="1"
                :max="wechatTotalPages"
                class="h-6 w-16 pl-5 pr-5 text-center text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                @keyup.enter="handleJumpPage"
                @change="handleJumpPage"
              />
              <Button
                size="icon"
                variant="outline"
                class="absolute right-0 top-0 h-6 w-5 rounded-l-none p-0 text-xs"
                :disabled="!tabConfig[PostGroup.WECHAT].hasNextPage()"
                @click="tabConfig[PostGroup.WECHAT].nextPage()"
              >
                <ChevronRight class="size-4" />
              </Button>
            </div>
            <span class="text-muted-foreground text-xs">页，共 {{ wechatTotalPages }} 页，{{ wechatTotalCount }} 条</span>
          </div>
        </div>
      </div>

      <!-- 删除确认对话框 -->
      <AlertDialog v-model:open="isOpenDelPostConfirmDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后将无法恢复，是否确认删除该文章？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel class="shadow-sm">
              取消
            </AlertDialogCancel>
            <AlertDialogAction class="bg-destructive hover:bg-destructive/90 shadow-sm" @click="delPost">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  </div>
</template>

<style scoped>
.post-slider {
  will-change: width;
}

/* 自定义滚动条样式 */
nav::-webkit-scrollbar {
  width: 3px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: rgba(var(--primary), 0.15);
  border-radius: 1.5px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--primary), 0.3);
}

/* 暗色模式滚动条 */
:global(.dark) nav::-webkit-scrollbar-thumb {
  background-color: rgba(var(--primary), 0.2);
}

:global(.dark) nav::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--primary), 0.4);
}

/* 列表项动画效果 */
.group {
  position: relative;
  overflow: hidden;
}

.group::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, transparent, rgba(var(--primary), 0.05), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.group:hover::after {
  transform: translateX(100%);
}
</style>
