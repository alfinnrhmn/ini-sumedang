<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'

// Menu kategori desktop (HOME-06, 21:4951). Teks dari getCategories() (ejaan resmi), bukan teks Figma.
// Hanya tampil >= 1024; di bawah itu disembunyikan (display: none) dan kategori ada di laci.
defineProps<{ categories: ArticleCategory[] }>()
</script>

<template>
  <nav class="menu" aria-label="Kategori">
    <ul class="list">
      <li v-for="category in categories" :key="category.id">
        <LayoutCategoryLabel :category="category" class="item" />
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.menu {
  display: none;
}

@media (min-width: 1024px) {
  /* 21:4951: 1440 x 47, latar biru merek, border 1 px (stroke di dalam bingkai), padding kiri 111 / kanan 160 pada frame 1440,
     isi dipusatkan. 111 = kiri kontainer (160) - 49; 160 = kiri/kanan kontainer. Di lebar lain: ikut kontainer 1120, minimal 24. */
  .menu {
    display: block;
    height: 47px;
    padding: 4px max(var(--space-24), calc((100% - var(--container-desktop)) / 2)) 4px max(var(--space-24), calc((100% - var(--container-desktop)) / 2 - 49px)); /* 4 + border 1 = padding 5 Figma */
    border: 1px solid var(--color-border);
    background: var(--color-brand);
  }

  .list {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px; /* 1024-1279: 9 item (879) + 8 celah muat dalam 976; celah Figma 26 dipakai mulai 1280 */
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .item {
    display: block;
    padding: 5px 10px; /* 21:4952 px 10 py 5, tinggi 37 */
    font: var(--type-text-l-medium);
    letter-spacing: var(--tracking-text-l);
    color: var(--color-white);
    white-space: nowrap;
  }
}

@media (min-width: 1280px) {
  .list {
    gap: 26px; /* 21:4951 gap 26 */
  }
}

/* State (tidak digambar di Figma; usulan turunan token, Keputusan PM 5). Aktif 130:2098: latar abu gelap alfa 20 % (42,42,42)
   dipetakan ke --color-black-3 (40,40,40) alfa 20 % (selisih R/G/B 2/2/2, alfa sama); teks oranye (245,178,65) tak punya token
   (--color-warning selisih R/G/B 19/7/6 > 4) -> deviasi: teks tetap putih. Hitungan dan kontras ada di Bukti HOME-06. */
a.item:hover,
a.item[aria-current="page"] {
  background: color-mix(in srgb, var(--color-black-3) 20%, transparent);
}
</style>
