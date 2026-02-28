<script setup lang="ts">
import { ref } from 'vue'
import wx3Image from '@/assets/images/wx-3.png'
import wx4Image from '@/assets/images/wx-4.png'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

// 控制全屏二维码对话框
const fullScreenQRVisible = ref(false)
const currentQRImage = ref('')

function onUpdate(val: boolean) {
  if (!val) {
    emit('close')
  }
}

function showFullQRCode() {
  currentQRImage.value = wx4Image
  fullScreenQRVisible.value = true
}

function closeFullScreenQR() {
  fullScreenQRVisible.value = false
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent class="max-h-[90vh] max-w-md overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-center">
          联系作者
        </DialogTitle>
      </DialogHeader>
      <div class="py-4">
        <div class="space-y-4">
          <div class="bg-background flex items-center rounded-lg p-3">
            <div class="mr-3 text-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p class="font-medium">
                微信
              </p>
              <p class="text-sm text-gray-600">
                IU--666
              </p>
            </div>
            <div class="ml-auto">
              <img :src="wx3Image" alt="微信二维码" class="object-cover h-14 w-14 cursor-pointer border border-gray-300 rounded" @click="showFullQRCode()">
            </div>
          </div>

          <div class="bg-background flex items-center rounded-lg p-3">
            <div class="mr-3 text-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="font-medium">
                邮箱
              </p>
              <p class="text-sm text-gray-600">
                wjc15138891405@163.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- 全屏二维码对话框 -->
  <Dialog :open="fullScreenQRVisible" @update:open="closeFullScreenQR">
    <DialogContent class="max-w-lg flex items-center justify-center p-6">
      <div class="relative" tabindex="0">
        <img :src="currentQRImage" alt="全屏二维码" class="object-contain h-64 w-64">
      </div>
    </DialogContent>
  </Dialog>
</template>
