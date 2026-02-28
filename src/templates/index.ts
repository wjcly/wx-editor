import { advancedTemplates } from './advanced'
import { basicTemplates } from './basic'
import { chartTemplates } from './charts'
import { contentStyleTemplates } from './contentStyles'
import { imageContentTemplates } from './imageContent'
import { layoutTemplates } from './layout'
import { titleStyleTemplates } from './titleStyles'
import { wechatTemplates } from './wechat'

// 导出所有模板
export const templates = {
  basic: {
    title: `基础语法`,
    items: basicTemplates,
  },
  advanced: {
    title: `高级语法`,
    items: advancedTemplates,
  },
  wechat: {
    title: `公众号模板`,
    items: wechatTemplates,
  },
  layout: {
    title: `布局模板`,
    items: layoutTemplates,
  },
  charts: {
    title: `图表模板`,
    items: chartTemplates,
  },
  titleStyles: {
    title: `标题样式`,
    items: titleStyleTemplates,
  },
  contentStyles: {
    title: `文字样式`,
    items: contentStyleTemplates,
  },
  imageContent: {
    title: `图文样式`,
    items: imageContentTemplates,
  },
  // ... 其他分类模板
}

// 导出模板类型
export interface Template {
  name: string
  content: string
}

export interface TemplateCategory {
  title: string
  items: Template[]
}

export interface Templates {
  [key: string]: TemplateCategory
}
