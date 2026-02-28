<script setup lang="ts">
import alipayImage from '@/assets/images/alipay.png'
import wxpayImage from '@/assets/images/wxpay.png'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

function onUpdate(val: boolean) {
  if (!val) {
    emit('close')
  }
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="text-center" tabindex="0">
          捐赠支持
        </DialogTitle>
      </DialogHeader>
      <div class="py-4 text-center">
        <p class="mb-4 text-gray-600">
          感谢您对本项目的认可与支持！
        </p>

        <div class="mb-6">
          <h3 class="mb-3 font-medium">
            支付宝
          </h3>
          <div class="bg-background relative mx-auto h-48 w-48 overflow-hidden border-2 border-gray-300 rounded-lg border-dashed p-6">
            <img :src="alipayImage" alt="支付宝二维码" class="object-cover absolute inset-0 h-full w-full">
          </div>
        </div>

        <div>
          <h3 class="mb-3 font-medium">
            微信
          </h3>
          <div class="bg-background relative mx-auto h-48 w-48 overflow-hidden border-2 border-gray-300 rounded-lg border-dashed p-6">
            <img :src="wxpayImage" alt="微信支付二维码" class="object-cover absolute inset-0 h-full w-full">
          </div>
        </div>

        <p class="mt-6 text-sm text-gray-500">
          您的支持是我持续维护和改进的动力！
        </p>
      </div>
    </DialogContent>
  </Dialog>
</template>
