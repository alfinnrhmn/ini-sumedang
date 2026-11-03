<script setup lang="ts">
import type { Article } from '~/types/article'

// Bagian "Trending" kolom kanan halaman kategori (UX-001 Keputusan PM 2). BUKAN halaman Trending: hanya daftar kecil di kolom kanan.
// Isi = artikel Terpopuler (pilihan editor, `sidebar.popular`, data yang sama dengan tab Terpopuler Beranda; tanpa API baru).
// Kosong = tidak dirender (tidak diisi "terbaru", PRD §3.6). Komponen visual BARU tanpa frame Figma: judul = HomeSectionTitle (h2, garis aksen),
// daftar = NewsCard layout="compact" seperti kolom samping Beranda; jarak dan gaya hanya dari token/pola yang sudah ada (deviasi untuk POLISH-01).
defineProps<{
  articles: Article[]
  /** Waktu server (ISO) untuk waktu relatif. */
  now: string
}>()
</script>

<template>
  <section v-if="articles.length" class="trending" aria-label="Trending">
    <HomeSectionTitle title="Trending" />
    <ul class="list">
      <li v-for="article in articles" :key="article.id">
        <NewsCard :article="article" :now="now" layout="compact" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* Daftar seperti SidebarTabs (34:354 / 90:2164): celah antar item 22, jarak judul ke daftar 16; < 1024 kartu kolom 354 boleh berdampingan di tablet */
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--container-mobile), 100%), 1fr));
  gap: 22px var(--space-24);
  margin: var(--space-16) 0 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 1024px) {
  .list {
    grid-template-columns: minmax(0, 1fr);
    margin-inline-start: 5px; /* daftar 34:354 mulai x 928, kolom kanan x 923 */
  }
}
</style>
