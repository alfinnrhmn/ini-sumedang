<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'

// Item menu/laci kategori: selalu tautan internal /kategori/<slug> (hanya kategori dari daftar WordPress, satu tab stop). `aria-current="page"` hanya pada kategori yang sedang dibuka, berbasis slug rute
// (`?halaman=N` tetap dihitung; `undefined` juga menimpa penanda otomatis NuxtLink). `active` = kategori pertama artikel di Detail: hanya penanda gaya `data-active`, BUKAN aria-current.
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
