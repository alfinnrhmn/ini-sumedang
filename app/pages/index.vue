<script setup lang="ts">
import type { RecommendedResponse } from '~/types/article'

useSeoMeta({ title: 'IniSumedang' })

const { data } = await useFetch<RecommendedResponse>('/api/articles/recommended', {
  key: 'articles-recommended'
})
</script>

<template>
  <main class="home">
    <h1 class="visually-hidden">
      IniSumedang
    </h1>
    <section class="recommended">
      <HomeSectionTitle title="Rekomendasi" />
      <ul v-if="data && data.articles.length" class="list">
        <li v-for="(article, index) in data.articles" :key="article.id">
          <NewsCard :article="article" :now="data.now" :eager="index < 2" />
        </li>
      </ul>
      <p v-else class="empty">
        Belum ada berita.
      </p>
    </section>
  </main>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  margin: 0 auto;
  padding: var(--space-24);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--container-mobile), 100%), 1fr));
  gap: var(--space-16) var(--space-24); /* mobile: pitch 120 = 104 + 16 (100:2458) */
  margin: 30px 0 0; /* 165:1727: garis (y 28) ke kartu pertama (y 58) */
  padding: 0;
  list-style: none;
}

.empty {
  margin-top: var(--space-24);
}

@media (min-width: 1024px) {
  /* Kolom kiri 739 dari 1120; kolom kanan (kolom samping, HOME-03) dikosongkan di slice ini */
  .list {
    width: calc(100% * 739 / 1120);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 23px; /* 21:4950 jarak horizontal kartu 358 + 23 + 358 = 739 */
    row-gap: 48px; /* jarak baris diukur: 44 (57:514-57:515), 52 (57:515-48:310); dipakai rata-rata */
    margin-top: 28px; /* garis 42:374 bawah y=820 ke kartu y=848 */
  }
}
</style>
