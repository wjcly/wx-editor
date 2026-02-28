import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from '@/composables/useToast'

export interface AIProvider {
  id: string
  name: string
  apiDomain: string
  defaultModel: string
  models: Array<{
    id: string
    name: string
  }>
}

export interface AIConfiguration {
  id: string
  name: string
  apiKey: string
  apiDomain: string
  model: string
  temperature: number
  maxLength: number
}

export const useAIStore = defineStore(`ai`, () => {
  // 持久化存储 - 存储所有配置
  const allConfigurations = useStorage<AIConfiguration[]>('md-ai-configurations', [])
  // 存储当前激活的配置ID
  const activeConfigurationId = useStorage<string>('md-ai-active-config-id', '')
  // 存储预设词
  const currentPresetWords = useStorage<string[]>('md-ai-preset-words', [])

  // 临时状态 - 用于配置界面
  const configName = ref('')
  const configProviderId = ref('')
  const configApiKey = ref('')
  const configApiDomain = ref('')
  const configModel = ref('')
  const configTemperature = ref(0.7)
  const configMaxLength = ref(2048)

  // 控制是否在更改提供商时应用默认值
  const applyingDefaults = ref(true)

  const settingsDialogVisible = ref(false)
  const isGenerating = ref(false)

  // 获取当前激活的配置
  const activeConfiguration = computed(() => {
    if (!activeConfigurationId.value)
      return null
    return allConfigurations.value.find(config => config.id === activeConfigurationId.value) || null
  })

  // 当前编辑的配置ID（用于UI状态，与activeConfigurationId分开管理）
  const editingConfigurationId = ref<string | null>(null)

  // 获取当前编辑的配置
  const editingConfiguration = computed(() => {
    if (!editingConfigurationId.value)
      return null
    return allConfigurations.value.find(config => config.id === editingConfigurationId.value) || null
  })

  // 获取当前活动配置的详情（用于AI请求）
  const currentProviderId = computed(() => 'custom')
  const currentApiKey = computed(() => activeConfiguration.value?.apiKey || '')
  const currentApiDomain = computed(() => {
    // 使用配置的 API 域
    return activeConfiguration.value?.apiDomain || ''
  })
  const currentModel = computed(() => activeConfiguration.value?.model || '')
  const currentTemperature = computed(() => activeConfiguration.value?.temperature || 0.7)
  const currentMaxLength = computed(() => activeConfiguration.value?.maxLength || 2048)

  // 保存当前编辑的配置
  function saveConfiguration() {
    // 生成唯一ID
    const configId = Date.now().toString()

    // 创建新配置或更新现有配置
    const newConfig: AIConfiguration = {
      id: configId,
      name: configName.value || `配置-${configId.substring(configId.length - 4)}`,
      apiKey: configApiKey.value,
      apiDomain: configApiDomain.value,
      model: configModel.value,
      temperature: configTemperature.value,
      maxLength: configMaxLength.value,
    }

    // 检查是否是更新现有配置
    const existingIndex = allConfigurations.value.findIndex(config => config.id === configId)
    if (existingIndex >= 0) {
      allConfigurations.value[existingIndex] = newConfig
    }
    else {
      allConfigurations.value.push(newConfig)
    }

    // 设置为当前激活的配置
    activeConfigurationId.value = configId

    // 关闭对话框
    settingsDialogVisible.value = false

    // 显示成功提示
    toast.success('AI配置保存成功')
  }

  // 更新现有配置
  function updateConfiguration() {
    if (!editingConfigurationId.value) {
      toast.error('没有选中的配置可以更新')
      return
    }

    const updatedConfig: AIConfiguration = {
      id: editingConfigurationId.value,
      name: configName.value || `配置-${Date.now().toString().substring(7)}`,
      apiKey: configApiKey.value,
      apiDomain: configApiDomain.value,
      model: configModel.value,
      temperature: configTemperature.value,
      maxLength: configMaxLength.value,
    }

    // Find and replace the configuration to ensure the old one is completely replaced
    const index = allConfigurations.value.findIndex(config => config.id === editingConfigurationId.value)
    if (index >= 0) {
      // Create a new array to ensure reactivity is triggered and old config is completely replaced
      const newConfigurations = [...allConfigurations.value]
      newConfigurations[index] = updatedConfig
      allConfigurations.value = newConfigurations
    }

    // 显示成功提示
    toast.success('AI配置更新成功')
  }

  // 删除配置
  function deleteConfiguration(configId: string) {
    // 不能删除当前激活的配置
    if (configId === activeConfigurationId.value) {
      toast.error('不能删除当前使用的配置')
      return
    }

    allConfigurations.value = allConfigurations.value.filter(config => config.id !== configId)
  }

  // 激活配置并加载到编辑表单（仅在需要编辑时使用）
  function activateConfigurationAndLoadForm(configId: string) {
    const config = allConfigurations.value.find(c => c.id === configId)
    if (config) {
      activeConfigurationId.value = configId
      editingConfigurationId.value = configId

      // 将配置加载到编辑表单中
      configName.value = config.name
      configApiKey.value = config.apiKey
      configApiDomain.value = config.apiDomain
      configModel.value = config.model
      configTemperature.value = config.temperature
      configMaxLength.value = config.maxLength

      toast.success(`已切换到配置: ${config.name}`)
    }
  }

  // 取消选中配置，返回到新增配置状态
  function clearEditingConfiguration() {
    editingConfigurationId.value = null

    // 清空表单，回到新增配置状态
    createNewConfiguration()
  }

  // 创建新配置（清空表单）
  function createNewConfiguration() {
    configName.value = ''
    configApiKey.value = ''
    configApiDomain.value = ''
    configModel.value = ''
    configTemperature.value = 0.7
    configMaxLength.value = 2048
  }

  // 加载配置到编辑表单
  function loadConfigurationToEdit(configId: string) {
    const config = allConfigurations.value.find(c => c.id === configId)
    if (config) {
      // 临时禁用默认值应用，以防止覆盖现有配置值
      applyingDefaults.value = false

      configName.value = config.name
      configApiKey.value = config.apiKey
      configApiDomain.value = config.apiDomain
      configModel.value = config.model
      configTemperature.value = config.temperature
      configMaxLength.value = config.maxLength

      // 重新启用默认值应用
      applyingDefaults.value = true
    }
  }

  return {
    // 配置界面状态
    configName,
    configProviderId,
    configApiKey,
    configApiDomain,
    configModel,
    configTemperature,
    configMaxLength,
    settingsDialogVisible,
    isGenerating,

    // 配置管理
    allConfigurations,
    activeConfiguration,
    activeConfigurationId,

    // 编辑配置状态
    editingConfiguration,
    editingConfigurationId,

    // 方法
    saveConfiguration,
    updateConfiguration,
    deleteConfiguration,
    activateConfigurationAndLoadForm,
    createNewConfiguration,
    loadConfigurationToEdit,
    clearEditingConfiguration,
    setGenerating: (status: boolean) => { isGenerating.value = status },

    // 当前活动配置（用于AI请求）
    currentProviderId,
    currentApiKey,
    currentApiDomain,
    currentModel,
    currentTemperature,
    currentMaxLength,
    currentPresetWords,

    // 预设词管理
    addPresetWord: (word: string) => { currentPresetWords.value.push(word) },
    removePresetWord: (index: number) => { currentPresetWords.value.splice(index, 1) },
  }
})
