<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'

// Item menu/laci kategori (HOME-06, PAGE-003). Kategori resmi = tautan internal /kategori/<slug> (satu tab stop); selain itu
// teks biasa (tanpa <a>). `aria-current="page"` hanya pada kategori yang sedang dibuka, berbasis slug rute sehingga
// `?halaman=N` tetap dihitung; di halaman lain tidak ada (nilai `undefined` juga menimpa penanda otomatis NuxtLink).
const props = defineProps<{ category: ArticleCategory }>()

const to = computed(() => categoryLink(props.category.slug))
const route = useRoute()
const current = computed(() => isCategoryRoute(route, props.category.slug))
</script>

<template>
  <NuxtLink v-if="to" :to="to" :aria-current="current ? 'page' : undefined">
    {{ category.name }}
  </NuxtLink>
  <span v-else>{{ category.name }}</span>
</template>
