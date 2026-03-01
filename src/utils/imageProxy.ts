/**
 * 图片代理服务配置
 * 支持多个代理服务，按优先级使用
 */

/**
 * 代理服务配置
 */
export interface ProxyConfig {
  /** 代理服务名称 */
  name: string
  /** 代理服务 URL 模板，使用 {url} 作为占位符 */
  urlTemplate: string
  /** 是否启用 */
  enabled: boolean
}

/**
 * 默认代理服务列表（按优先级排序）
 * 1. allorigins.win - 优先使用
 * 2. wsrv.nl - 备用
 */
const DEFAULT_PROXY_CONFIGS: ProxyConfig[] = [
  {
    name: 'allorigins',
    urlTemplate: 'https://api.allorigins.win/raw?url={url}',
    enabled: true,
  },
  {
    name: 'wsrv',
    urlTemplate: 'https://wsrv.nl?url={url}',
    enabled: true,
  },
]

/**
 * 获取启用的代理服务列表
 * @param customConfigs 自定义代理配置（可选）
 * @returns 启用的代理服务列表
 */
export function getEnabledProxies(customConfigs?: ProxyConfig[]): ProxyConfig[] {
  const configs = customConfigs || DEFAULT_PROXY_CONFIGS
  return configs.filter(proxy => proxy.enabled)
}

/**
 * 将图片 URL 转换为代理 URL
 * 使用第一个启用的代理服务
 * @param imageUrl 原始图片 URL
 * @param customConfigs 自定义代理配置（可选）
 * @returns 代理后的 URL
 */
export function getProxyUrl(imageUrl: string, customConfigs?: ProxyConfig[]): string {
  const proxies = getEnabledProxies(customConfigs)

  if (proxies.length === 0) {
    return imageUrl
  }

  // 使用第一个启用的代理服务
  const proxy = proxies[0]
  return proxy.urlTemplate.replace('{url}', encodeURIComponent(imageUrl))
}

/**
 * 从代理 URL 中提取原始 URL
 * 支持多种代理服务
 * @param proxyUrl 代理 URL
 * @returns 原始 URL，如果无法提取则返回原 URL
 */
export function extractOriginalUrl(proxyUrl: string): string {
  try {
    const url = new URL(proxyUrl)

    // 处理 allorigins.win 代理 URL
    if (url.hostname === 'api.allorigins.win' && url.pathname.startsWith('/raw')) {
      const encodedUrl = url.searchParams.get('url')
      if (encodedUrl) {
        return decodeURIComponent(encodedUrl)
      }
    }

    // 处理 wsrv.nl 代理 URL
    if (url.hostname === 'wsrv.nl') {
      const encodedUrl = url.searchParams.get('url')
      if (encodedUrl) {
        return decodeURIComponent(encodedUrl)
      }
    }
  }
  catch (e) {
    console.warn(`解析代理 URL 失败:`, e)
  }

  // 如果不是已知的代理 URL 或解析失败，返回原 URL
  return proxyUrl
}

/**
 * 将内容中的所有代理 URL 替换为原始 URL
 * @param content 包含图片和其他资源链接的内容
 * @returns 替换后的纯原始 URL 内容
 */
export function replaceProxyUrlsWithOriginal(content: string): string {
  let result = content

  // 匹配 markdown 图片语法中的代理 URL
  const markdownImgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g
  result = result.replace(markdownImgRegex, (alt, proxyUrl) => {
    const originalUrl = extractOriginalUrl(proxyUrl)
    return `![${alt}](${originalUrl})`
  })

  // 匹配 HTML img 标签中的代理 URL
  const imgSrcRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi
  result = result.replace(imgSrcRegex, (match, proxyUrl) => {
    const originalUrl = extractOriginalUrl(proxyUrl)
    return match.replace(proxyUrl, originalUrl)
  })

  return result
}

/**
 * 将 HTML 内容中的代理 URL 替换为原始 URL
 * @param htmlContent 包含图片标签的 HTML 内容
 * @returns 替换后的 HTML 内容
 */
export function replaceProxyUrlsInHtml(htmlContent: string): string {
  // 匹配 <img> 标签中的 src 属性
  const imgSrcRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi

  return htmlContent.replace(imgSrcRegex, (match, proxyUrl) => {
    const originalUrl = extractOriginalUrl(proxyUrl)
    return match.replace(proxyUrl, originalUrl)
  })
}
