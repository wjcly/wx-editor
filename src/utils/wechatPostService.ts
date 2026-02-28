import { getApiConfig } from '@/config/apiConfig'
import fetch, { axiosInstance as service } from '@/utils/fetch'
import { sanitizeForWechat } from '@/utils/styleSanitize'
import { replaceProxyUrlsWithOriginal } from '@/utils/urlUtils'

export interface WechatTokenResponse {
  access_token: string
  expires_in: number
  errcode: number
  errmsg: string
}

export interface WechatDraftResponse {
  media_id: string
  errcode: number
  errmsg: string
}

export interface WechatPublishResponse {
  errcode: number
  errmsg: string
}

export interface WechatImageUploadResponse {
  url: string
  errcode: number
  errmsg: string
}

export interface WechatMaterialUploadResponse {
  media_id: string
  url: string
  errcode: number
  errmsg: string
}

export class WechatPostService {
  /**
   * 获取微信access_token
   * @param appID 公众号appid
   * @param appsecret 公众号密钥
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns access_token
   */
  static async getAccessToken(appID: string, appsecret: string, proxyOrigin?: string): Promise<string> {
    // 检查本地存储是否有有效的token
    const data = localStorage.getItem(`mpToken:${appID}`)
    if (data) {
      const token = JSON.parse(data)
      if (token.expire && token.expire > new Date().getTime()) {
        return token.access_token
      }
    }

    // 构造GET请求参数
    const params = new URLSearchParams({
      grant_type: `client_credential`,
      appid: appID,
      secret: appsecret,
    })

    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/token?${params.toString()}`

    const requestOptions = {
      method: `GET`,
    }

    const res = await fetch<any, WechatTokenResponse>(url, requestOptions)
    if (res.access_token) {
      const tokenInfo = {
        ...res,
        expire: new Date().getTime() + res.expires_in * 1000,
      }
      localStorage.setItem(`mpToken:${appID}`, JSON.stringify(tokenInfo))
      return res.access_token
    }
    return ``
  }

  /**
   * 上传图片到微信素材库
   * @param accessToken 微信access_token
   * @param file 图片文件
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns 图片URL
   */
  static async uploadImage(
    accessToken: string,
    file: File,
    proxyOrigin?: string,
  ): Promise<string> {
    const formdata = new FormData()
    formdata.append(`media`, file, file.name)

    const requestOptions = {
      method: `POST`,
      data: formdata,
    }

    // 如果配置了全局代理域名且不是空字符串，则使用代理
    const useProxy = proxyOrigin && proxyOrigin.trim() !== ``
    const baseUrl = useProxy ? proxyOrigin : getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/material/add_material?access_token=${accessToken}&type=image`

    const res = await fetch<any, WechatImageUploadResponse>(url, requestOptions)

    if (!res.url) {
      throw new Error(res.errmsg || `上传图片失败`)
    }

    let imageUrl = res.url
    // 只有在使用代理且是网站部署时才使用 wsrv.nl
    if (useProxy && window.location.href.startsWith(`http`)) {
      imageUrl = `https://wsrv.nl?url=${encodeURIComponent(imageUrl)}`
    }

    return imageUrl
  }

  /**
   * 上传封面图片到微信素材库并获取media_id
   * @param accessToken 微信access_token
   * @param file 图片文件
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns media_id
   */
  static async uploadThumbImage(
    accessToken: string,
    file: File,
    proxyOrigin?: string,
  ): Promise<string> {
    const formdata = new FormData()
    formdata.append(`media`, file, file.name)

    const requestOptions = {
      method: `POST`,
      data: formdata,
    }

    // 如果配置了全局代理域名且不是空字符串，则使用代理
    const useProxy = proxyOrigin && proxyOrigin.trim() !== ``
    const baseUrl = useProxy ? proxyOrigin : getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/material/add_material?access_token=${accessToken}&type=image`

    const res = await fetch<any, WechatMaterialUploadResponse>(url, requestOptions)

    if (!res.media_id) {
      throw new Error(res.errmsg || `上传封面图片失败`)
    }

    return res.media_id
  }

  /**
   * 保存草稿
   * @param accessToken 微信access_token
   * @param article 文章内容
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns 草稿media_id
   */
  static async saveDraft(
    accessToken: string,
    article: any,
    proxyOrigin?: string,
  ): Promise<WechatDraftResponse> {
    // 处理文章内容，将代理 URL 替换为原始 URL
    let processedContent = replaceProxyUrlsWithOriginal(article.content)

    // 清理样式以适配微信兼容性
    processedContent = sanitizeForWechat(processedContent)

    // 构造请求数据
    const requestData = {
      articles: [{
        title: article.title,
        author: article.author,
        digest: article.digest,
        content: processedContent, // 使用处理后的内容
        content_source_url: ``, // 原文链接
        thumb_media_id: article.thumbMediaId,
        need_open_comment: article.needOpenComment ? 1 : 0,
        only_fans_can_comment: article.onlyFansCanComment ? 1 : 0,
      }],
    }

    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/draft/add?access_token=${accessToken}`

    const requestOptions = {
      method: `POST`,
      data: requestData,
    }

    return await fetch<any, WechatDraftResponse>(url, requestOptions)
  }

  /**
   * 发布草稿
   * @param accessToken 微信access_token
   * @param mediaId 草稿media_id
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns 发布结果
   */

  static async publishDraft(
    accessToken: string,
    mediaId: string,
    proxyOrigin?: string,
  ): Promise<WechatPublishResponse> {
    const requestData = {
      media_id: mediaId,
    }

    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/freepublish/submit?access_token=${accessToken}`

    const requestOptions = {
      method: `POST`,
      data: requestData,
    }

    const result = await fetch<any, WechatPublishResponse>(url, requestOptions)

    // 检查是否有错误码
    if (result.errcode && result.errcode !== 0) {
      console.error(`发布草稿接口返回错误:`, result.errcode, result.errmsg)

      // 针对未认证公众号的错误进行特殊处理
      if (result.errcode === 48001) {
        console.error(`当前公众号未认证，无法使用发布功能。请使用已认证的服务号或订阅号。`)
      }
    }

    return result
  }

  /**
   * 获取草稿列表
   * @param accessToken 微信access_token
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @param offset 偏移量
   * @param count 数量
   * @returns 草稿列表
   */
  static async getDrafts(
    accessToken: string,
    proxyOrigin?: string,
    offset: number = 0,
    count: number = 10,
    noContent: boolean = true, // 添加no_content参数，默认为true
  ): Promise<any> {
    const requestData = {
      offset,
      count,
      no_content: noContent ? 1 : 0, // 添加no_content字段
    }

    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/draft/batchget?access_token=${accessToken}`

    const requestOptions = {
      method: `POST`,
      data: requestData,
    }

    const response = await fetch(url, requestOptions)
    console.log(`微信草稿列表接口原始响应:`, response)
    return response
  }

  /**
   * 获取草稿详情
   * @param accessToken 微信access_token
   * @param mediaId 草稿media_id
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns 草稿详情
   */
  static async getDraft(
    accessToken: string,
    mediaId: string,
    proxyOrigin?: string,
  ): Promise<any> {
    const requestData = {
      media_id: mediaId,
    }

    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/draft/get?access_token=${accessToken}`

    const requestOptions = {
      method: `POST`,
      data: requestData,
    }

    return await fetch(url, requestOptions)
  }

  /**
   * 删除草稿
   * @param accessToken 微信access_token
   * @param mediaId 草稿media_id
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns 删除结果
   */
  static async deleteDraft(
    accessToken: string,
    mediaId: string,
    proxyOrigin?: string,
  ): Promise<any> {
    const requestData = {
      media_id: mediaId,
    }

    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/draft/delete?access_token=${accessToken}`

    const requestOptions = {
      method: `POST`,
      data: requestData,
    }

    return await fetch(url, requestOptions)
  }

  /**
   * 批量获取素材列表
   * @param accessToken 微信access_token
   * @param type 素材类型(image/voice/video/news)
   * @param offset 偏移量
   * @param count 数量
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns 素材列表
   */
  static async batchGetMaterials(
    accessToken: string,
    type: string,
    offset: number = 0,
    count: number = 20,
    proxyOrigin?: string,
  ): Promise<any> {
    const requestData = {
      type,
      offset,
      count,
    }

    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/material/batchget_material?access_token=${accessToken}`

    const requestOptions = {
      method: `POST`,
      data: requestData,
    }

    return await fetch(url, requestOptions)
  }

  /**
   * 获取永久素材信息（JSON格式）
   * @param accessToken 微信access_token
   * @param mediaId 素材media_id
   * @param proxyOrigin 代理域名
   * @returns 素材信息
   */
  static async getMaterial(
    accessToken: string,
    mediaId: string,
    proxyOrigin?: string,
  ): Promise<any> {
    const requestData = {
      media_id: mediaId,
    }

    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/material/get_material?access_token=${accessToken}`

    const requestOptions = {
      method: `POST`,
      data: requestData,
    }

    return await fetch(url, requestOptions)
  }

  /**
   * 获取永久素材信息（Blob格式）
   * @param accessToken 微信access_token
   * @param mediaId 素材media_id
   * @param proxyOrigin 代理域名
   * @returns 素材二进制数据或错误信息
   */
  static async getBlobMaterial(
    accessToken: string,
    mediaId: string,
    proxyOrigin?: string,
  ): Promise<Blob> {
    const requestData = {
      media_id: mediaId,
    }
    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/material/get_material?access_token=${accessToken}`
    const response = await service.post(url, requestData, {
      responseType: `blob`,
    })
    return response.data
  }

  /**
   * 上传素材到微信素材库
   * @param accessToken 微信access_token
   * @param file 文件
   * @param type 素材类型(image/voice/video/thumb)
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns media_id
   */
  static async uploadMaterial(
    accessToken: string,
    file: File,
    type: string,
    proxyOrigin?: string,
  ): Promise<string> {
    const formdata = new FormData()
    formdata.append(`media`, file, file.name)

    // 仅视频需要额外参数
    if (type === `video`) {
      formdata.append(`description`, JSON.stringify({
        title: file.name,
        introduction: ``,
      }))
    }

    // 构建 URL
    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/material/add_material?access_token=${accessToken}&type=${type}`

    const res = await fetch<any, WechatMaterialUploadResponse>(url, {
      method: `POST`,
      data: formdata,
    })

    if (!res.media_id) {
      throw new Error(res.errmsg || `上传${type}素材失败`)
    }

    return res.media_id
  }

  /**
   * 上传图片接口（不占用素材库数量限制）
   * @param accessToken 微信access_token
   * @param file 图片文件（仅支持jpg/png格式，大小必须在1MB以下）
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns 图片URL
   */
  static async uploadImageNoLimit(
    accessToken: string,
    file: File,
    proxyOrigin?: string,
  ): Promise<string> {
    // 验证文件格式
    const allowedTypes = [`image/jpeg`, `image/png`, `image/jpg`]
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`仅支持 JPG/PNG 格式图片`)
    }

    // 验证文件大小（必须在1MB以下）
    const maxSize = 1024 * 1024 // 1MB
    if (file.size > maxSize) {
      throw new Error(`图片大小必须在1MB以下，当前文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    }

    const formdata = new FormData()
    formdata.append(`media`, file, file.name)

    const requestOptions = {
      method: `POST`,
      data: formdata,
    }

    // 如果配置了全局代理域名且不是空字符串，则使用代理
    const useProxy = proxyOrigin && proxyOrigin.trim() !== ``
    const baseUrl = useProxy ? proxyOrigin : getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/media/uploadimg?access_token=${accessToken}`

    const res = await fetch<any, WechatImageUploadResponse>(url, requestOptions)

    if (!res.url) {
      throw new Error(res.errmsg || `上传图片失败`)
    }

    let imageUrl = res.url
    // 只有在使用代理且是网站部署时才使用 wsrv.nl
    if (useProxy && window.location.href.startsWith(`http`)) {
      imageUrl = `https://wsrv.nl?url=${encodeURIComponent(imageUrl)}`
    }

    return imageUrl
  }

  /**
   * 更新草稿
   * @param accessToken 微信access_token
   * @param mediaId 草稿media_id
   * @param article 要更新的文章内容
   * @param index 要更新的草稿的第几篇文章（多图文时用，默认为0）
   * @param proxyOrigin 代理域名（可选，如果提供则覆盖默认配置）
   * @returns 更新结果
   */
  static async updateDraft(
    accessToken: string,
    mediaId: string,
    article: any,
    index: number = 0,
    proxyOrigin?: string,
  ): Promise<WechatDraftResponse> {
    // 处理文章内容，将代理 URL 替换为原始 URL
    let processedContent = replaceProxyUrlsWithOriginal(article.content)

    // 清理样式以适配微信兼容性
    processedContent = sanitizeForWechat(processedContent)

    // 构造请求数据
    const requestData = {
      media_id: mediaId,
      index,
      articles: {
        title: article.title,
        author: article.author,
        digest: article.digest,
        content: processedContent, // 使用处理后的内容
        content_source_url: ``, // 原文链接
        thumb_media_id: article.thumbMediaId,
        need_open_comment: article.needOpenComment ? 1 : 0,
        only_fans_can_comment: article.onlyFansCanComment ? 1 : 0,
      },
    }

    const baseUrl = proxyOrigin?.trim() || getApiConfig().wechatApiBaseUrl
    const url = `${baseUrl}/cgi-bin/draft/update?access_token=${accessToken}`

    const requestOptions = {
      method: `POST`,
      data: requestData,
    }

    return await fetch<any, WechatDraftResponse>(url, requestOptions)
  }
}
