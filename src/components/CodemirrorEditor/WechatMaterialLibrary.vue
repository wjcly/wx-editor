<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { toast } from '@/composables/useToast'
import { WechatPostService } from '@/utils/wechatPostService'

// 素材类型枚举
type MaterialType = `image` | `voice` | `video`

// 接收父组件传来的已选素材列表和分页信息
const props = defineProps<{
  currentType?: `image` | `voice` | `video`
  currentPage?: number
}>()

const emit = defineEmits([`insertMaterial`, `refreshMaterials`])

// 媒体预览模态框相关数据
const previewMedia = ref({
  show: false,
  type: `` as `video` | `audio` | ``,
  url: ``,
  title: ``,
  blobUrl: ``, // 用于临时媒体内容的URL
})

// 音频播放相关状态
const isAudioPlaying = ref(false)
const audioProgress = ref(0)
const audioRef = ref<HTMLAudioElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)

// 素材列表 - 为每种素材类型维护独立的状态
const typeStates = ref<Record<MaterialType, {
  currentPage: number
  currentPageInput: number
  totalCount: number
  hasMore: boolean
  materials: any[]
}>>({
  image: {
    currentPage: 0,
    currentPageInput: 1,
    totalCount: 0,
    hasMore: true,
    materials: [],
  },
  voice: {
    currentPage: 0,
    currentPageInput: 1,
    totalCount: 0,
    hasMore: true,
    materials: [],
  },
  video: {
    currentPage: 0,
    currentPageInput: 1,
    totalCount: 0,
    hasMore: true,
    materials: [],
  },
})

const currentType = ref<MaterialType>(props.currentType || `image`)
const isLoadingMore = ref(false) // 是否正在加载更多

// 当前显示的材料列表（根据当前类型）
const materials = ref<any[]>([])

// 辅助函数：更新当前显示的材料列表
function updateCurrentMaterials() {
  materials.value = typeStates.value[currentType.value].materials
}

// 获取当前类型状态的计算属性
const currentTypeState = computed(() => typeStates.value[currentType.value])

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(typeStates.value[currentType.value].totalCount / 10)
})

// 防抖相关
let loadDebounceTimer: NodeJS.Timeout | null = null

// 组件卸载时确保清理状态
onUnmounted(() => {
  // 不再使用 loading 状态，这里可以留空或执行其他清理操作
})

// 格式化日期
function formatDate(timestamp: number): string {
  if (!timestamp)
    return ``
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString()
}

// 加载素材列表（带防抖）
async function loadMaterials(type: MaterialType = `image`, page: number = 0) {
  // 清除之前的防抖定时器
  if (loadDebounceTimer) {
    clearTimeout(loadDebounceTimer)
  }

  return new Promise<{ totalCount: number, currentPage: number, totalPages: number }>((resolve) => {
    loadDebounceTimer = setTimeout(async () => {
      // 统一设置加载更多状态，不管是否是第一页
      isLoadingMore.value = true

      try {
        // 获取微信配置
        const { getWechatConfig } = await import(`@/utils/wechatConfig`)
        const config = getWechatConfig()
        if (!config) {
          toast.error(`请先配置微信公众号参数`)
          resolve({
            totalCount: 0,
            currentPage: page,
            totalPages: 0,
          })
          return
        }

        // 获取access_token
        const accessToken = await WechatPostService.getAccessToken(
          config.appID,
          config.appsecret,
          config.proxyOrigin,
        )

        if (!accessToken) {
          toast.error(`获取微信access_token失败`)
          resolve({
            totalCount: 0,
            currentPage: page,
            totalPages: 0,
          })
          return
        }

        // 获取素材列表，每页10条（2行，每行5个）
        const result = await WechatPostService.batchGetMaterials(
          accessToken,
          type,
          page * 10,
          10,
          config.proxyOrigin,
        )

        if (result.item) {
          // 总是替换内容，而不是追加，确保每页只显示当前页的数据
          // 更新对应类型的状态
          // 添加 type 信息到每个素材对象
          typeStates.value[type].materials = result.item.map((material: any) => ({
            ...material,
            type, // 确保每个素材对象都有 type 属性
          }))
          typeStates.value[type].totalCount = result.total_count || 0
          typeStates.value[type].currentPage = page
          typeStates.value[type].currentPageInput = page + 1

          // 更新是否有更多数据的标志
          typeStates.value[type].hasMore = (page + 1) * 10 < (result.total_count || 0)
        }
        else {
          typeStates.value[type].materials = []
          typeStates.value[type].totalCount = 0
          typeStates.value[type].hasMore = false
        }

        // 如果是当前类型，更新显示的材料列表
        if (type === currentType.value) {
          updateCurrentMaterials()
        }

        // 返回分页信息给父组件
        const totalItems = result.total_count || 0
        const totalPages = Math.ceil(totalItems / 10) // 每页10条

        resolve({
          totalCount: totalItems,
          currentPage: page,
          totalPages,
        })
      }
      catch (error) {
        console.error(`加载素材列表失败:`, error)
        toast.error(`加载素材列表失败`)
        resolve({
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
        })
      }
      finally {
        isLoadingMore.value = false
      }
    }, 300) // 300ms 防抖延迟
  })
}

// 翻页功能
function goToPage(page: number) {
  if (page >= 0 && page < totalPages.value) {
    typeStates.value[currentType.value].currentPage = page
    typeStates.value[currentType.value].currentPageInput = page + 1 // Update the input field to match current page
    loadMaterials(currentType.value, page)
  }
}

// 处理页面输入变化
function handlePageChange() {
  // 确保输入的页码在有效范围内
  let page = typeStates.value[currentType.value].currentPageInput

  if (page < 1) {
    page = 1
  }
  else if (page > totalPages.value) {
    page = totalPages.value
  }

  // 更新输入框的值 to be within valid range
  typeStates.value[currentType.value].currentPageInput = page

  // 跳转到指定页
  goToPage(page - 1)
}

// 获取素材图片URL
function getMaterialImageUrl(material: any, type: MaterialType): string {
  if (type === `image`) {
    if (material.url) {
      return `https://wsrv.nl?url=${encodeURIComponent(material.url)}`
    }
  }
  else if (type === `video`) {
    // 视频素材：优先使用 cover_url，然后是 thumb_url，最后是其他可能的URL
    if (material.cover_url) {
      return `https://wsrv.nl?url=${encodeURIComponent(material.cover_url)}`
    }
    return ``
  }
  return ``
}

// 重新加载素材
async function refreshMaterials(type: string, page: number = 0) {
  typeStates.value[type as MaterialType].currentPage = page
  typeStates.value[type as MaterialType].hasMore = true
  const pageInfo = await loadMaterials(type as MaterialType, page)

  // 将分页信息传递给父组件
  if (pageInfo) {
    emit(`refreshMaterials`, {
      totalCount: pageInfo.totalCount,
      currentPage: pageInfo.currentPage,
      totalPages: pageInfo.totalPages,
    })
  }
}

// 打开媒体预览模态框
function openMediaPreview(type: `video` | `audio`, url: string, title: string) {
  previewMedia.value = {
    show: true,
    type,
    url,
    title,
    blobUrl: ``,
  }

  // 防止背景滚动
  document.body.style.overflow = `hidden`

  // 重置音频状态
  isAudioPlaying.value = false
  audioProgress.value = 0
}

// 关闭媒体预览模态框
function closeMediaPreview() {
  // 清理临时的blob URL
  if (previewMedia.value.blobUrl) {
    URL.revokeObjectURL(previewMedia.value.blobUrl)
  }

  previewMedia.value = {
    show: false,
    type: ``,
    url: ``,
    title: ``,
    blobUrl: ``,
  }

  // 恢复背景滚动
  document.body.style.overflow = ``
}

// 暴露方法供父组件调用
defineExpose({
  refreshMaterials,
  formatTime,
  downloadAudio,
})

// 组件卸载时确保清理状态
onUnmounted(() => {
  // 关闭媒体预览模态框
  closeMediaPreview()
})

// 播放视频（使用模态框预览）
async function toggleVideoPreview(material: any) {
  event?.stopImmediatePropagation()
  try {
    // 获取微信配置
    const { getWechatConfig } = await import(`@/utils/wechatConfig`)
    const config = getWechatConfig()
    if (!config) {
      toast.error(`请先配置微信公众号参数`)
      return
    }

    // 获取access_token
    const accessToken = await WechatPostService.getAccessToken(
      config.appID,
      config.appsecret,
      config.proxyOrigin,
    )

    if (!accessToken) {
      toast.error(`获取微信access_token失败`)
      return
    }

    // 获取视频素材信息
    const videoInfo = await WechatPostService.getMaterial(
      accessToken,
      material.media_id,
      config.proxyOrigin,
    )

    // 处理视频素材响应
    if (videoInfo) {
      // 如果返回的是包含下载URL的对象
      if (videoInfo.down_url) {
        // 在模态框中打开视频
        openMediaPreview(`video`, videoInfo.down_url, material.name || material.title || `视频预览`)
      }
    }
    else {
      toast.error(`无法获取视频信息`)
    }
  }
  catch (error: any) {
    console.error(`预览视频失败:`, error)
    toast.error(error.message || `预览视频失败`)
  }
}

// 播放音频（使用模态框预览）
async function toggleAudioPreview(material: any) {
  event?.stopImmediatePropagation()
  try {
    // 获取微信配置
    const { getWechatConfig } = await import(`@/utils/wechatConfig`)
    const config = getWechatConfig()
    if (!config) {
      toast.error(`请先配置微信公众号参数`)
      return
    }

    // 获取access_token
    const accessToken = await WechatPostService.getAccessToken(
      config.appID,
      config.appsecret,
      config.proxyOrigin,
    )

    if (!accessToken) {
      toast.error(`获取微信access_token失败`)
      return
    }

    // 使用WechatPostService获取音频素材
    const audioBlob = await WechatPostService.getBlobMaterial(
      accessToken,
      material.media_id,
      config.proxyOrigin,
    )

    // 将二进制流转为 blob URL
    const audioUrl = URL.createObjectURL(audioBlob)

    // 在模态框中播放音频
    openMediaPreview(`audio`, audioUrl, `${material.name || material.title || `音频预览`}.mp3`)

    // 保存blobUrl以便后续清理
    previewMedia.value.blobUrl = audioUrl
  }
  catch (error: any) {
    console.error(`预览音频失败:`, error)
    toast.error(error.message || `预览音频失败`)
  }
}

// 监听当前类型变化，重置分页
watch(() => props.currentType, (newType) => {
  if (newType && (newType === `image` || newType === `voice` || newType === `video`)) {
    currentType.value = newType

    // 立即加载新类型的材料
    const pageToLoad = typeStates.value[newType].currentPage || 0
    loadMaterials(newType, pageToLoad)
  }
}, { immediate: true })

// 初始加载时
onMounted(() => {
  // 使用 props.currentType 或默认值作为初始类型
  const initialType = props.currentType || `image`
  currentType.value = initialType
  // 初始加载数据
  loadMaterials(initialType, 0)

  // 添加滚动监听，以便实现滚动加载更多
  nextTick(() => {
    const container = document.querySelector(`.material-list`)
    if (container) {
      container.addEventListener(`scroll`, handleScroll)
    }
  })
})

// 监听当前类型变化，更新显示的材料列表
watch(currentType, () => {
  updateCurrentMaterials()
}, { immediate: true })

onMounted(() => {
  // 使用 props.currentType 或默认值作为初始类型
  const initialType = props.currentType || `image`
  currentType.value = initialType
  // 初始加载数据
  loadMaterials(initialType, 0)

  // 添加滚动监听，以便实现滚动加载更多
  nextTick(() => {
    const container = document.querySelector(`.material-list`)
    if (container) {
      container.addEventListener(`scroll`, handleScroll)
    }
  })
})

// 监听当前类型变化，更新显示的材料列表
watch(currentType, () => {
  updateCurrentMaterials()
}, { immediate: true })

onUnmounted(() => {
  // 移除滚动监听
  const container = document.querySelector(`.material-list`)
  if (container) {
    container.removeEventListener(`scroll`, handleScroll)
  }
})

// 处理滚动事件，实现滚动加载
function handleScroll(event: Event) {
  const element = event.target as HTMLElement

  // 检查是否滚动到底部附近
  if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
    // 检查是否正在加载或已加载完所有数据
    if (!isLoadingMore.value && typeStates.value[currentType.value].hasMore) {
      loadMoreMaterials()
    }
  }
}

// 音频播放控制
function toggleAudioPlayback() {
  if (audioRef.value) {
    if (isAudioPlaying.value) {
      audioRef.value.pause()
    }
    else {
      audioRef.value.play()
    }
    isAudioPlaying.value = !isAudioPlaying.value
  }
}

// 更新音频进度
function updateProgress() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
    duration.value = audioRef.value.duration || 1
    audioProgress.value = (currentTime.value / duration.value) * 100
  }
}

// 音频播放结束
function onAudioEnded() {
  isAudioPlaying.value = false
  audioProgress.value = 0
}

// 音频加载完成
function onAudioLoaded() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration || 0
    audioRef.value.play()
    isAudioPlaying.value = true
  }
}

// 时间格式化函数
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, `0`)}:${secs.toString().padStart(2, `0`)}`
}

// 跳转到指定播放位置
function seekAudio(event: MouseEvent) {
  if (audioRef.value) {
    const progressBar = event.currentTarget as HTMLElement
    const rect = progressBar.getBoundingClientRect()
    const pos = (event.clientX - rect.left) / rect.width
    audioRef.value.currentTime = pos * duration.value
  }
}

// 下载音频文件
function downloadAudio() {
  if (previewMedia.value.url) {
    const link = document.createElement(`a`)
    link.href = previewMedia.value.url
    link.download = `${previewMedia.value.title || `audio`}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 加载更多素材
async function loadMoreMaterials() {
  if (!typeStates.value[currentType.value].hasMore || isLoadingMore.value)
    return

  isLoadingMore.value = true
  const nextPage = typeStates.value[currentType.value].currentPage + 1

  try {
    // 获取微信配置
    const { getWechatConfig } = await import(`@/utils/wechatConfig`)
    const config = getWechatConfig()
    if (!config) {
      toast.error(`请先配置微信公众号参数`)
      return
    }

    // 获取access_token
    const accessToken = await WechatPostService.getAccessToken(
      config.appID,
      config.appsecret,
      config.proxyOrigin,
    )

    if (!accessToken) {
      toast.error(`获取微信access_token失败`)
      return
    }

    // 获取素材列表
    const result = await WechatPostService.batchGetMaterials(
      accessToken,
      currentType.value,
      nextPage * 10,
      10,
      config.proxyOrigin,
    )

    if (result.item && result.item.length > 0) {
      // 追加到现有列表，添加 type 信息
      const newMaterials = [
        ...typeStates.value[currentType.value].materials,
        ...result.item.map((material: any) => ({ ...material, type: currentType.value })),
      ]
      typeStates.value[currentType.value].materials = newMaterials
      typeStates.value[currentType.value].currentPage = nextPage
      typeStates.value[currentType.value].currentPageInput = nextPage + 1

      // 检查是否还有更多数据
      typeStates.value[currentType.value].hasMore = (nextPage + 1) * 10 < (result.total_count || 0)

      // 更新显示的材料列表
      updateCurrentMaterials()
    }
    else {
      // 没有更多数据
      typeStates.value[currentType.value].hasMore = false
    }
  }
  catch (error) {
    console.error(`加载更多素材失败:`, error)
    toast.error(`加载更多素材失败`)
  }
  finally {
    isLoadingMore.value = false
  }
}
</script>

<template>
  <div class="wechat-material-library">
    <div class="material-list">
      <div
        v-for="material in materials"
        :key="material.media_id"
        class="material-item"
      >
        <div v-if="currentType === 'image'" class="image-material">
          <div class="image-container">
            <img :src="getMaterialImageUrl(material, currentType)" :alt="material.name">
          </div>
          <div class="material-info">
            <div class="material-name" :title="material.name">
              {{ material.name }}
            </div>
          </div>
        </div>
        <div v-else-if="currentType === 'voice'" class="voice-material">
          <div class="voice-container">
            <div class="music-player">
              <div class="album-art">
                <div class="album-icon">
                  🎵
                </div>
              </div>
              <div class="player-controls">
                <div class="track-info">
                  <div class="track-title" :title="material.name || material.media_id">
                    {{ material.name || material.media_id }}
                  </div>
                  <div class="track-time">
                    {{ formatDate(material.update_time) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="currentType === 'video'" class="video-material">
          <div class="video-container">
            <img
              v-if="getMaterialImageUrl(material, currentType)"
              :src="getMaterialImageUrl(material, currentType)"
              :alt="material.name"
              class="video-cover"
            >
            <div v-else class="video-placeholder">
              暂无封面
            </div>
          </div>
          <div class="material-info">
            <div class="material-name" :title="material.name || material.media_id">
              {{ material.name || material.media_id }}
            </div>
          </div>
        </div>
        <div v-else class="other-material">
          <div class="material-name" :title="material.name || material.media_id">
            {{ material.name || material.media_id }}
          </div>
          <div class="material-update-time">
            {{ formatDate(material.update_time) }}
          </div>
        </div>
        <div class="overlay">
          <div class="overlay-content">
            <button class="insert-material-btn" @click.stop="emit('insertMaterial', material)">
              插入素材
            </button>
            <button v-if="currentType === 'voice'" class="preview-btn" @click.stop="toggleAudioPreview(material)">
              播放
            </button>
            <button v-if="currentType === 'video'" class="preview-btn" @click.stop="toggleVideoPreview(material)">
              播放
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 媒体预览模态框 -->
    <div v-if="previewMedia.show" class="media-preview-modal" @click="closeMediaPreview">
      <div class="media-preview-content" @click.stop>
        <div class="modal-header">
          <h3>{{ previewMedia.title }}</h3>
          <button class="close-button" @click="closeMediaPreview">
            ×
          </button>
        </div>
        <div class="modal-body">
          <!-- 视频预览 -->
          <video v-if="previewMedia.type === 'video'" :src="previewMedia.url" controls autoplay class="media-player" />
          <!-- 音频预览 -->
          <div v-else-if="previewMedia.type === 'audio'" class="custom-audio-player">
            <div class="audio-visualizer">
              <div v-for="n in 20" :key="n" class="bar" :style="{ animationDelay: `${n * 0.1}s` }" />
            </div>
            <!-- 自定义控制按钮 -->
            <div class="audio-controls">
              <button class="control-btn" @click="toggleAudioPlayback">
                <span v-if="!isAudioPlaying">▶</span>
                <span v-else>❚❚</span>
              </button>
              <div class="progress-container">
                <div class="progress-info">
                  <span class="time">{{ formatTime(currentTime) }}</span>
                  <div
                    class="progress-bar"
                    @click="seekAudio"
                  >
                    <div class="progress" :style="{ width: `${audioProgress}%` }" />
                  </div>
                  <span class="time">{{ formatTime(duration) }}</span>
                </div>
              </div>
              <button class="control-btn" title="下载音频" @click="downloadAudio">
                <span>⬇</span>
              </button>
            </div>
            <!-- 隐藏的原生audio元素用于实际播放 -->
            <audio
              ref="audioRef"
              :src="previewMedia.url"
              class="hidden-audio"
              @timeupdate="updateProgress"
              @ended="onAudioEnded"
              @canplay="onAudioLoaded"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="typeStates[currentType].totalCount > 0 && typeStates[currentType].materials.length > 0" class="pagination">
      <button
        :disabled="currentTypeState.currentPage <= 0"
        @click="goToPage(0)"
      >
        首页
      </button>
      <button
        :disabled="currentTypeState.currentPage <= 0"
        @click="goToPage(currentTypeState.currentPage - 1)"
      >
        上一页
      </button>
      <span class="page-info">
        第
        <input
          v-model.number="currentTypeState.currentPageInput"
          type="number"
          :min="1"
          :max="totalPages"
          class="page-input"
          @change="handlePageChange"
        >
        页，共 {{ totalPages }} 页
      </span>
      <button
        :disabled="currentTypeState.currentPage >= totalPages - 1"
        @click="goToPage(currentTypeState.currentPage + 1)"
      >
        下一页
      </button>
      <button
        :disabled="currentTypeState.currentPage >= totalPages - 1"
        @click="goToPage(totalPages - 1)"
      >
        末页
      </button>
    </div>
  </div>
</template>

<style scoped>
.wechat-material-library {
  padding: 16px;
}

.material-types {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.material-types button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.material-types button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.material-list {
  width: 100%;
  overflow: hidden; /* 清除浮动 */
}

.material-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 5px; /* 适中的 padding */
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: #ffffff; /* 与编辑器编辑区背景色一致 */
  float: left; /* 使用浮动布局 */
  width: 180px; /* 设置宽度 */
  height: 220px; /* 设置高度 */
  margin-top: 10px;
  margin-left: 15px; /* 左右间距 */
  box-sizing: border-box; /* 盒模型 */
  overflow: hidden;
}

.material-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.material-item.selected {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

.selection-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.2s;
}

.material-item:hover .selection-indicator,
.material-item.selected .selection-indicator {
  opacity: 1; /* 悬停或选中时显示 */
}

.selection-indicator.selected {
  background: #007bff;
  border-color: #007bff;
}

.image-material {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-container {
  width: 140px;
  height: 140px;
  margin: 5px auto; /* 居中显示 */
}

.image-material img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Maintain aspect ratio */
  border-radius: 4px;
  display: block; /* 块级元素 */
}

.image-material img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Maintain aspect ratio */
  border-radius: 4px;
  flex-shrink: 0;
  align-self: center; /* Center the image in its container */
}

.image-material .material-info {
  text-align: center; /* 文字居中 */
  margin-top: 5px;
  height: 40px; /* 固定高度确保一致性 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.voice-material {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  position: relative;
}

.voice-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  margin: 5px auto; /* 居中显示 */
  gap: 5px; /* 适中 gap */
  overflow: hidden;
}

.music-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.album-art {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.album-icon {
  font-size: 24px;
}

.player-controls {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.track-info {
  text-align: center;
  width: 100%;
}

.track-title {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
  max-width: 100%;
  text-align: center;
  height: 30px;
  text-overflow: ellipsis;
  word-break: break-all;
}

.track-time {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

.play-controls {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

.play-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #007bff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 12px;
  transition: all 0.2s;
}

.play-btn:hover {
  background: #0056b3;
  transform: scale(1.1);
}

.play-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 暗黑模式支持 */
html.dark .album-art {
  background: linear-gradient(135deg, #5a67d8, #805ad5);
}

html.dark .track-title {
  color: #d1d5db;
}

html.dark .track-time {
  color: #9ca3af;
}

html.dark .play-btn {
  background: #3b82f6;
}

html.dark .play-btn:hover {
  background: #2563eb;
}

.play-audio-icon {
  margin-left: auto;
  width: 20px;
  height: 20px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  cursor: pointer;
}

.video-material {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.video-container {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f5f5f5;
  margin: 5px auto; /* 居中显示 */
}

.video-material .material-info {
  text-align: center; /* 文字居中 */
  margin-top: 5px;
  height: 40px; /* 固定高度确保一致性 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.video-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* Maintain aspect ratio */
  object-position: center;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25px;
  height: 25px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  cursor: pointer;
  z-index: 10;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 20px; /* Reduced font size */
}

.material-icon {
  font-size: 20px;
}

.material-name {
  font-size: 12px;
  color: #333;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
  max-width: 100%;
  text-align: center;
  height: 30px; /* 固定高度确保一致性 */
  text-overflow: ellipsis; /* 省略号 */
  word-break: break-all; /* 确保长单词能换行 */
}

.material-update-time {
  font-size: 10px; /* 更小的字体 */
  color: #666;
  margin-top: 2px; /* Reduced margin */
  text-align: center;
}

.insert-material-btn {
  width: 100px;
  height: 25px;
  border-radius: 12px; /* 更圆润 */
  border: 1px solid #d1d5db; /* 使用Tailwind默认边框色 */
  background-color: #f9fafb; /* 使用Tailwind默认背景色 */
  text-align: center;
  margin: 5px auto 0;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
  color: #374151; /* 使用Tailwind默认文本色 */
  font-weight: 500;
}

.insert-material-btn:hover {
  background-color: #f3f4f6; /* 浅灰色悬停背景 */
  border-color: #9ca3af; /* 悬停边框色 */
  color: #1f2937; /* 悬停文本色 */
  transform: translateY(-1px); /* 轻微上移效果 */
}

.insert-material-btn:active {
  background-color: #e5e7eb; /* 点击背景色 */
  transform: translateY(0); /* 恢复位置 */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1); /* 内阴影效果 */
}

/* 暗黑模式支持 */
html.dark .insert-material-btn {
  background-color: #374151; /* 暗黑背景 */
  border-color: #4b5563; /* 暗黑边框 */
  color: #d1d5db; /* 暗黑文本 */
}

html.dark .insert-material-btn:hover {
  background-color: #4b5563; /* 暗黑悬停背景 */
  border-color: #6b7280; /* 暗黑悬停边框 */
  color: #f3f4f6; /* 暗黑悬停文本 */
}

html.dark .insert-material-btn:active {
  background-color: #1f2937; /* 暗黑点击背景 */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3); /* 暗黑内阴影 */
}

.info-container {
  text-align: center;
  margin-top: 5px;
  padding: 0 5px;
  height: 40px; /* 固定高度确保一致性 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.action-info {
  text-align: center;
  margin-top: 5px;
  height: 30px; /* 固定高度专门用于按钮 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 4px; /* 与素材项保持一致的圆角 */
  z-index: 10;
  box-sizing: border-box; /* 确保宽高计算包含边框和padding */
}

.overlay .overlay-content {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 按钮之间的间距 */
  align-items: center;
}

.material-item:hover .overlay {
  opacity: 1;
}

.preview-btn {
  width: 80px;
  height: 30px;
  border-radius: 15px;
  border: 1px solid #ffffff;
  background-color: rgba(255, 255, 255, 0.2);
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
  color: #ffffff;
  font-weight: 500;
}

.preview-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.preview-btn:active {
  background-color: rgba(255, 255, 255, 0.4);
  transform: scale(0.98);
}

/* 暗黑模式支持 */
html.dark .preview-btn {
  color: #ffffff;
  border-color: #d1d5db;
}

html.dark .preview-btn:hover {
  background-color: rgba(249, 249, 250, 0.3);
}

html.dark .preview-btn:active {
  background-color: rgba(249, 249, 250, 0.4);
}

.overlay .insert-material-btn {
  width: 80px;
  height: 30px;
  border-radius: 15px;
  border: 1px solid #ffffff;
  background-color: rgba(255, 255, 255, 0.2);
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
  color: #ffffff;
  font-weight: 500;
}

.overlay .insert-material-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.overlay .insert-material-btn:active {
  background-color: rgba(255, 255, 255, 0.4);
  transform: scale(0.98);
}

/* 暗黑模式支持 */
html.dark .overlay .insert-material-btn {
  color: #ffffff;
  border-color: #d1d5db;
}

html.dark .overlay .insert-material-btn:hover {
  background-color: rgba(249, 249, 250, 0.3);
}

html.dark .insert-material-btn:active {
  background-color: rgba(249, 249, 250, 0.4);
}

.other-material {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.other-material .material-name {
  margin-top: 1px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  max-width: 100%;
}

.other-material {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.other-material .material-info {
  text-align: center; /* 文字居中 */
  margin-top: 5px;
  height: 40px; /* 固定高度确保一致性 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 暗黑模式支持 */
html.dark .material-item {
  background: #1e1e1e; /* 与编辑器暗黑主题匹配的颜色 */
  border-color: #454545;
}

html.dark .material-item.selected {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.15);
}

html.dark .material-types button {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

html.dark .material-types button.active {
  background: #3b82f6;
}

html.dark .video-container {
  background-color: #4b5563;
}

html.dark .video-placeholder {
  background-color: #4b5563;
}

html.dark .material-name {
  color: #d1d5db;
}

html.dark .material-update-time {
  color: #9ca3af;
}

html.dark .selection-indicator {
  background: #1f2937;
  border-color: #6b7280;
}

html.dark .selection-indicator.selected {
  background: #3b82f6;
  border-color: #3b82f6;
}

html.dark .play-icon {
  background-color: rgba(30, 41, 59, 0.8);
}

/* Fix for hover question mark issue */
.material-item:hover::before,
.material-item:hover::after {
  content: none !important;
}

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 10px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #f0f0f0;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

/* 媒体预览模态框样式 */
.media-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.media-preview-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f0f0f0;
}

.modal-body {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-player {
  max-width: 100%;
  max-height: 70vh;
}

.media-player video,
.media-player audio {
  width: 100%;
  height: auto;
}

/* 美化音频播放器样式 */
.media-player audio {
  width: 100%;
  height: 60px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(120deg, #f5f7fa 0%, #e4edf5 100%);
  border: none;
  outline: none;
}

/* 针对暗黑模式的音频播放器样式 */
html.dark .media-player audio {
  background: linear-gradient(120deg, #2d3748 0%, #1a202c 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 自定义音频播放器，与模态框背景融为一体，占满整个区域 */
.custom-audio-player {
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.audio-header {
  text-align: center;
  width: 100%;
}

.audio-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0 20px;
}

.audio-visualizer {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 120px;
  width: 100%;
  max-width: 600px;
  gap: 6px;
  padding: 20px 0;
  margin: 0 auto;
}

.bar {
  width: 6px;
  background: rgba(107, 114, 128, 0.8);
  border-radius: 4px;
  height: 10px;
  animation: visualizer 1.2s ease-in-out infinite;
  animation-play-state: running;
}

html:not(.dark) .bar {
  background: rgba(107, 114, 128, 0.8);
}

html.dark .bar {
  background: rgba(156, 163, 175, 0.7);
}

.bar:nth-child(2n) {
  animation-duration: 1.5s;
}

.bar:nth-child(3n) {
  animation-duration: 1s;
}

.bar:nth-child(4n) {
  animation-duration: 1.7s;
}

.bar:nth-child(5n) {
  animation-duration: 1.3s;
}

/* Default (light mode) keyframes */
@keyframes visualizer {
  0%,
  100% {
    height: 10px;
  }
  50% {
    height: 30px;
  }
}

html:not(.dark) @keyframes visualizer {
  0%,
  100% {
    height: 10px;
    background: rgba(107, 114, 128, 0.6);
  }
  50% {
    height: 30px;
    background: rgba(75, 85, 99, 1);
  }
}

html.dark @keyframes visualizer {
  0%,
  100% {
    height: 10px;
    background: rgba(156, 163, 175, 0.5);
  }
  50% {
    height: 30px;
    background: rgba(209, 213, 219, 0.9);
  }
}

/* Dark mode keyframes */
html.dark @keyframes visualizer {
  0%,
  100% {
    height: 10px;
    background: rgba(255, 255, 255, 0.5);
  }
  50% {
    height: 30px;
    background: rgba(255, 255, 255, 0.9);
  }
}

.bar {
  animation: visualizer 1.2s ease-in-out infinite;
  animation-play-state: running;
}

/* 隐藏原生音频元素 */
.hidden-audio {
  display: none;
}

/* 自定义控制按钮 */
.audio-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 0 10px;
  margin-top: 10px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

html:not(.dark) .control-btn {
  background: rgba(107, 114, 128, 0.2);
  color: white;
}

html.dark .control-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
}

.progress-container {
  flex-grow: 1;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time {
  font-size: 12px;
  color: #333;
  min-width: 36px;
  text-align: center;
}

.progress-bar {
  flex-grow: 1;
  height: 4px;
  background: rgba(200, 200, 200, 0.5);
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
}

.progress {
  height: 100%;
  background: #333;
  border-radius: 2px;
  transition: width 0.1s linear;
}

html.dark .progress-bar {
  background: rgba(255, 255, 255, 0.2);
}

html.dark .progress {
  background: white;
}

html.dark .time {
  color: white;
}

/* 暗黑模式下的模态框样式 */
html.dark .media-preview-content {
  background: #2d2d2d;
  border: 1px solid #454545;
}

html.dark .modal-header {
  border-bottom: 1px solid #454545;
}

html.dark .modal-header h3 {
  color: #ffffff;
}

html.dark .close-button {
  color: #ffffff;
}

html.dark .close-button:hover {
  background-color: #3d3d3d;
}

/* Dark mode pagination styles */
html.dark .pagination button {
  background: #4b5563;
  border-color: #6b7280;
  color: white;
}

html.dark .pagination button:hover:not(:disabled) {
  background: #374151;
}

html.dark .page-input {
  background: #4b5563;
  border-color: #6b7280;
  color: white;
}
</style>
