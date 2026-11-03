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
    <!-- Papan iklan (E6): penampung statis `AdSlot` di posisi iklan frame final. Rekomendasi: 237 + 368 di kolom kanan (desktop 57:589, 63:600),
         lebar 737 setelah baris ketiga (desktop 84:1442), 354x78 setelah kartu ketiga (mobile 165:1933). Rekomendasi dan Ruang Visual tanpa "Lainnya" (E4). -->
    <section class="recommended">
      <HomeSectionTitle title="Rekomendasi" />
      <ul v-if="data && data.articles.length" class="list">
        <template v-for="(article, index) in data.articles" :key="article.id">
          <li>
            <NewsCard :article="article" :now="data.now" :eager="index < 2" />
          </li>
          <li v-if="index === 2" class="ad-item ad-item--compact">
            <AdSlot variant="mobile-s" />
          </li>
          <li v-if="index === 5" class="ad-item ad-item--wide">
            <AdSlot variant="wide-m" />
          </li>
        </template>
      </ul>
      <p v-else class="empty">
        Belum ada berita.
      </p>
      <div class="side-ads">
        <AdSlot variant="sidebar-m" />
        <AdSlot variant="sidebar-l" />
      </div>
    </section>
    <template v-for="(section, sectionIndex) in sections" :key="section.slug">
      <!-- Section kategori pertama membawa slot iklan: 357x78 di kolom kanan (desktop 63:627), 354x237 setelah kartu ketiga (mobile 165:1944) -->
      <section v-if="section.articles.length" class="category-section" :class="{ 'category-section--ad': sectionIndex === 0 }">
        <HomeSectionTitle
          :title="section.title"
          :more-to="categoryPath(section.slug)"
          :more-label="`Lainnya: ${section.title}`"
        />
        <ul class="list">
          <template v-for="(article, index) in section.articles" :key="article.id">
            <li>
              <NewsCard :article="article" :now="section.now" />
            </li>
            <li v-if="sectionIndex === 0 && index === 2" class="ad-item ad-item--compact">
              <AdSlot variant="mobile-m" />
            </li>
          </template>
        </ul>
        <div v-if="sectionIndex === 0" class="section-ad">
          <AdSlot variant="sidebar-s" />
        </div>
      </section>
      <!-- Mobile 100:2448 (354x237) dan 100:2536 (354x78): sebelum Ruang Visual -->
      <div v-if="sectionIndex === 0 && section.articles.length" class="mobile-ads">
        <AdSlot variant="mobile-m" />
        <AdSlot variant="mobile-s" />
      </div>
      <template v-if="section.slug === VISUAL_AFTER_SLUG && visual && visual.topics.length">
        <section class="category-section">
          <HomeSectionTitle title="Ruang Visual" />
          <div class="topics">
            <HomeVisualTopic v-for="entry in visual.topics" :key="entry.topic.id" :entry="entry" />
          </div>
        </section>
        <!-- Desktop 63:595 (1118x159): setelah Ruang Visual -->
        <div class="wide-ad">
          <AdSlot variant="wide-l" />
        </div>
      </template>
    </template>
  </main>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  margin: 0 auto;
  padding: 31px var(--space-24) var(--space-24); /* atas: header mobile berakhir y 51 (116:1662), hero mulai y 82 (90:2130): 31 */
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

/* Slot iklan (E6) di dalam daftar kartu: mobile (< 768, satu kolom) 354x78 / 354x237 setelah kartu ketiga (165:1933, 165:1944);
   tablet dan desktop (>= 768) 737x107 setelah kartu keenam (84:1442). Salah satu disembunyikan (display: none) sesuai lebar. */
.ad-item {
  grid-column: 1 / -1;
}

.ad-item--wide,
.side-ads,
.section-ad,
.wide-ad {
  display: none;
}

/* Mobile: dua iklan sebelum Ruang Visual, jarak 32 (100:2448 berakhir y 3317, 100:2536 y 3349) */
.mobile-ads {
  display: grid;
  gap: var(--space-32);
  margin-top: 30px; /* jarak section mobile */
}

.top + .recommended {
  margin-top: 34px;
}

@media (min-width: 768px) {
  .ad-item--compact {
    display: none;
  }

  .ad-item--wide {
    display: block;
  }
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
  .home {
    padding-top: 37px; /* header 94 + menu kategori 47 berakhir y 141 (21:4951), hero mulai y 178 (21:4974): 37 */
  }

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

  /* E2: tab kolom samping mulai 17 di atas hero (130:2202 y 161, hero 21:4974 y 178); tab 50 + celah 16 + daftar 482 = 548, jadi daftar berakhir
     di y 709 = dasar hero (178 + 531). Tinggi baris atas = 531, Rekomendasi tepat di bawah keduanya. */
  .hero-slot + .sidebar,
  .sidebar {
    margin-top: -17px;
  }

  /* Dasar baris atas (hero 21:4974 y 178 + 531 = 709, daftar kolom samping 34:354 berakhir y 709) ke judul Rekomendasi 42:376 (y 782): 73 */
  .top + .recommended {
    margin-top: 73px;
  }

  /* Rekomendasi: judul selebar kontainer (42:374), daftar di kolom kiri 739, iklan 237 + 368 di kolom kanan 357 (923 = 160 + 739 + 24) */
  .recommended {
    display: grid;
    grid-template-columns: calc(100% * 739 / 1120) calc(100% * 357 / 1120);
    justify-content: space-between;
  }

  .recommended > :first-child {
    grid-column: 1 / -1;
  }

  .side-ads {
    display: flex;
    flex-direction: column;
    gap: var(--space-32); /* 57:589 berakhir y 1317, 63:600 mulai y 1349 */
    grid-column: 2;
    grid-row: 2;
    align-self: start;
    margin-top: 28px; /* sejajar kartu pertama (garis ke kartu 28) */
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
  .category-section .list,
  .recommended .list {
    width: 100%;
  }

  /* Section kategori pertama: iklan 357x78 di kolom kanan sejajar kartu pertama (63:627 y 3019 = kartu 48:385 y 3019) */
  .category-section--ad {
    display: grid;
    grid-template-columns: calc(100% * 739 / 1120) calc(100% * 357 / 1120);
    justify-content: space-between;
    width: 100%;
  }

  .category-section--ad > :not(.section-ad) {
    grid-column: 1;
  }

  .section-ad {
    display: block;
    grid-column: 2;
    grid-row: 2;
    align-self: start;
    margin-top: 28px;
  }

  .mobile-ads {
    display: none;
  }

  /* 63:595 (1118x159) y 4874, 63 di bawah Ruang Visual (berakhir 4811); judul Nasional y 5053, 20 di bawah iklan (berakhir 5033) */
  .wide-ad {
    display: block;
    margin-top: 63px;
  }

  .wide-ad + .category-section {
    margin-top: 20px;
  }
}
</style>
