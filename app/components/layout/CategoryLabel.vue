<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'

// Item menu/laci kategori: tautan internal /kategori/<slug> (daftar WordPress). aria-current="page" hanya pada kategori
// yang dibuka (slug rute, ?halaman=N dihitung; undefined menimpa penanda NuxtLink). active = data-active saja.
const props = defineProps<{ category: ArticleCategory, active?: boolean }>()

const to = computed(() => categoryPath(props.category.slug))
const route = useRoute()
const current = computed(() => isCategoryRoute(route, props.category.slug))
</script>

<template>
  <NuxtLink :to="to" :aria-current="current ? 'page' : undefined" :data-active="active && !current ? '' : undefined">
    {{ category.name }}
  </NuxtLink>
</template>
