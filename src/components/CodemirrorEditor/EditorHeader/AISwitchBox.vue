<script setup lang="ts">
import { ArrowLeft, Check, Eye, EyeOff, Power, Trash2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAIStore } from '@/stores'

const aiStore = useAIStore()
const showApiKey = ref(false)
// 删除确认对话框相关状态
const deleteConfirmDialogOpen = ref(false)
const configToDeleteId = ref('')
const configToDeleteName = ref('')

const {
  configName,
  configApiKey,
  configApiDomain,
  configModel,
  configTemperature,
  configMaxLength,
  settingsDialogVisible,
  allConfigurations,
  activeConfigurationId,
  editingConfigurationId,
} = storeToRefs(aiStore)

// API密钥占位符
const getApiKeyPlaceholder = computed(() => {
  return 'API Key'
})

// 保存当前配置到左侧列表
function saveCurrentConfiguration() {
  if (!configName.value.trim()) {
    toast.error('请输入配置名称')
    return
  }

  // 验证模型选择
  if (!configModel.value) {
    toast.error('请输入模型名称')
    return
  }

  // 验证API Key
  if (!configApiKey.value) {
    toast.error('请输入API Key')
    return
  }

  // 检查是否存在相同的模型配置
  const existingConfig = allConfigurations.value.find(
    config => config.model === configModel.value,
  )

  if (existingConfig) {
    toast.error(`已存在相同模型的配置，配置名称: ${existingConfig.name}`)
    return
  }

  // 生成唯一ID
  const configId = Date.now().toString()

  // 创建新配置
  const newConfig = {
    id: configId,
    name: configName.value,
    apiKey: configApiKey.value,
    apiDomain: configApiDomain.value,
    model: configModel.value,
    temperature: configTemperature.value,
    maxLength: configMaxLength.value,
  }

  // 添加到配置列表
  aiStore.allConfigurations.push(newConfig)

  // 保存成功提示
  toast.success('AI配置已保存')

  // 清空表单（保持新配置状态而不是加载刚保存的配置）
  aiStore.clearEditingConfiguration()
}

// 打开删除确认对话框
function openDeleteConfirmation(configId: string, configName: string) {
  configToDeleteId.value = configId
  configToDeleteName.value = configName
  deleteConfirmDialogOpen.value = true
}

// 确认删除配置
function confirmDelete() {
  const deletedConfig = allConfigurations.value.find(c => c.id === configToDeleteId.value)
  const initialLength = allConfigurations.value.length

  // 检查是否正在编辑即将被删除的配置
  const isEditingDeletedConfig = aiStore.editingConfigurationId === configToDeleteId.value

  aiStore.deleteConfiguration(configToDeleteId.value)
  const finalLength = allConfigurations.value.length

  // 关闭对话框
  deleteConfirmDialogOpen.value = false

  // 如果删除的是当前正在编辑的配置，清空表单
  if (isEditingDeletedConfig) {
    aiStore.clearEditingConfiguration()
  }

  // 只有在配置确实被删除时才显示成功提示
  if (initialLength > finalLength && deletedConfig) {
    toast.success(`已删除配置: ${deletedConfig.name}`)
  }
}

// 选择配置进行编辑
function selectConfigurationForEditing(configId: string) {
  // 如果点击的配置已经是当前编辑的配置，则取消选中（回到新增配置状态）
  if (aiStore.editingConfigurationId === configId) {
    aiStore.clearEditingConfiguration()
  }
  else {
    // 否则，选中该配置进行编辑（不激活为默认配置）
    const config = allConfigurations.value.find(c => c.id === configId)
    if (config) {
      // 先设置编辑配置ID，然后加载配置值
      aiStore.editingConfigurationId = configId
      aiStore.loadConfigurationToEdit(configId)

      // 提示用户已切换到该配置进行编辑
      // toast.success(`已切换到配置: ${config.name}`);
    }
  }
}

// 切换配置选择状态（设为默认/取消默认）
const lastToastTime = ref(0)
function toggleConfigurationSelection(configId: string) {
  // 如果当前点击的配置已经是默认配置，则取消默认；否则设为默认
  if (aiStore.activeConfigurationId === configId) {
    // 取消默认配置
    aiStore.activeConfigurationId = ''
    const config = allConfigurations.value.find(c => c.id === configId)
    if (config) {
      if (Date.now() - lastToastTime.value > 400) {
        toast.success(`已取消 "${config.name}" 的默认配置设置`)
        lastToastTime.value = Date.now()
      }
    }
  }
  else {
    // 设为默认配置
    const config = allConfigurations.value.find(c => c.id === configId)
    aiStore.activeConfigurationId = configId

    // 提示用户已将配置设为默认
    if (config) {
      if (Date.now() - lastToastTime.value > 400) {
        toast.success(`已将 "${config.name}" 设为默认配置`)
        lastToastTime.value = Date.now()
      }
    }
  }
}

// 取消删除
function cancelDelete() {
  deleteConfirmDialogOpen.value = false
  configToDeleteId.value = ''
  configToDeleteName.value = ''
}

// 更新现有配置
function updateExistingConfiguration() {
  // 使用 storeToRefs 中解构的 editingConfigurationId
  if (!editingConfigurationId.value) {
    toast.error('没有选中的配置可以更新')
    return
  }

  if (!configName.value.trim()) {
    toast.error('请输入配置名称')
    return
  }

  // 验证模型选择
  if (!configModel.value) {
    toast.error('请输入模型名称')
    return
  }

  // 验证API Key
  if (!configApiKey.value) {
    toast.error('请输入API Key')
    return
  }

  // 检查是否存在相同的模型配置（排除当前正在编辑的配置）
  const existingConfig = allConfigurations.value.find(
    config => config.id !== editingConfigurationId.value
      && config.model === configModel.value,
  )

  if (existingConfig) {
    toast.error(`已存在相同模型的配置，配置名称: ${existingConfig.name}`)
    return
  }

  // 更新现有配置
  aiStore.updateConfiguration()

  // 清除编辑状态
  aiStore.clearEditingConfiguration()
}

// 取消编辑现有配置
function cancelEditing() {
  // 重新加载原始配置以取消更改
  if (aiStore.editingConfigurationId) {
    const originalConfig = allConfigurations.value.find(c => c.id === aiStore.editingConfigurationId)
    if (originalConfig) {
      aiStore.loadConfigurationToEdit(aiStore.editingConfigurationId)
    }
  }

  // 清除编辑状态
  aiStore.clearEditingConfiguration()
}
</script>

<template>
  <Dialog v-model:open="settingsDialogVisible">
    <DialogContent class="h-[70vh] flex flex-col sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>AI 配置</DialogTitle>
      </DialogHeader>

      <div class="flex flex-1 gap-6 overflow-hidden">
        <!-- 左侧：已保存的配置 -->
        <div class="w-1/3 flex flex-col border rounded-lg p-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-semibold">
              已保存的配置
            </h3>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div class="bg-card border-muted border rounded-lg">
              <div class="border-muted h-80 overflow-auto border-t p-1">
                <div
                  v-for="config in allConfigurations"
                  :key="config.id" class="group hover:bg-accent flex cursor-pointer items-center justify-between border rounded-lg p-3 transition-all duration-200" :class="[
                    aiStore.editingConfigurationId === config.id
                      ? 'bg-accent border-accent shadow-sm z-10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                  ]" @click="selectConfigurationForEditing(config.id)"
                >
                  <div class="min-w-0 flex-1">
                    <div class="truncate font-medium">
                      {{ config.name }}
                    </div>
                    <div class="truncate text-xs text-gray-500">
                      {{ config.apiDomain }}
                    </div>
                  </div>
                  <div
                    class="flex items-center gap-1" :class="{
                      visible: aiStore.editingConfigurationId === config.id,
                      invisible: aiStore.editingConfigurationId !== config.id,
                    }"
                  >
                    <Button
                      variant="ghost" size="sm" :title="activeConfigurationId === config.id ? '当前激活' : '设为默认'"
                      :class="{
                        'bg-accent text-accent-foreground': activeConfigurationId === config.id,
                      }" @click.stop="toggleConfigurationSelection(config.id)"
                    >
                      <Check v-if="activeConfigurationId === config.id" class="h-3 w-3" />
                      <Power v-else class="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost" size="sm" title="删除配置"
                      @click.stop="openDeleteConfirmation(config.id, config.name)"
                    >
                      <Trash2 class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col items-center justify-center gap-2 py-4">
          <Button
            v-if="!aiStore.editingConfiguration" size="sm" class="h-10 w-10 p-0" title="保存配置"
            @click="saveCurrentConfiguration"
          >
            <ArrowLeft class="h-4 w-4" />
          </Button>
        </div>

        <!-- 右侧：配置编辑 -->
        <div class="w-2/3 flex flex-col overflow-y-auto border rounded-lg p-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-semibold">
              {{ aiStore.editingConfiguration ? `当前配置: ${aiStore.editingConfiguration.name}`
                : '新增配置' }}
            </h3>
            <div v-if="aiStore.editingConfiguration" class="flex gap-2">
              <Button size="sm" variant="outline" @click="cancelEditing">
                取消
              </Button>
              <Button size="sm" @click="updateExistingConfiguration">
                保存更改
              </Button>
            </div>
          </div>

          <!-- 编辑现有配置表单 -->
          <div v-if="aiStore.editingConfiguration" class="space-y-4 custom-scrollbar flex-1 overflow-y-auto px-2">
            <!-- 配置名称 -->
            <div class="space-y-2">
              <Label>配置名称</Label>
              <Input v-model="configName" placeholder="请输入配置名称" />
            </div>

            <!-- API 地址 -->
            <div class="space-y-2">
              <Label>API 地址</Label>
              <Input v-model="configApiDomain" placeholder="请输入API地址" />
            </div>

            <!-- API Key -->
            <div class="space-y-2">
              <Label>API Key</Label>
              <div class="relative">
                <Input
                  v-model="configApiKey" :type="showApiKey ? 'text' : 'password'"
                  :placeholder="getApiKeyPlaceholder" class="pr-10"
                />
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 transform -translate-y-1/2"
                  @click="showApiKey = !showApiKey"
                >
                  <Eye v-if="!showApiKey" class="size-4" />
                  <EyeOff v-else class="size-4" />
                </button>
              </div>
            </div>

            <!-- 模型 -->
            <div class="space-y-2">
              <Label>模型</Label>
              <div class="w-full">
                <Input v-model="configModel" placeholder="请输入模型名称" />
              </div>
            </div>

            <!-- 温度设置 -->
            <div class="space-y-2">
              <div class="flex justify-between">
                <Label>温度</Label>
                <span class="text-muted-foreground">{{ Number(configTemperature).toFixed(1) }}</span>
              </div>
              <input v-model.number="configTemperature" type="range" :min="0" :max="2" :step="0.1" class="w-full">
              <p class="text-muted-foreground text-xs">
                较低的值使输出更加集中和确定，较高的值使输出更加多样和创造性
              </p>
            </div>

            <!-- 最大长度 -->
            <div class="space-y-2">
              <Label>最大长度</Label>
              <Input v-model.number="configMaxLength" type="number" :min="1" :max="4096" />
              <p class="text-muted-foreground text-xs">
                生成文本的最大标记数（1-4096）
              </p>
            </div>
          </div>

          <!-- 新增配置表单 -->
          <div v-else class="space-y-4 custom-scrollbar flex-1 overflow-y-auto px-2">
            <!-- 配置名称 -->
            <div class="space-y-2">
              <Label>配置名称</Label>
              <Input v-model="configName" placeholder="请输入配置名称" />
            </div>

            <!-- API 地址 -->
            <div class="space-y-2">
              <Label>API 地址</Label>
              <Input v-model="configApiDomain" placeholder="请输入API地址" />
            </div>

            <!-- API Key -->
            <div class="space-y-2">
              <Label>API Key</Label>
              <div class="relative">
                <Input
                  v-model="configApiKey" :type="showApiKey ? 'text' : 'password'"
                  :placeholder="getApiKeyPlaceholder" class="pr-10"
                />
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 transform -translate-y-1/2"
                  @click="showApiKey = !showApiKey"
                >
                  <Eye v-if="!showApiKey" class="size-4" />
                  <EyeOff v-else class="size-4" />
                </button>
              </div>
            </div>

            <!-- 模型 -->
            <div class="space-y-2">
              <Label>模型</Label>
              <div class="w-full">
                <Input v-model="configModel" placeholder="请输入模型名称" />
              </div>
            </div>

            <!-- 温度设置 -->
            <div class="space-y-2">
              <div class="flex justify-between">
                <Label>温度</Label>
                <span class="text-muted-foreground">{{ Number(configTemperature).toFixed(1) }}</span>
              </div>
              <input v-model.number="configTemperature" type="range" :min="0" :max="2" :step="0.1" class="w-full">
              <p class="text-muted-foreground text-xs">
                较低的值使输出更加集中和确定，较高的值使输出更加多样和创造性
              </p>
            </div>

            <!-- 最大长度 -->
            <div class="space-y-2">
              <Label>最大长度</Label>
              <Input v-model.number="configMaxLength" type="number" :min="1" :max="4096" />
              <p class="text-muted-foreground text-xs">
                生成文本的最大标记数（1-4096）
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 删除确认对话框 -->
      <AlertDialog v-model:open="deleteConfirmDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除配置 "{{ configToDeleteName }}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel @click="cancelDelete">
              取消
            </AlertDialogCancel>
            <AlertDialogAction class="bg-destructive hover:bg-destructive/90" @click="confirmDelete">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContent>
  </Dialog>
</template>
<style scoped>
.custom-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.custom-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>