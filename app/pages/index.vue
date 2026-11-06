<script setup lang="ts">
import type { HeroResponse, HomeSectionsResponse, RecommendedResponse, SidebarResponse, VisualTopicsResponse } from '~/types/article'

useSeoMeta({ title: 'IniSumedang' })

const { data } = await useFetch<RecommendedResponse>('/api/articles/recommended', {
  key: 'articles-recommended'
})

// Hero: 4 artikel terbaru; kosong = hero tidak dirender, kurang dari 2 = tanpa titik.
const { data: hero } = await useFetch<HeroResponse>('/api/articles/hero', {
  key: 'articles-hero'
})

// Kolom samping: tab Terbaru | Terpopuler; `popular` kosong = tab Terpopuler tidak ditampilkan.
const { data: sidebar } = await useFetch<SidebarResponse>('/api/articles/sidebar', {
  key: 'articles-sidebar'
})

// Ruang Visual: 4 topik (kategori anak `ruang-visual`); `topics` kosong = section tidak dirender. Urutan: Rekomendasi -> section kategori ke-1 -> Ruang Visual -> section ke-2, ke-3, ke-4.
// Section kategori dipilih di server (/api/articles/home-sections); tanpa section kategori, Ruang Visual dan widget sosial mobile tetap dirender.
const { data: visual } = await useFetch<VisualTopicsResponse>('/api/articles/visual-topics', {
  key: 'articles-visual-topics'
})

// Section kategori: satu permintaan; server memilih section dan artikelnya (HOME_SECTION_MAX section x HOME_SECTION_ARTICLE_COUNT kartu).
const { data: sectionData } = await useFetch<HomeSectionsResponse>('/api/articles/home-sections', {
  key: 'articles-home-sections'
})

// Kolom kanan menempel hanya >= 1024 px: kolom iklan Rekomendasi (kontainer = grid Rekomendasi) dan iklan section kategori pertama (kontainer = section itu).
// Tab Terbaru | Terpopuler tidak ditempel: kontainernya (.top) setinggi hero, tanpa ruang gulir.
const sideAds = ref<HTMLElement | null>(null)
const sectionAd = ref<HTMLElement | null>(null)
function setSectionAd(el: unknown) {
  sectionAd.value = el as HTMLElement | null
}
useStickyColumn(sideAds)
useStickyColumn(sectionAd)

// Section tanpa artikel tidak ada di daftar (server hanya memilih kategori tak kosong); gagal dimuat = tanpa section (Ruang Visual tetap dirender).
const sections = computed(() => sectionData.value?.sections ?? [])
const sectionsNow = computed(() => sectionData.value?.now ?? '')
// Widget sosial mobile: setelah section ke-3, atau setelah section terakhir bila kurang dari 3 (tanpa section: setelah Ruang Visual).
const socialIndex = computed(() => Math.min(2, sections.value.length - 1))
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
    <!-- Rekomendasi (tanpa "Lainnya"): kolom kanan desktop = widget sosial + 2 iklan, iklan lebar setelah baris ketiga, iklan kecil setelah kartu ketiga (mobile) -->
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
      <div ref="sideAds" class="side-ads">
        <HomeSocialWidget />
        <AdSlot variant="sidebar-m" />
        <AdSlot variant="sidebar-l" />
      </div>
    </section>
    <template v-for="(section, sectionIndex) in sections" :key="section.slug">
      <!-- Section kategori pertama membawa slot iklan: di kolom kanan (desktop) dan setelah kartu ketiga (mobile) -->
      <section class="category-section" :class="{ 'category-section--ad': sectionIndex === 0 }">
        <HomeSectionTitle
          :title="section.title"
          :more-to="categoryPath(section.slug)"
          :more-label="`Lainnya: ${section.title}`"
        />
        <ul class="list">
          <template v-for="(article, index) in section.articles" :key="article.id">
            <li>
              <NewsCard :article="article" :now="sectionsNow" />
            </li>
            <li v-if="sectionIndex === 0 && index === 2" class="ad-item ad-item--compact">
              <AdSlot variant="mobile-m" />
            </li>
          </template>
        </ul>
        <div v-if="sectionIndex === 0" :ref="setSectionAd" class="section-ad">
          <AdSlot variant="sidebar-s" />
        </div>
      </section>
      <!-- Mobile: dua iklan sebelum Ruang Visual -->
      <div v-if="sectionIndex === 0" class="mobile-ads">
        <AdSlot variant="mobile-m" />
        <AdSlot variant="mobile-s" />
      </div>
      <!-- Mobile/tablet: widget sosial setelah section ke-3 (jarak 30); desktop memakai salinan di kolom kanan Rekomendasi -->
      <div v-if="sectionIndex === socialIndex" class="mobile-social">
        <HomeSocialWidget />
      </div>
      <template v-if="sectionIndex === 0 && visual && visual.topics.length">
        <section class="category-section">
          <HomeSectionTitle title="Ruang Visual" />
          <div class="topics">
            <HomeVisualTopic v-for="entry in visual.topics" :key="entry.topic.id" :entry="entry" />
          </div>
        </section>
        <!-- Desktop: iklan lebar setelah Ruang Visual -->
        <div class="wide-ad">
          <AdSlot variant="wide-l" />
        </div>
      </template>
    </template>
    <!-- Tanpa section kategori (WordPress tanpa kategori berartikel): Ruang Visual dan widget sosial mobile tetap dirender, urutan sama -->
    <template v-if="!sections.length">
      <template v-if="visual && visual.topics.length">
        <section class="category-section">
          <HomeSectionTitle title="Ruang Visual" />
          <div class="topics">
            <HomeVisualTopic v-for="entry in visual.topics" :key="entry.topic.id" :entry="entry" />
          </div>
        </section>
        <div class="wide-ad">
          <AdSlot variant="wide-l" />
        </div>
      </template>
      <div class="mobile-social">
        <HomeSocialWidget />
      </div>
    </template>
  </main>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  margin: 0 auto;
  padding: 31px var(--space-24) var(--space-24); /* header mobile berakhir y 51, hero mulai y 82: 31 */
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
  gap: var(--space-16) var(--space-24); /* mobile: pitch 120 = 104 + 16 */
  margin: 30px 0 0; /* garis (y 28) ke kartu pertama (y 58) */
  padding: 0;
  list-style: none;
}

.empty {
  margin-top: var(--space-24);
}

/* Mobile: hero lalu kolom samping, jarak 33 (tinggi hero 238, kolom samping 460); jarak ke judul Rekomendasi 34 */
.hero-slot + .sidebar {
  margin-top: 33px;
}

/* Slot iklan di dalam daftar kartu: mobile (< 768, satu kolom) setelah kartu ketiga; tablet dan desktop (>= 768) iklan lebar setelah kartu keenam.
   Salah satu disembunyikan (display: none) sesuai lebar. */
.ad-item {
  grid-column: 1 / -1;
}

.ad-item--wide,
.side-ads,
.section-ad,
.wide-ad {
  display: none;
}

/* Pembungkus yang hanya berisi slot tanpa iklan (mode WordPress; AdSlot tidak dirender, hanya komentar Vue) disembunyikan agar tidak meninggalkan celah (margin/gap).
   Mode fixture selalu berisi penampung. `.side-ads` berisi widget sosial, tidak pernah kosong. */
.ad-item:empty,
.mobile-ads:empty,
.section-ad:empty,
.wide-ad:empty {
  display: none;
}

/* Mobile: dua iklan sebelum Ruang Visual, jarak 32 */
.mobile-ads {
  display: grid;
  gap: var(--space-32);
  margin-top: 30px; /* jarak section mobile */
}

.top + .recommended {
  margin-top: 34px;
}

/* Mobile: widget sosial setelah kartu terakhir section ke-3, jarak 30 = jarak section mobile */
.mobile-social {
  margin-top: 30px;
}

@media (min-width: 768px) {
  .ad-item--compact {
    display: none;
  }

  .ad-item--wide {
    display: block;
  }
}

/* Jarak antar section: mobile 30, desktop 50 */
.category-section {
  margin-top: 30px;
}

/* Blok topik Ruang Visual: mobile ditumpuk, jarak antar blok 32. Mobile tidak punya judul section di desain;
   jarak garis ke teks topik diturunkan dari .list (30) = 20 + margin judul topik 10. */
.topics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--container-mobile), 100%), 1fr));
  gap: var(--space-32) var(--space-24);
  margin-top: 20px;
}

@media (min-width: 1024px) {
  .home {
    padding-top: 37px; /* header 94 + menu kategori 47 berakhir y 141, hero mulai y 178: 37 */
  }

  .category-section {
    width: calc(100% * 739 / 1120); /* garis section 739, sama dengan kolom kiri */
    margin-top: 50px;
  }

  /* Baris atas: hero di kolom kiri (lebar 739) dan kolom samping di kolom kanan (x 923 = 160 + 739 + 24, lebar 357) */
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

  /* Tab kolom samping mulai 17 di atas hero; tab 50 + celah 16 + daftar 482 = 548, jadi daftar berakhir di dasar hero (tinggi baris atas 531),
     Rekomendasi tepat di bawah keduanya. */
  .hero-slot + .sidebar,
  .sidebar {
    margin-top: -17px;
  }

  /* Dasar baris atas (hero y 178 + 531 = 709) ke judul Rekomendasi (y 782): 73 */
  .top + .recommended {
    margin-top: 73px;
  }

  /* Rekomendasi: judul selebar kontainer, daftar di kolom kiri 739, iklan 237 + 368 di kolom kanan 357 (923 = 160 + 739 + 24) */
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
    gap: var(--space-32);
    grid-column: 2;
    grid-row: 2;
    align-self: start;
    margin-top: 28px; /* sejajar kartu pertama (garis ke kartu 28) */
    /* Menempel di dalam area grid baris 2 (setinggi daftar Rekomendasi); top dihitung useStickyColumn (var(--space-24) tanpa JavaScript) */
    position: sticky;
    top: var(--space-24);
  }

  /* Kolom kiri 739 dari 1120 */
  .list {
    width: calc(100% * 739 / 1120);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 23px; /* jarak horizontal kartu 358 + 23 + 358 = 739 */
    row-gap: 48px; /* jarak baris diukur: 44 dan 52; dipakai rata-rata */
    margin-top: 28px; /* garis bawah y=820 ke kartu y=848 */
  }

  /* Ruang Visual 2x2: 358 + 23 + 358 = 739; jarak baris 32. Garis section ke blok topik 12-13: dipakai 13 (judul topik bermargin 10, teks mulai 23). */
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

  /* Section kategori pertama: iklan 357x78 di kolom kanan sejajar kartu pertama */
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
    /* Menempel di dalam area grid baris 2 (setinggi daftar section); top dihitung useStickyColumn */
    position: sticky;
    top: var(--space-24);
  }

  .mobile-ads,
  .mobile-social {
    display: none;
  }

  /* Iklan lebar 1118x159: 63 di bawah Ruang Visual, 20 di atas judul section berikutnya */
  .wide-ad {
    display: block;
    margin-top: 63px;
  }

  .wide-ad + .category-section {
    margin-top: 20px;
  }

  /* Tanpa iklan lebar: kembali ke jarak section biasa (50) */
  .wide-ad:empty + .category-section {
    margin-top: 50px;
  }
}
</style>
