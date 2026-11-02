<script setup lang="ts">
// Isi artikel (desktop 127:2151, mobile 130:3366). SATU-SATUNYA tempat v-html di proyek (PAGE-002 Keputusan PM 5;
// gerbang: `git grep -n` pada pola atribut itu di app/ dan server/ harus tepat satu baris, di berkas ini).
// Masukan `bodyHtml` selalu keluaran `sanitizeBodyHtml` (SANITIZE-001) dari server: HTML mentah CMS tidak pernah sampai ke sini.
// Tanpa `class`/`style` bawaan HTML (penyanitasi membuangnya); semua gaya lewat :deep() dari token.
defineProps<{ bodyHtml: string }>()
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- HTML sudah disanitasi allowlist di server oleh sanitizeBodyHtml (SANITIZE-001); ini satu-satunya pemakaian -->
  <div class="body" v-html="bodyHtml" />
</template>

<style scoped>
/* Mobile 130:3367: kolom gap 20, padding atas 16; Inter Regular 16/25,6 (News/Body/Mobile), #1A212E */
.body {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 130:3367 */
  min-width: 0;
  padding-top: var(--space-16); /* 130:3367 pt 16 */
  font: var(--type-body);
  color: var(--color-article-title);
  overflow-wrap: anywhere;
}

.body :deep(p) {
  margin: 0;
}

/* Subjudul mobile 130:3374: Merriweather SemiBold 19,2/24,96 (News/Heading/Mobile) */
.body :deep(h2) {
  margin: 0;
  font: var(--type-heading-mobile);
}

.body :deep(h3) {
  margin: 0;
  font: var(--type-card-headline-desktop); /* tanpa node Figma: turunan token */
}

.body :deep(h4),
.body :deep(h5),
.body :deep(h6) {
  margin: 0;
  font-weight: 600; /* tanpa node Figma: turunan isi */
}

.body :deep(a) {
  color: var(--color-brand);
  text-decoration: underline;
}

.body :deep(ul),
.body :deep(ol) {
  margin: 0;
  padding-left: var(--space-24);
}

.body :deep(li + li) {
  margin-top: var(--space-8);
}

/* Kotak "Baca Juga" 130:3378 (mobile) / 130:2364 (desktop 603x90): latar #E4E4E4 -> --color-gray-5 (selisih 4/4/4), garis kiri biru 6,
   radius 8, padding 16 dan kiri 19 (+ garis 6 = teks mulai 25); judul Inter SemiBold 16/22,4 lalu teks 16/25,6, celah 6 */
.body :deep(blockquote) {
  display: flex;
  flex-direction: column;
  gap: 6px; /* 130:3379 */
  margin: 0;
  padding: var(--space-16) 19px;
  border-left: 6px solid var(--color-brand);
  border-radius: var(--radius-8);
  background: var(--color-gray-5);
  color: var(--color-black);
  font: var(--type-body);
}

.body :deep(blockquote p) {
  font: var(--type-body);
}

.body :deep(blockquote p:first-child > strong:only-child) {
  display: block; /* tinggi baris = tinggi judul (22,4), bukan garis dasar paragraf (25,6) */
  font: var(--type-card-headline-mobile); /* 130:3380 */
}

.body :deep(img) {
  display: block;
  max-width: 100%;
  height: auto; /* width/height atribut menjaga rasio: CLS 0 */
  border-radius: var(--radius-8);
}

.body :deep(figure) {
  margin: 0;
}

.body :deep(figcaption) {
  padding-top: var(--space-8);
  font: var(--type-caption);
  color: var(--color-footer-muted);
}

/* Embed YouTube: 16:9, selebar kolom */
.body :deep(iframe) {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: var(--radius-8);
}

.body :deep(table) {
  display: block; /* gulir mendatar di dalam kolom tanpa membuat halaman meluap */
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

.body :deep(th),
.body :deep(td) {
  padding: var(--space-8) var(--space-16);
  border: 1px solid var(--color-border);
  text-align: left;
}

.body :deep(th) {
  background: var(--color-surface);
  font-weight: 600;
}

.body :deep(hr) {
  width: 100%;
  margin: 0;
  border: 0;
  border-top: 1px solid var(--color-border);
}

.body :deep(pre) {
  margin: 0;
  padding: var(--space-16);
  overflow-x: auto;
  background: var(--color-surface);
  border-radius: var(--radius-8);
  white-space: pre-wrap;
}

@media (min-width: 1024px) {
  /* Desktop 127:2152: Merriweather Regular 17/30. Regular 400 belum di-host (hanya SemiBold 600): bobot 400 dideklarasikan,
     peramban memakai berkas 600 terdekat sampai 400 di-host (deviasi dicatat di task). Ukuran 17 di luar skala (node 127:2152). */
  .body {
    font: 400 17px/30px var(--font-serif);
  }

  /* 127:2154: Inter Bold 28/37 (700 belum di-host, dirender 600) */
  .body :deep(h2) {
    font: 700 28px/37px var(--font-sans);
  }

  .body :deep(blockquote) {
    max-width: 603px; /* 130:2364 */
    padding-right: 17px; /* Figma 19 (130:2364). Teks contoh 130:2368 selebar 560,7 px pada Inter yang di-host vs lebar isi 559: dengan 19 baris kedua muncul (tinggi 117 vs 90); 17 menjaga satu baris, kotak tetap 603 */
  }

  /* 130:2366: Inter SemiBold 19,2/26,88 (News/Card/Headline/Desktop) */
  .body :deep(blockquote p:first-child > strong:only-child) {
    font: var(--type-card-headline-desktop);
  }
}
</style>
