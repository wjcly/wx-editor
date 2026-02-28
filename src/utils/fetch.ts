import axios from 'axios'
import { getApiConfig } from '@/config/apiConfig'

// 获取当前API配置
const apiConfig = getApiConfig()

// 创建axios实例
const service = axios.create({
  baseURL: apiConfig.wechatApiBaseUrl,
  timeout: 30 * 1000, // 请求超时时间
})

service.interceptors.request.use(
  (config) => {
    if (/^(?:post|put|delete)$/i.test(`${config.method}`)) {
      // 检查是否是 FormData 对象，如果是则设置正确的 Content-Type
      if (config.data instanceof FormData) {
        // 当使用 FormData 时，浏览器会自动设置正确的 Content-Type（包括 boundary）
        config.headers[`Content-Type`] = undefined
      }
      else if (config.data && config.data.upload) {
        config.headers[`Content-Type`] = `multipart/form-data`
      }
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  },
)

service.interceptors.response.use(
  (res) => {
    // 如果调用方明确要求二进制，则直接返回 res
    if (res.config.responseType === `blob`) {
      return res
    }

    // 否则按 JSON 处理
    if (res.data?.errcode !== undefined && res.data.errcode !== 0) {
      return Promise.reject(res.data)
    }

    return res.data
  },
  (error) => {
    return Promise.reject(error)
  },
)

export { service as axiosInstance }

export default service
