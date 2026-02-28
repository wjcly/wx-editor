<script setup lang="ts">
import type { RadioGroupRootProps } from 'radix-vue'
import { RadioGroupRoot } from 'radix-vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<RadioGroupRootProps & { class?: string }>(), {
  defaultValue: undefined,
})

const emits = defineEmits([`update:modelValue`])

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <RadioGroupRoot
    v-bind="delegatedProps"
    class="grid gap-2"
    @update:model-value="(value) => emits('update:modelValue', value)"
  >
    <slot />
  </RadioGroupRoot>
</template>
