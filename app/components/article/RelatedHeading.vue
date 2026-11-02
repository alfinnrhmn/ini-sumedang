<script setup lang="ts">
// Judul blok Berita Terkait. Sidebar desktop (130:2227): baris 40, teks 19,2/26,88 dengan padding 10, garis dasar 3 px dengan aksen biru 96.
// Blok bawah (130:2943 desktop, 130:3569 mobile): teks langsung di atas garis 3 px dengan aksen biru 130. Garis dasar Figma #D9D9D9 -> --color-gray-5
// (keputusan PM 14, sama dengan judul section Beranda). Tanpa tautan "Lainnya"/"Lihat Lainnya" (tidak ada tujuan).
defineProps<{
  title: string
  variant: 'sidebar' | 'bottom'
  /** id untuk aria-labelledby wilayah. */
  headingId: string
}>()
</script>

<template>
  <div class="heading" :class="`heading--${variant}`">
    <h2 :id="headingId" class="text">
      {{ title }}
    </h2>
  </div>
</template>

<style scoped>
.heading {
  position: relative;
  border-bottom: 3px solid var(--color-gray-5);
}

/* Aksen biru menimpa garis dasar */
.heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: var(--accent-width);
  height: 3px;
  background: var(--color-brand);
}

.text {
  font: var(--type-card-headline-desktop); /* 130:2931 / 130:2230 Inter SemiBold 19,2/26,88 (News/Card/Headline/Desktop) */
  color: var(--color-black);
}

.heading--bottom {
  --accent-width: 130px; /* 130:2935 / 130:3578 */
}

.heading--sidebar {
  --accent-width: 96px; /* 130:2236 */
}

.heading--sidebar .text {
  display: flex;
  align-items: center;
  height: 40px; /* 130:2228 */
  padding-inline: 10px; /* 130:2229 */
}
</style>
