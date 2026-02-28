<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from '@/composables/useToast'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits([`close`])

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit(`close`, value),
})

// 表单数据
const form = ref({
  appID: ``,
  appsecret: ``,
  proxyOrigin: ``,
})

// 加载配置
onMounted(() => {
  // 加载全局代理配置（包含所有微信配置）
  const wxProxyConfig = localStorage.getItem(`wxProxyConfig`)
  if (wxProxyConfig) {
    try {
      const config = JSON.parse(wxProxyConfig)
      form.value.appID = config.appID || ``
      form.value.appsecret = config.appsecret || ``
      form.value.proxyOrigin = config.proxyOrigin || ``
    }
    catch (e) {
      console.error(`解析全局代理配置失败`, e)
    }
  }
})

// 监听对话框打开状态，在每次打开时重新加载配置
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 加载全局代理配置（包含所有微信配置）
    const wxProxyConfig = localStorage.getItem(`wxProxyConfig`)
    if (wxProxyConfig) {
      try {
        const config = JSON.parse(wxProxyConfig)
        form.value.appID = config.appID || ``
        form.value.appsecret = config.appsecret || ``
        form.value.proxyOrigin = config.proxyOrigin || ``
      }
      catch (e) {
        console.error(`解析全局代理配置失败`, e)
      }
    }
    else {
      // 如果没有配置，初始化为空
      form.value = {
        appID: ``,
        appsecret: ``,
        proxyOrigin: ``,
      }
    }
  }
})

// 保存配置
function saveConfig() {
  // 保存所有配置到全局代理配置中
  const wxProxyConfig = {
    appID: form.value.appID,
    appsecret: form.value.appsecret,
    proxyOrigin: form.value.proxyOrigin,
  }
  localStorage.setItem(`wxProxyConfig`, JSON.stringify(wxProxyConfig))

  // 移除旧的mpConfig（如果存在）
  localStorage.removeItem(`mpConfig`)

  toast.success(`配置保存成功`)
  dialogVisible.value = false
}

// 清空配置
function resetConfig() {
  // 清空全局代理配置
  localStorage.removeItem(`wxProxyConfig`)

  // 清空表单
  form.value = {
    appID: ``,
    appsecret: ``,
    proxyOrigin: ``,
  }

  toast.success(`配置已清空`)
}
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>微信公众号配置</DialogTitle>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="appID">AppID</Label>
            <Input
              id="appID"
              v-model="form.appID"
              placeholder="请输入微信公众号AppID"
            />
            <p class="text-muted-foreground text-sm">
              在微信公众平台后台的"开发"->"基本配置"中获取
            </p>
          </div>

          <div class="space-y-2">
            <Label for="appsecret">AppSecret</Label>
            <Input
              id="appsecret"
              v-model="form.appsecret"
              type="password"
              placeholder="请输入微信公众号AppSecret"
            />
            <p class="text-muted-foreground text-sm">
              在微信公众平台后台的"开发"->"基本配置"中获取
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="proxyOrigin">代理域名</Label>
            <Input
              id="proxyOrigin"
              v-model="form.proxyOrigin"
              placeholder="http://proxy.example.com"
            />
            <p class="text-muted-foreground text-sm">
              代理域名对应的ip地址应在微信公众平台的ip白名单中
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="resetConfig">
          清空配置
        </Button>
        <Button @click="saveConfig">
          保存配置
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
