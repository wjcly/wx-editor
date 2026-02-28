// 文章分组枚举
export enum PostGroup {
  DEFAULT = `default`,
  WECHAT = `wechat`,
}

// 基础文章类型
export interface Post {
  id?: string
  title: string
  content: string
  group?: PostGroup
  // 可选的微信相关属性，WechatDraft 会提供这些属性
  mediaId?: string
  author?: string
  digest?: string
  thumbMediaId?: string
  needOpenComment?: boolean
  onlyFansCanComment?: boolean
  updateTime?: number
}

// 微信草稿类型
export interface WechatDraft extends Post {
  mediaId?: string
  author?: string
  digest?: string
  thumbMediaId?: string
  needOpenComment?: boolean
  onlyFansCanComment?: boolean
  updateTime?: number
}

// 微信草稿表单数据
export interface WechatDraftForm {
  title: string
  author: string
  digest: string
  content: string
  thumbMediaId: string
  needOpenComment: boolean
  onlyFansCanComment: boolean
}

// Tab配置接口
export interface TabConfig {
  name: string
  groupName: PostGroup
  getArticles: () => (Post | WechatDraft)[]
  searchArticles: (query: string) => (Post | WechatDraft)[]
  switchArticle: (post: Post | WechatDraft) => void
  hasNextPage: () => boolean
  hasPrevPage: () => boolean
  nextPage: () => void
  prevPage: () => void
}
