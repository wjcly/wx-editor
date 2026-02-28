import { useAIStore } from '@/stores'

export interface AIStreamOptions {
  prompt: string | Array<{ role: string, content: string }> | {
    system?: string
    user?: string
  }
  onToken?: (token: string) => void
  onError?: (error: Error) => void
  onFinish?: () => void
  deepThinking?: boolean // 深度思考选项
}

// 请求头适配器接口
interface RequestHeaderAdapter {
  getHeaders: (apiKey: string) => Record<string, string>
}

// 响应解析适配器接口（非流式）
interface NonStreamingResponseParseAdapter {
  parseContent: (data: any) => string
}

class DefaultRequestHeaderAdapter implements RequestHeaderAdapter {
  getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': `application/json`,
      'Authorization': `Bearer ${apiKey}`,
    }
  }
}

class DefaultNonStreamingResponseParseAdapter implements NonStreamingResponseParseAdapter {
  parseContent(data: any): string {
    // OpenAI和其他标准兼容的提供商
    return data.choices?.[0]?.message?.content || ``
  }
}

class QwenNonStreamingResponseParseAdapter implements NonStreamingResponseParseAdapter {
  parseContent(data: any): string {
    // 通义千问兼容模式的content在choices.message.content中
    return data.choices?.[0]?.message?.content || ``
  }
}

class ZhipuNonStreamingResponseParseAdapter implements NonStreamingResponseParseAdapter {
  parseContent(data: any): string {
    return data.choices?.[0]?.message?.content || ``
  }
}

class DoubaoNonStreamingResponseParseAdapter implements NonStreamingResponseParseAdapter {
  parseContent(data: any): string {
    return data.choices?.[0]?.message?.content || ``
  }
}

class TencentNonStreamingResponseParseAdapter implements NonStreamingResponseParseAdapter {
  parseContent(data: any): string {
    return data.choices?.[0]?.message?.content || ``
  }
}

class NvidiaNonStreamingResponseParseAdapter implements NonStreamingResponseParseAdapter {
  parseContent(data: any): string {
    // NVIDIA API与其他标准兼容的提供商相同
    return data.choices?.[0]?.message?.content || ``
  }
}

// 创建非流式响应解析适配器映射
const nonStreamingResponseParseAdapters: Record<string, NonStreamingResponseParseAdapter> = {
  openai: new DefaultNonStreamingResponseParseAdapter(),
  nvidia: new NvidiaNonStreamingResponseParseAdapter(),
  qwen: new QwenNonStreamingResponseParseAdapter(),
  zhipu: new ZhipuNonStreamingResponseParseAdapter(),
  deepseek: new DefaultNonStreamingResponseParseAdapter(),
  doubao: new DoubaoNonStreamingResponseParseAdapter(),
  tencent: new TencentNonStreamingResponseParseAdapter(),
  custom: new DefaultNonStreamingResponseParseAdapter(),
}

class OpenAIRequestHeaderAdapter extends DefaultRequestHeaderAdapter {
  getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': `application/json`,
      'Authorization': `Bearer ${apiKey}`,
    }
  }
}

class QwenRequestHeaderAdapter extends DefaultRequestHeaderAdapter {
  getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': `application/json`,
      'Authorization': `Bearer ${apiKey}`,
    }
  }
}

class ZhipuRequestHeaderAdapter extends DefaultRequestHeaderAdapter {
  getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': `application/json`,
      'Authorization': `Bearer ${apiKey}`,
    }
  }
}

class DeepSeekRequestHeaderAdapter extends DefaultRequestHeaderAdapter {
  getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': `application/json`,
      'Authorization': `Bearer ${apiKey}`,
    }
  }
}

class DoubaoRequestHeaderAdapter extends DefaultRequestHeaderAdapter {
  getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': `application/json`,
      'Authorization': `Bearer ${apiKey}`,
    }
  }
}

class TencentRequestHeaderAdapter extends DefaultRequestHeaderAdapter {
  getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': `application/json`,
      'Authorization': `Bearer ${apiKey}`,
    }
  }
}

class NvidiaRequestHeaderAdapter extends DefaultRequestHeaderAdapter {
  getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': `application/json`,
      'Authorization': `Bearer ${apiKey}`,
    }
  }
}

// 创建请求头适配器映射
const requestHeaderAdapters: Record<string, RequestHeaderAdapter> = {
  openai: new OpenAIRequestHeaderAdapter(),
  nvidia: new NvidiaRequestHeaderAdapter(),
  qwen: new QwenRequestHeaderAdapter(),
  zhipu: new ZhipuRequestHeaderAdapter(),
  deepseek: new DeepSeekRequestHeaderAdapter(),
  doubao: new DoubaoRequestHeaderAdapter(),
  tencent: new TencentRequestHeaderAdapter(),
  custom: new DefaultRequestHeaderAdapter(),
}

// 获取请求头
function getRequestHeaders(apiKey: string, providerId: string) {
  const adapter = requestHeaderAdapters[providerId] || new DefaultRequestHeaderAdapter()
  return adapter.getHeaders(apiKey)
}

// 响应解析适配器接口
interface ResponseParseAdapter {
  parseToken: (data: any) => string | null
}

class DefaultResponseParseAdapter implements ResponseParseAdapter {
  parseToken(data: any): string | null {
    // OpenAI和其他标准兼容的提供商
    return data.choices?.[0]?.delta?.content || null
  }
}

class QwenResponseParseAdapter implements ResponseParseAdapter {
  parseToken(data: any): string | null {
    return data.choices?.[0]?.delta?.content || null
  }
}

class ZhipuResponseParseAdapter implements ResponseParseAdapter {
  parseToken(data: any): string | null {
    // 智谱AI的token在choices.delta.content中
    return data.choices?.[0]?.delta?.content || null
  }
}

class DoubaoResponseParseAdapter implements ResponseParseAdapter {
  parseToken(data: any): string | null {
    // 豆包的token在choices.delta.content中
    return data.choices?.[0]?.delta?.content || null
  }
}

class TencentResponseParseAdapter implements ResponseParseAdapter {
  parseToken(data: any): string | null {
    // 腾讯元宝的token在choices.delta.content中
    return data.choices?.[0]?.delta?.content || null
  }
}

class NvidiaResponseParseAdapter implements ResponseParseAdapter {
  parseToken(data: any): string | null {
    // NVIDIA API与其他标准兼容的提供商相同
    return data.choices?.[0]?.delta?.content || null
  }
}

// 创建响应解析适配器映射
const responseParseAdapters: Record<string, ResponseParseAdapter> = {
  openai: new DefaultResponseParseAdapter(),
  nvidia: new NvidiaResponseParseAdapter(),
  qwen: new QwenResponseParseAdapter(),
  zhipu: new ZhipuResponseParseAdapter(),
  deepseek: new DefaultResponseParseAdapter(),
  doubao: new DoubaoResponseParseAdapter(),
  tencent: new TencentResponseParseAdapter(),
  custom: new DefaultResponseParseAdapter(),
}

// 为每个请求维护独立的累积数据
const sseAccumulator = (() => {
  const accumulators = new Map() // 使用Map为每个providerId维护单独的累积数据

  return {
    getAccumulatedData(providerId: string): string {
      return accumulators.get(providerId) || ''
    },
    setAccumulatedData(providerId: string, data: string) {
      accumulators.set(providerId, data)
    },
    clearAccumulatedData(providerId: string) {
      accumulators.delete(providerId)
    },
  }
})()

// 处理不同的API响应格式
function parseResponseChunk(chunk: string, providerId: string): string[] {
  // 获取当前provider的累积数据
  let accumulatedData = sseAccumulator.getAccumulatedData(providerId)

  // 将当前块添加到累积数据中
  accumulatedData += chunk

  // 按行分割累积的数据
  const lines = accumulatedData.split(/\r?\n/)

  // 保留最后一个可能不完整的行
  accumulatedData = lines.pop() || ''

  // 更新累积数据
  sseAccumulator.setAccumulatedData(providerId, accumulatedData)

  const tokens: string[] = []

  for (const line of lines) {
    // 检查是否是 SSE 格式的 data 行
    if (line.startsWith('data: ')) {
      let data = line.slice(6)
      if (data === '[DONE]')
        continue

      // 清理数据，移除可能的空白字符
      data = data.trim()
      if (!data)
        continue

      try {
        // 尝试解析JSON
        const parsed = JSON.parse(data)

        // 使用适配器解析token
        const adapter = responseParseAdapters[providerId] || new DefaultResponseParseAdapter()
        const token = adapter.parseToken(parsed)

        if (token) {
          tokens.push(token)
        }
      }
      catch (e) {
        // 如果JSON解析失败，记录错误但不中断处理
        console.error('Error parsing SSE message:', e)
        console.error('Raw chunk data:', data)
      }
    }
    // 如果是空行，表示一个SSE消息结束，可以清空累积数据
    else if (line.trim() === '') {
      sseAccumulator.clearAccumulatedData(providerId)
    }
    // 检查是否有混合格式的数据（例如，部分数据在非"data:"行中）
    else if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
      // 这可能是直接的JSON数据，尝试解析
      try {
        const parsed = JSON.parse(line.trim())

        // 使用适配器解析token
        const adapter = responseParseAdapters[providerId] || new DefaultResponseParseAdapter()
        const token = adapter.parseToken(parsed)

        if (token) {
          tokens.push(token)
        }
      }
      catch (e) {
        // 如果JSON解析失败，记录错误但不中断处理
        console.error('Error parsing direct JSON message:', e)
        console.error('Raw chunk data:', line.trim())
      }
    }
  }

  return tokens
}

// 错误消息适配器接口
interface ErrorMessageAdapter {
  formatErrorMessage: (status: number, statusText?: string) => string
}

class DefaultErrorMessageAdapter implements ErrorMessageAdapter {
  formatErrorMessage(status: number, statusText?: string): string {
    let errorMessage = ``
    const providerName = `AI`

    switch (status) {
      case 401:
        errorMessage = `认证失败：API Key 无效。请检查您的${providerName} API Key是否正确配置。`
        break
      case 403:
        errorMessage = `API Key 无访问权限或配额已用尽。请检查您的API Key或联系服务商。`
        break
      case 429:
        errorMessage = `请求过于频繁，请稍后再试。`
        break
      case 500:
        errorMessage = `AI 服务器错误，请稍后重试。`
        break
      default:
        errorMessage = `请求失败 (${status}): ${statusText || `Unknown error`}`
    }

    return errorMessage
  }
}

class OpenAIErrorMessageAdapter implements ErrorMessageAdapter {
  formatErrorMessage(status: number, statusText?: string): string {
    let errorMessage = ``
    const providerName = `OpenAI`

    switch (status) {
      case 401:
        errorMessage = `认证失败：API Key 无效。请检查您的${providerName} API Key是否正确配置。`
        break
      case 403:
        errorMessage = `API Key 无访问权限或配额已用尽。请检查您的API Key或联系服务商。`
        break
      case 429:
        errorMessage = `请求过于频繁，请稍后再试。`
        break
      case 500:
        errorMessage = `AI 服务器错误，请稍后重试。`
        break
      default:
        errorMessage = `请求失败 (${status}): ${statusText || `Unknown error`}`
    }

    return errorMessage
  }
}

class QwenErrorMessageAdapter implements ErrorMessageAdapter {
  formatErrorMessage(status: number, statusText?: string): string {
    let errorMessage = ``
    const providerName = `通义千问(Qwen)`

    switch (status) {
      case 401:
        errorMessage = `认证失败：API Key 无效。请检查您的${providerName} API Key是否正确配置。`
        break
      case 403:
        errorMessage = `API Key 无访问权限或配额已用尽。请检查您的API Key或联系服务商。`
        break
      case 429:
        errorMessage = `请求过于频繁，请稍后再试。`
        break
      case 500:
        errorMessage = `AI 服务器错误，请稍后重试。`
        break
      default:
        errorMessage = `请求失败 (${status}): ${statusText || `Unknown error`}`
    }

    return errorMessage
  }
}

class ZhipuErrorMessageAdapter implements ErrorMessageAdapter {
  formatErrorMessage(status: number, statusText?: string): string {
    let errorMessage = ``
    const providerName = `智谱AI`

    switch (status) {
      case 401:
        errorMessage = `认证失败：API Key 无效。请检查您的${providerName} API Key是否正确配置。`
        break
      case 403:
        errorMessage = `API Key 无访问权限或配额已用尽。请检查您的API Key或联系服务商。`
        break
      case 429:
        errorMessage = `请求过于频繁，请稍后再试。`
        break
      case 500:
        errorMessage = `AI 服务器错误，请稍后重试。`
        break
      default:
        errorMessage = `请求失败 (${status}): ${statusText || `Unknown error`}`
    }

    return errorMessage
  }
}

class DeepSeekErrorMessageAdapter implements ErrorMessageAdapter {
  formatErrorMessage(status: number, statusText?: string): string {
    let errorMessage = ``
    const providerName = `DeepSeek`

    switch (status) {
      case 401:
        errorMessage = `认证失败：API Key 无效。请检查您的${providerName} API Key是否正确配置。`
        break
      case 403:
        errorMessage = `API Key 无访问权限或配额已用尽。请检查您的API Key或联系服务商。`
        break
      case 429:
        errorMessage = `请求过于频繁，请稍后再试。`
        break
      case 500:
        errorMessage = `AI 服务器错误，请稍后重试。`
        break
      default:
        errorMessage = `请求失败 (${status}): ${statusText || `Unknown error`}`
    }

    return errorMessage
  }
}

class DoubaoErrorMessageAdapter implements ErrorMessageAdapter {
  formatErrorMessage(status: number, statusText?: string): string {
    let errorMessage = ``
    const providerName = `豆包(Doubao)`

    switch (status) {
      case 401:
        errorMessage = `认证失败：API Key 无效。请检查您的${providerName} API Key是否正确配置。`
        break
      case 403:
        errorMessage = `API Key 无访问权限或配额已用尽。请检查您的API Key或联系服务商。`
        break
      case 429:
        errorMessage = `请求过于频繁，请稍后再试。`
        break
      case 500:
        errorMessage = `AI 服务器错误，请稍后重试。`
        break
      default:
        errorMessage = `请求失败 (${status}): ${statusText || `Unknown error`}`
    }

    return errorMessage
  }
}

class TencentErrorMessageAdapter implements ErrorMessageAdapter {
  formatErrorMessage(status: number, statusText?: string): string {
    let errorMessage = ``
    const providerName = `腾讯元宝(Tencent Yuanbao)`

    switch (status) {
      case 401:
        errorMessage = `认证失败：API Key 无效。请检查您的${providerName} API Key是否正确配置。`
        break
      case 403:
        errorMessage = `API Key 无访问权限或配额已用尽。请检查您的API Key或联系服务商。`
        break
      case 429:
        errorMessage = `请求过于频繁，请稍后再试。`
        break
      case 500:
        errorMessage = `AI 服务器错误，请稍后重试。`
        break
      default:
        errorMessage = `请求失败 (${status}): ${statusText || `Unknown error`}`
    }

    return errorMessage
  }
}

class NvidiaErrorMessageAdapter implements ErrorMessageAdapter {
  formatErrorMessage(status: number, statusText?: string): string {
    let errorMessage = ``
    const providerName = `NVIDIA AI`

    switch (status) {
      case 401:
        errorMessage = `认证失败：API Key 无效。请检查您的${providerName} API Key是否正确配置。`
        break
      case 403:
        errorMessage = `API Key 无访问权限或配额已用尽。请检查您的API Key或联系服务商。`
        break
      case 429:
        errorMessage = `请求过于频繁，请稍后再试。`
        break
      case 500:
        errorMessage = `AI 服务器错误，请稍后重试。`
        break
      default:
        errorMessage = `请求失败 (${status}): ${statusText || `Unknown error`}`
    }

    return errorMessage
  }
}

// 创建错误消息适配器映射
const errorMessageAdapters: Record<string, ErrorMessageAdapter> = {
  openai: new OpenAIErrorMessageAdapter(),
  nvidia: new NvidiaErrorMessageAdapter(),
  qwen: new QwenErrorMessageAdapter(),
  zhipu: new ZhipuErrorMessageAdapter(),
  deepseek: new DeepSeekErrorMessageAdapter(),
  doubao: new DoubaoErrorMessageAdapter(),
  tencent: new TencentErrorMessageAdapter(),
  custom: new DefaultErrorMessageAdapter(),
}

// 格式化错误消息
function formatErrorMessage(status: number, providerId: string, statusText?: string) {
  const adapter = errorMessageAdapters[providerId] || new DefaultErrorMessageAdapter()
  return adapter.formatErrorMessage(status, statusText)
}

// 用于跟踪当前活动的控制器
let currentAbortController: AbortController | null = null

export async function streamAIContent({
  prompt,
  onToken,
  onError,
  onFinish,
  deepThinking = false, // 默认不启用深度思考
}: AIStreamOptions) {
  const aiStore = useAIStore()
  aiStore.setGenerating(true)

  // 创建一个新的AbortController用于中断请求
  const abortController = new AbortController()
  currentAbortController = abortController

  try {
    const headers = getRequestHeaders(aiStore.currentApiKey, aiStore.currentProviderId)

    // 如果启用了深度思考，修改提示词
    let processedPrompt = prompt
    if (deepThinking) {
      if (typeof prompt === 'string') {
        // 对于字符串类型的提示词，在开头添加深度思考指令
        processedPrompt = `请深入分析并详细回答以下问题：\n\n${prompt}`
      }
      else if (Array.isArray(prompt)) {
        // 对于数组类型的提示词，在第一个用户消息前添加深度思考指令
        processedPrompt = prompt.map((msg, index) => {
          if (msg.role === 'user' && index === prompt.findIndex(m => m.role === 'user')) {
            return { ...msg, content: `请深入分析并详细回答以下问题：\n\n${msg.content}` }
          }
          return msg
        })
      }
      else if (typeof prompt === 'object') {
        // 对于对象类型的提示词，修改用户内容
        processedPrompt = {
          ...prompt,
          user: `请深入分析并详细回答以下问题：\n\n${(prompt as { user?: string }).user || ''}`,
        }
      }
    }

    const requestBody: any = {
      model: aiStore.currentModel,
      messages: [
        ...aiStore.currentPresetWords.map(word => ({ role: `system` as const, content: word })),
        ...(typeof processedPrompt === `string`
          ? [{ role: `user` as const, content: processedPrompt }]
          : Array.isArray(processedPrompt)
            ? processedPrompt
            : [
                { role: `system` as const, content: (processedPrompt as { system?: string }).system || `` },
                { role: `user` as const, content: (processedPrompt as { user?: string }).user || `` },
              ]
        ).filter(msg => msg.content),
      ],
      temperature: deepThinking ? Math.min(aiStore.currentTemperature, 0.3) : aiStore.currentTemperature, // 深度思考时降低温度以获得更一致的回答
      max_tokens: aiStore.currentMaxLength,
      stream: true,
    }

    // 如果启用深度思考，添加相应的参数
    if (deepThinking) {
      requestBody.extra_body = { reasoning_mode: 'long', enable_thinking: true }
    }

    // 使用配置的 API 域
    const apiUrl = aiStore.currentApiDomain

    const response = await fetch(apiUrl, {
      method: `POST`,
      headers,
      body: JSON.stringify(requestBody),
      signal: abortController.signal, // 添加信号以支持中断
    })

    if (!response.ok) {
      aiStore.setGenerating(false)
      currentAbortController = null
      const errorMessage = formatErrorMessage(response.status, aiStore.currentProviderId, response.statusText)
      throw new Error(errorMessage)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      aiStore.setGenerating(false)
      currentAbortController = null
      throw new Error(`No reader available`)
    }

    while (true) {
      // 检查是否被中断
      if (abortController.signal.aborted) {
        aiStore.setGenerating(false)
        currentAbortController = null
        break
      }

      const { done, value } = await reader.read()

      if (done) {
        aiStore.setGenerating(false)
        currentAbortController = null
        // 清理累积数据
        sseAccumulator.clearAccumulatedData(aiStore.currentProviderId)
        onFinish?.()
        break
      }

      const chunk = decoder.decode(value)
      // 可能一次返回多个 token，循环获取所有 token
      const tokens = parseResponseChunk(chunk, aiStore.currentProviderId)
      for (const token of tokens) {
        onToken?.(token)
      }
    }
  }
  catch (error) {
    // 检查是否是由于中断引起的错误
    if (abortController.signal.aborted) {
      aiStore.setGenerating(false)
      currentAbortController = null
      // 清理累积数据
      sseAccumulator.clearAccumulatedData(aiStore.currentProviderId)
      console.log('AI请求已被中断')
    }
    else {
      aiStore.setGenerating(false)
      currentAbortController = null
      // 清理累积数据
      sseAccumulator.clearAccumulatedData(aiStore.currentProviderId)
      onError?.(error as Error)
    }
  }
  finally {
    // 确保在任何情况下都清理累积数据
    sseAccumulator.clearAccumulatedData(aiStore.currentProviderId)
  }
}

// 中断当前AI请求
export function cancelAIRequest() {
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }
}

export function generateWithAI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let content = ``

    streamAIContent({
      prompt,
      onToken: (token) => {
        content += token
      },
      onError: (error) => {
        reject(error)
      },
      onFinish: () => {
        resolve(content)
      },
    })
  })
}

// CSS改写相关的提示词模板
export const CSS_REWRITE_PROMPTS = {
  optimize: `优化CSS结构,使用更合理的选择器和层级`,
  readability: `提高代码可读性,添加适当的空行和缩进`,
  simplify: `精简代码,去除冗余的样式声明`,
  comment: `为重要的样式块添加注释说明`,
  selectors: `保持原有的选择器名称不变`,
  important: `保留所有!important声明`,
  media: `保留所有媒体查询`,
  animation: `保留所有动画相关代码`,
}

// 生成CSS改写提示词
export function generateCssRewritePrompt(options: {
  styles: string[]
  retains: string[]
  css: string
  customPrompt?: string
}) {
  const { styles, retains, css, customPrompt } = options

  // 基础提示词
  const basePrompt = [
    `你是一个专业的CSS优化专家。你的任务是根据以下要求优化CSS代码:`,
    ``,
    `优化要求:`,
  ]

  // 添加优化选项
  styles.forEach((style) => {
    if (CSS_REWRITE_PROMPTS[style as keyof typeof CSS_REWRITE_PROMPTS]) {
      basePrompt.push(`- ${CSS_REWRITE_PROMPTS[style as keyof typeof CSS_REWRITE_PROMPTS]}`)
    }
  })

  // 添加保留选项
  if (retains.length > 0) {
    basePrompt.push(``, `保留要求:`)
    retains.forEach((retain) => {
      if (CSS_REWRITE_PROMPTS[retain as keyof typeof CSS_REWRITE_PROMPTS]) {
        basePrompt.push(`- ${CSS_REWRITE_PROMPTS[retain as keyof typeof CSS_REWRITE_PROMPTS]}`)
      }
    })
  }

  // 添加自定义提示词
  if (customPrompt?.trim()) {
    basePrompt.push(
      ``,
      `自定义要求:`,
      customPrompt.trim(),
    )
  }

  // 添加处理说明
  basePrompt.push(
    ``,
    `请严格按照以下步骤处理:`,
    `1. 仔细阅读上述优化和保留要求`,
    `2. 分析CSS代码的结构和特点`,
    `3. 根据要求优化代码,同时确保保留指定的特性`,
    `4. 检查优化后的代码是否符合所有要求`,
    ``,
    `需要优化的CSS代码:`,
    ``,
    css,
    ``,
    `请开始优化:`,
  )

  return {
    system: basePrompt.join(`\n`),
    user: css,
  }
}

// AI 服务接口
export async function callAI(prompt: string): Promise<string> {
  const aiStore = useAIStore()
  try {
    const headers = getRequestHeaders(aiStore.currentApiKey, aiStore.currentProviderId)

    // 使用配置的 API 域
    const apiUrl = aiStore.currentApiDomain

    const response = await fetch(apiUrl, {
      method: `POST`,
      headers,
      body: JSON.stringify({
        model: aiStore.currentModel,
        messages: [{ role: `user`, content: prompt }],
        temperature: aiStore.currentTemperature,
        max_tokens: aiStore.currentMaxLength,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI 服务请求失败: ${response.statusText}`)
    }

    const data = await response.json()

    // 根据不同提供商解析响应
    const adapter = nonStreamingResponseParseAdapters[aiStore.currentProviderId] || new DefaultNonStreamingResponseParseAdapter()
    const content = adapter.parseContent(data)

    return content
  }
  catch (error) {
    console.error(`调用 AI 服务失败:`, error)
    throw error
  }
}
