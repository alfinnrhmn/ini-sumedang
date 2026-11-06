<script setup lang="ts">
import type { VisualTopic } from '~/types/article'

/** Satu blok topik Ruang Visual: judul topik (h3, tidak menaut) -> kartu besar -> hingga 3 berita berthumbnail; komponen sendiri, bukan varian NewsCard. Tiap kartu = satu tautan (judul). */
const props = defineProps<{ entry: VisualTopic }>()

const leadHref = computed(() => articlePath(props.entry.lead))
const rows = computed(() => props.entry.items.map(article => ({ article, href: articlePath(article) })))
</script>

<template>
  <div class="topic">
    <div class="head">
      <h3 class="topic-title">
        {{ entry.topic.name }}
      </h3>
      <article class="lead">
        <div class="lead-media">
          <img
            v-if="entry.lead.heroImage"
            :src="entry.lead.heroImage.url"
            :alt="entry.lead.heroImage.alt"
            :width="entry.lead.heroImage.width"
            :height="entry.lead.heroImage.height"
            loading="lazy"
          >
        </div>
        <h4 class="lead-title">
          <NuxtLink v-if="leadHref" :to="leadHref" class="link">
            {{ entry.lead.title }}
          </NuxtLink>
          <template v-else>
            {{ entry.lead.title }}
          </template>
        </h4>
      </article>
    </div>
    <ul v-if="rows.length" class="items">
      <li v-for="row in rows" :key="row.article.id">
        <article class="item">
          <div class="thumb">
            <img
              v-if="row.article.heroImage"
              :src="row.article.heroImage.url"
              :alt="row.article.heroImage.alt"
              :width="row.article.heroImage.width"
              :height="row.article.heroImage.height"
              loading="lazy"
            >
          </div>
          <h4 class="item-title">
            <NuxtLink v-if="row.href" :to="row.href" class="link">
              {{ row.article.title }}
            </NuxtLink>
            <template v-else>
              {{ row.article.title }}
            </template>
          </h4>
        </article>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.topic {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  min-width: 0;
}

/* Judul topik: Figma Inter Bold 700 32/39 #1A1C21; tanpa token untuk gaya ini dan Inter 700 belum di-host (hanya 300-600), jadi bobot 600 dan warna --color-black-2 (#1D1D1D). Maks. 2 baris agar nama panjang tidak merusak blok.
   Jarak 10 atas-bawah dipasang sebagai margin (bukan padding) supaya baris ke-3 yang terpotong klem tidak tampak di area padding. */
.topic-title {
  margin: 10px 0;
  font: 600 32px/39px var(--font-sans);
  color: var(--color-black-2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.lead {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.lead-media {
  position: relative;
  aspect-ratio: 480 / 254;
  background: var(--color-surface);
  border-radius: var(--radius-8);
}

.lead-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-8);
}

.lead-title {
  font: var(--type-card-headline-desktop);
  color: var(--color-black-2); /* Figma #1A1C21, token terdekat */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  overflow-wrap: anywhere;
}

/* Daftar: jarak antar baris 8; garis #D5D5D5 = --color-footer-divider-mobile (nilai sama persis) */
.items {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Baris: jarak thumbnail-judul 10 (Figma, di luar skala); tinggi 94 (baris pertama, garis atas+bawah) / 93 */
.item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--space-16) 0;
  border-bottom: 1px solid var(--color-footer-divider-mobile);
}

.items li:first-child .item {
  border-top: 1px solid var(--color-footer-divider-mobile);
}

/* Thumbnail: bingkai 80x60 radius 6; gambar setinggi 132,24 % (79,34) menempel ke atas, terpotong bingkai */
.thumb {
  position: relative;
  flex: none;
  width: 80px;
  height: 60px;
  overflow: hidden;
  background: var(--color-surface);
  border-radius: var(--radius-6);
}

.thumb img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 132.24%;
  max-width: none;
  object-fit: cover;
}

.item-title {
  flex: 1 1 0;
  min-width: 0;
  font: var(--type-body);
  color: var(--color-black-2); /* Figma #1A1C21, token terdekat */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
}

/* Seluruh kartu satu tautan (pola NewsCard); cincin fokus 2 px + offset 2 = 4 px, di luar elemen (tanpa overflow hidden di induk) */
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

/* Hover: judul bergaris bawah, tanpa ubah warna; hanya perangkat dengan hover */
@media (hover: hover) {
  .link:hover {
    text-decoration: underline;
  }
}

@media (min-width: 1024px) {
  .topic {
    gap: var(--space-32);
  }
}
</style>
