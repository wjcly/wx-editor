import * as beautify from 'js-beautify'

/**
 * HTML格式化选项接口
 */
export interface HtmlBeautifyOptions {
  /**
   * 缩进空格数，默认为4
   */
  indent_size?: number
  /**
   * 缩进字符，默认为空格
   */
  indent_char?: string
  /**
   * 最大行长度，默认为无穷大
   */
  wrap_line_length?: number
  /**
   * 是否保留注释
   */
  preserve_newlines?: boolean
  /**
   * 最大连续换行数
   */
  max_preserve_newlines?: number
  /**
   * 是否缩进&lt;head&gt;和&lt;body&gt;标签内的元素
   */
  indent_inner_html?: boolean
  /**
   * 是否换行空元素标签，如&lt;br /&gt;
   */
  end_with_newline?: boolean
  /**
   * 是否允许在属性值周围使用引号
   */
  unformatted?: string[]
  /**
   * 不缩进的内容标签
   */
  content_unformatted?: string[]
  /**
   * 是否在开始标签后插入换行
   */
  indent_scripts?: `keep` | `separate` | `normal`
  /**
   * 是否在结束标签前插入换行
   */
  extra_liners?: string[]
}

/**
 * 默认HTML格式化选项
 */
const defaultOptions: HtmlBeautifyOptions = {
  indent_size: 2,
  indent_char: ` `,
  wrap_line_length: 120,
  preserve_newlines: true,
  max_preserve_newlines: 2,
  indent_inner_html: false,
  end_with_newline: false,
  unformatted: [`code`, `pre`, `em`, `strong`, `span`],
  content_unformatted: [`script`, `style`, `pre`, `code`],
  indent_scripts: `normal`,
  extra_liners: [`head`, `body`, `/html`],
}

/**
 * 格式化HTML内容
 * @param html - 需要格式化的HTML字符串
 * @param options - 可选的格式化选项
 * @returns 格式化后的HTML字符串
 */
export function formatHtml(html: string, options?: HtmlBeautifyOptions): string {
  if (!html) {
    return ``
  }

  try {
    // 合并用户提供的选项与默认选项
    const mergedOptions = { ...defaultOptions, ...options }

    // 使用js-beautify库格式化HTML
    return beautify.html(html, mergedOptions)
  }
  catch (error) {
    console.error(`HTML formatting failed:`, error)
    // 如果格式化失败，返回原始HTML
    return html
  }
}

/**
 * 格式化HTML内容的安全版本，包含错误处理
 * @param html - 需要格式化的HTML字符串
 * @param options - 可选的格式化选项
 * @returns Promise&lt;string&gt; - 返回格式化后的HTML字符串
 */
export async function safeFormatHtml(html: string, options?: HtmlBeautifyOptions): Promise<string> {
  return new Promise((resolve) => {
    try {
      const formatted = formatHtml(html, options)
      resolve(formatted)
    }
    catch (error) {
      console.error(`Safe HTML formatting failed:`, error)
      resolve(html) // 返回原始HTML而非抛出错误
    }
  })
}

/**
 * 预设格式化选项 - 紧凑模式
 */
export const compactOptions: HtmlBeautifyOptions = {
  indent_size: 2,
  indent_char: ` `,
  wrap_line_length: 0,
  preserve_newlines: false,
  max_preserve_newlines: 0,
  indent_inner_html: false,
  end_with_newline: false,
  unformatted: [`code`, `pre`, `em`, `strong`, `span`],
  content_unformatted: [`script`, `style`, `pre`, `code`],
  indent_scripts: `normal`,
  extra_liners: [],
}

/**
 * 预设格式化选项 - 详细模式
 */
export const verboseOptions: HtmlBeautifyOptions = {
  indent_size: 4,
  indent_char: ` `,
  wrap_line_length: 120,
  preserve_newlines: true,
  max_preserve_newlines: 2,
  indent_inner_html: true,
  end_with_newline: true,
  unformatted: [`code`, `pre`, `em`, `strong`, `span`],
  content_unformatted: [`script`, `style`, `pre`, `code`],
  indent_scripts: `separate`,
  extra_liners: [`head`, `body`, `/html`, `div`, `section`, `article`],
}
