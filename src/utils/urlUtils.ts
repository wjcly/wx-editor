/**
 * URL 工具函数，用于处理代理 URL 和原始 URL 之间的转换
 */

/**
 * 从代理 URL 提取原始 URL
 * @param proxyUrl 代理 URL，如 https://wsrv.nl?url=ENCODED_URL
 * @returns 原始 URL，如果无法提取则返回原 URL
 */
export function extractOriginalUrl(proxyUrl: string): string {
  // 处理 wsrv.nl 代理 URL
  if (proxyUrl.includes(`wsrv.nl`)) {
    try {
      const url = new URL(proxyUrl)
      const encodedUrl = url.searchParams.get(`url`)
      if (encodedUrl) {
        return decodeURIComponent(encodedUrl)
      }
    }
    catch (e) {
      console.warn(`解析 wsrv.nl URL 失败:`, e)
    }
  }

  // 如果不是代理 URL 或解析失败，返回原 URL
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
