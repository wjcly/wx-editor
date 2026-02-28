// 高级语法模板
export const advancedTemplates = [
  {
    name: `表格语法`,
    content: `| 表头1 | 表头2 | 表头3 |\n|--------|--------|--------|\n| 单元格1 | 单元格2 | 单元格3 |\n| 单元格4 | 单元格5 | 单元格6 |\n\n| 左对齐 | 居中对齐 | 右对齐 |\n|:-------|:--------:|--------:|\n| 内容   |  内容   |   内容 |`,
  },
  {
    name: `列表语法`,
    content: `1. 有序列表项1\n2. 有序列表项2\n   1. 子列表项1\n   2. 子列表项2\n3. 有序列表项3\n\n- 无序列表项1\n- 无序列表项2\n  - 子列表项1\n  - 子列表项2\n- 无序列表项3`,
  },
  {
    name: `引用语法`,
    content: `> 这是一级引用\n>> 这是二级引用\n>>> 这是三级引用\n\n> 引用中使用列表\n> 1. 第一项\n> 2. 第二项\n> \n> 引用中使用代码块\n> \`\`\`javascript\n> console.log('Hello World')\n> \`\`\``,
  },
  {
    name: `代码语法`,
    content: `\`\`\`javascript\n// 这是一个代码块\nfunction hello() {\n  console.log('Hello World')\n}\n\`\`\`\n\n\`\`\`python\n# 这是一个Python代码块\ndef hello():\n    print('Hello World')\n\`\`\`\n\n\`\`\`css\n/* 这是一个CSS代码块 */\n.container {\n  display: flex;\n  justify-content: center;\n}\n\`\`\``,
  },
  {
    name: `链接与图片`,
    content: `### 基础图片\n![风景图片](./assets/images/example.png)\n\n### 带标题的图片\n![城市风光](./assets/images/example.png "这是一张城市风光图片")\n\n### 多张图片展示\n![自然风光1](./assets/images/example.png)\n![自然风光2](./assets/images/example.png)\n![自然风光3](./assets/images/example.png)\n\n### 引用式图片链接\n![引用图片1][pic1]\n![引用图片2][pic2]\n![引用图片3][pic3]\n\n[pic1]: ./assets/images/example.png\n[pic2]: ./assets/images/example.png "带标题的引用图片"\n[pic3]: ./assets/images/example.png\n\n### HTML方式（用于更精确的控制）\n<img src="./assets/images/example.png" alt="精确控制的图片" width="400" height="300" style="display: block; margin: 20px auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">`,
  },
  {
    name: `高级表格`,
    content: `| 功能 | 语法 | 效果 |\n|------|------|------|\n| 单元格跨行 | <td rowspan="2">跨两行</td> | 合并垂直单元格 |\n| 单元格跨列 | <td colspan="2">跨两列</td> | 合并水平单元格 |\n| 单元格样式 | <td style="color: red">红色文字</td> | 自定义样式 |\n| 表格标题 | <caption>表格标题</caption> | 添加标题 |`,
  },
  {
    name: `定义列表`,
    content: `<dl>\n  <dt>Markdown</dt>\n  <dd>一种轻量级标记语言，创始人为约翰·格鲁伯。</dd>\n  \n  <dt>HTML</dt>\n  <dd>超文本标记语言，用于创建网页。</dd>\n  \n  <dt>CSS</dt>\n  <dd>层叠样式表，用于设计网页样式。</dd>\n</dl>`,
  },
  {
    name: `脚注`,
    content: `这是一个带有脚注的文本\n\n这又是一个脚注\n\n: 这是第一个脚注的详细内容\n: 这是第二个脚注的详细内容，可以包含多行\n    缩进后可以包含更多内容`,
  },
  {
    name: `目录生成`,
    content: `[TOC]\n\n# 第一章\n## 1.1 节\n### 1.1.1 小节\n## 1.2 节\n\n# 第二章\n## 2.1 节\n## 2.2 节\n\n# 第三章`,
  },
  {
    name: `高级链接`,
    content: `[相对路径](./assets/images/example.png)\n[邮件链接](mailto:example@example.com)\n[电话链接](tel:+1234567890)\n\n<!-- 链接到文档内的标题 -->\n[跳转到简介](#简介)\n\n<!-- 链接到其他文档 -->\n[其他文档](document.md#章节)`,
  },
  {
    name: `键盘快捷键`,
    content: `加粗：<kbd>Ctrl</kbd> + <kbd>B</kbd>\n\n斜体：<kbd>Ctrl</kbd> + <kbd>I</kbd>\n\n删除线：<kbd>Ctrl</kbd> + <kbd>D</kbd>\n\n超链接：<kbd>Ctrl</kbd> + <kbd>K</kbd>\n\n行内代码：<kbd>Ctrl</kbd> + <kbd>E</kbd>\n\n格式化：<kbd>Alt</kbd> + <kbd>Shift</kbd>\n\n新建文章：<kbd>Ctrl</kbd> + <kbd>Alt</kbd>\n\n保存：<kbd>Ctrl</kbd> + <kbd>S</kbd>\n\n全选：<kbd>Ctrl</kbd> + <kbd>A</kbd>\n\n撤销：<kbd>Ctrl</kbd> + <kbd>Z</kbd>\n\n重做：<kbd>Ctrl</kbd> + <kbd>Y</kbd>\n\n查找：<kbd>Ctrl</kbd> + <kbd>F</kbd>\n\n复制：<kbd>Ctrl</kbd> + <kbd>C</kbd>\n\n粘贴：<kbd>Ctrl</kbd> + <kbd>V</kbd>`,
  },
]
