<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'

// Menu kategori desktop: nama persis dari WordPress. Lebih dari 9 kategori membungkus ke baris lain; hanya >= 1024
// (di bawahnya ada laci). activeSlug: kategori pertama artikel di Detail, disorot tanpa aria-current.
defineProps<{ categories: ArticleCategory[], activeSlug?: string | null }>()
</script>

<template>
  <nav class="menu" aria-label="Kategori">
    <ul class="list">
      <li v-for="category in categories" :key="category.id">
        <LayoutCategoryLabel :category="category" :active="category.slug === activeSlug" class="item" />
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.menu {
  display: none;
}

@media (min-width: 1024px) {
  /* 1440 x 47, border 1 px; padding kiri 111 (= kiri kontainer 160 - 49) / kanan 160 pada frame 1440, isi dipusatkan.
     Di lebar lain: ikut kontainer 1120, minimal 24. */
  .menu {
    display: block;
    min-height: 47px; /* 9 kategori satu baris = 47; lebih banyak membungkus */
    padding: 4px max(var(--space-24), calc((100% - var(--container-desktop)) / 2)) 4px max(var(--space-24), calc((100% - var(--container-desktop)) / 2 - 49px)); /* 4 + border 1 = padding 5 Figma */
    border: 1px solid var(--color-border);
    background: var(--color-brand);
  }

  .list {
    display: flex;
    flex-wrap: wrap; /* kategori WordPress tanpa batas 9; baris tambahan hanya bila tidak muat */
    align-items: center;
    justify-content: center;
    gap: 4px 8px; /* 1024-1279: 9 item (879) + 8 celah muat dalam 976; celah Figma 26 dipakai mulai 1280 */
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Nama sangat panjang tidak melebihi lebar bilah: dipotong "..." (satu baris), item lain tidak terdorong keluar */
  .list li {
    min-width: 0;
    max-width: 100%;
  }

  .item {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 5px 10px; /* tinggi 37 */
    font: var(--type-text-l-medium);
    letter-spacing: var(--tracking-text-l);
    color: var(--color-white);
    white-space: nowrap;
  }
}

@media (min-width: 1280px) {
  .list {
    gap: 4px 26px;
  }
}

/* State (tanpa Figma; turunan token). Aktif: latar --color-black-3 alfa 20 % (Figma 42,42,42); teks oranye tanpa token
   (--color-warning selisih > 4), teks tetap putih. Aktif selalu berlaku; :hover hanya pada perangkat berhover. */
a.item[aria-current="page"],
a.item[data-active] {
  background: color-mix(in srgb, var(--color-black-3) 20%, transparent);
}

@media (hover: hover) {
  a.item:hover {
    background: color-mix(in srgb, var(--color-black-3) 20%, transparent);
  }
}
</style>
