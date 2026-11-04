<script setup lang="ts">
import type { CategoriesResponse } from '~/types/article'

// Header situs (HOME-06). Desktop >= 1024: hamburger + logo (21:5360, 1440 x 94), kolom pencarian (21:5270, PAGE-004) dan menu kategori
// (21:4951, 1440 x 47) di bawahnya. Di bawah 1024: hamburger + logo di kiri (116:1662, 354 x 26) dan ikon cari (116:1647, PAGE-004) di kanan.
// Tombol tema (21:4970, 116:1636) tidak dirender (keputusan pemilik; dark mode ditunda); slotnya (30 + celah 8) tetap dicadangkan agar
// kolom cari dan ikon cari berada di posisi Figma (keputusan PAGE-004 [I], untuk ditinjau pemilik di POLISH-01).
// Hamburger membuka laci 9 kategori (G20), sama di desktop dan mobile.
// Pencarian (Keputusan PM 1): >= 1024 form selalu tampil; < 1024 ikon cari membuka baris input yang menggantikan isi bilah (hamburger + logo
// disembunyikan, tinggi bilah tetap 51), fokus ke input; tombol tutup dan Esc menutupnya dan mengembalikan fokus ke ikon cari; tanpa overlay.
const { data } = await useFetch<CategoriesResponse>('/api/categories', { key: 'categories' })
const categories = computed(() => data.value?.categories ?? [])

const drawerId = useId()
const open = ref(false)
const toggleButton = ref<HTMLButtonElement | null>(null)

async function closeDrawer() {
  open.value = false
  await nextTick()
  toggleButton.value?.focus()
}

// PAGE-003: mengikuti tautan kategori di laci menutup laci TANPA mengembalikan fokus ke hamburger (halaman tujuan memindahkan fokus
// ke <h1>-nya). Navigasi ke rute lain ditangani watcher di bawah; tautan menuju halaman yang SEDANG dibuka tidak mengubah rute,
// jadi laci ditutup dan fokus dipindah ke <h1> di sini.
const route = useRoute()
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

// PAGE-004: baris pencarian mobile
const searchId = useId()
const searchOpen = ref(false)
const searchToggle = ref<HTMLButtonElement | null>(null)

async function closeSearch() {
  searchOpen.value = false
  await nextTick()
  searchToggle.value?.focus()
}

// Setelah kata kunci dikirim, baris ditutup TANPA mengembalikan fokus ke ikon cari (halaman /cari memindahkan fokus ke <h1>-nya); bila tujuan
// sama dengan halaman yang sedang dibuka (rute tidak berubah), fokus dipindah ke <h1> di sini.
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
      <LayoutCategoryMenu :categories="categories" />
      <LayoutCategoryDrawer
        :id="drawerId"
        :open="open"
        :categories="categories"
        @close="closeDrawer"
        @navigate="onDrawerNavigate"
      />
    </template>
  </header>
</template>

<style scoped>
/* Mobile 116:1662: bilah y 25 (padding atas 25), blok hamburger + logo y 27 (tinggi 24, rata bawah bilah 26 -> 2 px dari atas bilah),
   margin samping 24. Tinggi total 51. */
.bar {
  display: flex;
  align-items: center;
  gap: 6px; /* 116:1627 gap 6 */
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  height: 51px;
  margin: 0 auto;
  padding: 27px var(--space-24) 0; /* 25 (bilah) + 2 (116:1627 y 2) */
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

/* Ikon cari mobile 116:1647: 30 x 26 (padding 8 x 5 + border 1: ikon 14 x 14 pada x 8, y 6), latar #F8F8F8, border rgba(8,8,8,0.05), radius 6.
   Pada bilah 116:1662 ikon berada di x 286 dari kiri bilah 354 (68 lebar bersama tombol tema 30 + celah 8): rata kanan dengan margin kanan 38
   (slot tombol tema). Bilah isinya setinggi 24 pada y 27; ikon 26 setinggi y 25-51 (rata bawah), jadi naik 2. Area ketuk diperluas ke 44 x 44. */
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

/* Tanpa JavaScript (< 1024) ikon cari tidak bisa membuka baris: ikon disembunyikan dan form (SearchForm) tampil sebagai baris kedua bilah. */
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

/* Baris pencarian terbuka (< 1024): hamburger, logo, dan ikon cari disembunyikan; form (40 tinggi) rata bawah bilah 51 => padding atas 11 */
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
  width: 110px; /* 116:1631 */
  height: 22px;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Desktop 21:5360: tinggi 94, hamburger 40 x 40 lalu logo 236 x 64 (padding 10, gambar 216 x 44), gap 6 */
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
    width: 236px; /* 21:5268 */
    height: 64px;
    padding: 10px; /* 21:5268 p 10 */
  }

  /* Kolom cari 21:5270 pada x 639 (160 + 282 + 197): margin kiri 191 + celah flex 6 = 197 dari logo (21:5360 gap 197). Pusat vertikal bilah (y 20-74 dari 94). */
  .bar-search {
    margin-left: 191px;
  }

  .search-toggle {
    display: none;
  }
}
</style>
