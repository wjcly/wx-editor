<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import WechatMaterialLibrary from '@/components/CodemirrorEditor/WechatMaterialLibrary.vue'
import { Button } from '@/components/ui/button'
import { toast } from '@/composables/useToast'
import { WechatPostService } from '@/utils/wechatPostService'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits([`close`, `insertMaterial`, `refreshMaterials`])

// 当前素材类型
const currentType = ref<`image` | `voice` | `video`>(`image`)
// 素材库组件引用
const materialLibraryRef = ref()

// Tooltip相关
const tooltipTimeout = ref<NodeJS.Timeout | null>(null)

// 使用计算属性来处理双向绑定
const dialogOpen = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      emit(`close`)
    }
  },
})

// 上传素材文件
async function handleUploadFile(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0)
    return

  const file = files[0]

  // 验证文件是否符合要求
  if (!validateFile(file)) {
    return
  }

  // 根据当前选择的类型确定素材类型
  const materialType: `image` | `voice` | `video` = currentType.value

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

    // 上传素材
    await WechatPostService.uploadMaterial(
      accessToken,
      file,
      materialType,
      config.proxyOrigin,
    )

    toast.success(`素材上传成功`)

    // 更新当前类型为上传的类型以显示新上传的素材
    currentType.value = materialType

    // 重新加载当前类型的素材
    // 等待DOM更新后刷新素材列表
    await nextTick()

    // 等待DOM更新后调用子组件的刷新方法
    await nextTick()
    if (materialLibraryRef.value && materialLibraryRef.value.refreshMaterials && typeof materialLibraryRef.value.refreshMaterials === `function`) {
      materialLibraryRef.value.refreshMaterials(materialType, 0)
    }
  }
  catch (error: any) {
    console.error(`上传素材失败:`, error)
    toast.error(error.message || `上传素材失败`)
  }
  finally {
    // 重置文件输入框，以便可以再次选择同一个文件
    target.value = ``
  }
}

// 验证文件是否符合要求
function validateFile(file: File): boolean {
  // 声明变量用于不同的验证
  let extensions: string[], fileName: string, fileSize: number

  // 根据当前类型验证文件
  switch (currentType.value) {
    case `image`:
      // 检查文件大小
      fileSize = file.size
      if (fileSize > 10 * 1024 * 1024) { // 10MB
        toast.error(`图片文件大小不能超过10MB`)
        return false
      }

      // 检查文件扩展名
      extensions = [`.bmp`, `.png`, `.jpeg`, `.jpg`, `.gif`]
      fileName = file.name.toLowerCase()
      if (!extensions.some(ext => fileName.endsWith(ext))) {
        toast.error(`图片格式必须为bmp/png/jpeg/jpg/gif`)
        return false
      }
      break

    case `voice`:
      // 检查文件大小
      fileSize = file.size
      if (fileSize > 2 * 1024 * 1024) { // 2MB
        toast.error(`音频文件大小不能超过2MB`)
        return false
      }

      // 检查文件扩展名
      extensions = [`.mp3`, `.wma`, `.wav`, `.amr`]
      fileName = file.name.toLowerCase()
      if (!extensions.some(ext => fileName.endsWith(ext))) {
        toast.error(`音频格式必须为mp3/wma/wav/amr`)
        return false
      }
      break

    case `video`:
      // 检查文件大小
      fileSize = file.size
      if (fileSize > 10 * 1024 * 1024) { // 10MB
        toast.error(`视频文件大小不能超过10MB`)
        return false
      }

      // 检查文件扩展名
      extensions = [`.mp4`]
      fileName = file.name.toLowerCase()
      if (!extensions.some(ext => fileName.endsWith(ext))) {
        toast.error(`视频格式必须为MP4`)
        return false
      }
      break
  }

  return true
}

// 处理插入单个素材事件
function handleInsertMaterial(material: any) {
  // 发送选中的素材给父组件
  emit(`insertMaterial`, {
    materials: [material],
  })
  // 插入后通过设置计算属性来关闭对话框
  dialogOpen.value = false
}

// 显示上传要求tooltip
function showUploadTooltip(event: MouseEvent) {
  // 清除之前的定时器
  if (tooltipTimeout.value) {
    clearTimeout(tooltipTimeout.value)
  }

  // 延迟显示tooltip，避免鼠标快速划过时闪烁
  tooltipTimeout.value = setTimeout(() => {
    // 根据当前类型获取要求文本
    let text = ``
    switch (currentType.value) {
      case `image`:
        text = `图片上传要求：\\n• 大小：不超过10MB\\n• 格式：bmp/png/jpeg/jpg/gif`
        break
      case `voice`:
        text = `音频上传要求：\\n• 大小：不超过2MB\\n• 时长：不超过60秒\\n• 格式：mp3/wma/wav/amr`
        break
      case `video`:
        text = `视频上传要求：\\n• 大小：不超过10MB\\n• 格式：MP4`
        break
      default:
        text = `素材上传要求请根据类型查看对应说明`
    }

    // 创建tooltip元素
    const tooltip = document.createElement(`div`)
    tooltip.id = `upload-requirements-tooltip`
    tooltip.className = `fixed z-[10000] p-3 rounded-md text-sm max-w-[300px] break-words whitespace-pre-line pointer-events-none border`
    tooltip.textContent = text

    // 使用Tailwind的暗黑主题类，背景色与编辑器暗黑主题匹配
    tooltip.classList.add(`bg-black/80`, `text-white`, `border-black/10`, `dark:bg-[#1e1e1e]`, `dark:text-white`, `dark:border-[#454545]`)

    // 获取鼠标位置
    const mouseX = event.clientX || 0
    const mouseY = event.clientY || 0

    // 设置tooltip位置
    tooltip.style.left = `${mouseX + 10}px`
    tooltip.style.top = `${mouseY + 10}px`

    document.body.appendChild(tooltip)
  }, 300)
}

// 隐藏上传要求tooltip
function hideUploadTooltip() {
  // 清除显示定时器
  if (tooltipTimeout.value) {
    clearTimeout(tooltipTimeout.value)
    tooltipTimeout.value = null
  }

  // 移除tooltip元素
  const tooltip = document.getElementById(`upload-requirements-tooltip`)
  if (tooltip) {
    document.body.removeChild(tooltip)
  }
}
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="h-[700px] max-w-6xl w-[1080px] flex flex-col">
      <DialogHeader>
        <DialogTitle>微信公众号素材库</DialogTitle>
      </DialogHeader>

      <div class="h-full flex flex-col">
        <div class="mb-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :class="{ 'bg-primary text-primary-foreground': currentType === 'image' }"
            @click="currentType = 'image'"
          >
            图片
          </Button>
          <Button
            variant="outline"
            size="sm"
            :class="{ 'bg-primary text-primary-foreground': currentType === 'voice' }"
            @click="currentType = 'voice'"
          >
            音频
          </Button>
          <Button
            variant="outline"
            size="sm"
            :class="{ 'bg-primary text-primary-foreground': currentType === 'video' }"
            @click="currentType = 'video'"
          >
            视频
          </Button>
          <div class="flex-1" />
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" class="relative">
              上传
              <input
                type="file"
                class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                :accept="{
                  image: 'image/bmp,image/png,image/jpeg,image/jpg,image/gif,.bmp,.png,.jpeg,.jpg,.gif',
                  voice: 'audio/mp3,audio/wma,audio/wav,audio/amr,.mp3,.wma,.wav,.amr',
                  video: 'video/mp4,.mp4',
                }[currentType] || '*/*'"
                @change="handleUploadFile"
              >
            </Button>
            <div
              class="text-muted-foreground hover:text-foreground cursor-help text-xs transition-colors"
              @mouseenter="showUploadTooltip($event)"
              @mouseleave="hideUploadTooltip"
            >
              ?
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-hidden">
          <WechatMaterialLibrary
            v-if="dialogOpen"
            ref="materialLibraryRef"
            :current-type="currentType"
            @insert-material="handleInsertMaterial"
          />
        </div>
      </div>

      <DialogFooter />
    </DialogContent>
  </Dialog>
</template>
