<script setup lang="ts">
import type { ArticleDetailResponse } from '~/types/article'

// Header: hamburger (laci kategori) + logo, kolom cari, menu kategori (>= 1024). < 1024: ikon cari membuka baris input
// (tinggi 51); tutup/Esc mengembalikan fokus ke ikon cari. Slot tombol tema (30 + 8) dicadangkan walau tak dirender.
const { data } = await useCategoriesFetch()
const categories = computed(() => data.value?.categories ?? [])

// Kategori pertama artikel Detail disorot di menu dan laci (tanpa aria-current), dibaca dari payload article-<slug>;
// di server header memakai kunci sama (dedupe: 'defer' di kedua pemanggil) supaya ada di HTML SSR; galat diabaikan.
const route = useRoute()
const detailSlug = computed(() => (route.name === 'berita-slug' ? String(route.params.slug) : ''))
const detailKey = (slug: string) => `article-${slug}`
if (import.meta.server && detailSlug.value) {
  await useFetch<ArticleDetailResponse>(`/api/article/${encodeURIComponent(detailSlug.value)}`, { key: detailKey(detailSlug.value), dedupe: 'defer' })
}
const nuxtApp = useNuxtApp()
const activeSlug = computed(() => {
  if (!detailSlug.value) return null
  const detail = nuxtApp.payload.data[detailKey(detailSlug.value)] as ArticleDetailResponse | undefined
  return detail?.article.categories[0]?.slug ?? null
})

const drawerId = useId()
const open = ref(false)
const toggleButton = ref<HTMLButtonElement | null>(null)

async function closeDrawer() {
  open.value = false
  await nextTick()
  toggleButton.value?.focus()
}

// Tautan kategori di laci menutup laci TANPA fokus ke hamburger (halaman tujuan memindahkan fokus ke <h1>).
// Rute lain: watcher di bawah; tautan ke halaman SEDANG dibuka tak mengubah rute, jadi tutup + fokus ke <h1> di sini.
watch(() => route.fullPath, () => {
  if (open.value) open.value = false
  if (searchOpen.value) searchOpen.value = false
})

async function onDrawerNavigate(to: string) {
  open.value = false
  if (to === route.fullPath) {
    await nextTick()
    focusPageHeading()
  }
}

// Baris pencarian mobile
const searchId = useId()
const searchOpen = ref(false)
const searchToggle = ref<HTMLButtonElement | null>(null)

async function closeSearch() {
  searchOpen.value = false
  await nextTick()
  searchToggle.value?.focus()
}

// Setelah kata kunci dikirim, baris ditutup TANPA fokus ke ikon cari (halaman /cari memindahkan fokus ke <h1>);
// bila tujuan sama dengan halaman yang dibuka (rute tidak berubah), fokus dipindah ke <h1> di sini.
const router = useRouter()
async function onSearchNavigate(to: string) {
  searchOpen.value = false
  if (router.resolve(to).fullPath === route.fullPath) {
    await nextTick()
    focusPageHeading()
  }
}
</script>

<template>
  <header class="header">
    <div class="bar" :class="{ 'bar--search': searchOpen }">
      <button
        v-if="categories.length"
        ref="toggleButton"
        type="button"
        class="hamburger"
        aria-label="Menu kategori"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="drawerId"
        @click="open = true"
      >
        <img
          class="icon icon-d"
          src="/icons/hamburger-md-40.svg"
          alt=""
          width="40"
          height="40"
        >
        <img
          class="icon icon-m"
          src="/icons/hamburger-md-24.svg"
          alt=""
          width="24"
          height="24"
        >
      </button>
      <NuxtLink to="/" class="logo" aria-label="IniSumedang — Beranda">
        <img
          src="/images/inisumedang-logo-footer.png"
          alt=""
          width="216"
          height="44"
        >
      </NuxtLink>
      <LayoutSearchForm
        :id="searchId"
        :open="searchOpen"
        class="bar-search"
        @close="closeSearch"
        @navigate="onSearchNavigate"
      />
      <button
        ref="searchToggle"
        type="button"
        class="search-toggle"
        aria-label="Cari berita"
        :aria-expanded="searchOpen ? 'true' : 'false'"
        :aria-controls="searchId"
        @click="searchOpen = true"
      >
        <img
          src="/icons/search-14.svg"
          alt=""
          width="14"
          height="14"
        >
      </button>
    </div>
    <template v-if="categories.length">
      <LayoutCategoryMenu :categories="categories" :active-slug="activeSlug" />
      <LayoutCategoryDrawer
        :id="drawerId"
        :open="open"
        :categories="categories"
        :active-slug="activeSlug"
        @close="closeDrawer"
        @navigate="onDrawerNavigate"
      />
    </template>
  </header>
</template>

<style scoped>
/* Mobile: bilah y 25 (padding atas 25), blok hamburger + logo y 27 (tinggi 24, rata bawah bilah 26 = 2 px dari atas),
   margin samping 24. Tinggi total 51. */
.bar {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  height: 51px;
  margin: 0 auto;
  padding: 27px var(--space-24) 0; /* 25 (bilah) + 2 */
}

.hamburger {
  flex: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  line-height: 0;
  cursor: pointer;
}

.icon {
  display: block;
}

/* Ikon cari mobile: 30 x 26 (padding 8 x 5 + border 1: ikon 14 x 14 pada x 8, y 6), latar #F8F8F8, border 5%, radius 6.
   Margin kanan 38 (slot tombol tema, 68 bersama celah); rata bawah bilah (y 25-51, isi y 27). Area ketuk 44 x 44. */
.search-toggle {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  width: 30px;
  height: 26px;
  margin: -2px 38px 0 auto;
  padding: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-6);
  background: var(--color-surface);
  line-height: 0;
  cursor: pointer;
}

.search-toggle::after {
  content: '';
  position: absolute;
  inset: -9px -7px;
}

/* Tanpa JS (< 1024) ikon cari disembunyikan dan form (SearchForm) tampil sebagai baris kedua bilah. */
@media (max-width: 1023.98px) and (scripting: none) {
  .bar {
    flex-wrap: wrap;
    height: auto;
  }

  .search-toggle {
    display: none;
  }

  .bar .bar-search {
    flex: 0 0 100%;
    order: 3;
    margin-top: var(--space-8);
  }
}

/* Baris pencarian terbuka (< 1024): hamburger, logo, ikon cari disembunyikan;
   form (tinggi 40) rata bawah bilah 51 => padding atas 11 */
@media (max-width: 1023.98px) {
  .bar--search {
    padding-top: 11px;
  }

  .bar--search .hamburger,
  .bar--search .logo,
  .bar--search .search-toggle {
    display: none;
  }
}

.icon-d {
  display: none;
}

.logo {
  display: block;
  flex: none;
  width: 110px;
  height: 22px;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Desktop: tinggi 94, hamburger 40 x 40 lalu logo 236 x 64 (padding 10, gambar 216 x 44), gap 6 */
@media (min-width: 1024px) {
  .bar {
    height: 94px;
    padding: 0 var(--space-24);
  }

  .icon-d {
    display: block;
  }

  .icon-m {
    display: none;
  }

  .logo {
    width: 236px;
    height: 64px;
    padding: 10px;
  }

  /* Kolom cari x 639 (160 + 282 + 197): margin kiri 191 + celah flex 6 = 197 dari logo.
     Pusat vertikal bilah (y 20-74 dari 94). */
  .bar-search {
    margin-left: 191px;
  }

  .search-toggle {
    display: none;
  }
}
</style>
