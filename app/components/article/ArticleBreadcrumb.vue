<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'

// Breadcrumb Detail (130:2399 desktop, 130:3331 mobile): Beranda > kategori > judul.
// "Beranda" = tautan ke "/". Kategori = teks biasa selama `categoryPath` null (PAGE-003 belum ada), tautan bila terisi.
// Judul = halaman saat ini (aria-current="page"), bukan tautan; satu baris, dipotong "..." bila panjang.
const props = defineProps<{
  category: ArticleCategory | null
  title: string
}>()

const categoryTo = computed(() => (props.category ? categoryPath(props.category.slug) : null))
</script>

<template>
  <nav class="breadcrumb" aria-label="Jejak halaman">
    <ol class="list">
      <li class="item">
        <NuxtLink to="/" class="crumb">
          Beranda
        </NuxtLink>
      </li>
      <li v-if="category" class="item">
        <img class="arrow" src="/icons/breadcrumb-arrow.svg" alt="" width="8" height="8">
        <NuxtLink v-if="categoryTo" :to="categoryTo" class="crumb">
          {{ category.name }}
        </NuxtLink>
        <span v-else class="crumb">{{ category.name }}</span>
      </li>
      <li class="item item--current">
        <img class="arrow" src="/icons/breadcrumb-arrow.svg" alt="" width="8" height="8">
        <span class="crumb current" aria-current="page">{{ title }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.list {
  display: flex;
  align-items: center;
  gap: 4px; /* mobile 130:3331 */
  height: 16px; /* 130:2399 / 130:3331 */
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 4px; /* mobile 130:3331 (panah 8 diapit gap 4) */
  flex: none;
  min-width: 0;
}

/* Hanya judul yang boleh menyusut dan dipotong */
.item--current {
  flex: 0 1 auto;
}

.crumb {
  font: var(--type-metadata); /* 130:2396 Inter Medium 11,111/15,555 (News/Metadata) */
  color: var(--color-black);
  white-space: nowrap;
}

.current {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow {
  flex: none;
  width: 8px; /* 130:2405 */
  height: 8px;
}

@media (hover: hover) {
  a.crumb:hover {
    text-decoration: underline;
  }
}

@media (min-width: 1024px) {
  .list,
  .item {
    gap: 6px; /* 130:2399 desktop */
  }
}
</style>
