import mermaid from 'mermaid'
import { WechatPostService } from '@/utils/wechatPostService'

// 初始化Mermaid配置
mermaid.initialize({
  startOnLoad: false,
  theme: `default`,
  securityLevel: `loose`, // 允许内联样式
  fontFamily: `Arial`,
  fontSize: 16, // 增大字体以提高清晰度
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: `basis`, // 使用更平滑的曲线
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
  },
  gantt: {
    titleTopMargin: 25,
    barHeight: 20,
    barGap: 4,
    topPadding: 50,
    rightPadding: 75,
    leftPadding: 75,
    gridLineStartPadding: 3.5,
    fontSize: 11,
    numberSectionStyles: 4,
    axisFormat: `%Y-%m-%d`,
  },
  // 添加配置以提高渲染清晰度
  altFontFamily: `sans-serif`,
  deterministicIds: true,
  maxTextSize: 99999,
})

/**
 * 将Mermaid图表代码渲染为SVG字符串
 * @param mermaidCode Mermaid代码
 * @returns SVG字符串
 */
async function renderMermaidToSvg(mermaidCode: string): Promise<string> {
  try {
    // 清除可能的多余换行和空格
    const trimmedCode = mermaidCode.trim()

    // 生成唯一的图表ID，避免冲突
    const chartId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 使用Mermaid渲染
    const { svg } = await mermaid.render(chartId, trimmedCode)

    return svg
  }
  catch (error) {
    console.error(`Mermaid渲染失败:`, error)
    throw new Error(`Mermaid图表渲染失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * 将SVG转换为PNG格式的Blob
 * @param svg SVG字符串
 * @returns PNG格式的Blob对象
 */
async function svgToPngBlob(svg: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 创建一个临时的img元素来加载SVG
      const img = new Image()
      // 添加时间戳避免缓存问题
      const svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}#${Date.now()}`

      img.onload = () => {
        // 创建canvas来将SVG渲染为PNG
        const canvas = document.createElement(`canvas`)
        const ctx = canvas.getContext(`2d`)

        if (!ctx) {
          reject(new Error(`无法获取canvas上下文`))
          return
        }

        // 设置更高分辨率以提高清晰度
        const scaleFactor = 2 // 2倍分辨率
        const targetWidth = img.width || 800
        const targetHeight = img.height || 600

        // 设置canvas的内部尺寸为高分辨率
        canvas.width = targetWidth * scaleFactor
        canvas.height = targetHeight * scaleFactor

        // 设置canvas的显示尺寸
        canvas.style.width = `${targetWidth}px`
        canvas.style.height = `${targetHeight}px`

        // 缩放绘图上下文以提高清晰度
        ctx.scale(scaleFactor, scaleFactor)

        // 设置绘图参数以提高质量
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = `high`

        // 绘制SVG到canvas
        ctx.fillStyle = `white` // 设置背景色为白色
        ctx.fillRect(0, 0, targetWidth, targetHeight)
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        // 转换为PNG Blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          }
          else {
            reject(new Error(`Canvas toBlob失败`))
          }
        }, `image/png`, 1.0) // 使用1.0质量以获得最高质量
      }

      img.onerror = (error) => {
        reject(new Error(`SVG加载失败: ${error instanceof Error ? error.message : String(error)}`))
      }

      img.src = svgUrl
    }
    catch (error) {
      reject(new Error(`SVG转PNG失败: ${error instanceof Error ? error.message : String(error)}`))
    }
  })
}

/**
 * 上传图片文件到微信服务器并获取URL
 * @param file 要上传的文件
 * @param accessToken 微信access_token
 * @param proxyOrigin 代理域名
 * @returns 图片URL
 */
async function uploadMermaidImageToWechat(
  file: File,
  accessToken: string,
  proxyOrigin?: string,
): Promise<string> {
  try {
    // 使用WechatPostService的uploadImageNoLimit方法上传图片
    const imageUrl = await WechatPostService.uploadImageNoLimit(accessToken, file, proxyOrigin)
    return imageUrl
  }
  catch (error) {
    console.error(`上传Mermaid图片失败:`, error)
    throw new Error(`上传Mermaid图片失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * 将预渲染的Mermaid HTML标签转换为微信兼容的图片
 * @param content 包含Mermaid HTML标签的内容
 * @param accessToken 微信access_token
 * @param proxyOrigin 代理域名
 * @returns 替换Mermaid标签为图片URL的内容
 */
export async function replaceMermaidWithImages(
  content: string,
  accessToken: string,
  proxyOrigin?: string,
): Promise<string> {
  // 匹配预渲染的Mermaid HTML标签
  const mermaidHtmlRegex = /<pre[^>]*class="[^"]*mermaid[^"]*"[^>]*>([\s\S]*?)<\/pre>/g
  let result = content

  // 找出所有包含mermaid的pre标签
  const matches = content.matchAll(mermaidHtmlRegex)
  const allMatches = Array.from(matches)

  for (const match of allMatches) {
    const fullMatch = match[0]
    // 提取pre标签内的内容（即Mermaid代码）
    const mermaidCode = match[1]?.replace(/<[^>]*>/g, ``).trim() // 移除可能的HTML标签并清理内容

    try {
      // 渲染Mermaid为SVG
      console.log(`正在渲染Mermaid图表...`)
      const svg = await renderMermaidToSvg(mermaidCode)

      // 转换为PNG Blob
      const pngBlob = await svgToPngBlob(svg)

      // 创建文件对象
      const file = new File([pngBlob], `mermaid-chart-${Date.now()}.png`, { type: `image/png` })

      // 上传到微信服务器
      const imageUrl = await uploadMermaidImageToWechat(file, accessToken, proxyOrigin)

      // 替换原始的Mermaid pre标签为图片标签，设置宽度100%铺满
      const imageTag = `<img 
    data-type="png" 
    src="${imageUrl}" 
    alt="Mermaid图表"
    style="
      width: 100%;
      display: block;
      margin: 0 auto;
      padding: 0;
      border: none;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    "
  />`
      result = result.replace(fullMatch, imageTag)
    }
    catch (error) {
      console.error(`处理Mermaid图表失败:`, error)
    }
  }

  return result
}

/**
 * 检查HTML内容中是否包含Mermaid图表（预渲染的HTML格式）
 * @param content HTML内容字符串
 * @returns 是否包含Mermaid图表
 */
export function hasMermaidContent(content: string): boolean {
  // 检查是否包含Mermaid预渲染的HTML标签
  const mermaidHtmlRegex = /<pre[^>]*class="[^"]*mermaid[^"]*"[^>]*>/
  return mermaidHtmlRegex.test(content)
}
