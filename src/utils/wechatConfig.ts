/**
 * 微信配置工具函数
 */

interface WechatConfig {
  appID: string
  appsecret: string
  proxyOrigin?: string
}

/**
 * 获取微信配置
 * @returns 微信配置对象，如果未配置则返回null
 */
export function getWechatConfig(): WechatConfig | null {
  // 检查是否配置了微信公众号（从全局代理配置中读取）
  const wxProxyConfigStr = localStorage.getItem(`wxProxyConfig`)
  if (!wxProxyConfigStr) {
    return null
  }

  try {
    const config = JSON.parse(wxProxyConfigStr)

    // 检查配置是否为对象且包含必需的配置项
    if (!config || typeof config !== `object`) {
      return null
    }

    // 检查必需的配置项
    if (!config.appID || !config.appsecret) {
      return null
    }

    return {
      appID: config.appID,
      appsecret: config.appsecret,
      proxyOrigin: config.proxyOrigin || ``,
    }
  }
  catch (e) {
    console.error(`解析微信配置失败`, e)
    return null
  }
}
