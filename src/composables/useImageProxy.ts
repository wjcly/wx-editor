/**
 * 图片代理 Composable
 * 从 localStorage 读取微信配置中的图片代理 URL 并生成代理 URL
 */

/**
 * 从 localStorage 获取图片代理 URL 模板
 * @returns 代理 URL 模板，如果未配置则返回空字符串
 */
export function getImageProxyUrlTemplate(): string {
  try {
    const wxProxyConfig = localStorage.getItem(`wxProxyConfig`)
    if (wxProxyConfig) {
      const config = JSON.parse(wxProxyConfig)
      return config.imageProxyUrl || ``
    }
  }
  catch (e) {
    console.warn(`获取图片代理配置失败:`, e)
  }
  return ``
}

/**
 * 检查是否启用了图片代理
 * @returns 是否启用了图片代理
 */
export function isImageProxyEnabled(): boolean {
  const template = getImageProxyUrlTemplate()
  return template !== ``
}

/**
 * 将图片 URL 转换为代理 URL
 * @param imageUrl 原始图片 URL
 * @returns 代理后的 URL，如果未配置代理则返回原 URL
 */
export function getProxyUrl(imageUrl: string): string {
  const template = getImageProxyUrlTemplate()
  
  if (!template) {
    return imageUrl
  }
  
  return template.replace('{url}', encodeURIComponent(imageUrl))
}

/**
 * 从代理 URL 中提取原始 URL
 * @param proxyUrl 代理 URL
 * @returns 原始 URL，如果无法提取则返回原 URL
 */
export function extractOriginalUrl(proxyUrl: string): string {
  const template = getImageProxyUrlTemplate()
  
  if (!template) {
    return proxyUrl
  }
  
  try {
    // 获取模板中的 {url} 占位符之前的部分
    const templatePrefix = template.split('{url}')[0]
    
    // 如果代理 URL 不是以模板前缀开头，返回原 URL
    if (!proxyUrl.startsWith(templatePrefix)) {
      return proxyUrl
    }
    
    // 提取编码后的 URL 部分
    const encodedUrl = proxyUrl.slice(templatePrefix.length)
    
    // 尝试解码
    return decodeURIComponent(encodedUrl)
  }
  catch (e) {
    console.warn(`解析代理 URL 失败:`, e)
  }
  
  return proxyUrl
}

/**
 * 将内容中的所有代理 URL 替换为原始 URL
 * @param content 包含图片和其他资源链接的内容
 * @returns 替换后的纯原始 URL 内容
 */
export function replaceProxyUrlsWithOriginal(content: string): string {
  const template = getImageProxyUrlTemplate()
  
  if (!template) {
    return content
  }
  
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
  const template = getImageProxyUrlTemplate()
  
  if (!template) {
    return htmlContent
  }
  
  // 匹配 <img> 标签中的 src 属性
  const imgSrcRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi
  
  return htmlContent.replace(imgSrcRegex, (match, proxyUrl) => {
    const originalUrl = extractOriginalUrl(proxyUrl)
    return match.replace(proxyUrl, originalUrl)
  })
}
