<script setup lang="ts">
import WechatPublishDialog from '@/components/CodemirrorEditor/EditorHeader/WechatPublishDialog.vue'
import { toast } from '@/composables/useToast'
import { useStore } from '@/stores'
import { PostGroup } from '@/types/post'

const store = useStore()
const wechatPublishDialogVisible = ref(false)

async function prePost() {
  // 检查当前是否是微信草稿预览模式
  const currentPost = computed(() => store._currentPost)
  if (currentPost.value && currentPost.value.group === PostGroup.WECHAT) {
    // 如果是微信草稿预览模式，以编辑模式打开对话框
    wechatPublishDialogVisible.value = true
    return
  }

  // 检查是否配置了微信公众号
  const { getWechatConfig } = await import(`@/utils/wechatConfig`)
  const config = getWechatConfig()
  if (config) {
    // 显示微信发布对话框
    wechatPublishDialogVisible.value = true
    return
  }

  // 如果没有配置微信公众号，使用toast提示用户先配置
  toast.error(`请先在设置中配置微信公众号参数`)
}
</script>

<template>
  <Button variant="outline" @click="prePost">
    发布
  </Button>

  <!-- 微信发布对话框 -->
  <WechatPublishDialog
    v-model:open="wechatPublishDialogVisible"
    @close="wechatPublishDialogVisible = false"
  />
</template>
