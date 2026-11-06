<script setup lang="ts">
// Judul blok Berita Terkait: di sidebar desktop (baris 40, padding 10, garis dasar 3 px, aksen biru 96) dan di blok bawah (teks langsung di atas garis 3 px, aksen biru 130).
// Garis dasar #D9D9D9 Figma -> --color-gray-5 (sama dengan judul section Beranda). Tanpa tautan "Lainnya" (tidak ada tujuan).
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
  font: var(--type-card-headline-desktop);
  color: var(--color-black);
}

.heading--bottom {
  --accent-width: 130px;
}

.heading--sidebar {
  --accent-width: 96px;
}

.heading--sidebar .text {
  display: flex;
  align-items: center;
  height: 40px;
  padding-inline: 10px;
}
</style>
