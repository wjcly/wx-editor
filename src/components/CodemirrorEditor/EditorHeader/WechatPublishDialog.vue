<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import WechatMaterialLibraryDialog from '@/components/CodemirrorEditor/WechatMaterialLibraryDialog.vue'
import { toast } from '@/composables/useToast'
import { useStore } from '@/stores'
import type { WechatDraft, WechatDraftForm } from '@/types/post'
import { WechatPostService } from '@/utils/wechatPostService'

const props = defineProps<{
  open: boolean
  isEditMode?: boolean // 是否为编辑模式
  draftData?: WechatDraft // 草稿数据（编辑模式下使用）
}>()
const emit = defineEmits([`close`, `updateSuccess`])
const store = useStore()
const { output, editor } = storeToRefs(store)

const dialogVisible = computed({
  get: () => props.open,
  set: value => emit(`close`, value),
})

// 表单数据
const form = ref<WechatDraftForm>({
  title: ``,
  author: ``,
  digest: ``,
  content: ``,
  thumbMediaId: ``, // 封面图片media_id
  needOpenComment: true, // 是否打开评论（默认打开）
  onlyFansCanComment: false, // 是否粉丝才可评论
})

// Material library dialog state
const materialLibraryDialogVisible = ref(false)

// 加载状态
const loading = ref(false)
const isSavingDraft = ref(false) // 是否正在保存草稿
const isPublishing = ref(false) // 是否正在发布

// 获取文章内容
async function loadPostContent() {
  try {
    // 优先从全局变量获取微信草稿数据（如果存在）
    if ((window as any).currentWechatDraft) {
      const draft = (window as any).currentWechatDraft
      // 从草稿数据中提取信息
      form.value.title = draft.title || ``
      form.value.author = draft.author || ``
      form.value.digest = draft.digest || ``
      // 保持原始内容格式（在微信环境中可能已经是HTML格式）
      form.value.content = draft.content || ``
      form.value.thumbMediaId = draft.thumbMediaId || ``
      form.value.needOpenComment = draft.needOpenComment !== undefined ? draft.needOpenComment : true
      form.value.onlyFansCanComment = draft.onlyFansCanComment !== undefined ? draft.onlyFansCanComment : false
      return
    }

    // 提取标题（最大的标题）
    const titleElement = document.querySelector(`#output h1, #output h2, #output h3`)
    if (titleElement) {
      form.value.title = titleElement.textContent || ``
    }

    // 如果没有找到标题元素，尝试从编辑器中提取
    if (!form.value.title && editor.value) {
      const editorContent = editor.value.getValue()
      // 匹配Markdown标题（# 开头的行）- 修复正则表达式避免回溯问题
      const lines = editorContent.split(`\n`)
      let titleMatch = null
      for (const line of lines) {
        if (line.startsWith(`# `)) {
          titleMatch = [line, line.substring(2)]
          break
        }
      }
      if (titleMatch) {
        form.value.title = titleMatch[1]
      }
    }

    // 设置内容 - 使用渲染后的HTML内容（对于非微信草稿），保留微信草稿的原始内容
    form.value.content = output.value
  }
  catch (err) {
    console.error(`加载文章内容失败:`, err)
  }
}

// 保存草稿
async function saveDraft() {
  if (loading.value)
    return

  // 检查必填项（标题）
  if (!form.value.title.trim()) {
    toast.error(`标题不能为空`)
    return
  }

  // 检查必填项（文章封面）
  if (!form.value.thumbMediaId) {
    toast.error(`文章封面不能为空`)
    return
  }

  loading.value = true
  isSavingDraft.value = true
  let saveSuccess = false

  try {
    // 检查全局变量中是否有微信草稿数据，如果有则更新草稿
    if ((window as any).currentWechatDraft && (window as any).currentWechatDraft.mediaId) {
      const draft = (window as any).currentWechatDraft
      // 检查内容中是否包含Mermaid图表
      let updatedContent = form.value.content
      const { hasMermaidContent } = await import(`@/utils/mermaidRenderer`)

      if (hasMermaidContent(form.value.content)) {
        toast.info(`检测到Mermaid图表，正在渲染为图片...`)
        // 获取微信配置和access_token
        const { getWechatConfig } = await import(`@/utils/wechatConfig`)
        const config = getWechatConfig()
        if (!config) {
          toast.error(`请先配置微信公众号参数`)
          loading.value = false
          isSavingDraft.value = false
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
          loading.value = false
          isSavingDraft.value = false
          return
        }

        // 使用Mermaid渲染器将Mermaid图表转换为图片
        const { replaceMermaidWithImages } = await import(`@/utils/mermaidRenderer`)
        updatedContent = await replaceMermaidWithImages(form.value.content, accessToken, config.proxyOrigin)

        // 清理编辑器产生的多余HTML结构，如空列表项和额外包装元素
        const { cleanEditorHtml } = await import(`@/utils/htmlCleaner`)
        updatedContent = cleanEditorHtml(updatedContent)
      }

      // 更新草稿
      const article = {
        title: form.value.title,
        author: form.value.author,
        digest: form.value.digest,
        content: updatedContent, // 使用处理后的包含图片的内容
        thumbMediaId: form.value.thumbMediaId,
        needOpenComment: form.value.needOpenComment,
        onlyFansCanComment: form.value.onlyFansCanComment,
      }

      const result = await store.updateWechatDraft(draft.mediaId, article)
      if (result.errcode === 0) {
        saveSuccess = true
        // 清空表单内容
        form.value = {
          title: ``,
          author: ``,
          digest: ``,
          content: ``,
          thumbMediaId: ``,
          needOpenComment: true,
          onlyFansCanComment: false,
        }
        // 关闭弹窗
        dialogVisible.value = false
        // 触发更新成功事件
        emit(`updateSuccess`)
        // 刷新微信草稿数据
        refreshWechatDrafts(`update`)
      }
      loading.value = false
      isSavingDraft.value = false
      return
    }

    // 获取微信配置
    const { getWechatConfig } = await import(`@/utils/wechatConfig`)
    const config = getWechatConfig()
    if (!config) {
      toast.error(`请先配置微信公众号参数`)
      loading.value = false
      isSavingDraft.value = false
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
      loading.value = false
      isSavingDraft.value = false
      return
    }

    // 检查内容中是否包含Mermaid图表
    let updatedContent = form.value.content
    const { hasMermaidContent } = await import(`@/utils/mermaidRenderer`)

    if (hasMermaidContent(form.value.content)) {
      // 使用Mermaid渲染器将Mermaid图表转换为图片
      const { replaceMermaidWithImages } = await import(`@/utils/mermaidRenderer`)
      updatedContent = await replaceMermaidWithImages(form.value.content, accessToken, config.proxyOrigin)
    }

    // 清理编辑器产生的多余HTML结构，如空列表项和额外包装元素
    const { cleanEditorHtml } = await import(`@/utils/htmlCleaner`)
    updatedContent = cleanEditorHtml(updatedContent)

    // 保存为草稿（使用处理后的内容）
    const result = await WechatPostService.saveDraft(accessToken, { ...form.value, content: updatedContent }, config.proxyOrigin)
    if (result.media_id) {
      saveSuccess = true
      // 保存草稿ID到localStorage
      const drafts = JSON.parse(localStorage.getItem(`wechatDrafts`) || `[]`)
      drafts.push({
        media_id: result.media_id,
        title: form.value.title,
        createTime: new Date().toISOString(),
      })
      localStorage.setItem(`wechatDrafts`, JSON.stringify(drafts))

      // 清空表单内容
      form.value = {
        title: ``,
        author: ``,
        digest: ``,
        content: ``,
        thumbMediaId: ``,
        needOpenComment: true,
        onlyFansCanComment: false,
      }

      // 关闭弹窗
      dialogVisible.value = false
    }
    else {
      // 不再抛出异常，直接通过toast提示错误
      const errorMsg = result.errmsg || `保存草稿失败`
      const errorCode = result.errcode || `未知错误码`
      console.error(`保存草稿失败:`, errorCode, errorMsg)
      toast.error(`保存草稿失败 (${errorCode})`)
    }
  }
  catch (err: any) {
    // 只记录错误日志，不通过toast重复提示
    console.error(`保存失败:`, err)
  }
  finally {
    loading.value = false
    isSavingDraft.value = false
    // 显示统一的成功提示
    if (saveSuccess) {
      refreshWechatDrafts(`save`)
    }
  }
}

// 发布文章
async function saveAndPublish() {
  if (loading.value)
    return

  // 检查必填项（标题）
  if (!form.value.title.trim()) {
    toast.error(`标题不能为空`)
    return
  }

  // 检查必填项（文章封面）
  if (!form.value.thumbMediaId) {
    toast.error(`文章封面不能为空`)
    return
  }

  loading.value = true
  isPublishing.value = true

  try {
    // 获取微信配置
    const { getWechatConfig } = await import(`@/utils/wechatConfig`)
    const config = getWechatConfig()
    if (!config) {
      toast.error(`请先配置微信公众号参数`)
      loading.value = false
      isPublishing.value = false
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
      loading.value = false
      isPublishing.value = false
      return
    }

    // 检查内容中是否包含Mermaid图表
    let updatedContent = form.value.content
    const { hasMermaidContent } = await import(`@/utils/mermaidRenderer`)

    if (hasMermaidContent(form.value.content)) {
      toast.info(`检测到Mermaid图表，正在渲染为图片...`)
      // 使用Mermaid渲染器将Mermaid图表转换为图片
      const { replaceMermaidWithImages } = await import(`@/utils/mermaidRenderer`)
      updatedContent = await replaceMermaidWithImages(form.value.content, accessToken, config.proxyOrigin)
    }

    // 清理编辑器产生的多余HTML结构，如空列表项和额外包装元素
    const { cleanEditorHtml } = await import(`@/utils/htmlCleaner`)
    updatedContent = cleanEditorHtml(updatedContent)

    // 保存为草稿（使用处理后的内容）
    const draftResult = await WechatPostService.saveDraft(accessToken, { ...form.value, content: updatedContent }, config.proxyOrigin)
    if (draftResult.media_id) {
      // 发布草稿
      const publishResult = await WechatPostService.publishDraft(accessToken, draftResult.media_id, config.proxyOrigin)
      if (publishResult.errcode === 0) {
        // 使用toast提示发布成功
        toast.success(`文章发布成功！`)

        // 清空表单内容
        form.value = {
          title: ``,
          author: ``,
          digest: ``,
          content: ``,
          thumbMediaId: ``,
          needOpenComment: true,
          onlyFansCanComment: false,
        }

        // 关闭弹窗
        dialogVisible.value = false
      }
      else {
        const errorCode = publishResult.errcode || `未知错误码`

        // 针对未认证公众号的友好提示
        if (errorCode === 48001) {
          toast.error(`发布文章失败：当前公众号未认证，无法使用发布功能。请使用已认证的公众号或手动发布。`)
        }
        else {
          // 对于其他错误，不显示默认的错误信息，只显示错误码
          toast.error(`发布文章失败 (${errorCode})`)
        }
      }
    }
    else {
      // 不再抛出异常，直接通过toast提示错误
      const errorMsg = draftResult.errmsg || `保存草稿失败`
      const errorCode = draftResult.errcode || `未知错误码`
      console.error(`保存草稿失败:`, errorCode, errorMsg)
      toast.error(`保存草稿失败 (${errorCode})`)
    }
  }
  catch (err: any) {
    // 只记录错误日志，不通过toast重复提示
    console.error(`发布失败:`, err)
  }
  finally {
    loading.value = false
    isPublishing.value = false
  }
}

onMounted(() => {
  if (props.open) {
    loadPostContent()
  }
})

// 监听对话框打开状态
watch(() => props.open, (newVal) => {
  if (newVal) {
    // 使用nextTick确保DOM更新后再加载内容
    nextTick(() => {
      loadPostContent()
    })
  }
})

// 打开素材库对话框选择封面图片
function showMaterialLibraryDialog() {
  materialLibraryDialogVisible.value = true
}

// 处理从素材库选择的图片
function handleMaterialSelection(data: { materials: any[] }) {
  if (data.materials && data.materials.length > 0) {
    const selectedMaterial = data.materials[0]
    if (selectedMaterial) {
      form.value.thumbMediaId = selectedMaterial.media_id
      toast.success(`已选择封面图片`)
    }
  }
}

// 刷新微信草稿数据
async function refreshWechatDrafts(operation: `update` | `save` = `update`) {
  try {
    // 获取微信配置
    const { getWechatConfig } = await import(`@/utils/wechatConfig`)
    const config = getWechatConfig()
    if (!config) {
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
      return
    }

    // 如果有当前草稿，先获取最新的草稿详情
    const currentDraft = (window as any).currentWechatDraft
    if (currentDraft && currentDraft.mediaId) {
      try {
        // 获取最新的草稿详情
        const draftDetail = await WechatPostService.getDraft(accessToken, currentDraft.mediaId, config.proxyOrigin)
        if (draftDetail && draftDetail.news_item && draftDetail.news_item.length > 0) {
          const newsItem = draftDetail.news_item[0]
          // 更新全局变量中的草稿信息
          const updatedDraft = {
            ...currentDraft,
            title: newsItem.title || currentDraft.title,
            author: newsItem.author || currentDraft.author,
            digest: newsItem.digest || currentDraft.digest,
            content: newsItem.content || currentDraft.content,
            thumbMediaId: newsItem.thumb_media_id || currentDraft.thumbMediaId,
            needOpenComment: newsItem.need_open_comment !== undefined ? newsItem.need_open_comment === 1 : currentDraft.needOpenComment,
            onlyFansCanComment: newsItem.only_fans_can_comment !== undefined ? newsItem.only_fans_can_comment === 1 : currentDraft.onlyFansCanComment,
          }
          ;(window as any).currentWechatDraft = updatedDraft

          // 更新当前显示的文章内容
          await store.setWechatDraftContent(updatedDraft)
        }
      }
      catch (detailErr) {
        console.error(`获取最新草稿详情失败:`, detailErr)
      }
    }

    // 获取当前页面的草稿列表
    // 由于模块循环引用问题，采用事件方式通知刷新
    document.dispatchEvent(new CustomEvent(`refresh-wechat-drafts`))

    // 显示对应的操作成功提示
    if (operation === `update`) {
      toast.success(`草稿更新成功！`)
    }
    else if (operation === `save`) {
      toast.success(`草稿保存成功！`)
    }
  }
  catch (error) {
    console.error(`刷新微信草稿数据失败:`, error)
  }
}
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent class="max-w-2xl w-[600px]">
      <DialogHeader>
        <DialogTitle>微信公众号发布</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="title">
            <span class="mr-1 text-red-500">*</span>文章标题
          </Label>
          <Input id="title" v-model="form.title" placeholder="请输入文章标题" />
        </div>

        <div class="space-y-2">
          <Label for="author">文章作者</Label>
          <Input id="author" v-model="form.author" placeholder="请输入作者名" />
        </div>

        <div class="space-y-2">
          <Label for="digest">文章摘要</Label>
          <Textarea id="digest" v-model="form.digest" placeholder="请输入文章摘要" rows="3" />
        </div>

        <div class="space-y-2">
          <Label for="thumb">
            <span class="mr-1 text-red-500">*</span>文章封面
          </Label>
          <div class="flex items-center gap-2">
            <Input id="thumb" v-model="form.thumbMediaId" placeholder="请选择封面图片" readonly class="flex-1" />
            <Button variant="outline" @click="showMaterialLibraryDialog">
              选择素材
            </Button>
          </div>
          <p class="text-muted-foreground text-sm">
            注：未认证公众号无法发布文章，仅可保存草稿
          </p>
        </div>

        <div class="space-y-2">
          <Label>评论设置</Label>
          <div class="flex items-center gap-6">
            <label class="flex items-center">
              <input
                v-model="form.needOpenComment"
                type="checkbox"
                class="mr-2"
              >
              打开评论
            </label>

            <div v-if="form.needOpenComment" class="flex items-center gap-4">
              <label class="flex items-center">
                <input
                  v-model="form.onlyFansCanComment"
                  type="radio"
                  :value="false"
                  class="mr-2"
                >
                所有人可评论
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.onlyFansCanComment"
                  type="radio"
                  :value="true"
                  class="mr-2"
                >
                粉丝才可评论
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 微信素材库对话框 -->
      <WechatMaterialLibraryDialog
        :visible="materialLibraryDialogVisible"
        @close="materialLibraryDialogVisible = false"
        @insert-material="handleMaterialSelection"
      />

      <DialogFooter>
        <Button variant="outline" :disabled="loading" @click="dialogVisible = false">
          取消
        </Button>
        <Button :disabled="loading || isPublishing" :class="{ 'opacity-50': loading || isPublishing }" @click="saveDraft">
          <span v-if="loading && !isPublishing">处理中...</span>
          <span v-else>保存草稿</span>
        </Button>
        <Button :disabled="loading || isSavingDraft" :class="{ 'opacity-50': loading || isSavingDraft }" title="未认证公众号无法发布文章" @click="saveAndPublish">
          <span v-if="loading && isPublishing">处理中...</span>
          <span v-else>发布文章</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
