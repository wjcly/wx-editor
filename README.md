# WeChat Markdown Editor

一款**完全本地化**的 Markdown 编辑器，专注微信公众号文章编辑、排版和发布

## 🌟 核心特性

### 🔒 完全本地存储
- **零服务器依赖** - 纯前端应用，无需后端服务
- **localStorage** - 存储编辑器配置、文章列表、样式设置
- **IndexedDB** - 存储 AI 聊天会话历史、自定义提示词
- **数据隐私** - 所有数据保存在浏览器本地，不会上传到任何服务器

### 🤖 AI 智能助手

强大的 AI 对话系统，支持多轮对话和上下文理解：

- **多配置管理** - 支持配置多个 AI 服务提供商（OpenAI、DeepSeek、通义千问、智谱 AI、NVIDIA 等）
- **多轮对话** - 完整的对话历史管理，支持创建多个会话、切换会话、删除会话
- **提示词系统** 
  - 内置丰富的高质量提示词模板（写作、润色、代码、翻译等）
  - 支持自定义提示词，分类管理
  - 提示词支持标签搜索
- **引用来源** - 支持添加引用来源，让 AI 回答更准确
- **深度思考模式** - 降低温度参数获得更一致的回答
- **对话管理**
  - 导出对话为图片
  - 复制单条消息
  - 编辑消息重新提问
  - 批量选择消息
- **预设词功能** - 支持设置系统级预设词，影响 AI 回答风格

### 📝 编辑功能

- **CodeMirror 5 编辑器** - 流畅的 Markdown 编辑体验
- **实时预览** - Markdown 渲染预览，支持同步/异步滚动
- **样式定制**
  - 多种文本主题
  - 自定义字体、字号、主色
  - 代码块主题选择
  - 自定义 CSS 编辑器，支持多方案管理
- **模板系统**
  - 标题样式模板
  - 内容样式模板
  - 布局模板
  - 图表模板（Mermaid）
  - 微信文章模板

### 📦 微信公众号集成

- **图片上传** - 直接上传到微信服务器，不占用素材库限额
- **素材库管理** - 浏览和管理微信素材库（图片、音频、视频）
- **草稿管理** - 保存草稿到微信、获取草稿列表、编辑草稿
- **一键发布** - 直接发布到微信公众号
- **文章导入** - 通过链接导入公众号文章到本地编辑

### 📤 导出功能

- **Markdown** - 导出源文件
- **HTML** - 导出格式化后的 HTML
- **长图** - 导出文章/AI对话为 PNG 长图


## 🛠️ 技术栈

- **框架**: Vue 3.5 + TypeScript
- **构建**: Vite 5
- **状态管理**: Pinia + @vueuse/core
- **编辑器**: CodeMirror 5
- **Markdown**: Marked
- **UI**: UnoCSS + TailwindCSS + Radix Vue
- **图表**: Chart.js + Mermaid
- **数学公式**: MathJax
- **代码高亮**: Highlight.js
- **本地存储**: localStorage + IndexedDB

## 🚀 快速开始

### 环境要求

- Node.js >= 20
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

启动后访问：http://127.0.0.1:5173/md/

### 构建

```bash
npm run build
```

### 预览

```bash
npm run preview
```

## ⚙️ 配置说明

### 微信公众号配置

配置后可使用图片上传、素材库、草稿管理、发布功能：

1. 公众号 AppID
2. 公众号 AppSecret  
3. 代理地址（注意cors及微信ip白名单）

### AI 配置

支持配置多个 AI 服务：

- 配置名称
- API Domain（支持自定义接口地址，也需要注意有cors，实测通义千问无需额外配置，NVIDIA则需要配置cors）
- API Key
- 模型名称
- 温度参数（0-1）
- 最大 Token 数

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

Apache License 2.0

## 📮 联系方式

- **GitHub**: [wjcly/wx-editor](https://github.com/wjcly/wx-editor)
- **问题反馈**: [GitHub Issues](https://github.com/wjcly/wx-editor/issues)
