<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'
import { categoryPath } from '~/utils/routes'

// Item menu/laci kategori (HOME-06). `categoryPath` null (sebelum PAGE-003) = teks biasa: bukan <a>, tanpa href,
// tidak dapat difokus. Bila terisi = tautan internal; halaman yang sedang dibuka diberi aria-current="page".
const props = defineProps<{ category: ArticleCategory }>()

const to = computed(() => categoryPath(props.category.slug))
</script>

<template>
  <NuxtLink v-if="to" :to="to">
    {{ category.name }}
  </NuxtLink>
  <span v-else>{{ category.name }}</span>
</template>
