<script setup lang="ts">
import type { Article } from '~/types/article'

// Kartu blok Berita Terkait di bawah artikel: desktop "Card recomendasion desktop" 243x260 (130:2903), mobile "Card news Mobile" 354x318 (130:3620).
// Satu tautan per kartu (judul; overlay ::after menutup kartu). Gambar dan avatar bukan tautan. Waktu hanya di mobile (desktop 130:2479: hanya penerbit).
const props = defineProps<{
  article: Article
  /** Waktu server (ISO) untuk waktu relatif. */
  now: string
}>()

const href = computed(() => articlePath(props.article))
const time = computed(() => formatRelativeTime(props.article.publishedAt, props.now))
</script>

<template>
  <article class="card">
    <div class="media">
      <img
        v-if="article.heroImage"
        :src="article.heroImage.url"
        :alt="article.heroImage.alt"
        :width="article.heroImage.width"
        :height="article.heroImage.height"
        loading="lazy"
      >
    </div>
    <div class="body">
      <h3 class="title">
        <NuxtLink :to="href" class="link">
          {{ article.title }}
        </NuxtLink>
      </h3>
      <div class="meta">
        <img class="avatar" src="/images/avatar-mobile.png" alt="" width="20" height="20">
        <span class="author">{{ article.authorLabel }}</span>
        <time class="time" :datetime="article.publishedAt">{{ time }}</time>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Mobile 130:3620: gambar 210 (radius 8), konten pt 15 / pb 16, gap 12 */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: var(--color-black);
}

.media {
  aspect-ratio: 354 / 210; /* I130:3620;90:2254 */
  background: var(--color-surface);
  border-radius: var(--radius-8);
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-8);
}

.body {
  display: flex;
  flex-direction: column;
  gap: 12px; /* I130:3620;98:828 */
  padding: 15px 0 var(--space-16); /* I130:3620;98:828 pt 15 pb 16 */
  min-width: 0;
}

.title {
  font: var(--type-card-headline-mobile); /* I130:3620;98:830 Inter SemiBold 16/22,4 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.link:focus-visible {
  outline: none;
}

.link:focus-visible::after {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: var(--radius-8);
}

@media (hover: hover) {
  .link:hover {
    text-decoration: underline;
  }
}

/* Sumber dan waktu I130:3620;98:831: celah 16; avatar 20 + celah 8 + nama Inter Medium 13/19 */
.meta {
  display: flex;
  align-items: center;
  gap: 8px; /* I130:3620;98:832 */
  min-width: 0;
}

.avatar {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
}

.author {
  min-width: 0;
  font: var(--type-card-author-desktop); /* 13/19 Figma -> News/Card/Author/Desktop 13,333/18,666 (selisih 0,33) */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Waktu I130:3620;98:837: Inter Regular 12/18, #727272 -> tak ada token dalam 4 level; --color-footer-muted (selisih 12/2/19, kontras 4,97:1; --color-gray-3 gagal AA 3,84:1) */
.time {
  flex: none;
  margin-left: var(--space-8); /* 8 + 8 = celah 16 penerbit-waktu */
  font: 400 12px/18px var(--font-sans);
  color: var(--color-footer-muted);
  white-space: nowrap;
}

/* Desktop 130:2903: kolom gap 20, gambar tinggi 150 (243 lebar, tanpa radius), judul 19,2/26,88 maks. 2 baris, penerbit gap 14 */
@media (min-width: 1024px) {
  .card {
    gap: 20px; /* 130:2903 */
  }

  .media {
    aspect-ratio: 243 / 150; /* I130:2903;130:2476 */
    border-radius: 0;
  }

  .media img {
    border-radius: 0;
  }

  .body {
    gap: var(--space-16); /* I130:2903;130:2477 */
    padding: 0;
  }

  .title {
    font: var(--type-card-headline-desktop);
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .link:focus-visible::after {
    border-radius: 0;
  }

  .meta {
    gap: 14px; /* I130:2903;130:2479 */
  }

  .avatar {
    border-radius: var(--radius-10); /* I130:2903;130:2481 rounded 10 (= lingkaran 20) */
  }

  .time {
    display: none; /* 130:2479: desktop hanya penerbit */
  }
}
</style>
