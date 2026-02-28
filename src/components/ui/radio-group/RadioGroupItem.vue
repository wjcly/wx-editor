<script setup lang="ts">
import type { RadioGroupItemProps } from 'radix-vue'
import { Circle } from 'lucide-vue-next'
import { RadioGroupIndicator, RadioGroupItem } from 'radix-vue'
import { computed } from 'vue'

const props = defineProps<RadioGroupItemProps & { class?: string }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <RadioGroupItem
    v-bind="delegatedProps"
    class="ring-offset-background border-primary text-primary focus-visible:ring-ring aspect-square h-4 w-4 border rounded-full disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <Circle class="h-2.5 w-2.5 fill-current text-current" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
