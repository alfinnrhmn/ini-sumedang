<script setup lang="ts">
import type { Article, SearchResponse, SidebarResponse } from '~/types/article'
import { CATEGORY_PAGE_PATTERN } from '~/config/category'
import { normalizeSearchQuery, SEARCH_EMPTY_MESSAGE, SEARCH_INVALID_MESSAGE } from '~/config/search'

// `q` divalidasi seperti server (normalizeSearchQuery): kosong/tak valid = 200 + pesan netral, tanpa API.
// `halaman` tak valid = 404. Kata kunci hanya teks (interpolasi Vue), TIDAK masuk <title>/meta; noindex.

const route = useRoute()
// `q` dan `halaman` diteruskan apa adanya (string; array untuk ganda; null tanpa nilai): validasi memutuskan.
const query = computed(() => normalizeSearchQuery(route.query.q))
const pageParam = computed(() => route.query.halaman)
const pageNumber = computed(() => {
  const value = pageParam.value
  if (value === undefined) return 1
  return typeof value === 'string' && CATEGORY_PAGE_PATTERN.test(value) ? Number(value) : null
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

// Halaman 2 dst. tanpa kata kunci valid tak punya isi (seperti di luar batas): 404; halaman 1 = pesan netral.
function checkRoute() {
  if (pageNumber.value === null || (query.value === null && pageNumber.value > 1)) throw pageError(404)
}
checkRoute()

const { data, error } = await useAsyncData<SearchResponse | null>(
  () => `search-${JSON.stringify(route.query.q ?? null)}-${JSON.stringify(pageParam.value ?? null)}`,
  () => (query.value === null
    ? Promise.resolve(null)
    : $fetch<SearchResponse>('/api/search', { query: { q: query.value, ...(pageParam.value === undefined ? {} : { halaman: pageParam.value }) } }))
)

if (error.value) throw pageError(error.value.statusCode ?? 500)

// Trending: hanya `popular`, kunci sama dengan Beranda/kategori; gagal memuat tidak menggagalkan halaman.
const { data: sidebar } = await useFetch<SidebarResponse>('/api/articles/sidebar', { key: 'articles-sidebar' })

// Gagal memuat pada navigasi berikutnya (mis. halaman sudah tak ada) atau rute tak valid: tampilkan halaman error.
watch(error, (value) => {
  if (value) showError(pageError(value.statusCode ?? 500))
})
watch(() => [route.query.q, route.query.halaman], () => {
  try {
    checkRoute()
  }
  catch (value) {
    showError(value as Error)
  }
})

// Tampilan: kata kunci tak valid = pesan netral (dari rute, seketika); selain itu mengikuti data (judul, jumlah, kartu,
// tombol selalu sinkron; data lama tetap tampil selama permintaan berikutnya berjalan).
const invalid = computed(() => query.value === null)
const shownQuery = computed(() => data.value?.query ?? '')
const articles = computed(() => data.value?.articles ?? [])
const pagination = computed(() => data.value?.pagination)
const now = computed(() => data.value?.now ?? '')

// "Lebih banyak": `shown` = artikel halaman awal + tambahan klien; `loadedPage` = halaman terakhir dimuat;
// keduanya dibuang saat kata kunci atau ?halaman berubah. Waktu relatif memakai `now` halaman awal.
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

// Judul dokumen konstan (kata kunci tidak dipantulkan ke <title>/meta); noindex.
useSeoMeta({
  title: 'Hasil pencarian - Ini Sumedang',
  robots: 'noindex'
})

// Fokus ke <h1> dan gulir ke atas HANYA untuk navigasi maju disengaja (bukan muat awal/hidrasi, bukan Back/Forward).
// Instansi sama (?q/?halaman berubah): saat data baru tiba, atau saat rute berubah bila kata kunci tak valid.
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
function afterRouteChange() {
  nextTick(() => {
    if (!historyNav.lastWasPop) {
      enterPage()
      return
    }
    const y = recalledScroll(route.fullPath)
    if (y !== undefined) window.scrollTo(0, y)
  })
}
watch(data, (value, previous) => {
  if (!value || value === previous) return
  afterRouteChange()
}, { flush: 'post' })
// Kata kunci tak valid tak punya `data` teramati: perubahan rute ke/antar kata kunci tak valid ditangani di sini.
watch(() => route.fullPath, () => {
  if (invalid.value) afterRouteChange()
}, { flush: 'post' })
</script>

<template>
  <main class="search-page">
    <ArticleBreadcrumb :category="null" title="Pencarian" />
    <div class="columns">
      <!-- Judul + jumlah hasil di baris 1 kolom kiri agar kolom kanan mulai di baris 2, sejajar atas daftar kartu -->
      <div class="head">
        <HomeSectionTitle title="Hasil pencarian" tag="h1" />
        <p v-if="!invalid && pagination" class="summary">
          {{ pagination.total }} berita untuk “{{ shownQuery }}”
        </p>
      </div>
      <div class="primary">
        <p v-if="invalid" class="empty">
          {{ SEARCH_INVALID_MESSAGE }}
        </p>
        <template v-else-if="pagination">
          <section v-if="shown.length" :aria-labelledby="listHeadingId">
            <!-- h2 tersembunyi menjaga urutan heading (h1 > h2 > h3 judul kartu) -->
            <h2 :id="listHeadingId" class="visually-hidden">
              Berita hasil pencarian
            </h2>
            <ul ref="listEl" class="list">
              <li v-for="(article, index) in shown" :key="article.id">
                <NewsCard :article="article" :now="now" :eager="index < 2" />
              </li>
            </ul>
          </section>
          <p v-else class="empty">
            {{ SEARCH_EMPTY_MESSAGE }}
          </p>
          <CategoryLoadMore
            :query="shownQuery"
            :loaded-page="loadedPage"
            :total-pages="pagination.totalPages"
            :articles="shown"
            @loaded="onLoaded"
          />
        </template>
      </div>
      <!-- Kolom kanan (357): widget sosial, Trending (kosong = tak dirender), lalu iklan; urutan sama di mobile -->
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
/* Seperti halaman kategori (tanpa frame): kontainer, jarak atas, jarak judul-ke-daftar meminjam Detail dan Beranda. */
.search-page {
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  margin: 0 auto;
  padding: 12px var(--space-24) var(--space-24);
}

.columns {
  margin-top: var(--space-8);
}

/* Jumlah hasil di bawah garis judul; kata kunci panjang tanpa spasi (maks. 100) dibungkus agar tak melewati layar */
.summary {
  margin-top: var(--space-8);
  color: var(--color-gray-2); /* 8,6 : 1 di atas putih */
  overflow-wrap: anywhere;
}

/* < 1024: kolom kanan di bawah kolom kiri, jarak seperti jarak section mobile Beranda (30) */
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

/* Mobile satu kolom kartu horizontal (354x104), tablet 2 kolom hanya bila kartu tidak lebih sempit dari kartu mobile;
   garis ke kartu pertama 30 */
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
  color: var(--color-footer-muted); /* 4,97 : 1 di atas putih */
}

@media (min-width: 1024px) {
  .search-page {
    padding-top: 9px;
  }

  /* Grid seperti halaman kategori: judul (kolom 1, baris 1), daftar + "Lebih banyak" (kolom 1, baris 2), kolom kanan
     (kolom 2, baris 2) dengan jarak atas --list-gap (28) agar atas widget = atas gambar kartu 1. Sticky: baris 2. */
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

  .head {
    grid-column: 1;
    grid-row: 1;
  }

  .primary {
    grid-column: 1;
    grid-row: 2;
  }

  .empty {
    /* Pesan tanpa kartu: jarak yang sama dengan daftar kartu */
    margin-top: var(--list-gap);
  }

  .secondary {
    grid-column: 2;
    grid-row: 2;
    margin-top: var(--list-gap);
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
    column-gap: 23px;
    row-gap: 48px;
    margin-top: var(--list-gap);
  }
}
</style>
