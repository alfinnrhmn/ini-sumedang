<script setup lang="ts">
import type { FooterLink } from '~/config/footer'

// to terisi = tautan internal (NuxtLink); null = teks tanpa <a>/href. Kategori (punya slug): aria-current="page"
// hanya pada kategori yang dibuka (slug rute, termasuk ?halaman=N); tautan lain (Beranda) memakai penanda NuxtLink.
const props = defineProps<{ link: FooterLink }>()

const route = useRoute()
// data-category = penanda gaya aktif footer (kategori Berita menaut ke /, jadi gaya tak bisa bergantung pada href).
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

<style scoped>
/* Area klik >= 24 x 24 px (WCAG 2.5.8) lewat ::after tak terlihat berpusat pada tautan; tampilan tidak berubah. */
a {
  position: relative;
}

a::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, 24px);
  height: 24px;
  transform: translate(-50%, -50%);
}
</style>
