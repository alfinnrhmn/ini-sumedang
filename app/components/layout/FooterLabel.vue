<script setup lang="ts">
import type { FooterLink } from '~/config/footer'

// `to` terisi = tautan internal (NuxtLink); `null` = teks biasa tanpa <a>/href dan tidak dapat difokus.
// Tautan kategori (punya `slug`, PAGE-003): `aria-current="page"` hanya pada kategori yang sedang dibuka (berbasis slug rute, termasuk
// `?halaman=N`); tautan lain (Beranda) memakai penanda otomatis NuxtLink.
const props = defineProps<{ link: FooterLink }>()

const route = useRoute()
// `data-category` = penanda gaya aktif footer (kategori Berita menaut ke `/`, jadi gaya tidak bisa bergantung pada href).
const categoryAttrs = computed(() =>
  props.link.slug
    ? { 'aria-current': isCategoryRoute(route, props.link.slug) ? ('page' as const) : undefined, 'data-category': '' }
    : {}
)
</script>

<template>
  <NuxtLink v-if="link.to" :to="link.to" v-bind="categoryAttrs">
    {{ link.label }}
  </NuxtLink>
  <span v-else>{{ link.label }}</span>
</template>
