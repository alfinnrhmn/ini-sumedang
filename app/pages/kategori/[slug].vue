<script setup lang="ts">
import type { Article, CategoryPageResponse, SidebarResponse } from '~/types/article'
import { siteOrigin } from '~/config/site'

// Kategori resmi berhalaman tanpa hero; data lewat /api/category/<slug>?halaman=N. Slug/halaman tak valid: 404.
// Tanpa artikel: halaman 1 menampilkan keadaan kosong netral. Kategori Berita = Beranda: dialihkan 308 ke "/".

// Slug literal (makro definePageMeta tak boleh merujuk variabel setup); server route juga mengalihkan saat muat awal.
definePageMeta({
  middleware: (to) => {
    if (to.params.slug === 'berita') return navigateTo('/', { redirectCode: 308 })
  }
})

const route = useRoute()
const slug = computed(() => String(route.params.slug))
// Parameter halaman diteruskan apa adanya (string; array untuk ganda; null atau '' = kosong): server yang menilai.
const pageParam = computed(() => route.query.halaman)

const { data, error } = await useFetch<CategoryPageResponse>(() => `/api/category/${encodeURIComponent(slug.value)}`, {
  key: computed(() => `category-${slug.value}-${JSON.stringify(pageParam.value ?? null)}`),
  query: computed(() => (pageParam.value === undefined ? {} : { halaman: pageParam.value }))
})

function pageError(statusCode: number) {
  const notFound = statusCode === 404
  return createError({
    statusCode: notFound ? 404 : 500,
    statusMessage: notFound ? 'Not Found' : 'Internal Server Error',
    message: notFound ? 'Halaman tidak ditemukan.' : 'Halaman tidak dapat dimuat.',
    fatal: true
  })
}

if (error.value || !data.value) throw pageError(error.value ? (error.value.statusCode ?? 500) : 404)

// Trending: hanya `popular`, kunci sama dengan Beranda; gagal memuat tidak menggagalkan halaman.
const { data: sidebar } = await useFetch<SidebarResponse>('/api/articles/sidebar', { key: 'articles-sidebar' })

// Gagal memuat pada navigasi berikutnya (mis. halaman sudah tidak ada): tampilkan halaman error yang sama.
watch(error, (value) => {
  if (value) showError(pageError(value.statusCode ?? 500))
})

// Tampilan mengikuti data (bukan rute) agar judul, kartu, dan tombol sinkron; data lama tetap tampil saat memuat ulang.
const category = computed(() => data.value?.category)
const articles = computed(() => data.value?.articles ?? [])
const pagination = computed(() => data.value?.pagination)
const now = computed(() => data.value?.now ?? '')

// "Lebih banyak": `shown` = artikel halaman awal + tambahan klien; `loadedPage` = halaman terakhir dimuat;
// keduanya dibuang saat kategori atau ?halaman berubah lewat navigasi. Waktu relatif memakai `now` halaman awal.
const shown = ref<Article[]>([...articles.value])
const loadedPage = ref(data.value?.pagination.page ?? 1)
watch(data, (value) => {
  shown.value = [...(value?.articles ?? [])]
  loadedPage.value = value?.pagination.page ?? 1
})
const listEl = ref<HTMLElement | null>(null)
async function onLoaded(payload: { articles: Article[], page: number, added: number }) {
  const firstNew = shown.value.length
  shown.value = payload.articles
  loadedPage.value = payload.page
  if (payload.added < 1) return
  // Fokus ke tautan judul kartu baru pertama (tombol bisa hilang di halaman akhir); tanpa menggulir agar tak melompat.
  await nextTick()
  listEl.value?.children[firstNew]?.querySelector<HTMLElement>('a[href^="/berita/"]')?.focus({ preventScroll: true })
}

// Kolom kanan menempel pada >= 1024 px
const secondary = ref<HTMLElement | null>(null)
useStickyColumn(secondary)

// Judul dokumen "<Kategori> - Ini Sumedang" (Detail memakai "— IniSumedang"); deskripsi sederhana.
// Canonical = SITE_URL + /kategori/<slug> (+ ?halaman=N, N > 1); header Host tak dipakai di produksi (hanya mode dev).
const origin = siteOrigin(useRequestURL().origin, useRuntimeConfig().public.siteUrl)
const title = computed(() => `${category.value?.name ?? 'Kategori'} - Ini Sumedang`)
const description = computed(() => `Berita ${category.value?.name ?? ''} terbaru dari IniSumedang.`)
const canonical = computed(() =>
  `${origin}${categoryPagePath(category.value?.slug ?? slug.value, pagination.value?.page ?? 1)}`
)
useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: canonical
})
useHead({ link: [{ rel: 'canonical', href: canonical }] })

// Fokus ke <h1> dan gulir ke atas HANYA untuk navigasi maju disengaja (bukan muat awal/hidrasi, bukan Back/Forward).
// Hanya ?halaman berubah: router Nuxt tak memulihkan gulir bila path sama, jadi Back/Forward memakai rememberScroll.
const listHeadingId = useId()
const nuxtApp = useNuxtApp()
const router = useRouter()
const historyNav = trackHistoryNavigation(router)
function enterPage() {
  window.scrollTo(0, 0)
  focusPageHeading()
}
onMounted(() => {
  if (!nuxtApp.isHydrating && !historyNav.lastWasPop) enterPage()
})
onBeforeRouteUpdate((_to, from) => {
  rememberScroll(from.fullPath, window.scrollY)
})
watch(data, (value, previous) => {
  if (!previous || !value || value === previous) return
  nextTick(() => {
    if (!historyNav.lastWasPop) {
      enterPage()
      return
    }
    const y = recalledScroll(route.fullPath)
    if (y !== undefined) window.scrollTo(0, y)
  })
}, { flush: 'post' })
</script>

<template>
  <main v-if="category && pagination" class="category-page">
    <ArticleBreadcrumb :category="null" :title="category.name" />
    <div class="columns">
      <!-- Judul di baris sendiri (>= 1024: baris 1 grid) agar kolom kanan mulai di baris 2, sejajar atas daftar -->
      <HomeSectionTitle :title="category.name" tag="h1" class="page-title" />
      <div class="primary">
        <section v-if="shown.length" :aria-labelledby="listHeadingId">
          <!-- h2 tersembunyi menjaga urutan heading (h1 > h2 > h3 judul kartu), seperti judul section di Beranda -->
          <h2 :id="listHeadingId" class="visually-hidden">
            Berita {{ category.name }} terbaru
          </h2>
          <ul ref="listEl" class="list">
            <li v-for="(article, index) in shown" :key="article.id">
              <NewsCard :article="article" :now="now" :eager="index < 2" />
            </li>
          </ul>
        </section>
        <p v-else class="empty">
          Belum ada berita di kategori ini.
        </p>
        <CategoryLoadMore
          :slug="category.slug"
          :loaded-page="loadedPage"
          :total-pages="pagination.totalPages"
          :articles="shown"
          @loaded="onLoaded"
        />
      </div>
      <!-- Kolom kanan (357): widget sosial, Trending (kosong = tak dirender), lalu iklan
           (desktop 237 + 368; < 1024: 237 + 78 seperti mobile Beranda); urutan sama di mobile -->
      <div ref="secondary" class="secondary">
        <HomeSocialWidget />
        <HomeTrendingList v-if="sidebar" :articles="sidebar.popular" :now="sidebar.now" />
        <div class="ads ads--desktop">
          <AdSlot variant="sidebar-m" />
          <AdSlot variant="sidebar-l" />
        </div>
        <div class="ads ads--mobile">
          <AdSlot variant="mobile-m" />
          <AdSlot variant="mobile-s" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Kontainer, jarak atas, dan jarak judul-ke-daftar meminjam Detail (breadcrumb) dan Beranda (daftar kartu).
   Mobile: breadcrumb 12 di bawah header, judul 8 di bawahnya; desktop: breadcrumb 9 di bawah menu, judul 18. */
.category-page {
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  margin: 0 auto;
  padding: 12px var(--space-24) var(--space-24);
}

.columns {
  margin-top: var(--space-8);
}

/* < 1024: kolom kanan di bawah kiri (sosial, Trending, dua iklan mobile), jarak seperti section mobile Beranda (30) */
.secondary {
  display: grid;
  gap: var(--space-32);
  margin-top: 30px;
}

.ads {
  display: grid;
  gap: var(--space-32);
}

.ads--desktop {
  display: none;
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

/* Seperti daftar Beranda: mobile satu kolom kartu horizontal (354x104), tablet 2 kolom hanya bila kartu tidak lebih
   sempit dari kartu mobile (auto-fill minmax 354); garis ke kartu pertama 30. */
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--container-mobile), 100%), 1fr));
  gap: var(--space-16) var(--space-24);
  margin: 30px 0 0;
  padding: 0;
  list-style: none;
}

.empty {
  margin-top: var(--space-24);
  color: var(--color-footer-muted);
}

@media (min-width: 1024px) {
  .category-page {
    padding-top: 9px;
  }

  /* Grid 2 x 2: judul (kolom 1, baris 1), daftar + "Lebih banyak" (kolom 1, baris 2), kolom kanan (kolom 2, baris 2),
     jarak atas --list-gap (28) agar atas widget = atas kartu pertama; sticky di baris 2, tak menimpa judul/footer. */
  .columns {
    --list-gap: 28px;

    display: grid;
    /* Kolom kiri 739 dan kolom kanan 357 dari 1120, fluid di bawah 1280 seperti Beranda */
    grid-template-columns: calc(100% * 739 / 1120) calc(100% * 357 / 1120);
    grid-template-rows: auto auto;
    justify-content: space-between;
    align-items: start;
    margin-top: 18px;
  }

  .page-title {
    grid-column: 1;
    grid-row: 1;
  }

  .primary {
    grid-column: 1;
    grid-row: 2;
  }

  .secondary {
    grid-column: 2;
    grid-row: 2;
    margin-top: var(--list-gap);
    /* Menempel di dalam baris 2 .columns; nilai top dihitung useStickyColumn (var(--space-24) tanpa JavaScript) */
    position: sticky;
    top: var(--space-24);
  }

  .ads--desktop {
    display: grid;
  }

  .ads--mobile {
    display: none;
  }

  /* Dua kolom kartu 358 dengan celah 23 = 739 (sama dengan daftar Rekomendasi Beranda) */
  .list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 23px; /* jarak horizontal kartu 358 + 23 */
    row-gap: 48px; /* sama dengan daftar Beranda */
    margin-top: var(--list-gap); /* 28: garis bawah ke kartu, sama dengan Beranda; juga jarak atas kolom kanan */
  }
}
</style>
