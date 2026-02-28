<script setup lang="ts">
import type { Component } from 'vue'
import type { IConfigOption } from '@/types'

interface StyleOptionProps {
  title: string
  options: IConfigOption[]
  current: string
  change: <T>(val: T) => void
  icon?: Component | null
}

const props = withDefaults(defineProps<StyleOptionProps>(), {
  icon: null,
})

function setStyle(title: string, value: string) {
  switch (title) {
    case `字体`:
      return { fontFamily: value }
    case `字号`:
      return { fontSize: value }
    case `主题色`:
      return { color: value }
    default:
      return {}
  }
}
</script>

<template>
  <MenubarSub>
    <MenubarSubTrigger>
      <component
        :is="props.icon"
        class="mr-2 h-4 w-4"
      />
      <span>{{ props.title }}</span>
    </MenubarSubTrigger>
    <MenubarSubContent class="max-h-56 overflow-auto">
      <MenubarCheckboxItem
        v-for="{ label, value, desc } in options"
        :key="value"
        :label="label"
        :model-value="value"
        class="w-50"
        :checked="current === value"
        @click="change(value)"
      >
        {{ label }}
        <DropdownMenuShortcut :style="setStyle(title, value)">
          {{ desc }}
        </DropdownMenuShortcut>
      </MenubarCheckboxItem>
    </MenubarSubContent>
  </MenubarSub>
</template>
