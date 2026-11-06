<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'

// Item menu/laci kategori (HOME-06, PAGE-003, WP-002). Item hanya dirender untuk kategori dari daftar kategori WordPress, jadi selalu tautan
// internal /kategori/<slug> (satu tab stop). `aria-current="page"` hanya pada kategori yang sedang dibuka, berbasis slug rute sehingga
// `?halaman=N` tetap dihitung; di halaman lain tidak ada (nilai `undefined` juga menimpa penanda otomatis NuxtLink).
// POLISH-01 D26: `active` = kategori pertama artikel yang sedang dibuka di Detail; hanya penanda gaya `data-active` (sorotan menu/laci), BUKAN aria-current
// (aria-current tetap hanya untuk halaman kategori yang sedang dibuka).
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
