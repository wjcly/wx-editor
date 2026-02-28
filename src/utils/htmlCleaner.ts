/**
 * 清理编辑器产生的多余HTML结构
 * 特别针对ProseMirror等编辑器产生的额外包装元素和空列表项
 *
 * @param content 需要清理的HTML内容
 * @returns 清理后的HTML内容
 */
export function cleanEditorHtml(content: string): string {
  if (!content)
    return content

  let result = content

  // 移除ProseMirror的拖尾换行标记
  result = result.replace(/<br class="ProseMirror-trailingBreak">/g, ``)

  // 移除空的列表项，特别是那些仅包含section和span结构的
  result = result.replace(/<li[^>]*>\s*<section[^>]*>\s*<span[^>]*>\s*<\/span>\s*<\/section>\s*<\/li>/gi, ``)

  // 移除空的列表项，特别是那些仅包含换行或空白的
  result = result.replace(/<li[^>]*>\s*<section[^>]*>\s*<span[^>]*>\s*<br[^>]*>\s*<\/span>\s*<\/section>\s*<\/li>/gi, ``)

  // 清理li标签内的多余section和span包装，保留实际内容
  result = result.replace(
    /<li([^>]*)>\s*<section[^>]*>\s*<span[^>]*>([^<]*(?:<.*?)??)<\/span>\s*<\/section>\s*<\/li>/gi,
    `<li$1>$2</li>`,
  )

  // 清理多个连续空白行
  result = result.replace(/(<li[^>]*>)\s*(<section|<span)/gi, `$1`)
  result = result.replace(/(\/span>\s*|\/section>\s*)<\/li>/gi, `</li>`)

  // 移除多余的空格和换行，但保留必要的HTML结构
  result = result.replace(/[ \t\n\r\f\v]+</g, `<`) // 移除标签前的空白 (replaced \s+ with specific whitespace chars to prevent backtracking)
  result = result.replace(/>[ \t\n\r\f\v]+/g, `>`) // 移除标签后的空白 (replaced \s+ with specific whitespace chars to prevent backtracking)

  // 确保列表结构完整，移除空列表项
  result = result.replace(/<li[^>]*><\/li>/g, ``)

  // 再次清理可能残留的多余空白
  result = result.replace(/<li[^>]*>\s*<\/li>/g, ``)

  // 确保列表项之间没有多余的空列表项 - 分步骤处理避免复杂的量词嵌套
  result = result.replace(/(<ul[^>]*>|<ol[^>]*>)\s*(<li[^>]*><\/li>\s*)+(?=<li)/g, (listTag) => {
    return listTag // 返回列表开始标签，去掉后续的空列表项直到遇到非空项
  })

  // 处理连续空列表项的另一种情况
  result = result.replace(/(<\/li>)\s*(<li[^>]*><\/li>\s*)+(?=<li)/g, `$1`)

  return result
}
