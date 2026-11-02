<script setup lang="ts">
import type { CategoriesResponse } from '~/types/article'

// Header situs (HOME-06). Desktop >= 1024: hamburger + logo (21:5360, 1440 x 94) dan menu kategori (21:4951, 1440 x 47)
// di bawahnya. Di bawah 1024: hamburger + logo di kiri (116:1662, 354 x 26), kanan kosong. Kolom pencarian (21:5270),
// ikon cari (116:1647) dan tombol tema (21:4970, 116:1636) tidak dirender (keputusan pemilik; pencarian = PAGE-004).
// Hamburger membuka laci 9 kategori (G20), sama di desktop dan mobile.
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

const route = useRoute()
watch(() => route.fullPath, () => {
  if (open.value) open.value = false
})
</script>

<template>
  <header class="header">
    <div class="bar">
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
    </div>
    <template v-if="categories.length">
      <LayoutCategoryMenu :categories="categories" />
      <LayoutCategoryDrawer
        :id="drawerId"
        :open="open"
        :categories="categories"
        @close="closeDrawer"
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
}
</style>
