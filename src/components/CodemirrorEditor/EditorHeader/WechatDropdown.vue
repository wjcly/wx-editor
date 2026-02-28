<script setup lang="ts">
import { Image, MessageCircle, Settings } from 'lucide-vue-next'
import { ref } from 'vue'
import WechatConfigDialog from '@/components/CodemirrorEditor/EditorHeader/WechatConfigDialog.vue'
import WechatMaterialLibraryDialog from '@/components/CodemirrorEditor/WechatMaterialLibraryDialog.vue'

const wechatConfigDialogVisible = ref(false)
const wechatMaterialLibraryDialogVisible = ref(false)

// 处理插入素材事件
function handleInsertMaterial(data: { materials: any[] }) {
  // 处理多个素材的插入
  if (data.materials && data.materials.length > 0) {
    // 为每个选中的素材生成内容，目前只处理图片类型
    const contents = data.materials.map((material) => {
      console.log(material.type)
      if (material.type === `image`) {
        // 使用 wsrv.nl 代理服务，避免跨域问题
        const imageUrl = material.url || material.thumb_url
        const proxyUrl = `https://wsrv.nl?url=${encodeURIComponent(imageUrl)}`
        return `![${material.name || `微信图片`}](${proxyUrl})`
      }
      // 其他类型的素材暂不处理
      return ``
    }).filter(content => content !== ``).join(`\\n`) // 过滤空内容并用换行符连接

    console.log(`插入素材到编辑器:`, data.materials)

    // 发送自定义事件，让父组件处理
    document.dispatchEvent(new CustomEvent(`insert-wechat-material`, {
      detail: { content: contents, materials: data.materials },
    }))
  }
}
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      <MessageCircle class="mr-2 size-4" />
      微信公众号
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="wechatConfigDialogVisible = true">
        <Settings class="mr-2 h-4 w-4" />
        <span>配置</span>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="wechatMaterialLibraryDialogVisible = true">
        <Image class="mr-2 h-4 w-4" />
        <span>素材库</span>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>

  <WechatConfigDialog
    :visible="wechatConfigDialogVisible"
    @close="wechatConfigDialogVisible = false"
  />
  <WechatMaterialLibraryDialog
    :visible="wechatMaterialLibraryDialogVisible"
    @close="wechatMaterialLibraryDialogVisible = false"
    @insert-material="handleInsertMaterial"
  />
</template>
