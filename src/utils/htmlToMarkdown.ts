import TurndownService from 'turndown'

// 创建 TurndownService 实例并配置
const turndownService = new TurndownService({
  headingStyle: `atx`, // 标题格式，使用 # 号
  hr: `---`, // 分隔线格式
  bulletListMarker: `-`, // 无序列表标记
  codeBlockStyle: `fenced`, // 代码块格式
  emDelimiter: `*`, // 斜体格式
  strongDelimiter: `**`, // 粗体格式
  linkStyle: `inlined`, // 链接格式
  linkReferenceStyle: `full`, // 链接引用格式
})

// 添加自定义规则处理表格（包括有<th>和只有<td>的表格）
turndownService.addRule(`table`, {
  filter: `table`,
  replacement(_content, node) {
    const table = node as HTMLTableElement
    const rows = Array.from(table.rows)
    if (rows.length === 0)
      return _content

    let markdown = `\n\n`

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const cells = Array.from(row.cells)
      let rowContent = `|`

      // 处理每列
      for (let j = 0; j < cells.length; j++) {
        const cell = cells[j]
        const cellContent = (cell.textContent || ``).trim()
        rowContent += ` ${cellContent} |`
      }

      markdown += `${rowContent}\n`

      // 在第一行后添加分隔行，将第一行视为表头
      if (i === 0) {
        let separator = `|`
        for (let k = 0; k < cells.length; k++) {
          separator += ` --- |`
        }
        markdown += `${separator}\n`
      }
    }

    return `${markdown}\n`
  },
})

// 添加自定义规则来处理特殊HTML标签
turndownService.addRule(`pre`, {
  filter: `pre`,
  replacement(_content, node) {
    // 检查是否有代码块
    const codeElement = (node as HTMLElement).querySelector(`code`)
    if (codeElement) {
      const codeContent = codeElement.textContent || ``
      const language = codeElement.className || ``
      return `\n\`\`\`${language}\n${codeContent}\n\`\`\`\n`
    }
    return `\n\`\`\`\n${_content}\n\`\`\`\n`
  },
})

// 处理图片
turndownService.addRule(`img`, {
  filter: `img`,
  replacement(_content, node) {
    const img = node as HTMLImageElement
    const src = img.src || ``
    const alt = img.alt || ``
    const title = img.title || ``

    if (title) {
      return `![${alt}](${src} "${title}")`
    }
    return `![${alt}](${src})`
  },
})

// 处理 Mermaid 图表
turndownService.addRule(`mermaid`, {
  filter(node) {
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      return element.nodeName === `PRE`
        && element.classList
        && element.classList.contains(`mermaid`)
    }
    return node && node.nodeName === `PRE`
  },
  replacement(_content, node) {
    // 获取 pre 标签内的文本内容作为 mermaid 代码
    const mermaidCode = node.textContent || ``
    return `\n\`\`\`mermaid\n${mermaidCode.trim()}\n\`\`\`\n`
  },
})

/**
 * 将HTML内容转换为Markdown格式
 * @param html HTML字符串
 * @returns 转换后的Markdown字符串
 */
export function htmlToMarkdown(html: string): string {
  if (!html) {
    return ``
  }

  // 使用turndown服务转换HTML为Markdown
  let markdown = turndownService.turndown(html)

  // 进行额外的清理和格式化
  // 移除多余的空行
  markdown = markdown.replace(/\n\s*\n\s*\n/g, `\n\n`)

  // 确保两个段落之间有一个空行
  markdown = markdown.trim()

  return markdown
}

/**
 * 安全地转换HTML内容为Markdown，处理可能的错误
 * @param html HTML字符串
 * @returns 转换后的Markdown字符串
 */
export function safeHtmlToMarkdown(html: string): string {
  try {
    return htmlToMarkdown(html)
  }
  catch (error) {
    console.error(`HTML to Markdown conversion failed:`, error)
    // 如果转换失败，返回原始HTML或简单清理后的文本
    return html || ``
  }
}
