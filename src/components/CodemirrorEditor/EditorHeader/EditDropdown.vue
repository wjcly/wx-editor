<script setup lang="ts">
import { TableIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useDisplayStore, useStore } from '@/stores'

const { toggleShowInsertFormDialog } = useDisplayStore()
const store = useStore()

const { citeStatusChanged, countStatusChanged } = store
const { isCiteStatus, isCountStatus } = storeToRefs(store)
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      编辑
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <TableIcon class="mr-2 h-4 w-4" />
        插入表格
      </MenubarItem>
      <MenubarSeparator />
      <MenubarCheckboxItem :checked="isCiteStatus" @click="citeStatusChanged()">
        微信外链转底部引用
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem :checked="isCountStatus" @click="countStatusChanged()">
        统计字数和阅读时间
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>
</template>
