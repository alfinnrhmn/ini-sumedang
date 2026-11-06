<script setup lang="ts">
import type { Article } from '~/types/article'

// Kartu blok Berita Terkait di bawah artikel. Satu tautan per kartu (judul; overlay ::after menutup kartu); gambar dan avatar bukan tautan.
// Waktu hanya di mobile (desktop hanya penerbit).
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
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: var(--color-black);
}

.media {
  aspect-ratio: 354 / 210;
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
  gap: 12px;
  padding: 15px 0 var(--space-16);
  min-width: 0;
}

.title {
  font: var(--type-card-headline-mobile);
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

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* Waktu: #727272 Figma tak punya token dalam 4 level; dipakai --color-footer-muted (selisih 12/2/19, kontras 4,97:1; --color-gray-3 gagal AA 3,84:1) */
.time {
  flex: none;
  margin-left: var(--space-8); /* 8 + 8 = celah 16 penerbit-waktu */
  font: 400 12px/18px var(--font-sans);
  color: var(--color-footer-muted);
  white-space: nowrap;
}

@media (min-width: 1024px) {
  .card {
    gap: 20px;
  }

  .media {
    aspect-ratio: 243 / 150;
    border-radius: 0;
  }

  .media img {
    border-radius: 0;
  }

  .body {
    gap: var(--space-16);
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
    gap: 14px;
  }

  .avatar {
    border-radius: var(--radius-10); /* lingkaran 20 */
  }

  .time {
    display: none; /* desktop hanya penerbit */
  }
}
</style>
