<script setup lang="ts">
import type { MarkedOptions } from 'marked'
import type { ComponentPublicInstance } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import CodeMirror from 'codemirror'
import { Bot, Download, Image, LayoutTemplate, RotateCcw, Table, Upload } from 'lucide-vue-next'
import { marked } from 'marked'
import { computed, provide, unref } from 'vue'
import AIAssistant from '@/components/CodemirrorEditor/AIAssistant.vue'
import MarkdownTemplateDialog from '@/components/CodemirrorEditor/EditorHeader/MarkdownTemplateDialog.vue'
import RewriteDialog from '@/components/CodemirrorEditor/RewriteDialog.vue'
import SearchPanel from '@/components/CodemirrorEditor/SearchPanel.vue'
import UploadImgDialog from '@/components/CodemirrorEditor/UploadImgDialog.vue'
import { toast } from '@/composables/useToast'
import { altKey, ctrlKey, shiftKey } from '@/config'
import { type AIStreamOptions, streamAIContent } from '@/services/ai'
import { useAIStore, useDisplayStore, useStore } from '@/stores'
import {
  checkImage,
  formatDoc,
  toBase64,
} from '@/utils'
import { WechatPostService } from '@/utils/wechatPostService'
import 'highlight.js/styles/github.css'

const store = useStore()
const displayStore = useDisplayStore()
const aiStore = useAIStore()
const { isDark, output, editor, readingTime } = storeToRefs(store)

const {
  editorRefresh,
  exportEditorContent2HTML,
  exportEditorContent2MD,
  formatContent,
  importMarkdownContent,
  resetStyleConfirm,
} = store

const {
  toggleShowInsertFormDialog,

} = displayStore

// 添加状态
const showRewriteDialog = ref(false)
const showTemplateDialog = ref(false)
const showUploadImgDialog = ref(false)
const showControls = ref(true)
const isShowClearConfirmDialog = ref(false)
const showSearchPanel = ref(false) // 添加搜索面板状态

const isTransitioning = ref(false)
const isEditorFocused = ref(false)
const preview = ref<HTMLDivElement | null>(null)
const tempContent = ref(``) // 添加临时存储变量

// AI Assistant ref
const aiAssistantRef = ref<InstanceType<typeof AIAssistant> | null>(null)

// 用于存储AI助手的引用，以便其他组件可以访问
provide('aiAssistantRef', aiAssistantRef)

// 插入图片URL到编辑器
function insertImageUrl(url: string) {
  if (!store.editor)
    return

  const imageUrl = `![](${url})`

  // 将 Markdown 形式的 URL 插入编辑框光标所在位置
  store.editor.replaceSelection(`\n${imageUrl}\n`, 'end')
}

// 防止重复显示通知的状态
const aiConfigNotificationTimeout = ref<number | null>(null)

// 检查AI配置并打开助手
function checkAIConfigurationAndOpenAssistant() {
  // 检查是否存在AI配置
  if (!aiStore.activeConfiguration || !aiStore.activeConfiguration.apiKey) {
    // 防止重复显示通知
    if (aiConfigNotificationTimeout.value) {
      return
    }

    toast.error('请先配置AI助手')

    // 设置防抖延迟，避免短时间内重复显示
    aiConfigNotificationTimeout.value = setTimeout(() => {
      aiConfigNotificationTimeout.value = null
    }, 2000) as unknown as number

    // 自动打开设置对话框
    aiStore.settingsDialogVisible = true
    return
  }

  // 如果有配置，调用AI助手
  if (aiAssistantRef.value) {
    aiAssistantRef.value.customAIInputWithSelection()
  }
  else {
    toast.error('AI助手未初始化')
  }
}

// 添加选中文本作为引文
function addSelectionAsCitation() {
  // 检查AI配置
  if (!aiStore.activeConfiguration || !aiStore.activeConfiguration.apiKey) {
    // 防止重复显示通知
    if (aiConfigNotificationTimeout.value) {
      return
    }

    toast.error('请先配置AI助手')

    // 设置防抖延迟，避免短时间内重复显示
    aiConfigNotificationTimeout.value = setTimeout(() => {
      aiConfigNotificationTimeout.value = null
    }, 2000) as unknown as number

    // 自动打开设置对话框
    aiStore.settingsDialogVisible = true
    return
  }

  if (!store.editor)
    return

  const selection = store.editor.getSelection()
  if (!selection.trim()) {
    toast.warning('请先选择要引用的文本')
    return
  }

  // 调用AI助手的addCitation方法
  if (aiAssistantRef.value) {
    aiAssistantRef.value.addCitation(selection)
    toast.success('已添加引文')
  }
  else {
    toast.error('AI助手未初始化')
  }
}

// 配置 marked
const options: MarkedOptions = {
  breaks: true,
  gfm: true,
}
marked.setOptions(options)

// 添加滚动检测状态
const isScrolling = ref(false)
let scrollTimer: NodeJS.Timeout
let controlsTimer: NodeJS.Timeout

// 弹窗状态变化监听器
const dialogStateChangeHandler = ((event: CustomEvent) => {
  const { isOpen } = event.detail
  showControls.value = !isOpen
}) as EventListener

// 监听弹窗状态
const aiDialogState = ref(false)

// Watch AI assistant dialog state when it's available
function updateAiDialogState() {
  const assistant = aiAssistantRef.value
  if (assistant && 'showAIInputDialog' in assistant && assistant.showAIInputDialog) {
    aiDialogState.value = unref(assistant.showAIInputDialog)
  }
}

// Watch for changes to the AI assistant ref and its dialog state
watch(() => aiAssistantRef.value, () => {
  updateAiDialogState()
}, { immediate: true })

// Watch AI dialog state with proper null checking
watchEffect(() => {
  const assistant = aiAssistantRef.value
  if (assistant && 'showAIInputDialog' in assistant && assistant.showAIInputDialog) {
    aiDialogState.value = unref(assistant.showAIInputDialog)
  }
})

const combinedDialogState = computed(() => {
  return displayStore.isShowInsertFormDialog
    || displayStore.isShowCssEditor
    || showTemplateDialog.value
    || showRewriteDialog.value
    || showUploadImgDialog.value
    || aiDialogState.value
    || isShowClearConfirmDialog.value
    || aiStore.settingsDialogVisible
})

watch(combinedDialogState, (isDialogOpen) => {
  if (isDialogOpen)
    showControls.value = false
  else
    showControls.value = true
}, { immediate: true })

// 添加性能优化相关的状态
const isPerformingAnimation = ref(false)

// 使用节流处理滚动
const throttledScroll = useThrottleFn(() => {
  if (isPerformingAnimation.value)
    return

  // 执行滚动同步
  scrollCB(`preview`)

  showControls.value = false
  clearTimeout(scrollTimer)
  clearTimeout(controlsTimer)

  scrollTimer = setTimeout(() => {
    isScrolling.value = false

    // 滚动停止2秒后显示控制按钮
    if (!isPerformingAnimation.value) {
      controlsTimer = setTimeout(() => {
        showControls.value = true
      }, 2000)
    }
  }, 150)
}, 100)

// 修改滚动处理函数
function handlePreviewScroll() {
  isScrolling.value = true
  // 只在启用同步滚动时调用
  if (store.isSyncScroll) {
    throttledScroll()
  }
}

// 监听窗口大小变化
onMounted(() => {
  // 监听弹窗状态变化
  document.addEventListener(`dialog-state-change`, dialogStateChangeHandler)

  // 初始化时保存内容
  nextTick(() => {
    if (editor.value) {
      tempContent.value = editor.value.getValue()
    }
  })

  const previewEl = document.getElementById(`preview`)
  if (previewEl) {
    previewEl.addEventListener(`scroll`, handlePreviewScroll)
  }
})

onUnmounted(() => {
  // 移除弹窗状态变化监听
  document.removeEventListener(`dialog-state-change`, dialogStateChangeHandler)

  const previewEl = document.getElementById(`preview`)
  if (previewEl) {
    previewEl.removeEventListener(`scroll`, handlePreviewScroll)
  }
  clearTimeout(scrollTimer)
  clearTimeout(controlsTimer)
})

const isImgLoading = ref(false)
const timeout = ref<NodeJS.Timeout>()
const changeTimer = ref<NodeJS.Timeout>()

function previewScrollCB() {
  if (!store.isSyncScroll)
    return
  scrollCB(`preview`)
}

function editorScrollCB() {
  if (!store.isSyncScroll)
    return
  scrollCB(`editor`)
}

function scrollCB(text: string) {
  if (!store.isSyncScroll)
    return

  let source: HTMLElement
  let target: HTMLElement

  clearTimeout(timeout.value)
  if (text === `preview`) {
    source = preview.value!
    target = document.querySelector<HTMLElement>(`.CodeMirror-scroll`)!

    editor.value!.off(`scroll`, handleScroll)
    timeout.value = setTimeout(() => {
      editor.value!.on(`scroll`, handleScroll)
    }, 300)
  }
  else {
    source = document.querySelector<HTMLElement>(`.CodeMirror-scroll`)!
    target = preview.value!

    target.removeEventListener(`scroll`, previewScrollCB, false)
    timeout.value = setTimeout(() => {
      target.addEventListener(`scroll`, previewScrollCB, false)
    }, 300)
  }

  const percentage = source.scrollTop / (source.scrollHeight - source.offsetHeight)
  const height = percentage * (target.scrollHeight - target.offsetHeight)

  target.scrollTo(0, height)
}

async function handleChange(instance: CodeMirror.Editor, _changeObj: CodeMirror.EditorChange) {
  if (changeTimer.value) {
    clearTimeout(changeTimer.value)
  }

  changeTimer.value = setTimeout(async () => {
    try {
      const content = instance.getValue()
      if (store._currentPost) {
        store._currentPost.content = content

        // 从内容中提取h1作为标题
        const lines = content.split(`\n`)
        // 默认保持原标题

        // 查找第一行的h1标题（# 标题格式）
        for (const line of lines) {
          // 检查是否以 # 开头，并安全地提取标题
          const h1Match = line.startsWith(`# `) ? [`match`, line.slice(2)] : line.startsWith(`#\t`) ? [`match`, line.slice(2)] : null
          if (h1Match) {
            const extractedTitle = h1Match[1].trim()
            // 只有在提取到的标题与当前标题不同时才更新
            if (extractedTitle && store._currentPost && extractedTitle !== store._currentPost.title) {
              const index = store.posts.findIndex(p => store._currentPost && p.id === store._currentPost.id)
              if (index !== -1) {
                store.renamePost(index, extractedTitle)
              }
            }
            break
          }
        }
      }

      // 强制更新预览内容
      await store.editorRefresh()

      // 确保预览区域内容已完全更新
      await nextTick()

      // 触发预览区域的重新渲染
      if (preview.value) {
        const currentScroll = preview.value.scrollTop
        preview.value.style.display = `none`
        void preview.value.offsetHeight // 触发重排
        preview.value.style.display = ``
        preview.value.scrollTop = currentScroll
      }
    }
    catch (error) {
      console.error(`更新预览内容时出错:`, error)
    }
  }, 300)
}

function handlePaste(_cm: CodeMirror.Editor, e: ClipboardEvent) {
  if (!(e.clipboardData && e.clipboardData.items) || isImgLoading.value) {
    return
  }
  for (let i = 0, len = e.clipboardData.items.length; i < len; ++i) {
    const item = e.clipboardData.items[i]
    if (item.kind === `file`) {
      const pasteFile = item.getAsFile()!
      const isValid = beforeUpload(pasteFile)
      if (!isValid) {
        continue
      }
      uploadImage(pasteFile)
    }
  }
}

function handleScroll(_instance: CodeMirror.Editor) {
  isScrolling.value = true
  showControls.value = false

  clearTimeout(scrollTimer)
  clearTimeout(controlsTimer)

  scrollTimer = setTimeout(() => {
    isScrolling.value = false

    // 滚动停止2秒后显示控制按钮
    controlsTimer = setTimeout(() => {
      showControls.value = true
    }, 2000)
  }, 150)

  // 只在启用同步滚动时调用
  if (store.isSyncScroll) {
    editorScrollCB()
  }
}

// 更新编辑器
function onEditorRefresh() {
  editorRefresh()
}

const backLight = ref(false)
const isCoping = ref(false)

function startCopy() {
  isCoping.value = true
  backLight.value = true
}

// 拷贝结束
function endCopy() {
  backLight.value = false
  setTimeout(() => {
    isCoping.value = false
  }, 800)
}

function beforeUpload(file: File) {
  // validate image
  const checkResult = checkImage(file)
  if (!checkResult.ok) {
    toast.error(checkResult.msg!)
    return false
  }

  // 检查是否有图床配置（例如微信配置）
  const wechatConfig = localStorage.getItem('wxProxyConfig')

  // 如果没有配置，则允许上传（使用基础功能）
  // 如果有配置但无效，才提示错误
  if (wechatConfig) {
    try {
      const configObj = JSON.parse(wechatConfig)
      // 尝试多种可能的属性名称
      const appID = configObj.appID || configObj.appid || configObj.APPID || configObj.app_id
      const appSecret = configObj.appSecret || configObj.appsecret || configObj.APPSECRET || configObj.app_secret

      if (!appID || !appSecret) {
        toast.error('微信图床配置不完整，请重新配置')
        return false
      }
    }
    catch { // Using bare catch to avoid unused variable
      toast.error('图床配置格式错误')
      return false
    }
  }
  // 如果没有配置，也可以继续（使用基础功能）
  return true
}

// 图片上传结束
function uploaded(imageUrl: string, callback?: (success: boolean) => void) {
  if (!imageUrl) {
    toast.error(`上传图片未知异常`)
    if (callback)
      callback(false)
    return
  }
  // 上传成功，获取光标
  const cursor = editor.value!.getCursor()
  const markdownImage = `![](${imageUrl})`
  // 将 Markdown 形式的 URL 插入编辑框光标所在位置
  toRaw(store.editor!).replaceSelection(`
${markdownImage}
`, cursor as any)
  // 不再这里显示提示，由 UploadImgDialog.vue 统一处理
  if (callback)
    callback(true)
}
function uploadImage(file: File, callback?: (success: boolean) => void) {
  isImgLoading.value = true

  // Try to upload via WeChat API if config is available, otherwise use base64
  const config = JSON.parse(localStorage.getItem('wxProxyConfig') || '{}')
  // 尝试多种可能的属性名称
  const appID = config.appID || config.appid || config.APPID || config.app_id
  const appSecret = config.appSecret || config.appsecret || config.APPSECRET || config.app_secret

  if (appID && appSecret) {
    // Upload via WeChat API
    WechatPostService.getAccessToken(appID, appSecret, config.proxyOrigin)
      .then((accessToken) => {
        if (!accessToken) {
          throw new Error('获取微信访问令牌失败')
        }
        return WechatPostService.uploadImageNoLimit(accessToken, file, config.proxyOrigin)
      })
      .then((url) => {
        uploaded(url, callback)
      })
      .catch((err) => {
        console.error('上传图片失败:', err)
        toast.error(err.message || '图片上传失败')
        if (callback)
          callback(false)
      })
      .finally(() => {
        isImgLoading.value = false
      })
  }
  else {
    // Fallback to base64 if WeChat config is not available
    toBase64(file)
      .then((base64Content) => {
        // Use base64 content directly as the URL
        return base64Content
      })
      .then((url) => {
        uploaded(url, callback)
      })
      .catch((err) => {
        console.error('转换图片失败:', err)
        toast.error(err.message || '图片处理失败')
        if (callback)
          callback(false)
      })
      .finally(() => {
        isImgLoading.value = false
      })
  }
}

// 监听暗色模式并更新编辑器
watch(isDark, () => {
  const theme = isDark.value ? `darcula` : `xq-light`
  toRaw(editor.value)?.setOption?.(`theme`, theme)
})

// 初始化编辑器
function initEditor() {
  const editorDom = document.querySelector<HTMLTextAreaElement>(`#editor`)
  if (!editorDom) {
    console.warn(`找不到编辑器DOM元素`)
    return
  }

  // 确保清理旧的编辑器实例
  if (editor.value) {
    try {
      // 保存当前内容
      const content = editor.value.getValue()
      if (store._currentPost) {
        store._currentPost.content = content
      }

      // 移除所有事件监听器
      editor.value.off(`change`, handleChange)
      editor.value.off(`paste`, handlePaste)
      editor.value.off(`scroll`, handleScroll)

      // 清理DOM
      const wrapper = editor.value.getWrapperElement()
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper)
      }

      // 清空引用
      editor.value = null
    }
    catch (err) {
      console.error(`清理编辑器失败:`, err)
    }
  }

  // 设置初始内容
  if (!editorDom.value) {
    editorDom.value = store._currentPost ? store._currentPost.content : ``
  }

  // 创建新的编辑器实例
  editor.value = markRaw(CodeMirror.fromTextArea(editorDom, {
    mode: `text/x-markdown`,
    theme: isDark.value ? `darcula` : `xq-light`,
    lineNumbers: false,
    lineWrapping: true,
    styleActiveLine: true,
    autoCloseBrackets: true,
    viewportMargin: Infinity,
    autofocus: true,
    dragDrop: false,
    inputStyle: `contenteditable`,
    spellcheck: false,
    value: store._currentPost ? store._currentPost.content : ``,
    extraKeys: {
      [`${shiftKey}-${altKey}-F`]: function autoFormat(editor) {
        formatDoc(editor.getValue()).then((doc) => {
          editor.setValue(doc)
        })
      },
      [`${ctrlKey}-B`]: function bold(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`**${selected}**`)
      },
      [`${ctrlKey}-I`]: function italic(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`*${selected}*`)
      },
      [`${ctrlKey}-D`]: function del(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`~~${selected}~~`)
      },
      [`${ctrlKey}-K`]: function italic(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`[${selected}]()`)
      },
      [`${ctrlKey}-E`]: function code(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`\`${selected}\``)
      },
      [`${ctrlKey}-F`]: function search() {
        showSearchPanel.value = true
        // 延迟聚焦到搜索输入框
        nextTick(() => {
          const searchInput = document.getElementById('search-input')
          if (searchInput) {
            searchInput.focus()
            if (searchInput instanceof HTMLInputElement || searchInput instanceof HTMLTextAreaElement) {
              searchInput.select()
            }
          }
        })
      },
    },
  }))

  // 确保编辑器已经完全初始化后再添加事件监听
  nextTick(() => {
    if (!editor.value)
      return

    // 添加事件监听器
    editor.value.on(`change`, handleChange)
    editor.value.on(`paste`, handlePaste)
    editor.value.on(`scroll`, handleScroll)
    editor.value.on(`focus`, () => {
      isEditorFocused.value = true
    })
    editor.value.on(`blur`, () => {
      isEditorFocused.value = false
    })

    // 刷新编辑器
    editor.value.refresh()
    editor.value.focus()
  })
}

// 组件卸载时的清理
onBeforeUnmount(() => {
  if (editor.value) {
    try {
      // 保存最后的内容
      const content = editor.value.getValue()
      if (store._currentPost) {
        store._currentPost.content = content
      }

      // 移除所有事件监听器
      editor.value.off(`change`, handleChange)
      editor.value.off(`paste`, handlePaste)
      editor.value.off(`scroll`, handleScroll)
      editor.value.off(`focus`, () => {
        isEditorFocused.value = true
      })
      editor.value.off(`blur`, () => {
        isEditorFocused.value = false
      })

      // 移除同步滚动事件监听器（如果已添加）
      if (preview.value && store.isSyncScroll) {
        preview.value.removeEventListener(`scroll`, previewScrollCB, false)
      }

      // 移除DOM元素
      const wrapper = editor.value.getWrapperElement()
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper)
      }

      // 清空引用
      editor.value = null
    }
    catch (err) {
      console.error(`清理编辑器失败:`, err)
    }
  }

  // 清理定时器
  if (changeTimer.value) {
    clearTimeout(changeTimer.value)
  }

  // 移除键盘事件监听
  window.removeEventListener(`keydown`, handleKeyDown)
})

// 修改组件挂载逻辑
onMounted(() => {
  nextTick(() => {
    initEditor()
    onEditorRefresh()
    mdLocalToRemote()
    window.addEventListener(`keydown`, handleKeyDown)

    // 延迟设置滚动同步
    setTimeout(() => {
      if (preview.value && editor.value) {
        // 如果同步滚动已启用，添加事件监听器
        if (store.isSyncScroll) {
          preview.value.addEventListener(`scroll`, previewScrollCB, false)
          editor.value.on(`scroll`, handleScroll)
        }
      }
    }, 300)

    // 监听同步滚动状态变化
    watch(() => store.isSyncScroll, (newVal) => {
      if (preview.value && editor.value) {
        if (newVal) {
          // 启用同步滚动：添加事件监听器
          preview.value.addEventListener(`scroll`, previewScrollCB, false)
          editor.value.on(`scroll`, handleScroll)
        }
        else {
          // 禁用同步滚动：移除事件监听器
          preview.value.removeEventListener(`scroll`, previewScrollCB, false)
          editor.value.off(`scroll`, handleScroll)
        }
      }
    })
  })
})

const container = ref(null)

// 工具函数，添加格式
function addFormat(cmd: string) {
  const editorInstance = editor.value
  if (!editorInstance)
    return

  // 使用类型断言访问 extraKeys
  const extraKeys = (editorInstance as any).options?.extraKeys
  if (!extraKeys?.[cmd])
    return

  try {
    extraKeys[cmd](editorInstance)
  }
  catch (error) {
    console.error(`执行格式化命令失败:`, error)
  }
}

const codeMirrorWrapper = ref<ComponentPublicInstance<HTMLDivElement> | null>(null)

// 转换 markdown 中的本地图片为线上图片
// todo 处理事件覆盖
function mdLocalToRemote() {
  const dom = codeMirrorWrapper.value!

  // 上传 md 中的图片
  const uploadMdImg = async ({ md, list }: { md: { str: string, path: string, file: File }, list: { path: string, file: File }[] }) => {
    const mdImgList = [
      ...(md.str.matchAll(/!\[(.*?)\]\((.*?)\)/g) || []),
    ].filter((item) => {
      return item // 获取所有相对地址的图片
    })
    const root = md.path.match(/.+?\//)![0]
    const resList = await Promise.all<{ matchStr: string, url: string }>(
      mdImgList.map((item) => {
        return new Promise((resolve) => {
          let [, , matchStr] = item
          matchStr = matchStr.replace(/^.\//, ``) // 处理 ./img/ 为 img/ 统一相对路径风格
          const { file }
            = list.find(f => f.path === `${root}${matchStr}`) || {}

          // 直接上传文件并获取URL，而不使用 uploadImage 函数
          if (file) {
            toBase64(file)
              .then((base64Content) => {
                // For now, use the base64 content directly as the URL
                // In a real implementation, this would upload to a server and return the actual URL
                return base64Content
              })
              .then((url) => {
                resolve({ matchStr, url })
              })
              .catch((err) => {
                console.error(`上传文件失败:`, err)
                resolve({ matchStr, url: `` }) // 失败时返回空URL
              })
          }
          else {
            resolve({ matchStr, url: `` }) // 文件不存在时返回空URL
          }
        })
      }),
    )
    resList.forEach((item) => {
      md.str = md.str
        .replace(`](./${item.matchStr})`, `](${item.url})`)
        .replace(`](${item.matchStr})`, `](${item.url})`)
    })
    editor.value!.setValue(md.str)
  }

  dom.ondragover = evt => evt.preventDefault()
  dom.ondrop = async (evt: any) => {
    evt.preventDefault()
    for (const item of evt.dataTransfer.items) {
      item.getAsFileSystemHandle().then(async (handle: { kind: string, getFile: () => any }) => {
        if (handle.kind === `directory`) {
          const list = await showFileStructure(handle) as { path: string, file: File }[]
          const md = await getMd({ list })
          uploadMdImg({ md, list })
        }
        else {
          const file = await handle.getFile()
          console.log(`file`, file)
        }
      })
    }
  }

  // 从文件列表中查找一个 md 文件并解析
  async function getMd({ list }: { list: { path: string, file: File }[] }) {
    return new Promise<{ str: string, file: File, path: string }>((resolve) => {
      const { path, file } = list.find(item => item.path.match(/\.md$/))!
      const reader = new FileReader()
      reader.readAsText(file!, `UTF-8`)
      reader.onload = (evt) => {
        resolve({
          str: evt.target!.result as string,
          file,
          path,
        })
      }
    })
  }

  // 转换文件系统句柄中的文件为文件列表
  async function showFileStructure(root: any) {
    const result = []
    let cwd = ``
    try {
      const dirs = [root]
      for (const dir of dirs) {
        cwd += `${dir.name}/`
        for await (const [, handle] of dir) {
          if (handle.kind === `file`) {
            result.push({
              path: cwd + handle.name,
              file: await handle.getFile(),
            })
          }
          else {
            result.push({
              path: `${cwd + handle.name}/`,
            })
            dirs.push(handle)
          }
        }
      }
    }
    catch (err) {
      console.error(err)
    }
    return result
  }
}

// 添加新文章
function handleAddPost() {
  store.addPost(`新文章`)
  // 切换到新创建的文章（addPost已经设置currentPostId）
}

// 全选
function handleSelectAll() {
  editor.value?.execCommand(`selectAll`)
}

// 撤销
function handleUndo() {
  editor.value?.execCommand(`undo`)
}

// 重做
function handleRedo() {
  editor.value?.execCommand(`redo`)
}

// 查找
function handleFind() {
  // 打开自定义搜索面板
  showSearchPanel.value = true
  // 确保搜索框获得焦点
  nextTick(() => {
    // 延迟一点确保DOM已更新
    setTimeout(() => {
      const searchInput = document.getElementById(`custom-search-input`)
      if (searchInput) {
        searchInput.focus()
        // 使用 Selection API 替代 select() 方法
        if (searchInput instanceof HTMLInputElement || searchInput instanceof HTMLTextAreaElement) {
          searchInput.select()
        }
        else {
          // 对于其他类型的元素，使用 Selection API
          const range = document.createRange()
          range.selectNodeContents(searchInput)
          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
          }
        }
      }
    }, 100)
  })
}

interface RewriteConfig {
  level: string
  styles: string[]
  retains: string[]
  extras: string[]
}

async function handleRewriteConfirm(config: RewriteConfig) {
  try {
    const stylePrompts = {
      academic: `使用学术性的语言和表达方式，包含专业术语，保持严谨的学术风格`,
      news: `采用新闻报道的写作方式，客观陈述，突出重点信息`,
      popular: `使用通俗易懂的语言，适当增加比喻和例子，让内容更容易理解`,
    }

    const levelPrompts = {
      low: `轻微改写，保持大部分原文内容`,
      medium: `中度改写，保持核心内容`,
      high: `深度改写，只保留主要观点`,
    }

    // 获取编辑器中的选中文本
    const selectedText = store.editor?.getSelection() || ''

    // 分段处理长文本
    const maxChunkLength = 2000 // 增加每段最大字符数
    const text = selectedText

    // 首先按段落分割
    const paragraphs = text.split(/\n\s*\n/)
    const chunks: string[] = []

    let currentChunk = ``
    let currentLength = 0

    // 智能分段处理
    for (const paragraph of paragraphs) {
      const paragraphLength = paragraph.length

      // 如果当前段落本身就超过最大长度
      if (paragraphLength > maxChunkLength) {
        // 如果当前chunk不为空，先保存
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          currentChunk = ``
          currentLength = 0
        }

        // 按句子分割长段落
        const sentences = paragraph.split(/([。！？.!?]+)/).filter(Boolean)
        let tempChunk = ``
        let tempLength = 0

        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i]
          const sentenceLength = sentence.length

          if (tempLength + sentenceLength > maxChunkLength) {
            if (tempChunk) {
              chunks.push(tempChunk.trim())
              tempChunk = sentence
              tempLength = sentenceLength
            }
            else {
              // 如果单个句子超过最大长度，强制分割
              const forcedChunks = sentence.match(new RegExp(`.{1,${maxChunkLength}}`, `g`)) || []
              chunks.push(...forcedChunks.map(chunk => chunk.trim()))
            }
          }
          else {
            tempChunk += sentence
            tempLength += sentenceLength
          }
        }

        if (tempChunk) {
          currentChunk = tempChunk
          currentLength = tempLength
        }
      }
      // 如果添加当前段落会超过最大长度
      else if (currentLength + paragraphLength + 2 > maxChunkLength) {
        chunks.push(currentChunk.trim())
        currentChunk = paragraph
        currentLength = paragraphLength
      }
      // 可以将段落添加到当前chunk
      else {
        currentChunk += (currentChunk ? `\n\n` : ``) + paragraph
        currentLength += paragraphLength + 2
      }
    }

    // 保存最后一个chunk
    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }

    const endCursor = editor.value!.getCursor(`to`)
    // 在原文后插入分隔线和说明
    editor.value!.replaceRange(`\n\n---\n【以下是AI改写的版本】：\n\n`, endCursor)

    // 更新插入位置到新行
    const currentPosition = {
      line: endCursor.line + 5, // 跳过分隔线和说明
      ch: 0,
    }

    // 逐段处理并添加进度提示
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const isLastChunk = i === chunks.length - 1

      // 添加进度提示
      if (chunks.length > 1) {
        const progressText = `\n【正在处理第 ${i + 1}/${chunks.length} 段...】\n\n`
        editor.value!.replaceRange(progressText, currentPosition)
        currentPosition.line += 3
      }

      const prompt = `请对以下内容进行改写，要求：
1. ${config.styles.map(style => stylePrompts[style as keyof typeof stylePrompts]).join(`\n`)}
2. ${levelPrompts[config.level as keyof typeof levelPrompts]}
3. 保持原文的核心意思不变
4. 调整段落组织，但确保逻辑连贯
${config.retains.length > 0 ? `5. 保留以下内容：${config.retains.join(`、`)}` : ``}
${config.extras.length > 0 ? `6. 额外要求：${config.extras.join(`、`)}` : ``}
${chunks.length > 1 ? `7. 这是分段处理的第 ${i + 1}/${chunks.length} 段，请确保改写后的内容与其他段落保持连贯性和过渡性` : ``}

原文内容：
${chunk}`

      // 添加重试机制
      let retryCount = 0
      const maxRetries = 3
      let lastError: Error | null = null

      while (retryCount < maxRetries) {
        try {
          await new Promise<void>((resolve, reject) => {
            let hasStartedResponse = false

            streamAIContent({
              prompt,
              onToken: (token: string) => {
                hasStartedResponse = true
                editor.value?.replaceRange(token, currentPosition)
                const lines = token.split(`\n`)
                if (lines.length > 1) {
                  currentPosition.line += lines.length - 1
                  currentPosition.ch = lines[lines.length - 1].length
                }
                else {
                  currentPosition.ch += token.length
                }
              },
              onError: (error: Error) => {
                // 如果已经开始接收响应，则认为是成功的
                if (hasStartedResponse) {
                  resolve()
                }
                else {
                  reject(error)
                }
              },
              onFinish: () => {
                if (!isLastChunk) {
                  editor.value?.replaceRange(`\n\n`, currentPosition)
                  currentPosition.line += 2
                  currentPosition.ch = 0
                }
                resolve()
              },
            } satisfies AIStreamOptions)
          })

          // 如果成功处理，跳出重试循环
          break
        }
        catch (error) {
          lastError = error as Error
          retryCount++

          // 如果还有重试机会，添加重试提示
          if (retryCount < maxRetries) {
            const retryText = `\n【请求失败，正在进行第 ${retryCount + 1} 次重试...】\n`
            editor.value!.replaceRange(retryText, currentPosition)
            currentPosition.line += 2
            currentPosition.ch = 0

            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
          }
        }
      }

      // 如果所有重试都失败了
      if (retryCount === maxRetries && lastError) {
        throw new Error(`处理失败，已重试 ${maxRetries} 次：${lastError.message}`)
      }

      // 如果不是最后一段，删除进度提示
      if (!isLastChunk && chunks.length > 1) {
        const progressLineStart = currentPosition.line - 3
        editor.value!.replaceRange(``, { line: progressLineStart, ch: 0 }, { line: progressLineStart + 1, ch: 0 },
        )
        currentPosition.line -= 1
      }
    }

    // 处理完成后的提示
    editor.value!.replaceRange(`\n\n【内容改写完成】\n`, currentPosition)
  }
  catch (error) {
    // 添加更详细的错误信息
    console.error(`改写失败:`, error)
    const errorMessage = error instanceof Error
      ? `改写失败: ${error.message}`
      : `改写内容时出错`
    toast.error(errorMessage)

    // 添加恢复提示
    if (editor.value) {
      const cursor = editor.value.getCursor()
      editor.value.replaceRange(`\n\n【处理失败，请重试或减少文本长度】\n`, cursor)
    }
  }
}

// 在需要保存的地方，使用 getValue 替代 save
function handleSave() {
  if (!editor.value)
    return
  const content = editor.value.getValue()
  // 处理保存逻辑
  if (store._currentPost) {
    store._currentPost.content = content
  }
  store.editorRefresh()
}

// 替换原来使用 save() 的地方
function handleKeyDown(e: KeyboardEvent) {
  // 只有在编辑器获得焦点时才处理快捷键
  if (!isEditorFocused.value) {
    return
  }

  // 定义快捷键映射
  const shortcuts = {
    'ctrl+s': () => handleSave(),
    'ctrl+alt+n': () => {
      e.preventDefault() // 防止浏览器默认行为
      store.addPost(`新文章`)
      // 切换到新创建的文章
      if (store.posts.length > 0) {
        const lastPost = store.posts[store.posts.length - 1]
        store.currentPostId = lastPost.id || null
      }
    },
    'ctrl+a': () => editor.value?.execCommand(`selectAll`),
    'ctrl+z': () => editor.value?.execCommand(`undo`),
    'ctrl+y': () => editor.value?.execCommand(`redo`),
    'ctrl+shift+z': () => editor.value?.execCommand(`redo`),
    'ctrl+f': () => {
      e.preventDefault() // 防止浏览器默认行为
      // 打开自定义搜索面板
      showSearchPanel.value = true
    },
  }

  // 构建当前按键组合
  const keyCombination = [
    e.ctrlKey ? `ctrl` : ``,
    e.shiftKey ? `shift` : ``,
    e.altKey ? `alt` : ``,
    e.key.toLowerCase(),
  ].filter(Boolean).join(`+`)

  // 执行对应的快捷键功能
  if (shortcuts[keyCombination as keyof typeof shortcuts]) {
    e.preventDefault()
    shortcuts[keyCombination as keyof typeof shortcuts]()
  }
}

// 处理微信素材插入事件
function handleInsertWechatMaterial(event: CustomEvent) {
  const { content } = event.detail
  if (editor.value && content) {
    // 获取当前光标位置
    const cursor = editor.value.getCursor()
    // 在光标位置插入内容
    editor.value.replaceSelection(content)
    // 将光标移动到插入内容的末尾
    const line = cursor.line
    const ch = cursor.ch + content.length
    editor.value.setCursor({ line, ch })

    // 刷新编辑器显示
    store.editorRefresh()
  }
}

onMounted(() => {
  initEditor()
  onEditorRefresh()
  mdLocalToRemote()
  window.addEventListener(`keydown`, handleKeyDown)
  // 添加对微信素材插入事件的监听
  document.addEventListener(`insert-wechat-material`, handleInsertWechatMaterial as EventListener)
})

onUnmounted(() => {
  window.removeEventListener(`keydown`, handleKeyDown)
  // 移除对微信素材插入事件的监听
  document.removeEventListener(`insert-wechat-material`, handleInsertWechatMaterial as EventListener)
})

// 修改手势处理函数
</script>

<template>
  <div
    ref="container"
    class="container flex flex-col"
  >
    <EditorHeader
      @add-format="addFormat"
      @format-content="formatContent"
      @start-copy="startCopy"
      @end-copy="endCopy"
      @add-post="handleAddPost"
      @save="handleSave"
      @select-all="handleSelectAll"
      @undo="handleUndo"
      @redo="handleRedo"
      @find="handleFind"
    />

    <main class="container-main flex flex-1 flex-col">
      <div class="container-main-section border-radius-10 relative flex flex-1 overflow-hidden border-1">
        <PostSlider />
        <div class="editor-preview-container flex flex-1 flex-col overflow-hidden">
          <div class="search-panel-wrapper relative">
            <SearchPanel
              v-model="showSearchPanel"
              :editor="editor"
              @close="showSearchPanel = false"
            />
          </div>
          <div class="editor-preview-content flex flex-1 overflow-hidden">
            <div
              ref="codeMirrorWrapper"
              class="codeMirror-wrapper relative"
              :class="{
                'order-1': !store.isEditOnLeft,
                'border-r': store.isEditOnLeft,
                'border-l': !store.isEditOnLeft,
                'is-transitioning': isTransitioning,
              }"
            >
              <ContextMenu modal>
                <ContextMenuTrigger>
                  <textarea
                    id="editor"
                    type="textarea"
                    placeholder="Your markdown text here."
                    @focus="isEditorFocused = true"
                    @blur="isEditorFocused = false"
                  />
                </ContextMenuTrigger>
                <ContextMenuContent
                  class="context-menu-content"
                >
                  <ContextMenuItem @click="checkAIConfigurationAndOpenAssistant()">
                    <Bot class="mr-2 h-4 w-4" />
                    AI助手
                  </ContextMenuItem>
                  <ContextMenuItem @click="addSelectionAsCitation()">
                    <Bot class="mr-2 h-4 w-4" />
                    添加为引文
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem @click="showTemplateDialog = true">
                    <LayoutTemplate class="mr-2 h-4 w-4" />
                    插入模板
                  </ContextMenuItem>
                  <ContextMenuItem @click="showUploadImgDialog = true">
                    <Image class="mr-2 h-4 w-4" />
                    上传图片
                  </ContextMenuItem>
                  <ContextMenuItem @click="toggleShowInsertFormDialog()">
                    <Table class="mr-2 h-4 w-4" />
                    插入表格
                  </ContextMenuItem>
                  <ContextMenuItem @click="resetStyleConfirm()">
                    <RotateCcw class="mr-2 h-4 w-4" />
                    恢复默认样式
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem @click="importMarkdownContent()">
                    <Download class="mr-2 h-4 w-4" />
                    导入 .md 文档
                  </ContextMenuItem>
                  <ContextMenuItem @click="exportEditorContent2MD()">
                    <Upload class="mr-2 h-4 w-4" />
                    导出 .md 文档
                  </ContextMenuItem>
                  <ContextMenuItem @click="exportEditorContent2HTML()">
                    <Upload class="mr-2 h-4 w-4" />
                    导出 .html
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>

            <div
              id="preview"
              ref="preview"
              class="preview-wrapper flex-1 p-5"
              :class="{
                'is-transitioning': isTransitioning,
              }"
            >
              <div id="output-wrapper" :class="{ output_night: !backLight }">
                <div class="preview border-x-1 shadow-xl">
                  <section
                    id="output"
                    :key="output"
                    class="markdown-preview"
                    v-html="output"
                  />
                  <div v-if="isCoping" class="loading-mask">
                    <div class="loading-mask-box">
                      <div class="loading__img" />
                      <span>正在生成</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CssEditor class="order-2 flex-1" />
        <RightSlider class="order-2" />
      </div>
      <footer
        class="text-muted-foreground h-[30px] flex select-none items-center justify-end text-[12px]"
        :class="{ hidden: displayStore.isShowInsertFormDialog || displayStore.isShowCssEditor || showTemplateDialog || showRewriteDialog || showUploadImgDialog || isShowClearConfirmDialog || aiStore.settingsDialogVisible }"
      >
        字数 {{ readingTime?.words }}， 阅读大约需 {{ Math.ceil(readingTime?.minutes ?? 0) }} 分钟
      </footer>

      <UploadImgDialog v-model="showUploadImgDialog" @upload-image="insertImageUrl" />

      <InsertFormDialog />

      <RunLoading />

      <AlertDialog v-model:open="store.isOpenConfirmDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>提示</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将丢失本地自定义样式，是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="store.resetStyle()">
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RewriteDialog
        v-model:open="showRewriteDialog"
        @confirm="handleRewriteConfirm"
      />

      <AIAssistant
        ref="aiAssistantRef"
        :editor="editor"
      />

      <MarkdownTemplateDialog
        v-model:show="showTemplateDialog"
      />

      <AlertDialog v-model:open="isShowClearConfirmDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将清空当前编辑器的所有内容，是否确认？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="store.clearCurrentContent()">
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  </div>
</template>

<style lang="less" scoped>
@import url('../assets/less/app.less');
</style>

<style lang="less" scoped>
.container {
  height: 100vh;
  min-width: 100%;
  padding: 0;
}

.container-main {
  overflow: hidden;
  padding: 0 20px;
  margin-top: 0.5rem;
}

#output-wrapper {
  position: relative;
  user-select: text;
  height: 100%;
  width: 100%;
}

#output-wrapper.output_night {
  width: 100%;
}

:deep(.preview-table) {
  border-spacing: 0;
}

.codeMirror-wrapper,
.preview-wrapper {
  height: 100%;
  will-change: transform, opacity;
  flex: 1; /* 确保编辑器和预览区域各占一半 */
}

.container-main-section {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 150px); /* 调整高度以适应头部和边距 */
}

.editor-preview-container {
  display: flex;
  flex-direction: column;
  flex: 1; /* 占据剩余空间 */
}

.editor-preview-content {
  display: flex;
  flex-direction: row; /* 水平排列编辑器和预览 */
  flex: 1; /* 占据容器剩余空间 */
}

.codeMirror-wrapper {
  overflow-x: auto;
  position: relative;

  &.prevent-touch {
    touch-action: pan-x pan-y;

    :deep(.CodeMirror) {
      touch-action: pan-x pan-y;
    }
  }

  :deep(.CodeMirror) {
    height: 100%;
    width: 100%;
    font-size: 15px;
    line-height: 1.6;
  }

  :deep(.CodeMirror-focused) {
    z-index: 2;
  }

  /* CodeMirror 占位符样式 */
  :deep(.CodeMirror .cm-placeholder) {
    color: #999;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(20px, -50%) scale(0.9);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translate(0, -50%) scale(1);
}

.preview-wrapper {
  height: 100%;
  overflow-y: auto;
  background-color: var(--background);

  .preview {
    min-height: 100%;
    height: auto;
    width: 100%;
    margin: 0;
    padding: 16px;

    #output {
      width: 100%;
      min-height: 100%;
      height: auto;
    }
  }
}

.markdown-preview {
  width: 100%;
  min-height: 100%;
  height: auto;
  overflow: visible;
  word-break: break-word;
  overflow-wrap: break-word;
}

.search-panel-wrapper {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  width: 100%;
}
</style>
