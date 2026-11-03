<script setup lang="ts">
import type { CategoryPageResponse, SidebarResponse } from '~/types/article'

// Halaman kategori (PAGE-003; tanpa frame Figma, PRD §3.2 G1): daftar berita satu kategori resmi, berhalaman, tanpa hero.
// E5 (evaluasi pemilik): tata letak Beranda/Detail = kolom kiri 739 (judul h1, kartu 2 kolom, paginasi) + kolom kanan 357 (Terbaru | Terpopuler
// dari /api/articles/sidebar dan papan iklan AdSlot). Dibangun dari komponen yang ada (SectionTitle sebagai h1, NewsCard, ArticleBreadcrumb,
// HomeSidebarTabs, AdSlot); keputusan tata letak = butuh peninjauan pemilik (POLISH-01). Data hanya lewat /api/category/<slug>?halaman=N.
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

// Kolom kanan (sama dengan Beranda): data kolom samping dibagikan lewat kunci yang sama; kegagalan memuatnya tidak menggagalkan halaman.
const { data: sidebar } = await useFetch<SidebarResponse>('/api/articles/sidebar', { key: 'articles-sidebar' })
const sidebarHeadingId = useId()

// Gagal memuat pada navigasi berikutnya (mis. halaman sudah tidak ada): tampilkan halaman error yang sama.
watch(error, (value) => {
  if (value) showError(pageError(value.statusCode ?? 500))
})

// Tampilan mengikuti data (bukan rute) agar judul, kartu, dan paginasi selalu sinkron; data lama tetap tampil selama permintaan berikutnya berjalan.
const category = computed(() => data.value?.category)
const articles = computed(() => data.value?.articles ?? [])
const pagination = computed(() => data.value?.pagination)
const now = computed(() => data.value?.now ?? '')

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
        <section v-if="articles.length" :aria-labelledby="listHeadingId">
          <!-- h2 tersembunyi menjaga urutan heading (h1 > h2 > h3 judul kartu), seperti judul section di Beranda -->
          <h2 :id="listHeadingId" class="visually-hidden">
            Berita {{ category.name }} terbaru
          </h2>
          <ul class="list">
            <li v-for="(article, index) in articles" :key="article.id">
              <NewsCard :article="article" :now="now" :eager="index < 2" />
            </li>
          </ul>
        </section>
        <p v-else class="empty">
          Belum ada berita di kategori ini.
        </p>
        <CategoryPagination
          class="pager"
          :slug="category.slug"
          :page="pagination.page"
          :total-pages="pagination.totalPages"
        />
      </div>
      <!-- Kolom kanan seperti Beranda (357): Terbaru | Terpopuler, widget sosial (SOC-001), lalu papan iklan (desktop 237 + 368; < 1024: 237 + 78 seperti mobile Beranda) -->
      <div class="secondary">
        <aside v-if="sidebar && sidebar.latest.length" class="sidebar" :aria-labelledby="sidebarHeadingId">
          <h2 :id="sidebarHeadingId" class="visually-hidden">
            {{ sidebar.popular.length ? 'Terbaru dan Terpopuler' : 'Terbaru' }}
          </h2>
          <HomeSidebarTabs :latest="sidebar.latest" :popular="sidebar.popular" :now="sidebar.now" />
        </aside>
        <HomeSocialWidget />
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

/* < 1024: kolom kanan di bawah kolom kiri (tab Terbaru | Terpopuler lalu dua iklan mobile), jarak seperti jarak section mobile Beranda (30) */
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

/* Navigasi paginasi: jarak ke daftar kartu terakhir (tanpa frame) [?] */
.pager {
  margin-top: var(--space-40);
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
