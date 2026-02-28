import { BorderStyle, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx'
import { marked } from 'marked'

interface WordExportOptions {
  title?: string
  author?: string
  subject?: string
}

export async function exportToWord(markdown: string, options: WordExportOptions = {}) {
  try {
    // 解析 Markdown 为 HTML，使用同步方法
    const html = marked.parse(markdown, { async: false }) as string

    // 创建文档
    const doc = new Document({
      sections: [{
        properties: {},
        children: parseHtmlToDocxElements(html),
      }],
    })

    // 生成 Word 文档
    const buffer = await Packer.toBlob(doc)
    const url = window.URL.createObjectURL(buffer)
    const link = document.createElement(`a`)
    link.href = url
    link.download = `${options.title || `markdown_export`}_${Date.now()}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
  catch (error) {
    console.error(`导出 Word 文档失败:`, error)
    throw error
  }
}

// 处理表情符号
function processEmoji(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}\u{2600}-\u{26FF}]/gu, (match) => {
    return ` [${match}] `
  })
}

// 处理图表的函数
function processChart(element: Element): Paragraph[] {
  const paragraphs: Paragraph[] = []

  // 添加图表标题
  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: `[图表]`, bold: true })],
    spacing: { before: 200, after: 100 },
    alignment: `center`,
  }))

  // 如果有图表说明，添加说明文字
  const caption = element.getAttribute(`data-caption`) || element.getAttribute(`alt`)
  if (caption) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: caption, italics: true })],
      spacing: { before: 100, after: 200 },
      alignment: `center`,
    }))
  }

  return paragraphs
}

function parseHtmlToDocxElements(html: string) {
  const div = document.createElement(`div`)
  div.innerHTML = html
  const elements: any[] = []

  // 递归处理 HTML 元素
  function processElement(element: Element) {
    let code, rows, headerRow, bodyRows

    switch (element.tagName.toLowerCase()) {
      case `h1`:
        elements.push(new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: processEmoji(element.textContent || ``), size: 36, bold: true })],
          spacing: { before: 400, after: 200 },
          alignment: `center`,
        }))
        break
      case `h2`:
        elements.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: processEmoji(element.textContent || ``), size: 32, bold: true })],
          spacing: { before: 300, after: 150 },
        }))
        break
      case `h3`:
        elements.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: processEmoji(element.textContent || ``), size: 28, bold: true })],
          spacing: { before: 200, after: 100 },
        }))
        break
      case `p`:
        if (element.querySelector(`img`)) {
          // 处理图片段落
          const img = element.querySelector(`img`)
          if (img) {
            // 检查是否为图表（通过类名或其他属性判断）
            if (img.classList.contains(`chart`) || img.getAttribute(`data-type`) === `chart`) {
              elements.push(...processChart(img))
            }
            else {
              elements.push(new Paragraph({
                children: [new TextRun({ text: `[图片] ${img.alt || ``}`, italics: true })],
                spacing: { before: 100, after: 100 },
                alignment: `center`,
              }))
            }
          }
        }
        else {
          // 普通段落，处理表情符号
          elements.push(new Paragraph({
            children: [new TextRun({ text: processEmoji(element.textContent || ``) })],
            spacing: { before: 100, after: 100 },
          }))
        }
        break
      case `ul`:
      case `ol`:
        Array.from(element.children).forEach((li, index) => {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: element.tagName === `ol` ? `${index + 1}. ` : `• `,
                bold: true,
              }),
              new TextRun(processEmoji(li.textContent || ``)),
            ],
            indent: { left: 720, hanging: 360 },
            spacing: { before: 60, after: 60 },
          }))
        })
        break
      case `blockquote`:
        elements.push(new Paragraph({
          children: [new TextRun({ text: processEmoji(element.textContent || ``), italics: true })],
          indent: { left: 720 },
          spacing: { before: 200, after: 200 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 12, color: `666666` },
          },
          shading: { type: `solid`, fill: `F5F5F5` },
        }))
        break
      case `pre`:
        code = element.querySelector(`code`)
        elements.push(new Paragraph({
          children: [new TextRun({
            text: code ? code.textContent || `` : element.textContent || ``,
            font: `Consolas`,
            size: 20,
          })],
          spacing: { before: 200, after: 200 },
          shading: { type: `solid`, fill: `F8F8F8` },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
            left: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
            right: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
          },
        }))
        break
      case `table`:
        rows = []
        headerRow = element.querySelector(`thead tr`)
        if (headerRow) {
          rows.push(new TableRow({
            children: Array.from(headerRow.children).map(cell => new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: processEmoji(cell.textContent || ``), bold: true })],
              })],
              shading: { type: `solid`, fill: `F0F0F0` },
            })),
          }))
        }
        bodyRows = element.querySelectorAll(`tbody tr`)
        bodyRows.forEach((row) => {
          rows.push(new TableRow({
            children: Array.from(row.children).map(cell => new TableCell({
              children: [new Paragraph({
                children: [new TextRun(processEmoji(cell.textContent || ``))],
              })],
            })),
          }))
        })
        elements.push(new Table({
          rows,
          width: {
            size: 100,
            type: `pct`,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
            left: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
            right: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
          },
        }))
        break
      case `hr`:
        elements.push(new Paragraph({
          children: [],
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: `DDDDDD` },
          },
          spacing: { before: 200, after: 200 },
        }))
        break
      default:
        // 递归处理子元素
        Array.from(element.children).forEach(child => processElement(child))
    }
  }

  Array.from(div.children).forEach(child => processElement(child))
  return elements
}
