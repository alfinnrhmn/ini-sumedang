<script setup lang="ts">
import type { CategoryArticlesResponse, HeroResponse, RecommendedResponse, SidebarResponse, VisualTopicsResponse } from '~/types/article'
import { HOME_SECTIONS, HOME_SECTION_COUNTS } from '~/config/home'

useSeoMeta({ title: 'IniSumedang' })

const { data } = await useFetch<RecommendedResponse>('/api/articles/recommended', {
  key: 'articles-recommended'
})

// Hero (HOME-07): carousel manual 4 artikel terbaru; kosong = hero tidak dirender, kurang dari 2 = tanpa titik.
const { data: hero } = await useFetch<HeroResponse>('/api/articles/hero', {
  key: 'articles-hero'
})

// Kolom samping (HOME-03): tab Terbaru | Terpopuler; `popular` kosong = tab Terpopuler tidak ditampilkan.
const { data: sidebar } = await useFetch<SidebarResponse>('/api/articles/sidebar', {
  key: 'articles-sidebar'
})

// Ruang Visual (HOME-04): 4 topik (kategori anak `ruang-visual`); `topics` kosong = section tidak dirender.
// Urutan section (HOME-02): Rekomendasi -> Sepak Bola -> Ruang Visual -> Nasional -> Bisnis dan Teknologi -> Otomotif.
const VISUAL_AFTER_SLUG = 'sepak-bola'
const { data: visual } = await useFetch<VisualTopicsResponse>('/api/articles/visual-topics', {
  key: 'articles-visual-topics'
})

// Section kategori: satu permintaan per section, jumlah dari HOME_SECTION_COUNTS (satu konfigurasi).
// useFetch dipanggil sinkron di setup (konteks Nuxt tersedia); hasilnya ditunggu bersama.
const sectionFetches = HOME_SECTIONS.map(section =>
  useFetch<CategoryArticlesResponse>('/api/articles/by-category', {
    key: `articles-category-${section.slug}`,
    query: { category: section.slug, limit: HOME_SECTION_COUNTS[section.slug] }
  })
)
await Promise.all(sectionFetches)

// Section tanpa artikel (atau gagal dimuat) tidak dirender (v-if di template; Ruang Visual tetap di posisinya).
const sections = computed(() =>
  HOME_SECTIONS.map((section, index) => ({
    ...section,
    articles: sectionFetches[index]?.data.value?.articles ?? [],
    now: sectionFetches[index]?.data.value?.now ?? ''
  }))
)
</script>

<template>
  <main class="home">
    <h1 class="visually-hidden">
      IniSumedang
    </h1>
    <div v-if="(hero && hero.articles.length) || (sidebar && sidebar.latest.length)" class="top">
      <HomeHero v-if="hero && hero.articles.length" class="hero-slot" :articles="hero.articles" :now="hero.now" />
      <aside v-if="sidebar && sidebar.latest.length" class="sidebar" aria-labelledby="sidebar-title">
        <h2 id="sidebar-title" class="visually-hidden">
          {{ sidebar.popular.length ? 'Terbaru dan Terpopuler' : 'Terbaru' }}
        </h2>
        <HomeSidebarTabs :latest="sidebar.latest" :popular="sidebar.popular" :now="sidebar.now" />
      </aside>
    </div>
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
    <template v-for="section in sections" :key="section.slug">
      <section v-if="section.articles.length" class="category-section">
        <HomeSectionTitle :title="section.title" />
        <ul class="list">
          <li v-for="article in section.articles" :key="article.id">
            <NewsCard :article="article" :now="section.now" />
          </li>
        </ul>
      </section>
      <section v-if="section.slug === VISUAL_AFTER_SLUG && visual && visual.topics.length" class="category-section">
        <HomeSectionTitle title="Ruang Visual" />
        <div class="topics">
          <HomeVisualTopic v-for="entry in visual.topics" :key="entry.topic.id" :entry="entry" />
        </div>
      </section>
    </template>
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

/* Mobile 90:1611: hero 90:2130 (y 82, tinggi 238) lalu kolom samping 100:2461 (y 353, tinggi 460), jarak hero ke kolom samping 33 (320 ke 353);
   jarak ke judul Rekomendasi 165:1727 34 (813 ke 847) */
.hero-slot + .sidebar {
  margin-top: 33px;
}

.top + .recommended {
  margin-top: 34px;
}

/* Jarak antar section: mobile 30 (165:1735 y 1733 ke akhir kartu y 1703), desktop 50 (kartu 48:475 berakhir y 6334, judul 57:505 y 6384) */
.category-section {
  margin-top: 30px;
}

/* Blok topik Ruang Visual: mobile ditumpuk, jarak antar blok 32 (179:2422, 650,3 - 618,3). Mobile tidak punya judul section di Figma [?];
   jarak garis ke teks topik diturunkan dari .list (30) = 20 + margin judul topik 10 [I]. */
.topics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--container-mobile), 100%), 1fr));
  gap: var(--space-32) var(--space-24);
  margin-top: 20px;
}

@media (min-width: 1024px) {
  .category-section {
    width: calc(100% * 739 / 1120); /* garis section 739 (84:1435), sama dengan kolom kiri */
    margin-top: 50px;
  }

  /* Baris atas: hero di kolom kiri (x 160, lebar 739, 21:4974) dan kolom samping di kolom kanan (x 923 = 160 + 739 + 24, lebar 357, 130:2202) */
  .top {
    display: flex;
    align-items: flex-start;
  }

  .hero-slot {
    flex: none;
    width: calc(100% * 739 / 1120);
  }

  .sidebar {
    width: calc(100% * 357 / 1120);
    margin-left: auto;
  }

  .hero-slot + .sidebar {
    margin-top: 0;
  }

  /* Dasar baris atas (hero 21:4974 y 178 + 531 = 709, daftar kolom samping 34:354 berakhir y 709) ke judul Rekomendasi 42:376 (y 782): 73 */
  .top + .recommended {
    margin-top: 73px;
  }

  /* Kolom kiri 739 dari 1120 */
  .list {
    width: calc(100% * 739 / 1120);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 23px; /* 21:4950 jarak horizontal kartu 358 + 23 + 358 = 739 */
    row-gap: 48px; /* jarak baris diukur: 44 (57:514-57:515), 52 (57:515-48:310); dipakai rata-rata */
    margin-top: 28px; /* garis 42:374 bawah y=820 ke kartu y=848 */
  }

  /* Ruang Visual 2x2: 358 + 23 + 358 = 739 (101:2708 x 160, 101:2709 x 541); baris 32 (3502 + 638,4 ke 4171 = 32,6).
     Garis section 65:1071 (y 3486-3489) ke blok 101:2709 (y 3501): 12-13; dipakai 13 (judul topik bermargin 10, teks mulai 23). */
  .topics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 23px;
    margin-top: 13px;
  }

  /* Lebar 739 sudah ditetapkan pada .category-section; daftar di dalamnya mengisi penuh agar tidak dipersempit dua kali */
  .category-section .list {
    width: 100%;
  }
}
</style>
