<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'

// Breadcrumb Detail: Beranda > kategori > judul. Kategori WordPress = tautan /kategori/<slug>, selain itu teks biasa.
// Judul = halaman saat ini (aria-current="page"), bukan tautan; satu baris, dipotong "..." bila panjang.
const props = defineProps<{
  category: ArticleCategory | null
  title: string
}>()

const categories = useCategories()
const categoryTo = computed(() => (props.category ? categoryLink(props.category.slug, categories.value) : null))
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
  gap: 4px;
  height: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
  min-width: 0;
}

/* Hanya judul yang boleh menyusut dan dipotong */
.item--current {
  flex: 0 1 auto;
}

.crumb {
  font: var(--type-metadata);
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
  width: 8px;
  height: 8px;
}

/* Area klik >= 24 x 24 px (WCAG 2.5.8) lewat ::after tak terlihat berpusat pada tautan; tampilan tidak berubah. */
a.crumb {
  position: relative;
}

a.crumb::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, 24px);
  height: 24px;
  transform: translate(-50%, -50%);
}

@media (hover: hover) {
  a.crumb:hover {
    text-decoration: underline;
  }
}

@media (min-width: 1024px) {
  .list,
  .item {
    gap: 6px;
  }
}
</style>
