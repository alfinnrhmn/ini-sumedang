<script setup lang="ts">
import type { ArticleDetail } from '~/types/article'

// Kepala artikel (desktop 127:2132, mobile 130:3342): label kategori • tag, judul (h1), ringkasan, identitas + waktu baca.
// Label kedua = tag pertama artikel (Figma "LAYANAN PUBLIK" [I: subkategori/tag]); tanpa tag, hanya kategori; tanpa keduanya label tidak dirender.
// Tanggal terbit [I; PAGE-002 Keputusan 11, tidak ada di node Figma] ditampilkan di baris waktu baca.
const props = defineProps<{ article: ArticleDetail }>()

const category = computed(() => props.article.categories[0]?.name ?? '')
// PAGE-003: kategori resmi = tautan ke /kategori/<slug>; label kedua (tag) tetap teks biasa.
const categoryTo = computed(() => {
  const first = props.article.categories[0]
  return first ? categoryLink(first.slug) : null
})
const tag = computed(() => props.article.tags[0]?.name ?? '')
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
/* Mobile 130:3342: kolom gap 16 (label, blok judul, identitas) */
.head {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  min-width: 0;
}

/* Label 130:3343: Inter SemiBold 11,111/16,667 biru, huruf kapital; titik 5x5 (130:3346) celah 6 */
.label {
  display: flex;
  align-items: center;
  gap: 6px; /* 130:3343 */
  font: var(--type-card-label-mobile);
  text-transform: uppercase;
  color: var(--color-brand);
}

/* PAGE-003: tautan kategori mewarisi warna dan huruf label; hover bergaris bawah.
   POLISH-01 D41 (WCAG 2.5.8): area klik >= 24 x 24 px lewat ::after tak terlihat berpusat pada tautan; tampilan tidak berubah. */
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
  width: 5px; /* 130:3346 */
  height: 5px;
  border-radius: var(--radius-full);
  background: var(--color-brand);
}

/* Blok judul + ringkasan 130:3350: jarak 8 (mobile), 16 (desktop 130:2342) */
.text {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  min-width: 0;
}

/* Judul mobile 130:3352: Merriweather SemiBold 27,648/33,178, tracking -0,2, #1A212E */
.title {
  font: var(--type-headline-mobile);
  letter-spacing: var(--tracking-headline);
  color: var(--color-article-title);
  overflow-wrap: anywhere;
}

/* Ringkasan 130:3354: Inter Regular 13,333/18,666, #5E6B7D -> token terdekat --color-footer-muted (selisih 8/5/8, kontras 4,97:1) */
.excerpt {
  font: var(--type-caption);
  color: var(--color-footer-muted);
  overflow-wrap: anywhere;
}

/* Identitas 130:3355: avatar 20, celah 8; nama Inter Medium 11,111/16,667 #1A212E; waktu baca 11,111/16,667 #5E6B7D */
.meta {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  min-width: 0;
}

.avatar {
  flex: none;
  width: 20px; /* 130:3356 */
  height: 20px;
  border-radius: var(--radius-full);
}

.meta-text {
  min-width: 0;
}

.author {
  height: 15px; /* 130:3358 */
  font: var(--type-card-author-mobile);
  color: var(--color-article-title);
}

.sub {
  height: 14px; /* 130:3359 (baris 16,667 dalam kotak 14: blok identitas 29 = tinggi Figma) */
  font: var(--type-card-timestamp);
  color: var(--color-footer-muted);
}

@media (min-width: 1024px) {
  /* Desktop 127:2132: label (19) gap 16, blok judul (110) gap 16 ke ringkasan (60), gap 16 identitas; padding bawah 28 */
  .head {
    padding-bottom: 28px; /* 127:2132 pb 28 */
  }

  /* 127:2133: Inter Bold 13/19. Inter 700 belum di-host (hanya 300-600): dirender 600, deviasi dicatat di task */
  .label {
    font: 700 13px/19px var(--font-sans);
  }

  .text {
    gap: var(--space-16);
  }

  /* 127:2134: Inter Bold 46/55 #1A212E (700 dirender 600, lihat atas) */
  .title {
    font: 700 46px/55px var(--font-sans);
    letter-spacing: 0;
  }

  /* 127:2135: Inter Regular 20/30 */
  .excerpt {
    font: 400 20px/30px var(--font-sans);
  }

  /* 127:2136: avatar 36, celah 14; nama Inter SemiBold 14/19, waktu baca Inter Regular 12/17, jarak 3 */
  .meta {
    gap: 14px;
  }

  .avatar {
    width: 36px; /* 127:2137 */
    height: 36px;
  }

  .meta-text {
    display: flex;
    flex-direction: column;
    gap: 3px; /* 127:2139 */
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
