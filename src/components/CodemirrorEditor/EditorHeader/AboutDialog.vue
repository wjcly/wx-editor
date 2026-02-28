<script setup lang="ts">
import { ref } from 'vue'
import wx3Image from '@/assets/images/wx-3.png'
import ContactAuthorDialog from '@/components/CodemirrorEditor/EditorHeader/ContactAuthorDialog.vue'
import DonationDialog from '@/components/CodemirrorEditor/EditorHeader/DonationDialog.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

// 控制子对话框的显示状态
const contactVisible = ref(false)
const donationVisible = ref(false)

function onUpdate(val: boolean) {
  if (!val) {
    emit('close')
  }
}

function showContactDialog() {
  contactVisible.value = true
}

function showDonationDialog() {
  donationVisible.value = true
}

function closeContactDialog() {
  contactVisible.value = false
}

function closeDonationDialog() {
  donationVisible.value = false
}

// 按钮配置
const buttons = [
  { label: 'GitHub 仓库', action: () => window.open('https://github.com/wjcly/wx-editor', '_blank') },
  { label: '问题反馈', action: () => window.open('https://github.com/wjcly/wx-editor/issues', '_blank') },
  { label: '联系作者', action: showContactDialog },
  { label: '打赏作者', action: showDonationDialog },
]
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-center">
          Markdown 编辑器
        </DialogTitle>
      </DialogHeader>
      <div class="text-center">
        <h3 class="mb-3 text-lg font-semibold">
          一款轻量、专注 Markdown 编辑的编辑器
        </h3>
        <p class="mb-4 text-gray-600">
          本地化配置存储
        </p>
        <img
          class="mx-auto my-6 border border-gray-200 rounded-xl shadow-lg"
          :src="wx3Image"
          alt="Markdown 编辑器"
          style="width: 200px; height: auto;"
        >
        <div class="space-y-2 mt-4">
          <p class="text-sm text-gray-500">
            版本: 1.0.0
          </p>
        </div>
      </div>
      <DialogFooter class="flex flex-col flex-wrap justify-center gap-2 pt-4 sm:flex-row">
        <Button
          v-for="(button, index) in buttons"
          :key="index"
          variant="outline"
          size="sm"
          class="min-w-[120px] flex-1"
          @click="button.action"
        >
          {{ button.label }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 联系作者对话框 -->
  <ContactAuthorDialog :visible="contactVisible" @close="closeContactDialog" />

  <!-- 捐赠打赏对话框 -->
  <DonationDialog :visible="donationVisible" @close="closeDonationDialog" />
</template>
