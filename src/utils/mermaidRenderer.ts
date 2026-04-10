import mermaid from 'mermaid'
import { WechatPostService } from '@/utils/wechatPostService'

// 初始化Mermaid配置（最高质量）
mermaid.initialize({
  startOnLoad: false,
  theme: `default`,
  securityLevel: `loose`, // 允许内联样式
  fontFamily: `Arial, sans-serif`,
  fontSize: 18, // 增大字体以提高清晰度（从16增加到18）
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: `basis`, // 使用更平滑的曲线
    padding: 20, // 增加内边距
    nodeSpacing: 50, // 增加节点间距
    rankSpacing: 50, // 增加层级间距
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
    fontSize: 18, // 增大时序图字体
  },
  gantt: {
    titleTopMargin: 25,
    barHeight: 25, // 增加条形图高度
    barGap: 6, // 增加间距
    topPadding: 50,
    rightPadding: 75,
    leftPadding: 75,
    gridLineStartPadding: 3.5,
    fontSize: 14, // 增大甘特图字体（从11增加到14）
    numberSectionStyles: 4,
    axisFormat: `%Y-%m-%d`,
  },
  // 添加配置以提高渲染清晰度
  altFontFamily: `sans-serif`,
  deterministicIds: true,
  maxTextSize: 99999,
  // 提高 SVG 输出质量
  logLevel: 0, // 禁用日志以提高性能
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
 * 将SVG转换为PNG格式的Blob（最高质量）
 * 参考 mermaid-plus-cli 的实现：使用超高分辨率 Canvas 渲染
 * @param svg SVG字符串
 * @returns PNG格式的Blob对象
 */
async function svgToPngBlob(svg: string): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      // 创建临时容器渲染 SVG
      const tempDiv = document.createElement(`div`)
      tempDiv.style.cssText = `position: absolute; left: -9999px; top: 0; visibility: hidden;`
      tempDiv.innerHTML = svg
      document.body.appendChild(tempDiv)

      // 等待字体加载完成
      await document.fonts.ready

      const svgElement = tempDiv.querySelector(`svg`) as SVGElement
      if (!svgElement) {
        document.body.removeChild(tempDiv)
        reject(new Error(`SVG元素不存在`))
        return
      }

      // 获取 SVG 的 viewBox 属性（这是最准确的尺寸来源）
      const viewBox = svgElement.getAttribute(`viewBox`)
      let width: number
      let height: number

      if (viewBox) {
        const parts = viewBox.split(/\s+/)
        width = parseFloat(parts[2]) || 800
        height = parseFloat(parts[3]) || 600
      }
      else {
        const styleWidth = svgElement.style.width
        const styleHeight = svgElement.style.height
        width = parseFloat(styleWidth) || parseFloat(svgElement.getAttribute(`width`) || `800`)
        height = parseFloat(styleHeight) || parseFloat(svgElement.getAttribute(`height`) || `600`)
      }

      // 2x 分辨率（速度和质量的平衡）
      const scaleFactor = 2

      // 克隆 SVG 并设置明确尺寸
      const svgClone = svgElement.cloneNode(true) as SVGElement
      svgClone.setAttribute(`width`, String(width))
      svgClone.setAttribute(`height`, String(height))

      // 确保 viewBox 存在
      if (!svgClone.getAttribute(`viewBox`)) {
        svgClone.setAttribute(`viewBox`, `0 0 ${width} ${height}`)
      }

      // 序列化并创建 Data URL（避免 Blob URL 导致 canvas 被污染）
      const svgData = new XMLSerializer().serializeToString(svgClone)
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`

      document.body.removeChild(tempDiv)

      const img = new Image()
      img.onload = () => {
        // 创建高分辨率 Canvas
        const canvas = document.createElement(`canvas`)
        canvas.width = Math.round(width * scaleFactor)
        canvas.height = Math.round(height * scaleFactor)
        const ctx = canvas.getContext(`2d`, { alpha: false })

        if (!ctx) {
          reject(new Error(`无法获取canvas上下文`))
          return
        }

        // 白色背景
        ctx.fillStyle = `#ffffff`
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 高质量平滑
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = `high`

        // 绘制图像
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // 转换为最高质量 PNG
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          }
          else {
            reject(new Error(`Canvas toBlob失败`))
          }
        }, `image/png`, 1.0)
      }

      img.onerror = (error) => {
        reject(new Error(`SVG加载失败: ${error instanceof Error ? error.message : String(error)}`))
      }

      img.src = svgDataUrl
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
