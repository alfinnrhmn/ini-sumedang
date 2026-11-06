<script setup lang="ts">
// Isi artikel: SATU-SATUNYA tempat v-html di proyek (gerbang: `git grep -n` pada atribut itu di app/ dan server/ harus tepat satu baris, di berkas ini).
// `bodyHtml` selalu keluaran `sanitizeBodyHtml` dari server (HTML mentah CMS tidak pernah sampai ke sini); tanpa `class`/`style` bawaan, semua gaya lewat :deep() dari token.
defineProps<{ bodyHtml: string }>()
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- HTML sudah disanitasi allowlist di server oleh sanitizeBodyHtml; ini satu-satunya pemakaian -->
  <div class="body" v-html="bodyHtml" />
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  padding-top: var(--space-16);
  font: var(--type-body);
  color: var(--color-article-title);
  overflow-wrap: anywhere;
}

.body :deep(p) {
  margin: 0;
}

.body :deep(h2) {
  margin: 0;
  font: var(--type-heading-mobile);
}

.body :deep(h3) {
  margin: 0;
  font: var(--type-card-headline-desktop); /* turunan token, bukan nilai Figma */
}

.body :deep(h4),
.body :deep(h5),
.body :deep(h6) {
  margin: 0;
  font-weight: 600; /* turunan isi, bukan nilai Figma */
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

/* Kotak "Baca Juga": latar Figma #E4E4E4 -> --color-gray-5 (selisih 4/4/4); padding kiri 19 + garis kiri 6 = teks mulai x 25. */
.body :deep(blockquote) {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font: var(--type-card-headline-mobile);
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
  /* Desktop: Merriweather Regular 17/30. Regular 400 belum di-host (hanya SemiBold 600): peramban memakai berkas 600 terdekat.
     Ukuran 17 di luar skala. */
  .body {
    font: 400 17px/30px var(--font-serif);
  }

  /* Inter Bold 28/37 (700 belum di-host, dirender 600) */
  .body :deep(h2) {
    font: 700 28px/37px var(--font-sans);
  }

  .body :deep(blockquote) {
    max-width: 603px;
    padding-right: 17px; /* Figma 19; dengan 19 teks contoh (560,7 px) lebih lebar dari isi (559 px) sehingga baris kedua muncul (tinggi 117 vs 90); 17 menjaga satu baris, kotak tetap 603 */
  }

  .body :deep(blockquote p:first-child > strong:only-child) {
    font: var(--type-card-headline-desktop);
  }
}
</style>
