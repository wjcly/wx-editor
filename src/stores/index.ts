import type { ReadTimeResults } from 'reading-time'
import { useStorage } from '@vueuse/core'
import CodeMirror from 'codemirror'
import { marked } from 'marked'
import { v4 as uuidv4 } from 'uuid'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt?raw'
import { altKey, codeBlockThemeOptions, colorOptions, fontFamilyOptions, fontSizeOptions, legendOptions, shiftKey, themeMap, themeOptions } from '@/config'

import type { Post, WechatDraft } from '@/types/post'
import { PostGroup } from '@/types/post'
import { addPrefix, css2json, customCssWithTemplate, customizeTheme, downloadMD, exportHTML, formatDoc } from '@/utils'
import { initRenderer } from '@/utils/renderer'

export const useStore = defineStore(`store`, () => {
  // 是否开启深色模式
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  // 是否开启 Mac 代码块
  const isMacCodeBlock = useStorage(`isMacCodeBlock`, true)
  const toggleMacCodeBlock = useToggle(isMacCodeBlock)

  // 是否在左侧编辑
  const isEditOnLeft = useStorage(`isEditOnLeft`, true)
  const toggleEditOnLeft = useToggle(isEditOnLeft)

  // 是否开启微信外链接底部引用
  const isCiteStatus = useStorage(`isCiteStatus`, false)
  const toggleCiteStatus = useToggle(isCiteStatus)

  // 是否统计字数和阅读时间
  const isCountStatus = useStorage(`isCountStatus`, false)
  const toggleCountStatus = useToggle(isCountStatus)

  // 是否开启段落首行缩进
  const isUseIndent = useStorage(addPrefix(`use_indent`), false)
  const toggleUseIndent = useToggle(isUseIndent)

  // 是否开启同步滚动
  const isSyncScroll = useStorage(`isSyncScroll`, true)
  const toggleSyncScroll = useToggle(isSyncScroll)

  const output = ref(``)

  // 文本字体
  const theme = useStorage<keyof typeof themeMap>(addPrefix(`theme`), themeOptions[0].value)
  // 文本字体
  const fontFamily = useStorage(`fonts`, fontFamilyOptions[0].value)
  // 文本大小
  const fontSize = useStorage(`size`, fontSizeOptions[2].value)
  // 主色
  const primaryColor = useStorage(`color`, colorOptions[0].value)
  // 代码块主题
  const codeBlockTheme = useStorage(`codeBlockTheme`, codeBlockThemeOptions[23].value)

  // 图注格式
  const legend = useStorage(`legend`, legendOptions[3].value)

  const fontSizeNumber = computed(() => Number(fontSize.value.replace(`px`, ``)))

  // 编辑器实例
  const editor = ref<CodeMirror.Editor | null>(null)

  // 文章列表 - 只初始化为空数组
  const posts = useStorage(addPrefix(`posts`), [] as Post[])

  // 当前文章索引
  const currentPostId = useStorage<string | null>(addPrefix(`currentPostId`), null)

  // 是否是首次使用
  const isFirstUse = useStorage(`isFirstUse`, true)

  // 侧边栏状态
  const isOpenRightSlider = useStorage(addPrefix(`is_open_right_slider`), false)
  const isOpenPostSlider = useStorage(addPrefix(`is_open_post_slider`), false)

  // 微信内容图片转换辅助函数
  const transformWechatImages = (htmlContent: string): string => {
    let processedContent = htmlContent
    // 转换图片的 data-src 为 src 以确保图片能正常显示
    processedContent = processedContent.replace(/data-src=/g, `src=`)
    processedContent = processedContent.replace(/ data-w="[^"]*"/g, ``)
    processedContent = processedContent.replace(/ data-ratio="[^"]*"/g, ``)
    // 将图片URL转换为通过wsrv.nl代理的URL
    processedContent = processedContent.replace(/src="(https?:\/\/mmbiz\.(qpic|qlogo)\.cn\/[^\s"]*)"/g, `src="https://wsrv.nl/?url=$1"`)
    return processedContent
  }

  // 更新输出内容
  const updateOutput = () => {
    if (currentPostId.value) {
      const currentPost = posts.value.find(p => p.id === currentPostId.value)
      if (currentPost) {
        // 对所有内容类型都使用markdown渲染，以支持Markdown语法
        const rendered = marked.parse(currentPost.content)
        if (typeof rendered === `string`) {
          output.value = rendered
        }
      }
    }
    else if (editor.value) {
      // 如果没有当前文章ID，但编辑器存在，则使用编辑器内容
      const content = editor.value.getValue()
      const rendered = marked.parse(content)
      if (typeof rendered === `string`) {
        output.value = rendered
      }
    }
  }

  // 编辑器刷新
  const refreshEditor = () => {
    nextTick(() => {
      if (editor.value) {
        editor.value.refresh()
        updateOutput()
      }
    })
  }

  // 文章管理
  const addPost = (title: string) => {
    const newPost = {
      id: uuidv4(),
      title,
      content: `# ${title}`,
      group: PostGroup.DEFAULT,
    } as Post
    posts.value.push(newPost)
    currentPostId.value = newPost.id
  }

  const renamePost = (index: number, title: string) => {
    if (index >= 0 && index < posts.value.length) {
      posts.value[index].title = title
    }
  }

  const delPost = (index: number) => {
    const deletedPostId = posts.value[index]?.id
    posts.value.splice(index, 1)

    // 如果删除的是当前选中的文章，则选择下一个或上一个
    if (currentPostId.value === deletedPostId && posts.value.length > 0) {
      const newCurrentIndex = Math.min(index, posts.value.length - 1)
      currentPostId.value = posts.value[newCurrentIndex]?.id || null
    }
    else if (posts.value.length === 0) {
      currentPostId.value = null
    }
  }

  // 清空当前编辑器内容
  const clearCurrentContent = () => {
    if (editor.value && currentPostId.value) {
      const current = posts.value.find(p => p.id === currentPostId.value)
      if (current) {
        current.content = ``
        editor.value.setValue(``)
        editor.value.clearHistory()
        editor.value.refresh()
        updateOutput()
      }
    }
  }

  // 监听文章切换
  watch(currentPostId, () => {
    if (editor.value && currentPostId.value) {
      const currentPost = posts.value.find(p => p.id === currentPostId.value)
      if (currentPost) {
        editor.value.setValue(currentPost.content)
        editor.value.clearHistory()
        editor.value.refresh()
      }
    }
  })

  // 每次应用启动时检查是否是首次使用
  onMounted(() => {
    // 如果是首次使用
    if (isFirstUse.value) {
      // 初始化为空数组，不添加任何预设文章
      posts.value = [] as Post[]
      currentPostId.value = null
      isFirstUse.value = false

      // 初始化侧边栏状态
      isOpenPostSlider.value = false
      isOpenRightSlider.value = false
    }

    // 不再自动确保至少有一篇文章
    if (posts.value.length === 0) {
      currentPostId.value = null
    }
    else {
      // 如果有文章且当前文章ID为空，则设置为第一篇文章的ID
      if (!currentPostId.value && posts.value.length > 0) {
        currentPostId.value = posts.value[0].id || null
      }
    }

    // 初始化编辑器内容
    nextTick(() => {
      if (editor.value && currentPostId.value) {
        const currentPost = posts.value.find(p => p.id === currentPostId.value)
        if (currentPost) {
          editor.value.setValue(currentPost.content)
          editor.value.clearHistory()
          editor.value.refresh()
          updateOutput()
        }
      }
    })
  })

  // 格式化文档
  const formatContent = () => {
    formatDoc((editor.value!).getValue()).then((doc) => {
      if (currentPostId.value) {
        const current = posts.value.find(p => p.id === currentPostId.value)
        if (current) {
          current.content = doc
        }
      }
      toRaw(editor.value!).setValue(doc)
      refreshEditor()
    })
  }

  // 切换 highlight.js 代码主题
  const codeThemeChange = () => {
    const cssUrl = codeBlockTheme.value
    const el = document.querySelector(`#hljs`)
    if (el) {
      el.setAttribute(`href`, cssUrl)
    }
    else {
      const link = document.createElement(`link`)
      link.setAttribute(`type`, `text/css`)
      link.setAttribute(`rel`, `stylesheet`)
      link.setAttribute(`href`, cssUrl)
      link.setAttribute(`id`, `hljs`)
      document.head.appendChild(link)
    }
  }

  // 自义定 CSS 编辑器
  const cssEditor = ref<CodeMirror.EditorFromTextArea | null>(null)
  const setCssEditorValue = (content: string) => {
    (cssEditor.value!).setValue(content)
  }
  // 自定义 CSS 内容
  const cssContent = useStorage(`__css_content`, DEFAULT_CSS_CONTENT)
  const cssContentConfig = useStorage(addPrefix(`css_content_config`), {
    active: `方案1`,
    tabs: [
      {
        title: `方案1`,
        name: `方案1`,
        // 兼容之前的方案
        content: cssContent.value || DEFAULT_CSS_CONTENT,
      },
    ],
  })
  onMounted(() => {
    // 清空过往历史记录
    cssContent.value = ``
  })
  const getCurrentTab = () => cssContentConfig.value.tabs.find((tab) => {
    return tab.name === cssContentConfig.value.active
  })!
  const tabChanged = (name: string) => {
    cssContentConfig.value.active = name
    const content = cssContentConfig.value.tabs.find((tab) => {
      return tab.name === name
    })!.content
    setCssEditorValue(content)
  }

  // 重命名 css 方案
  const renameTab = (name: string) => {
    const tab = getCurrentTab()!
    tab.title = name
    tab.name = name
    cssContentConfig.value.active = name
  }

  const addCssContentTab = (name: string) => {
    cssContentConfig.value.tabs.push({
      name,
      title: name,
      content: DEFAULT_CSS_CONTENT,
    })
    cssContentConfig.value.active = name
    setCssEditorValue(DEFAULT_CSS_CONTENT)
  }
  const validatorTabName = (val: string) => {
    return cssContentConfig.value.tabs.every(({ name }) => name !== val)
  }

  const renderer = initRenderer({
    theme: customCssWithTemplate(css2json(getCurrentTab().content), primaryColor.value, customizeTheme(themeMap[theme.value], { fontSize: fontSizeNumber.value, color: primaryColor.value })),
    fonts: fontFamily.value,
    size: fontSize.value,
    isUseIndent: isUseIndent.value,
  })

  const readingTime = ref<ReadTimeResults | null>(null)

  // 更新编辑器
  const editorRefresh = () => {
    codeThemeChange()

    // 检查当前文章是否为微信文章
    // const _currentPost = posts.value.find(p => p.id === currentPostId.value) // 注释掉这行，因为未使用

    // 对所有内容统一使用markdown渲染逻辑，以支持新输入的Markdown语法
    renderer.reset({ citeStatus: isCiteStatus.value, legend: legend.value, isUseIndent: isUseIndent.value, countStatus: isCountStatus.value })

    const { markdownContent, readingTime: readingTimeResult } = renderer.parseFrontMatterAndContent(editor.value!.getValue())
    readingTime.value = readingTimeResult
    let outputTemp = marked.parse(markdownContent) as string

    // 阅读时间及字数统计
    outputTemp = renderer.buildReadingTime(readingTimeResult) + outputTemp

    // 去除第一行的 margin-top
    outputTemp = outputTemp.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
    // 引用脚注
    outputTemp += renderer.buildFootnotes()
    // 附加的一些 style
    outputTemp += renderer.buildAddition()

    if (isMacCodeBlock.value) {
      outputTemp += `
        <style>
          .hljs.code__pre > .mac-sign {
            display: flex;
          }
        </style>
      `
    }

    outputTemp += `
      <style>
        .code__pre {
          padding: 0 !important;
        }

        .hljs.code__pre code {
          display: -webkit-box;
          padding: 0.5em 1em 1em;
          overflow-x: auto;
          text-indent: 0;
        }
      </style>
    `

    output.value = renderer.createContainer(outputTemp)
  }

  // 更新 CSS
  const updateCss = () => {
    const json = css2json(cssEditor.value!.getValue())
    const newTheme = customCssWithTemplate(json, primaryColor.value, customizeTheme(themeMap[theme.value], { fontSize: fontSizeNumber.value, color: primaryColor.value }))
    renderer.setOptions({
      theme: newTheme,
    })

    editorRefresh()
  }
  // 初始化 CSS 编辑器
  onMounted(() => {
    const cssEditorDom = document.querySelector<HTMLTextAreaElement>(`#cssEditor`)!
    cssEditorDom.value = getCurrentTab().content
    const theme = isDark.value ? `darcula` : `xq-light`
    cssEditor.value = markRaw(
      CodeMirror.fromTextArea(cssEditorDom, {
        mode: `css`,
        theme,
        lineNumbers: false,
        lineWrapping: true,
        styleActiveLine: true,
        matchBrackets: true,
        autofocus: true,
        extraKeys: {
          [`${shiftKey}-${altKey}-F`]: function autoFormat(editor: CodeMirror.Editor) {
            formatDoc(editor.getValue(), `css`).then((doc) => {
              getCurrentTab().content = doc
              editor.setValue(doc)
            })
          },
        },
      } as never),
    )

    // 自动提示
    cssEditor.value.on(`keyup`, (cm, e) => {
      if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 189) {
        (cm as any).showHint(e)
      }
    })

    // 实时保存
    cssEditor.value.on(`update`, () => {
      updateCss()
      getCurrentTab().content = cssEditor.value!.getValue()
    })
  })

  watch(isDark, () => {
    const theme = isDark.value ? `darcula` : `xq-light`
    toRaw(cssEditor.value)?.setOption?.(`theme`, theme)
  })

  // 重置样式
  const resetStyle = () => {
    isCiteStatus.value = false
    isMacCodeBlock.value = true
    isCountStatus.value = false

    theme.value = themeOptions[0].value
    fontFamily.value = fontFamilyOptions[0].value
    fontFamily.value = fontFamilyOptions[0].value
    fontSize.value = fontSizeOptions[2].value
    primaryColor.value = colorOptions[0].value
    codeBlockTheme.value = codeBlockThemeOptions[23].value
    legend.value = legendOptions[3].value

    cssContentConfig.value = {
      active: `方案 1`,
      tabs: [
        {
          title: `方案 1`,
          name: `方案 1`,
          // 兼容之前的方案
          content: cssContent.value || DEFAULT_CSS_CONTENT,
        },
      ],
    }

    cssEditor.value!.setValue(DEFAULT_CSS_CONTENT)

    updateCss()
    editorRefresh()

    toast.success(`样式重置成功~`)
  }

  // 为函数添加刷新编辑器的功能
  const withAfterRefresh = (fn: (...rest: any[]) => void) => (...rest: any[]) => {
    fn(...rest)
    editorRefresh()
  }

  // 添加一个getter来获取当前文章
  const _currentPost = computed(() => {
    if (currentPostId.value) {
      return posts.value.find(p => p.id === currentPostId.value)
    }
    return null
  })

  // 添加微信草稿内容显示方法
  const setWechatDraftContent = async (draft: WechatDraft) => {
    console.log(`Setting wechat draft content:`, draft)
    const htmlContent = draft.content

    // 使用HTML格式化工具格式化内容
    const { formatHtml } = await import(`@/utils/htmlFormatter`)
    const formattedHtml = formatHtml(htmlContent)

    // 使用统一的图片转换函数处理
    const processedHtml = transformWechatImages(formattedHtml)

    // 检查是否已存在对应ID的文章，如果不存在则创建一个
    let targetPost = posts.value.find(p => p.id === draft.mediaId)

    if (!targetPost) {
      // 如果不存在对应ID的文章，则创建一个
      const newPost: WechatDraft = {
        id: draft.mediaId,
        title: draft.title,
        content: processedHtml, // 存储处理后的HTML格式
        group: PostGroup.WECHAT,
        mediaId: draft.mediaId,
        author: draft.author,
        digest: draft.digest,
        thumbMediaId: draft.thumbMediaId,
        needOpenComment: draft.needOpenComment,
        onlyFansCanComment: draft.onlyFansCanComment,
      }
      posts.value.push(newPost)
      targetPost = posts.value[posts.value.length - 1]
    }
    else {
      // 如果存在，则更新其内容
      targetPost.title = draft.title
      targetPost.content = processedHtml // 存储处理后的HTML格式
      targetPost.group = PostGroup.WECHAT
      // 因为 draft 是 WechatDraft，所以 targetPost 也应被当作 WechatDraft 来处理
      const wechatTarget = targetPost as WechatDraft
      wechatTarget.mediaId = draft.mediaId
      wechatTarget.author = draft.author
      wechatTarget.digest = draft.digest
      wechatTarget.thumbMediaId = draft.thumbMediaId
      wechatTarget.needOpenComment = draft.needOpenComment
      wechatTarget.onlyFansCanComment = draft.onlyFansCanComment
    }

    // 设置当前文章为这个微信草稿
    currentPostId.value = targetPost.id

    console.log(`Current post after update:`, targetPost)

    if (editor.value) {
      editor.value.setValue(processedHtml) // 显示处理后的HTML格式
      updateOutput()
    }
  }

  // 更新微信草稿方法
  const updateWechatDraft = async (mediaId: string, article: WechatDraft) => {
    try {
      // 获取微信配置
      const { getWechatConfig } = await import(`@/utils/wechatConfig`)
      const config = getWechatConfig()
      if (!config) {
        throw new Error(`未配置微信公众号`)
      }

      // 获取access_token
      const { WechatPostService } = await import(`@/utils/wechatPostService`)
      const accessToken = await WechatPostService.getAccessToken(
        config.appID,
        config.appsecret,
        config.proxyOrigin,
      )

      if (!accessToken) {
        throw new Error(`获取微信访问令牌失败`)
      }

      // 调用微信更新草稿API
      const result = await WechatPostService.updateDraft(
        accessToken,
        mediaId,
        article,
        0, // index默认为0
        config.proxyOrigin,
      )

      if (result.errcode === 0) {
        return result
      }
      else {
        throw new Error(`微信草稿更新失败: ${result.errmsg}`)
      }
    }
    catch (error: any) {
      console.error(`更新微信草稿失败:`, error)
      toast.error(error.message || `更新微信草稿失败`)
      throw error
    }
  }

  const getTheme = (size: string, color: string) => {
    const newTheme = themeMap[theme.value]
    const fontSize = Number(size.replace(`px`, ``))
    return customCssWithTemplate(css2json(getCurrentTab().content), color, customizeTheme(newTheme, { fontSize, color }))
  }

  const themeChanged = withAfterRefresh((newTheme: keyof typeof themeMap) => {
    renderer.setOptions({
      theme: customCssWithTemplate(css2json(getCurrentTab().content), primaryColor.value, customizeTheme(themeMap[newTheme], { fontSize: fontSizeNumber.value })),
    })
    theme.value = newTheme
  })

  const fontChanged = withAfterRefresh((fonts) => {
    renderer.setOptions({
      fonts,
    })

    fontFamily.value = fonts
  })

  const sizeChanged = withAfterRefresh((size) => {
    const theme = getTheme(size, primaryColor.value)
    renderer.setOptions({
      size,
      theme,
    })

    fontSize.value = size
  })

  const colorChanged = withAfterRefresh((newColor) => {
    const theme = getTheme(fontSize.value, newColor)
    renderer.setOptions({
      theme,
    })

    primaryColor.value = newColor
  })

  const codeBlockThemeChanged = withAfterRefresh((newTheme) => {
    codeBlockTheme.value = newTheme
  })

  const legendChanged = withAfterRefresh((newVal) => {
    legend.value = newVal
  })

  const macCodeBlockChanged = withAfterRefresh(() => {
    toggleMacCodeBlock()
  })

  const citeStatusChanged = withAfterRefresh(() => {
    toggleCiteStatus()
  })

  const countStatusChanged = withAfterRefresh(() => {
    toggleCountStatus()
  })

  const useIndentChanged = withAfterRefresh(() => {
    toggleUseIndent()
  })

  // 导出编辑器内容为 HTML，并且下载到本地
  const exportEditorContent2HTML = () => {
    const currentPost = posts.value.find(p => p.id === currentPostId.value)
    if (currentPost && currentPost.group === PostGroup.WECHAT) {
      // 对于微信内容，需要临时处理图片URL（移除代理URL，因为是导出到本地）
      const htmlContent = output.value.replace(/src="https:\/\/wsrv\.nl\/\?url=/g, `src="`)
      const element = document.querySelector(`#output`)!
      const originalContent = element.innerHTML
      element.innerHTML = htmlContent
      exportHTML(primaryColor.value)
      // 恢复原来的内容
      element.innerHTML = originalContent
    }
    else {
      // 对于非微信内容，使用正常的渲染流程
      exportHTML(primaryColor.value)
      document.querySelector(`#output`)!.innerHTML = output.value
    }
  }

  // 导出编辑器内容到本地
  const exportEditorContent2MD = () => {
    downloadMD(editor.value!.getValue())
  }

  // 导入 Markdown 文档
  const importMarkdownContent = () => {
    const body = document.body
    const input = document.createElement(`input`)
    input.type = `file`
    input.name = `filename`
    input.accept = `.md`
    input.onchange = () => {
      const file = input.files![0]
      if (!file) {
        return
      }

      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = (event) => {
        (editor.value!).setValue((event.target!).result as string)
        toast.success(`文档导入成功`)
      }
    }

    body.appendChild(input)
    input.click()
    body.removeChild(input)
  }

  const isOpenConfirmDialog = ref(false)

  // 重置样式
  const resetStyleConfirm = () => {
    isOpenConfirmDialog.value = true
  }

  // 导入内容
  const importContent = async (content: string) => {
    if (!editor.value)
      return

    try {
      // 检查当前文章是否为微信文章，如果是则进行相应处理
      const currentPost = posts.value.find(p => p.id === currentPostId.value)
      let processedContent = content

      if (currentPost && currentPost.group === PostGroup.WECHAT) {
        // 对微信内容进行特定处理
        const { sanitizeForWechat } = await import(`@/utils/styleSanitize`)
        processedContent = sanitizeForWechat(content)
        // 使用HTML格式化工具格式化内容
        const { formatHtml } = await import(`@/utils/htmlFormatter`)
        processedContent = formatHtml(processedContent)
        // 应用图片转换以确保正确显示
        processedContent = transformWechatImages(processedContent)
      }

      // 先清空编辑器
      editor.value.setValue(``)
      // 等待下一个渲染周期
      await nextTick()
      // 重置编辑器状态
      editor.value.clearHistory()
      // 设置新内容
      editor.value.setValue(processedContent)
      // 移动光标到开始位置
      editor.value.setCursor(0, 0)
      // 刷新编辑器
      editor.value.refresh()
      // 更新存储的内容
      if (currentPostId.value) {
        const current = posts.value.find(p => p.id === currentPostId.value)
        if (current) {
          current.content = processedContent
        }
      }
      // 更新输出
      updateOutput()
    }
    catch (error) {
      console.error(`更新编辑器内容时出错:`, error)
      throw new Error(`更新编辑器内容失败`)
    }
  }

  return {
    isDark,
    toggleDark,

    isEditOnLeft,
    toggleEditOnLeft,

    isMacCodeBlock,
    isCiteStatus,
    citeStatusChanged,
    isUseIndent,
    useIndentChanged,
    isSyncScroll,
    toggleSyncScroll,

    isCountStatus,
    countStatusChanged,

    output,
    editor,
    cssEditor,
    theme,
    fontFamily,
    fontSize,
    primaryColor,
    codeBlockTheme,
    legend,
    readingTime,

    editorRefresh,

    themeChanged,
    fontChanged,
    sizeChanged,
    colorChanged,
    codeBlockThemeChanged,
    legendChanged,
    macCodeBlockChanged,

    formatContent,
    exportEditorContent2HTML,
    exportEditorContent2MD,

    importMarkdownContent,

    isOpenConfirmDialog,
    resetStyleConfirm,
    resetStyle,

    cssContentConfig,
    addCssContentTab,
    validatorTabName,
    setCssEditorValue,
    tabChanged,
    renameTab,
    posts,
    currentPostId,
    _currentPost,
    addPost,
    renamePost,
    delPost,
    isOpenPostSlider,
    isOpenRightSlider,
    importContent,
    clearCurrentContent,
    setWechatDraftContent,
    updateWechatDraft,
    updateOutput,
  }
})

export const useDisplayStore = defineStore(`display`, () => {
  // 是否展示 CSS 编辑器
  const isShowCssEditor = ref(false)
  const toggleShowCssEditor = useToggle(isShowCssEditor)

  // 是否展示插入表格对话框
  const isShowInsertFormDialog = ref(false)
  const toggleShowInsertFormDialog = useToggle(isShowInsertFormDialog)

  // 是否正在上传文件
  const isUploading = ref(false)

  return {
    isShowCssEditor,
    toggleShowCssEditor,
    isShowInsertFormDialog,
    toggleShowInsertFormDialog,
    isUploading,
  }
})

export * from './ai'
