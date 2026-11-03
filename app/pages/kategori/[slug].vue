<script setup lang="ts">
import type { Article, CategoryPageResponse, SidebarResponse } from '~/types/article'

// Halaman kategori (PAGE-003; tanpa frame Figma, PRD §3.2 G1): daftar berita satu kategori resmi, berhalaman, tanpa hero.
// E5 (evaluasi pemilik): tata letak Beranda/Detail = kolom kiri 739 (judul h1, kartu 2 kolom, "Lebih banyak") + kolom kanan 357.
// UX-001 (instruksi pemilik 3 Nov 2026): tab Terbaru | Terpopuler dihapus dari halaman ini; kolom kanan = widget sosial -> Trending (artikel Terpopuler,
// /api/articles/sidebar `popular`; kosong atau gagal dimuat = tidak dirender) -> papan iklan AdSlot; paginasi diganti tombol "Lebih banyak"
// (CategoryLoadMore: menambah kartu di bawah daftar tanpa memuat ulang halaman). Dibangun dari komponen yang ada (SectionTitle sebagai h1, NewsCard,
// ArticleBreadcrumb, AdSlot); keputusan tata letak = butuh peninjauan pemilik (POLISH-01). Data hanya lewat /api/category/<slug>?halaman=N.
// Slug tak dikenal, halaman tak valid, atau halaman melewati batas = status 404 (halaman error berlayout = task terpisah).
// Kategori tanpa artikel: halaman 1 menampilkan keadaan kosong netral. Kategori Berita = Beranda (E1): tidak punya halaman, dialihkan 308 ke "/".

// E1: slug ditulis literal (makro definePageMeta tidak boleh merujuk variabel setup); server route juga mengalihkan pada muat langsung (SSR).
definePageMeta({
  middleware: (to) => {
    if (to.params.slug === 'berita') return navigateTo('/', { redirectCode: 308 })
  }
})

const route = useRoute()
const slug = computed(() => String(route.params.slug))
// Parameter halaman diteruskan apa adanya (string; array untuk parameter ganda; null atau '' untuk kosong): server yang menilai validitasnya.
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

// Trending (UX-001): hanya `popular` yang dipakai; data kolom samping dibagikan dengan Beranda lewat kunci yang sama, kegagalan memuatnya tidak menggagalkan halaman.
const { data: sidebar } = await useFetch<SidebarResponse>('/api/articles/sidebar', { key: 'articles-sidebar' })

// Gagal memuat pada navigasi berikutnya (mis. halaman sudah tidak ada): tampilkan halaman error yang sama.
watch(error, (value) => {
  if (value) showError(pageError(value.statusCode ?? 500))
})

// Tampilan mengikuti data (bukan rute) agar judul, kartu, dan tombol "Lebih banyak" selalu sinkron; data lama tetap tampil selama permintaan berikutnya berjalan.
const category = computed(() => data.value?.category)
const articles = computed(() => data.value?.articles ?? [])
const pagination = computed(() => data.value?.pagination)
const now = computed(() => data.value?.now ?? '')

// "Lebih banyak" (UX-001): `shown` = artikel halaman awal + yang ditambahkan di klien; `loadedPage` = halaman terakhir yang sudah dimuat.
// Keduanya dibuang (kembali ke data rute) saat kategori atau ?halaman berubah lewat navigasi. Waktu relatif memakai `now` halaman awal.
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
  // Fokus ke tautan judul kartu baru pertama (tombol bisa hilang di halaman terakhir); tanpa menggulir agar tampilan tidak melompat.
  await nextTick()
  listEl.value?.children[firstNew]?.querySelector<HTMLElement>('a[href^="/berita/"]')?.focus({ preventScroll: true })
}

// Kolom kanan menempel pada >= 1024 px (UX-001 Keputusan PM 5)
const secondary = ref<HTMLElement | null>(null)
useStickyColumn(secondary)

// Judul dokumen "<Kategori> - Ini Sumedang" (catatan pemilik; Detail memakai "— IniSumedang", penyelarasan di SEO-001); deskripsi sederhana [I].
// Canonical = origin permintaan + /kategori/<slug> (+ ?halaman=N bila N > 1); basis produksi ditetapkan saat hosting [I].
const requestUrl = useRequestURL()
const title = computed(() => `${category.value?.name ?? 'Kategori'} - Ini Sumedang`)
const description = computed(() => `Berita ${category.value?.name ?? ''} terbaru dari IniSumedang.`)
const canonical = computed(() =>
  `${requestUrl.origin}${categoryPagePath(category.value?.slug ?? slug.value, pagination.value?.page ?? 1)}`
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

// Fokus ke <h1> dan gulir ke atas HANYA untuk navigasi maju yang disengaja (klik/Enter pada menu, laci, paginasi, footer, label kartu:
// kategori ke kategori, halaman ke halaman): tidak pada muat awal (SSR/hidrasi) dan tidak pada Back/Forward browser (popstate), supaya
// posisi gulir dipulihkan dan fokus tidak dicuri (temuan QA M1). Pembeda = trackHistoryNavigation (app/utils/focus.ts).
// Instansi baru (slug berubah atau dari halaman lain): setelah mount; Back/Forward ke instansi baru dipulihkan router (savedPosition).
// Instansi sama (hanya ?halaman berubah): saat data baru tiba; router Nuxt tidak memulihkan gulir bila path sama, jadi Back/Forward
// antar halaman paginasi memulihkan posisi yang diingat saat halaman itu ditinggalkan (rememberScroll).
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
      <div class="primary">
        <HomeSectionTitle :title="category.name" tag="h1" />
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
      <!-- Kolom kanan (357): widget sosial (SOC-001), Trending (UX-001; kosong = tidak dirender), lalu papan iklan (desktop 237 + 368; < 1024: 237 + 78 seperti mobile Beranda); urutan sama di mobile -->
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
/* Tanpa frame [?]: kontainer, jarak atas, dan jarak judul-ke-daftar meminjam Detail (breadcrumb) dan Beranda (daftar kartu).
   Mobile: header berakhir y 51, breadcrumb y 63 (12), judul 8 di bawahnya; desktop: menu berakhir y 141, breadcrumb y 150 (9), judul 18 di bawahnya. */
.category-page {
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  margin: 0 auto;
  padding: 12px var(--space-24) var(--space-24);
}

.columns {
  margin-top: var(--space-8);
}

/* < 1024: kolom kanan di bawah kolom kiri (widget sosial, Trending, lalu dua iklan mobile), jarak seperti jarak section mobile Beranda (30) */
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

/* Sama dengan daftar kartu Beranda: mobile satu kolom kartu horizontal (354x104, pola Rekomendasi) dan tablet 2 kolom hanya bila
   kartu tidak lebih sempit dari kartu mobile (auto-fill minmax 354); garis ke kartu pertama 30 (165:1727). */
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

  .columns {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 18px;
  }

  /* Kolom kiri 739 dan kolom kanan 357 dari 1120 (21:4950: daftar x 160 lebar 739, kolom kanan x 923 lebar 357), fluid di bawah 1280 seperti Beranda */
  .primary {
    flex: none;
    width: calc(100% * 739 / 1120);
  }

  .secondary {
    flex: none;
    width: calc(100% * 357 / 1120);
    margin-top: 0;
    /* UX-001 Keputusan PM 5: menempel di dalam .columns; nilai top dihitung useStickyColumn (var(--space-24) tanpa JavaScript) */
    position: sticky;
    top: var(--space-24);
  }

  .ads--desktop {
    display: grid;
  }

  .ads--mobile {
    display: none;
  }

  /* Dua kolom kartu 358 dengan celah 23 = 739 (sama dengan daftar Rekomendasi Beranda 21:4950) */
  .list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 23px; /* 21:4950 jarak horizontal kartu 358 + 23 */
    row-gap: 48px; /* sama dengan daftar Beranda */
    margin-top: 28px; /* garis 42:374 bawah ke kartu: sama dengan Beranda */
  }
}
</style>
