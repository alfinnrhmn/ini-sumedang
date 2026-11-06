<script setup lang="ts">
import type { ArticleDetail } from '~/types/article'
import { visibleTags } from '~/config/home'

// Kepala artikel: label kategori • tag, judul (h1), ringkasan, identitas + waktu baca. Label kedua = tag tampil pertama (tag fungsional `terpopuler` tidak ikut);
// tanpa tag hanya kategori, tanpa keduanya label tidak dirender. Tanggal terbit ditampilkan di baris waktu baca.
const props = defineProps<{ article: ArticleDetail }>()

const category = computed(() => props.article.categories[0]?.name ?? '')
// Kategori yang ada di daftar kategori WordPress = tautan ke /kategori/<slug>; label kedua (tag) tetap teks biasa.
const categories = useCategories()
const categoryTo = computed(() => {
  const first = props.article.categories[0]
  return first ? categoryLink(first.slug, categories.value) : null
})
const tag = computed(() => visibleTags(props.article.tags)[0]?.name ?? '')
const date = computed(() => formatPublishDate(props.article.publishedAt))
</script>

<template>
  <header class="head">
    <p v-if="category || tag" class="label">
      <NuxtLink v-if="category && categoryTo" :to="categoryTo" :aria-current="undefined" class="category-link">{{ category }}</NuxtLink>
      <span v-else-if="category">{{ category }}</span>
      <span v-if="category && tag" class="dot" aria-hidden="true" />
      <span v-if="tag">{{ tag }}</span>
    </p>
    <div class="text">
      <h1 class="title">
        {{ article.title }}
      </h1>
      <p v-if="article.excerpt" class="excerpt">
        {{ article.excerpt }}
      </p>
    </div>
    <div class="meta">
      <img class="avatar" src="/images/avatar-mobile.png" alt="" width="40" height="40">
      <div class="meta-text">
        <p class="author">
          {{ article.authorLabel }}
        </p>
        <p class="sub">
          <time :datetime="article.publishedAt">{{ date }}</time> · {{ article.readingMinutes }} menit baca
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.head {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  min-width: 0;
}

.label {
  display: flex;
  align-items: center;
  gap: 6px;
  font: var(--type-card-label-mobile);
  text-transform: uppercase;
  color: var(--color-brand);
}

/* Tautan kategori mewarisi warna dan huruf label; hover bergaris bawah.
   Area klik >= 24 x 24 px (WCAG 2.5.8) lewat ::after tak terlihat berpusat pada tautan; tampilan tidak berubah. */
.category-link {
  position: relative;
}

.category-link::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, 24px);
  height: 24px;
  transform: translate(-50%, -50%);
}

@media (hover: hover) {
  .category-link:hover {
    text-decoration: underline;
  }
}

.dot {
  flex: none;
  width: 5px;
  height: 5px;
  border-radius: var(--radius-full);
  background: var(--color-brand);
}

.text {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  min-width: 0;
}

.title {
  font: var(--type-headline-mobile);
  letter-spacing: var(--tracking-headline);
  color: var(--color-article-title);
  overflow-wrap: anywhere;
}

/* Ringkasan: #5E6B7D Figma -> --color-footer-muted (selisih 8/5/8, kontras 4,97:1) */
.excerpt {
  font: var(--type-caption);
  color: var(--color-footer-muted);
  overflow-wrap: anywhere;
}

.meta {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  min-width: 0;
}

.avatar {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
}

.meta-text {
  min-width: 0;
}

.author {
  height: 15px;
  font: var(--type-card-author-mobile);
  color: var(--color-article-title);
}

.sub {
  height: 14px; /* baris 16,667 dalam kotak 14: blok identitas 29 = tinggi Figma */
  font: var(--type-card-timestamp);
  color: var(--color-footer-muted);
}

@media (min-width: 1024px) {
  .head {
    padding-bottom: 28px;
  }

  /* Inter Bold 13/19 di Figma; Inter 700 belum di-host (hanya 300-600), dirender 600 */
  .label {
    font: 700 13px/19px var(--font-sans);
  }

  .text {
    gap: var(--space-16);
  }

  /* Inter Bold 46/55 (700 dirender 600) */
  .title {
    font: 700 46px/55px var(--font-sans);
    letter-spacing: 0;
  }

  .excerpt {
    font: 400 20px/30px var(--font-sans);
  }

  .meta {
    gap: 14px;
  }

  .avatar {
    width: 36px;
    height: 36px;
  }

  .meta-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .author {
    height: auto;
    font: 600 14px/19px var(--font-sans);
  }

  .sub {
    height: auto;
    font: 400 12px/17px var(--font-sans);
  }
}
</style>
