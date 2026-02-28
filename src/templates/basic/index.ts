// 基础模板
export const basicTemplates = [
  {
    name: `标题语法`,
    content: `# 一级标题\n## 二级标题\n### 三级标题\n#### 四级标题\n##### 五级标题\n###### 六级标题\n\n标题语法替代写法：\n一级标题\n=========\n\n二级标题\n---------`,
  },
  {
    name: `文本格式化`,
    content: `**粗体文本**\n*斜体文本*\n***粗斜体文本***\n~~删除线文本~~`,
  },
  {
    name: `段落与换行`,
    content: `这是第一段落。\n\n这是第二段落。\n\n在行末加两个空格  \n可以实现段内换行。\n\n使用 HTML 的 <br> 标签也可以换行。\n<br>就像这样。\n\n---\n\n可以使用三个或更多的 - 或 * 或 _ 来创建分隔线：\n\n***\n\n___`,
  },
  {
    name: `文本对齐`,
    content: `<section style="text-align: left;">左对齐文本</section>\n<section style="text-align: center;">居中对齐文本</section>\n<section style="text-align: right;">右对齐文本</section>\n<section style="text-align: justify; text-indent: 0;">两端对齐文本，这是一段很长的文本用来演示两端对齐的效果。这是一段很长的文本用来演示两端对齐的效果。</section>`,
  },
  {
    name: `字体样式`,
    content: `<font color="red">红色文字</font>\n\n<font color="#00ff00">使用十六进制颜色</font>\n\n<font size="5">大号文字</font>\n\n<font face="黑体">黑体字</font>\n\n<font face="微软雅黑" color="#ff0000" size="4">组合使用</font>`,
  },
  {
    name: `空格缩进`,
    content: `&nbsp;首行缩进一个空格\n<p style="text-indent: 2em">首行缩进两个空格</p>\n\n这是普通段落\n&nbsp;&nbsp;&nbsp;&nbsp;这是缩进的段落\n\n<p style="text-indent: 2em">使用样式实现首行缩进</p>`,
  },
  {
    name: `特殊符号`,
    content: `版权符号：<p>版权：©\n注册商标：®\n商标：™ \n货币：€ £ ¥\n运算符：× ÷ °\n单位：m<sup>2</sup>、m<sup>3</sup>\n箭头：← ↑ → ↓ ↔</p>`,
  },
  {
    name: `注释说明`,
    content: `<!-- 这是一个注释，不会显示在渲染后的文档中 -->\n\n这是正常显示的文本\n\n<!--\n这是多行注释\n可以包含多行内容\n都不会显示\n-->\n\n这也是正常显示的文本`,
  },
  {
    name: `转义字符`,
    content: `\\* 星号\n\\_ 下划线\n\\{ 花括号\n\\} 花括号\n\\[ 方括号\n\\] 方括号\n\\( 小括号\n\\) 小括号\n\\# 井号\n\\+ 加号\n\\- 减号\n\\. 点号\n\\! 感叹号\n\\~ 波浪线\n\\\\ 反斜线`,
  },
  {
    name: `铺满表格`,
    content: `<table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold;">左对齐表头</th>
          <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">居中对齐表头</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">右对齐表头</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: left;">单元格1内容</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">单元格2内容</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">单元格3内容</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: left;">单元格4内容</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">单元格5内容</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">单元格6内容</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: left;">这是一个较长的左对齐单元格内容示例</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">居中内容</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">右侧内容</td>
        </tr>
      </tbody>
    </table>`,
  },
  {
    name: `数学公式`,
    content: `行内公式：$E = mc^2$\n\n独立公式：\n$$\\sum_{i=1}^n a_i=0$$\n\n$$f(x_1,x_x,\\ldots,x_n) = x_1^2 + x_2^2 + \\cdots + x_n^2$$\n\n$$\\displaystyle \\frac{1}{\\Bigl(\\sqrt{\\phi \\sqrt{5}}-\\phi\\Bigr) e^{\\frac25 \\pi}} = 1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}} {1+\\frac{e^{-8\\pi}} {1+\\cdots}}}}$$`,
  },
]
