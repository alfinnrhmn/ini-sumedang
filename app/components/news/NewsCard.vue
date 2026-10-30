<script setup lang="ts">
import type { Article } from '~/types/article'

const props = defineProps<{
  article: Article
  /** Waktu server (ISO) untuk waktu relatif. */
  now: string
  /** Gambar di atas lipatan: loading eager. */
  eager?: boolean
}>()

const href = computed(() => articlePath(props.article))
const category = computed(() => props.article.categories[0]?.name ?? '')
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
        :loading="eager ? 'eager' : 'lazy'"
      >
    </div>
    <div class="body">
      <p v-if="category" class="category">
        {{ category }}
      </p>
      <h3 class="title">
        <NuxtLink v-if="href" :to="href" class="link">
          {{ article.title }}
        </NuxtLink>
        <template v-else>
          {{ article.title }}
        </template>
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
/* Varian horizontal (mobile, 159:2933): 354x104 */
.card {
  position: relative;
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: var(--space-16);
  align-items: center;
  color: var(--color-black);
}

.media {
  width: 104px;
  height: 104px;
  background: var(--color-surface);
  border-radius: var(--radius-10);
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-10);
}

.body {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 159:2933 gap kolom teks */
  min-width: 0;
}

.category {
  font: var(--type-card-mobile-category);
  color: var(--color-black);
}

.title {
  font: var(--type-card-mobile-headline);
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
  border-radius: var(--radius-10);
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px; /* 159:2933 avatar-penerbit */
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
  font: var(--type-card-timestamp); /* keputusan PM 16: Regular 400 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  flex: none;
  margin-left: 4px; /* 6 + 4 = gap 10 penerbit-waktu (159:2933) */
  font: var(--type-card-mobile-timestamp);
  white-space: nowrap;
}

/* Varian vertikal (desktop, 57:514): 358 x <=350 */
@media (min-width: 1024px) {
  .card {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
    align-items: start;
  }

  .media {
    width: 100%;
    height: auto;
    aspect-ratio: 358 / 225;
    border-radius: var(--radius-8);
  }

  .media img {
    border-radius: var(--radius-8);
  }

  .body {
    gap: 0;
  }

  /* G19: label kategori tidak tampil di desktop (display:none juga menyembunyikannya dari pembaca layar) */
  .category {
    display: none;
  }

  .title {
    font: var(--type-card-headline-desktop);
    margin-bottom: var(--space-16);
  }

  .link:focus-visible::after {
    border-radius: var(--radius-8);
  }

  .meta {
    gap: var(--space-8);
  }

  .author {
    font: var(--type-card-author-desktop);
  }

  .time {
    margin-left: var(--space-8); /* 8 + 8 = gap 16 penerbit-waktu (57:514) */
    font: var(--type-card-timestamp);
  }
}
</style>
