/**
 * NVIDIA 配置工具函数
 */

interface NvidiaConfig {
  proxyOrigin?: string
}

/**
 * 获取 NVIDIA 配置
 * @returns NVIDIA 配置对象，如果未配置则返回 null
 */
export function getNvidiaConfig(): NvidiaConfig | null {
  const nvidiaProxyConfigStr = localStorage.getItem(`nvidiaProxyConfig`)
  if (!nvidiaProxyConfigStr) {
    return null
  }
  try {
    const config = JSON.parse(nvidiaProxyConfigStr)
    return {
      proxyOrigin: config.proxyOrigin || ``,
    }
  }
  catch (e) {
    console.error(`解析 NVIDIA 配置失败`, e)
    return null
  }
}
