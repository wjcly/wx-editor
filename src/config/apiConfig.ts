/**
 * API Configuration
 * Centralized configuration for API base URLs
 */

export interface ApiConfig {
  wechatApiBaseUrl?: string
}

// Function to get current configuration
export function getApiConfig(): ApiConfig {
  const customConfigStr = localStorage.getItem(`apiConfig`)

  if (customConfigStr) {
    try {
      return JSON.parse(customConfigStr)
    }
    catch (e) {
      console.warn(`Failed to parse custom API config:`, e)
      return {}
    }
  }

  return {}
}

// Function to update API configuration
export function updateApiConfig(newConfig: Partial<ApiConfig>): void {
  const currentConfig = getApiConfig()
  const updatedConfig = {
    ...currentConfig,
    ...newConfig,
  }

  localStorage.setItem(`apiConfig`, JSON.stringify(updatedConfig))
}

// Function to reset to default configuration
export function resetApiConfig(): void {
  localStorage.removeItem(`apiConfig`)
}
