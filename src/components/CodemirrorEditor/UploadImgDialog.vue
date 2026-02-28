<script setup lang="ts">
import { ImageIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WechatPostService } from '@/utils/wechatPostService'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'uploadImage': [url: string]
}>()

const showDialog = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const fileInputRef = ref<HTMLInputElement>()

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    for (const file of Array.from(target.files)) {
      if (file.type.startsWith('image/')) {
        await uploadImage(file)
      }
    }
  }
}

async function handleDrop(event: DragEvent) {
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    for (const file of Array.from(event.dataTransfer.files)) {
      if (file.type.startsWith('image/')) {
        await uploadImage(file)
      }
    }
  }
}

async function uploadImage(file: File) {
  try {
    // 获取微信访问令牌
    const config = JSON.parse(localStorage.getItem('wxProxyConfig') || '{}')
    console.log(config)
    // 尝试多种可能的属性名称
    const appID = config.appID || config.appid || config.APPID || config.app_id
    const appSecret = config.appSecret || config.appsecret || config.APPSECRET || config.app_secret

    if (!appID || !appSecret) {
      toast.error('请先配置微信公众号信息')
      return
    }

    const accessToken = await WechatPostService.getAccessToken(appID, appSecret, config.proxyOrigin)

    if (!accessToken) {
      toast.error('获取微信访问令牌失败')
      return
    }

    // 调用微信图片上传接口
    const imageUrl = await WechatPostService.uploadImageNoLimit(accessToken, file, config.proxyOrigin)

    // 发射上传成功的URL
    emit('uploadImage', imageUrl)

    toast.success('图片上传成功')

    // 自动关闭对话框，因为图片已插入编辑器
    setTimeout(() => {
      showDialog.value = false
    }, 1000)
  }
  catch (error: any) {
    console.error('上传图片失败:', error)
    toast.error(error.message || '图片上传失败')
  }
}
</script>

<template>
  <Dialog v-model:open="showDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>上传图片</DialogTitle>
      </DialogHeader>

      <div class="py-4">
        <div
          class="cursor-pointer border-2 border-gray-300 rounded-lg border-dashed p-6 text-center transition-colors hover:border-blue-500"
          @dragover.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <div class="flex flex-col items-center justify-center">
            <ImageIcon class="mb-2 h-12 w-12 text-gray-400" />
            <p class="text-sm text-gray-600">
              点击选择文件或拖拽图片到此处
            </p>
            <p class="mt-1 text-xs text-gray-400">
              支持 JPG、PNG、GIF 等常见图片格式
            </p>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          >
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
